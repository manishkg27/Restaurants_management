import React, { useEffect, useState } from "react";
import { getRestaurantOrders, updateDeliveryStatus } from "../../api/orderAPI";
import { getMyRestaurant } from "../../api/restaurantAPI";
import { useAuth } from "../../context/AuthContext";
import useSocket from "../../hooks/useSocket";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import formatCurrency from "../../lib/formatCurrency";
import { toast } from "react-toastify";
import { ClipboardList, User, Phone, MapPin } from "lucide-react";
import "./OrdersManagementPage.css";

const OrdersManagementPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("incoming"); // 'incoming', 'delivered', 'cancelled'

  const socketHook = useSocket(user);

  const fetchOrdersAndRestaurant = async () => {
    try {
      const resData = await getMyRestaurant();
      if (resData.success && resData.data) {
        setRestaurant(resData.data);
      }
      
      const response = await getRestaurantOrders();
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error("Fetch restaurant orders failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndRestaurant();
  }, []);

  useEffect(() => {
    if (restaurant && socketHook.socket) {
      socketHook.joinRestaurantRoom(restaurant._id);

      socketHook.listen("newOrder", (data) => {
        fetchOrdersAndRestaurant();
      });
    }

    return () => {
      if (socketHook.socket) {
        socketHook.stopListening("newOrder");
      }
    };
  }, [restaurant, socketHook.socket]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await updateDeliveryStatus(orderId, newStatus);
      if (response.success) {
        toast.success(response.message || `Delivery status changed to ${newStatus}`);
        
        // Update local state instead of full fetch to avoid flicker
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, deliveryStatus: newStatus } : order
          )
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update delivery status");
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="orders-mgmt">
      <div className="container orders-mgmt__container">
        <div className="orders-mgmt__header">
          <ClipboardList size={26} className="orders-mgmt__header-icon" />
          <h2 className="orders-mgmt__title">
            Order Management Panel
          </h2>
        </div>

        {/* Tab Selectors */}
        <div className="orders-page__tabs" style={{ marginBottom: "2rem", display: "flex", gap: "10px" }}>
          {[
            { id: "incoming", label: "Incoming Orders", icon: ClipboardList },
            { id: "delivered", label: "Delivered", icon: ClipboardList },
            { id: "cancelled", label: "Cancelled", icon: ClipboardList },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`orders-page__tab-btn ${
                  isSelected
                    ? "orders-page__tab-btn--active"
                    : "orders-page__tab-btn--inactive"
                }`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#ea580c" : "#ffffff",
                  color: isSelected ? "#fff" : "#6b7280",
                  fontWeight: isSelected ? "600" : "400",
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {orders.filter(o => {
          if (activeTab === "incoming") return ["pending", "confirmed", "preparing", "out-for-delivery"].includes(o.deliveryStatus);
          if (activeTab === "delivered") return o.deliveryStatus === "delivered";
          if (activeTab === "cancelled") return o.deliveryStatus === "cancelled";
          return true;
        }).length === 0 ? (
          <div className="orders-mgmt__empty">
            <ClipboardList size={40} className="orders-mgmt__empty-icon" />
            <p>No orders found in this category.</p>
          </div>
        ) : (
          <div className="orders-mgmt__list">
            {orders.filter(o => {
              if (activeTab === "incoming") return ["pending", "confirmed", "preparing", "out-for-delivery"].includes(o.deliveryStatus);
              if (activeTab === "delivered") return o.deliveryStatus === "delivered";
              if (activeTab === "cancelled") return o.deliveryStatus === "cancelled";
              return true;
            }).map((order) => (
              <div key={order._id} className="orders-mgmt__card">
                {/* Header info */}
                <div className="orders-mgmt__card-header">
                  <div>
                    <span className="orders-mgmt__order-id">
                      Order #{order._id} • {new Date(order.createdAt).toLocaleString()}
                    </span>
                    <div className="orders-mgmt__price-row">
                      <div className="orders-mgmt__price">
                        {formatCurrency(order.totalPrice)}
                      </div>
                      <span className={`orders-mgmt__payment-badge ${
                        order.deliveryStatus === 'cancelled' ? 'orders-mgmt__payment-badge--refunded' : 
                        order.paymentStatus ? 'orders-mgmt__payment-badge--paid' : 'orders-mgmt__payment-badge--pending'
                      }`}>
                        {order.deliveryStatus === 'cancelled' ? "Refunded" : order.paymentStatus ? "Paid" : "Payment Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Selector */}
                  <div className="orders-mgmt__status-row">
                    <span className="orders-mgmt__status-label">
                      Delivery Status:
                    </span>
                    <select
                      value={order.deliveryStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="form-input orders-mgmt__status-select"
                      disabled={order.deliveryStatus === 'delivered' || order.deliveryStatus === 'cancelled'}
                    >
                      <option value="pending" disabled={order.deliveryStatus !== 'pending'}>Pending</option>
                      <option value="confirmed" disabled={!['pending', 'confirmed'].includes(order.deliveryStatus)}>Accepted</option>
                      <option value="preparing" disabled={!['pending', 'confirmed', 'preparing'].includes(order.deliveryStatus)}>Preparing</option>
                      <option value="out-for-delivery" disabled={order.deliveryStatus === 'delivered' || order.deliveryStatus === 'cancelled'}>Out for Delivery</option>
                      <option value="delivered" disabled={order.deliveryStatus === 'cancelled'}>Delivered</option>
                      {(order.deliveryStatus === 'pending' || order.deliveryStatus === 'cancelled') && (
                        <option value="cancelled" disabled={order.deliveryStatus === 'cancelled'}>Cancelled</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Items & Delivery Info */}
                <div className="orders-mgmt__details-grid">
                  {/* Items */}
                  <div>
                    <h5 className="orders-mgmt__section-title">Dishes Ordered</h5>
                    <div className="orders-mgmt__items-list">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="orders-mgmt__item">
                          <span>
                            {item.itemName} <strong className="orders-mgmt__item-qty">x {item.quantity}</strong>
                          </span>
                          <span className="orders-mgmt__item-price">{formatCurrency(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recipient Details */}
                  <div className="orders-mgmt__recipient">
                    <h5 className="orders-mgmt__section-title">Recipient Details</h5>
                    <div className="orders-mgmt__recipient-details">
                      <div className="orders-mgmt__recipient-row">
                        <User size={14} className="orders-mgmt__recipient-icon" />
                        <span>{order.deliveryInfo?.name}</span>
                      </div>
                      <div className="orders-mgmt__recipient-row">
                        <Phone size={14} className="orders-mgmt__recipient-icon" />
                        <span>{order.deliveryInfo?.phone}</span>
                      </div>
                      <div className="orders-mgmt__recipient-row orders-mgmt__recipient-row--align-start">
                        <MapPin size={14} className="orders-mgmt__recipient-icon orders-mgmt__recipient-icon--top" />
                        <span className="orders-mgmt__recipient-text">{order.deliveryInfo?.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagementPage;
