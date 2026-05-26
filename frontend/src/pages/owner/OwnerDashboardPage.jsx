import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats } from "../../api/orderAPI";
import { getMyRestaurant } from "../../api/restaurantAPI";
import useSocket from "../../hooks/useSocket";
import LoadingSpinner from "../../components/LoadingSpinner";
import formatCurrency from "../../utils/formatCurrency";
import { toast } from "react-toastify";
import { ClipboardList, IndianRupee, Clock, CheckCircle2, Store, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import "./OwnerDashboardPage.css";

const OwnerDashboardPage = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  const socketHook = useSocket(token);

  const fetchStatsAndRestaurant = async () => {
    try {
      const restResponse = await getMyRestaurant();
      if (restResponse.success && restResponse.data) {
        setRestaurant(restResponse.data);
      }
      
      const statsResponse = await getDashboardStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsAndRestaurant();
  }, []);

  useEffect(() => {
    if (restaurant && socketHook.socket) {
      socketHook.emit("joinRestaurantRoom", { restaurantId: restaurant._id });

      socketHook.listen("newOrder", (data) => {
        toast.info(data.message || "New order received!", {
          position: "top-right",
          autoClose: 5000,
        });
        
        fetchStatsAndRestaurant();
      });
    }

    return () => {
      if (socketHook.socket) {
        socketHook.stopListening("newOrder");
      }
    };
  }, [restaurant, socketHook.socket]);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="owner-dashboard">
      <div className="owner-dashboard__container">
        {/* Simple Shop Banner Card */}
        <div className="owner-dashboard__banner">
          <div className="owner-dashboard__banner-info">
            <div className="owner-dashboard__banner-icon">
              <Store size={22} />
            </div>
            <div className="owner-dashboard__banner-text">
              <h2 className="owner-dashboard__banner-title">
                {restaurant ? restaurant.name : "My Restaurant"}
              </h2>
              <p className="owner-dashboard__banner-subtitle">
                Owner Dashboard Stats & Real-time Live Orders Panel
              </p>
            </div>
          </div>

          <div className="owner-dashboard__banner-actions">
            <Link to="/owner/menu" className="owner-dashboard__btn owner-dashboard__btn--secondary">
              Manage Menu
            </Link>
            <Link to="/owner/orders" className="owner-dashboard__btn owner-dashboard__btn--primary">
              View Orders
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="owner-dashboard__stats">
          {/* Revenue */}
          <div className="owner-dashboard__stat-card">
            <div className="owner-dashboard__stat-icon owner-dashboard__stat-icon--green">
              <IndianRupee size={18} />
            </div>
            <div className="owner-dashboard__stat-info">
              <span className="owner-dashboard__stat-label">Total Revenue</span>
              <h3 className="owner-dashboard__stat-value owner-dashboard__stat-value--green">
                {formatCurrency(stats?.totalRevenue || 0)}
              </h3>
            </div>
          </div>

          {/* Orders */}
          <div className="owner-dashboard__stat-card">
            <div className="owner-dashboard__stat-icon owner-dashboard__stat-icon--orange">
              <ClipboardList size={18} />
            </div>
            <div className="owner-dashboard__stat-info">
              <span className="owner-dashboard__stat-label">Total Orders</span>
              <h3 className="owner-dashboard__stat-value owner-dashboard__stat-value--orange">
                {stats?.totalOrders || 0}
              </h3>
            </div>
          </div>

          {/* Pending */}
          <div className="owner-dashboard__stat-card">
            <div className="owner-dashboard__stat-icon owner-dashboard__stat-icon--yellow">
              <Clock size={18} />
            </div>
            <div className="owner-dashboard__stat-info">
              <span className="owner-dashboard__stat-label">Pending</span>
              <h3 className="owner-dashboard__stat-value owner-dashboard__stat-value--yellow">
                {stats?.pendingOrders || 0}
              </h3>
            </div>
          </div>

          {/* Delivered */}
          <div className="owner-dashboard__stat-card">
            <div className="owner-dashboard__stat-icon owner-dashboard__stat-icon--green">
              <CheckCircle2 size={18} />
            </div>
            <div className="owner-dashboard__stat-info">
              <span className="owner-dashboard__stat-label">Delivered</span>
              <h3 className="owner-dashboard__stat-value owner-dashboard__stat-value--green">
                {stats?.deliveredOrders || 0}
              </h3>
            </div>
          </div>
        </div>

        {/* Live Notification Area */}
        <div className="owner-dashboard__notification">
          <div className="owner-dashboard__notification-icon">
            <Bell size={18} />
          </div>
          <h3 className="owner-dashboard__notification-title">
            Real-Time Engine Active
          </h3>
          <p className="owner-dashboard__notification-desc">
            This dashboard is connected to the backend WebSocket stream. Newly placed customer orders will trigger immediate desktop alerts and automatically refresh metrics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
