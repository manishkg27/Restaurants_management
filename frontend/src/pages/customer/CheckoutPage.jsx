import React, { useState, useEffect } from "react";
import "./CheckoutPage.css";
import { useCart } from "../../context/CartContext";
import { placeOrder } from "../../api/orderAPI";
import { checkoutOrder, verifyPayment } from "../../api/paymentAPI";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import formatCurrency from "../../lib/formatCurrency";
import { ClipboardList, MapPin, Phone, User, CreditCard } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";

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
  const { cartItems, cartTotal, restaurantName, clearCart, fetchCart, loading: cartLoading } = useCart();
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

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (user && user.profile) {
      setName(user.profile?.fullName || user.username || "");
      const userAddresses = user.profile.addresses || [];
      setAddresses(userAddresses);
      
      if (userAddresses.length > 0 && !useNewAddress) {
        // Auto-select first address
        const firstAddr = userAddresses[0];
        setSelectedAddressId(firstAddr._id);
        setPhone(firstAddr.contactNumber || "");
        setAddress(firstAddr.address || "");
        setCity(firstAddr.city || "");
        setState(firstAddr.state || "");
        setPinCode(firstAddr.pinCode || "");
      }
      setEmail(user.email || "");
    }
    
    if (useNewAddress) {
      setSelectedAddressId("");
      setPhone("");
      setAddress("");
      setCity("");
      setState("");
      setPinCode("");
    }
  }, [useNewAddress, user]);

  const handleAddressSelect = (addrId) => {
    setSelectedAddressId(addrId);
    setUseNewAddress(false);
    const addr = addresses.find(a => a._id === addrId);
    if (addr) {
      setPhone(addr.contactNumber || "");
      setAddress(addr.address || "");
      setCity(addr.city || "");
      setState(addr.state || "");
      setPinCode(addr.pinCode || "");
    }
  };
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

      const orderRes = await placeOrder({ 
        deliveryInfo: { name, phone, email, address, city, state, pinCode },
        expectedTotal: cartTotal 
      });
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
              navigate(`/order-confirmation/${orderId}`);
            } else {
              toast.error(verificationRes.message || "Payment verification failed");
              navigate("/orders");
            }
          } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
            navigate("/orders");
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
        modal: {
          ondismiss: function() {
            toast.info("Payment cancelled. You can retry from your Orders page.");
            clearCart();
            navigate("/orders");
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response){
        toast.error("Payment failed. Please try again from your Orders page.");
        clearCart();
        navigate("/orders");
      });

      paymentObject.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  if (loading || cartLoading) return <LoadingSpinner fullPage />;

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

          {addresses.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label className="checkout-page__label" style={{ marginBottom: '10px', display: 'block' }}>Saved Addresses</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                {addresses.map(addr => (
                  <div 
                    key={addr._id} 
                    onClick={() => handleAddressSelect(addr._id)}
                    style={{ 
                      border: `2px solid ${selectedAddressId === addr._id ? '#ea580c' : '#e5e7eb'}`, 
                      borderRadius: '8px', padding: '10px', cursor: 'pointer',
                      backgroundColor: selectedAddressId === addr._id ? '#fff7ed' : '#fff'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px', marginBottom: '4px' }}>{addr.title}</div>
                    <div style={{ fontSize: '12px', color: '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{addr.address}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="useNewAddress"
              checked={useNewAddress || addresses.length === 0}
              onChange={(e) => setUseNewAddress(e.target.checked)}
              style={{ cursor: "pointer", width: '16px', height: '16px', accentColor: '#ea580c' }}
            />
            <label htmlFor="useNewAddress" style={{ cursor: "pointer", fontSize: "14px", color: "#4b5563", fontWeight: '500' }}>
              Deliver to a different/new address
            </label>
          </div>

          {(useNewAddress || addresses.length === 0) && (
            <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#6b7280' }}>
                Note: This address will only be used for this order. To save an address, please go to your Profile.
              </p>

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
            </div>
          )}

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
