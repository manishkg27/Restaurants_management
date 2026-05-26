import React, { useEffect, useState } from "react";
import "./OrdersPage.css";
import { getMyOrders } from "../api/orderAPI";
import LoadingSpinner from "../components/LoadingSpinner";
import FeedbackForm from "../components/FeedbackForm";
import formatCurrency from "../utils/formatCurrency";
import { ClipboardList, Truck, CheckCircle2, AlertCircle } from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current"); // 'current', 'payment-pending', 'delivered'
  const [selectedItemForFeedback, setSelectedItemForFeedback] = useState(null);

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
                  {/* Status */}
                  <div className="orders-page__status">
                    <span>Status:</span>
                    <span
                      className={`orders-page__status-text ${
                        order.deliveryStatus === "delivered"
                          ? "orders-page__status-text--delivered"
                          : "orders-page__status-text--active"
                      }`}
                    >
                      {order.deliveryStatus}
                    </span>
                  </div>

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
                  {order.deliveryStatus !== "delivered" ? (
                    <button
                      onClick={() => alert(`Tracking your order from ${order.restaurant?.name}. Status is currently: ${order.deliveryStatus}`)}
                      className="orders-page__action-btn"
                    >
                      Track Order
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
                            onClick={() => setSelectedItemForFeedback(item.item || item._id)}
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
                {selectedItemForFeedback && order.items.some((it) => (it.item || it._id) === selectedItemForFeedback) && (
                  <div className="orders-page__feedback-form-container">
                    <FeedbackForm
                      itemId={selectedItemForFeedback}
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
