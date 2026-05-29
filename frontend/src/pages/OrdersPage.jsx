import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useSocket from "../hooks/useSocket";
import "./OrdersPage.css";
import { getMyOrders, cancelOrder } from "../api/orderAPI";
import { checkoutOrder, verifyPayment } from "../api/paymentAPI";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import FeedbackForm from "../components/FeedbackForm";
import formatCurrency from "../utils/formatCurrency";
import { ClipboardList, Truck, CheckCircle2, AlertCircle } from "lucide-react";

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

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current"); // 'current', 'payment-pending', 'delivered'
  const [selectedItemForFeedback, setSelectedItemForFeedback] = useState(null);

  const socketHook = useSocket(user);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getMyOrders(activeTab);
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error("Fetch my orders failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  useEffect(() => {
    if (user && socketHook.socket) {
      // Join customer's private room
      socketHook.joinUserRoom(user._id);

      // Listen for delivery status updates
      socketHook.listen("orderStatusUpdate", (data) => {
        // Optionally update the local order state if we wanted to avoid a full fetch:
        setOrders(prevOrders => prevOrders.map(order => 
          order._id === data.orderId 
            ? { ...order, deliveryStatus: data.deliveryStatus }
            : order
        ));
      });
    }

    return () => {
      if (socketHook.socket) {
        socketHook.stopListening("orderStatusUpdate");
      }
    };
  }, [user, socketHook.socket]);

  return (
    <div className="orders-page">
      <div className="orders-page__container">
        {/* Title */}
        <div className="orders-page__header">
          <ClipboardList size={22} className="orders-page__header-icon" />
          <h2 className="orders-page__title">My Orders</h2>
        </div>

        {/* Tab Selectors: Rounded Buttons with Spacing */}
        <div className="orders-page__tabs">
          {[
            { id: "current", label: "Active Orders", icon: Truck },
            { id: "payment-pending", label: "Unpaid", icon: AlertCircle },
            { id: "delivered", label: "Past Orders", icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedItemForFeedback(null);
                }}
                className={`orders-page__tab-btn ${
                  isSelected
                    ? "orders-page__tab-btn--active"
                    : "orders-page__tab-btn--inactive"
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content list */}
        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="orders-page__empty">
            <ClipboardList size={30} className="orders-page__empty-icon" />
            <p className="orders-page__empty-text">No orders found in this category.</p>
          </div>
        ) : (
          <div className="orders-page__list">
            {orders.map((order) => (
              <div
                key={order._id}
                className="orders-page__card"
              >
                {/* Header: Restaurant Name & Order Id */}
                <div className="orders-page__card-header">
                  <h3 className="orders-page__card-title">
                    {order.restaurant?.name || "Premium Restaurant"}
                  </h3>
                  <span className="orders-page__card-subtitle">
                    Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </span>
                </div>

                {/* Body Details */}
                <div className="orders-page__card-body">
                  {/* Order Progress Timeline */}
                  {order.paymentStatus !== false && order.deliveryStatus !== "cancelled" && (
                    <div className="orders-page__timeline" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '12px', left: '0', right: '0', height: '2px', backgroundColor: '#e5e7eb', zIndex: 1 }}></div>
                      
                      {['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'].map((step, index) => {
                        const statusOrder = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'];
                        const currentIndex = statusOrder.indexOf(order.deliveryStatus);
                        const isCompleted = index <= currentIndex;
                        const isActive = index === currentIndex;
                        
                        const stepNames = {
                          'pending': 'Pending',
                          'confirmed': 'Accepted',
                          'preparing': 'Preparing',
                          'out-for-delivery': 'On the way',
                          'delivered': 'Delivered'
                        };

                        return (
                          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                            <div style={{ 
                              width: '24px', height: '24px', borderRadius: '50%', 
                              backgroundColor: isCompleted ? '#22c55e' : '#fff',
                              border: `2px solid ${isCompleted ? '#22c55e' : '#d1d5db'}`,
                              display: 'flex', justifyContent: 'center', alignItems: 'center',
                              boxShadow: isActive ? '0 0 0 4px rgba(34, 197, 94, 0.2)' : 'none'
                            }}>
                              {isCompleted && <CheckCircle2 size={14} color="#fff" />}
                            </div>
                            <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: isActive ? 'bold' : 'normal', color: isCompleted ? '#374151' : '#9ca3af', textAlign: 'center', width: '60px' }}>
                              {stepNames[step]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Fallback Status for Cancelled/Failed */}
                  {(order.deliveryStatus === "cancelled" || order.paymentStatus === false) && (
                    <div className="orders-page__status">
                      <span>Status:</span>
                      <span
                        className={`orders-page__status-text ${
                          order.deliveryStatus === "cancelled" ? "orders-page__status-text--failed" :
                          order.paymentStatus === false ? "orders-page__status-text--failed" : ""
                        }`}
                      >
                        {order.deliveryStatus === "cancelled" ? "Cancelled" : "Failed Payment"}
                      </span>
                    </div>
                  )}

                  {/* Items list */}
                  <div className="orders-page__items">
                    <span className="orders-page__items-label">Items:</span>
                    <ul className="orders-page__items-list">
                      {order.items?.map((item, idx) => (
                        <li key={idx}>
                          <span>
                            {item.itemName} <strong className="orders-page__item-qty">x{item.quantity}</strong>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Grand Total */}
                  <div className="orders-page__total">
                    <span className="orders-page__total-label">Total Amount</span>
                    <span className="orders-page__total-value">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="orders-page__actions">
                  {order.deliveryStatus === "cancelled" ? (
                    <div style={{width: '100%', textAlign: 'center', color: '#f44336', padding: '10px 0'}}>Order Cancelled</div>
                  ) : order.paymentStatus === false ? (
                    <div className="orders-page__payment-actions" style={{ display: 'flex', gap: '10px', width: '100%' }}>
                      <button
                        onClick={async () => {
                          try {
                            setLoading(true);
                            const scriptLoaded = await loadRazorpayScript();
                            if (!scriptLoaded) {
                              toast.error("Failed to load payment gateway.");
                              setLoading(false);
                              return;
                            }

                            const checkoutRes = await checkoutOrder(order._id);
                            if (!checkoutRes.success) {
                              toast.error(checkoutRes.message || "Failed to initiate payment");
                              setLoading(false);
                              return;
                            }

                            const { razorpayOrderId, amount, currency, keyId } = checkoutRes.data;

                            const options = {
                              key: keyId,
                              amount: amount,
                              currency: currency,
                              name: "Eatify Premium Dining",
                              description: `Payment for Order #${order._id}`,
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
                                    fetchOrders();
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
                                name: order.deliveryInfo?.name || "",
                                email: order.deliveryInfo?.email || "",
                                contact: order.deliveryInfo?.phone || "",
                              },
                              theme: {
                                color: "#ea580c",
                              },
                            };

                            const paymentObject = new window.Razorpay(options);
                            paymentObject.on('payment.failed', function (response) {
                                toast.error(response.error.description);
                            });
                            paymentObject.open();
                          } catch (err) {
                            toast.error("Payment initiation failed");
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="orders-page__action-btn"
                        style={{ flex: 1, backgroundColor: '#4caf50' }}
                      >
                        Repay
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await cancelOrder(order._id);
                            toast.success("Order cancelled");
                            fetchOrders();
                          } catch (err) {
                            toast.error("Failed to cancel order");
                          }
                        }}
                        className="orders-page__action-btn"
                        style={{ flex: 1, backgroundColor: '#f44336' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : order.deliveryStatus !== "delivered" ? (
                    <button
                      disabled
                      className="orders-page__action-btn"
                      style={{ opacity: 0.7, cursor: 'default' }}
                    >
                      {order.deliveryStatus === 'pending' ? 'Awaiting Confirmation' : 
                       order.deliveryStatus === 'confirmed' ? 'Restaurant is processing' :
                       order.deliveryStatus === 'preparing' ? 'Food is being prepared' :
                       'Driver is on the way'}
                    </button>
                  ) : (
                    <div className="orders-page__feedback">
                      <span className="orders-page__feedback-label">
                        Help us improve
                      </span>
                      <div className="orders-page__feedback-btns">
                        {order.items?.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const targetId = item._id;
                              setSelectedItemForFeedback(selectedItemForFeedback === targetId ? null : targetId);
                            }}
                            className="orders-page__review-btn"
                          >
                            Review {item.itemName.substring(0, 10)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Inline Review form trigger */}
                {selectedItemForFeedback && order.items.some((it) => it._id === selectedItemForFeedback) && (
                  <div className="orders-page__feedback-form-container">
                    <FeedbackForm
                      itemId={order.items.find((it) => it._id === selectedItemForFeedback)?.item || order.items.find((it) => it._id === selectedItemForFeedback)?._id}
                      orderId={order._id}
                      onSuccess={() => setSelectedItemForFeedback(null)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
