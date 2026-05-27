import React, { useState, useEffect } from "react";
import "./CheckoutPage.css";
import { useCart } from "../context/CartContext";
import { placeOrder } from "../api/orderAPI";
import { checkoutOrder, verifyPayment } from "../api/paymentAPI";
import { useAuth } from "../context/AuthContext";
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
  const { user } = useAuth();
  const navigate = useNavigate();

  const [useNewAddress, setUseNewAddress] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!useNewAddress && user) {
      setName(user.profile?.fullName || user.username || "");
      setPhone(user.profile?.contactNumber || "");
      setEmail(user.email || "");
      setAddress(user.profile?.address || "");
      setCity(user.profile?.city || "");
      setState(user.profile?.state || "");
      setPinCode(user.profile?.zipCode || "");
    } else if (useNewAddress) {
      setName("");
      setPhone("");
      setAddress("");
      setCity("");
      setState("");
      setPinCode("");
    }
  }, [useNewAddress, user]);


  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !email || !address || !city || !state || !pinCode) {
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

      const orderRes = await placeOrder({ name, phone, email, address, city, state, pinCode });
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
          email: email,
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
    <div className="checkout-page">
      <div className="checkout-page__container">
        {/* Delivery Details Form */}
        <form
          onSubmit={handleCheckoutSubmit}
          className="checkout-page__form"
        >
          <div className="checkout-page__form-header">
            <ClipboardList size={18} className="checkout-page__form-icon" />
            <h3 className="checkout-page__form-title">
              Delivery Details
            </h3>
          </div>

          <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="useNewAddress"
              checked={useNewAddress}
              onChange={(e) => setUseNewAddress(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <label htmlFor="useNewAddress" style={{ cursor: "pointer", fontSize: "14px", color: "#ddd" }}>
              Deliver to a different address
            </label>
          </div>

          <div className="checkout-page__form-group">
            <label className="checkout-page__label" htmlFor="name">
              Recipient Name
            </label>
            <div className="checkout-page__input-wrapper">
              <User size={14} className="checkout-page__input-icon" />
              <input
                id="name"
                type="text"
                className="checkout-page__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="checkout-page__form-group">
            <label className="checkout-page__label" htmlFor="phone">
              Contact Number
            </label>
            <div className="checkout-page__input-wrapper">
              <Phone size={14} className="checkout-page__input-icon" />
              <input
                id="phone"
                type="tel"
                className="checkout-page__input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                required
              />
            </div>
          </div>

          <div className="checkout-page__form-group">
            <label className="checkout-page__label" htmlFor="email">
              Email Address
            </label>
            <div className="checkout-page__input-wrapper">
              <User size={14} className="checkout-page__input-icon" />
              <input
                id="email"
                type="email"
                className="checkout-page__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@example.com"
                required
              />
            </div>
          </div>

          <div className="checkout-page__form-group">
            <label className="checkout-page__label" htmlFor="address">
              Delivery Address
            </label>
            <div className="checkout-page__input-wrapper">
              <MapPin size={14} className="checkout-page__input-icon checkout-page__input-icon--textarea" />
              <textarea
                id="address"
                className="checkout-page__textarea"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete house/office street address, landmarks..."
                rows={3}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="checkout-page__form-group" style={{ flex: 1 }}>
              <label className="checkout-page__label" htmlFor="city">
                City
              </label>
              <div className="checkout-page__input-wrapper">
                <MapPin size={14} className="checkout-page__input-icon" />
                <input
                  id="city"
                  type="text"
                  className="checkout-page__input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  required
                />
              </div>
            </div>

            <div className="checkout-page__form-group" style={{ flex: 1 }}>
              <label className="checkout-page__label" htmlFor="state">
                State
              </label>
              <div className="checkout-page__input-wrapper">
                <MapPin size={14} className="checkout-page__input-icon" />
                <input
                  id="state"
                  type="text"
                  className="checkout-page__input"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  required
                />
              </div>
            </div>
          </div>

          <div className="checkout-page__form-group">
            <label className="checkout-page__label" htmlFor="pinCode">
              Pin Code
            </label>
            <div className="checkout-page__input-wrapper">
              <MapPin size={14} className="checkout-page__input-icon" />
              <input
                id="pinCode"
                type="text"
                className="checkout-page__input"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="e.g. 400050"
                required
              />
            </div>
          </div>

          <button type="submit" className="checkout-page__button" disabled={loading}>
            <CreditCard size={15} />
            {loading ? "Processing..." : "Pay & Confirm Order"}
          </button>
        </form>

        {/* Order Summary */}
        <div className="checkout-page__summary">
          <h3 className="checkout-page__summary-title">
            Order Summary
          </h3>

          {restaurantName && (
            <div className="checkout-page__summary-restaurant">
              Ordering from: <strong>{restaurantName}</strong>
            </div>
          )}

          {/* List items */}
          <div className="checkout-page__summary-items">
            {cartItems.map((item) => (
              <div key={item._id} className="checkout-page__summary-item">
                <span className="checkout-page__summary-item-name">
                  {item.itemInfo.name} <strong>x {item.quantity}</strong>
                </span>
                <span className="checkout-page__summary-item-price">
                  {formatCurrency(item.itemInfo.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="checkout-page__summary-total-container">
            <span className="checkout-page__summary-total-label">Grand Total:</span>
            <span className="checkout-page__summary-total-value">
              {formatCurrency(cartTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
