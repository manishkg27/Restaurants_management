import React, { useEffect, useState } from "react";
import { getRestaurantOrders, updateDeliveryStatus } from "../../api/orderAPI";
import LoadingSpinner from "../../components/LoadingSpinner";
import formatCurrency from "../../utils/formatCurrency";
import { toast } from "react-toastify";
import { ClipboardList, User, Phone, MapPin } from "lucide-react";
import "./OrdersManagementPage.css";

const OrdersManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
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
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await updateDeliveryStatus(orderId, newStatus);
      if (response.success) {
        toast.success(response.message || `Delivery status changed to ${newStatus}`);
        await fetchOrders();
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

        {orders.length === 0 ? (
          <div className="orders-mgmt__empty">
            <ClipboardList size={40} className="orders-mgmt__empty-icon" />
            <p>Your restaurant has not received any orders yet.</p>
          </div>
        ) : (
          <div className="orders-mgmt__list">
            {orders.map((order) => (
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
                      <span className={`orders-mgmt__payment-badge ${order.paymentStatus ? 'orders-mgmt__payment-badge--paid' : 'orders-mgmt__payment-badge--pending'}`}>
                        {order.paymentStatus ? "Paid" : "Payment Pending"}
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
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="out-for-delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
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
