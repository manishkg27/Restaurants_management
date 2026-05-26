import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { placeOrder } from "../api/orderAPI";
import { checkoutOrder, verifyPayment } from "../api/paymentAPI";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import formatCurrency from "../utils/formatCurrency";
import { ClipboardList, MapPin, Phone, User, CreditCard } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

// Helper function to dynamically load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const { cartItems, cartTotal, restaurantName, clearCart } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      toast.warning("Your cart is empty! Add items before checking out.");
      navigate("/restaurants");
    }
  }, [cartItems]);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      toast.error("Please provide all delivery information");
      return;
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway SDK. Please check your internet connection.");
        setLoading(false);
        return;
      }

      const orderRes = await placeOrder({ name, phone, address });
      if (!orderRes.success) {
        toast.error(orderRes.message || "Failed to place order");
        setLoading(false);
        return;
      }

      const { orderId } = orderRes.data;

      const checkoutRes = await checkoutOrder(orderId);
      if (!checkoutRes.success) {
        toast.error(checkoutRes.message || "Failed to initiate payment gateway");
        setLoading(false);
        return;
      }

      const { razorpayOrderId, amount, currency, keyId } = checkoutRes.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Eatify Premium Dining",
        description: `Payment for Order #${orderId}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            setLoading(true);
            const verificationRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verificationRes.success) {
              toast.success("Payment verified! Order placed successfully.");
              clearCart();
              navigate("/orders");
            } else {
              toast.error(verificationRes.message || "Payment verification failed");
            }
          } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: name,
          contact: phone,
        },
        theme: {
          color: "#ea580c",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Delivery Details Form */}
        <form
          onSubmit={handleCheckoutSubmit}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-2">
            <ClipboardList size={18} className="text-orange-600" />
            <h3 className="text-sm font-bold text-gray-800 m-0">
              Delivery Details
            </h3>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700" htmlFor="name">
              Recipient Name
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="name"
                type="text"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-xs text-gray-800 outline-none focus:border-blue-500 bg-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700" htmlFor="phone">
              Contact Number
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="phone"
                type="tel"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-xs text-gray-800 outline-none focus:border-blue-500 bg-white"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-700" htmlFor="address">
              Delivery Address
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                id="address"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-xs text-gray-800 outline-none focus:border-blue-500 resize-none bg-white"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete house/office street address, landmarks..."
                rows={4}
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded text-sm flex items-center justify-center gap-2 cursor-pointer border-none mt-2">
            <CreditCard size={15} />
            Pay & Confirm Order
          </button>
        </form>

        {/* Order Summary */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 h-fit flex flex-col gap-4">
          <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-3 m-0">
            Order Summary
          </h3>

          {restaurantName && (
            <div className="text-xs text-gray-500">
              Ordering from: <strong className="text-orange-600">{restaurantName}</strong>
            </div>
          )}

          {/* List items */}
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between text-xs">
                <span className="text-gray-700">
                  {item.itemInfo.name} <strong className="text-gray-400">x {item.quantity}</strong>
                </span>
                <span className="text-orange-600 font-bold">
                  {formatCurrency(item.itemInfo.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 flex justify-between items-center mt-2">
            <span className="text-xs font-bold text-gray-600">Grand Total:</span>
            <span className="text-base font-extrabold text-orange-600">
              {formatCurrency(cartTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
