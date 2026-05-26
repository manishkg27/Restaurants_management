import React, { useEffect, useState } from "react";
import { getRestaurantOrders, updateDeliveryStatus } from "../../api/orderAPI";
import LoadingSpinner from "../../components/LoadingSpinner";
import formatCurrency from "../../utils/formatCurrency";
import { toast } from "react-toastify";
import { ClipboardList, User, Phone, MapPin, Edit2, Check, Clock } from "lucide-react";

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
    <div style={{ minHeight: "80vh", padding: "40px 0" }}>
      <div className="container" style={{ maxWidth: "900px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <ClipboardList size={26} style={{ color: "var(--accent)" }} />
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-heading)" }}>
            Order Management Panel
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="glass" style={{ padding: "80px", textAlign: "center", color: "var(--text-muted)", borderRadius: "var(--radius-lg)" }}>
            <ClipboardList size={40} style={{ marginBottom: "12px", opacity: 0.5 }} />
            <p>Your restaurant has not received any orders yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {orders.map((order) => (
              <div
                key={order._id}
                className="glass animate-fade-in"
                style={{
                  borderRadius: "var(--radius-md)",
                  padding: "24px",
                  border: "1px solid var(--border-glass)",
                }}
              >
                {/* Header info */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "12px",
                    borderBottom: "1px solid var(--border-glass)",
                    paddingBottom: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      Order #{order._id} • {new Date(order.createdAt).toLocaleString()}
                    </span>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "4px" }}>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-heading)" }}>
                        {formatCurrency(order.totalPrice)}
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "var(--radius-full)",
                          textTransform: "uppercase",
                          backgroundColor: order.paymentStatus ? "var(--success-glow)" : "var(--error-glow)",
                          color: order.paymentStatus ? "var(--success)" : "var(--error)",
                        }}
                      >
                        {order.paymentStatus ? "Paid" : "Payment Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Selector */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                      Delivery Status:
                    </span>
                    <select
                      value={order.deliveryStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="form-input"
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.85rem",
                        width: "auto",
                        height: "36px",
                        backgroundColor: "var(--bg-primary)",
                      }}
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                  {/* Items */}
                  <div>
                    <h5 style={{ fontWeight: 700, marginBottom: "8px", fontSize: "0.95rem" }}>Dishes Ordered</h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                          <span>
                            {item.itemName} <strong style={{ color: "var(--text-muted)" }}>x {item.quantity}</strong>
                          </span>
                          <span style={{ fontWeight: 600 }}>{formatCurrency(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recipient Details */}
                  <div style={{ borderLeft: "1px solid var(--border-glass)", paddingLeft: "24px" }}>
                    <h5 style={{ fontWeight: 700, marginBottom: "8px", fontSize: "0.95rem" }}>Recipient Details</h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <User size={14} style={{ color: "var(--accent)" }} />
                        <span>{order.deliveryInfo?.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Phone size={14} style={{ color: "var(--accent)" }} />
                        <span>{order.deliveryInfo?.phone}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <MapPin size={14} style={{ color: "var(--accent)", marginTop: "3px" }} />
                        <span style={{ lineHeight: 1.4 }}>{order.deliveryInfo?.address}</span>
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
