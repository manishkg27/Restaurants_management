import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats, getTransactions } from "../../api/orderAPI";
import { getMyRestaurant } from "../../api/restaurantAPI";
import useSocket from "../../hooks/useSocket";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import formatCurrency from "../../lib/formatCurrency";
import { toast } from "react-toastify";
import { 
  ClipboardList, 
  Store, 
  IndianRupee,
  Clock,
  CheckCircle2,
  Bell,
  AlertTriangle,
  Search,
  History
} from "lucide-react";
import { Link } from "react-router-dom";
import "./OwnerDashboardPage.css";

const OwnerDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Transactions State
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingTx, setLoadingTx] = useState(false);

  const socketHook = useSocket(user);

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

  const fetchTransactions = async (query = "", start = "", end = "") => {
    try {
      setLoadingTx(true);
      const res = await getTransactions(query, start, end);
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchStatsAndRestaurant();
    fetchTransactions();
  }, []);

  // Debounced search & filter
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTransactions(searchQuery, startDate, endDate);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, startDate, endDate]);

  useEffect(() => {
    let cleanup = null;
    if (restaurant && socketHook.socket) {
      socketHook.joinRestaurantRoom(restaurant._id);

      cleanup = socketHook.listen("newOrder", (data) => {
        toast.info(data.message || "New order received!", {
          position: "top-right",
          autoClose: 5000,
        });
        
        fetchStatsAndRestaurant();
      });
    }

    return () => {
      if (cleanup) {
        cleanup();
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
            <Link
              to="/owner/menu"
              className="owner-dashboard__btn owner-dashboard__btn--secondary"
            >
              Manage Menu
            </Link>
            <Link
              to="/owner/orders"
              className="owner-dashboard__btn owner-dashboard__btn--primary"
            >
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

          {/* Cancelled */}
          <div className="owner-dashboard__stat-card">
            <div
              className="owner-dashboard__stat-icon"
              style={{ backgroundColor: "#ffffff", color: "#dc2626" }}
            >
              <AlertTriangle size={18} />
            </div>
            <div className="owner-dashboard__stat-info">
              <span className="owner-dashboard__stat-label">Cancelled</span>
              <h3
                className="owner-dashboard__stat-value"
                style={{ color: "#dc2626" }}
              >
                {stats?.cancelledOrders || 0}
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
            This dashboard is connected to the backend WebSocket stream. Newly
            placed customer orders will trigger immediate desktop alerts and
            automatically refresh metrics.
          </p>
        </div>
        </div>

        {/* Transaction History Section */}
        <div className="owner-dashboard__transactions" style={{ marginTop: '2rem', backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History size={20} color="#ea580c" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Transaction Ledger</h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ position: 'relative', width: '250px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input
                  type="text"
                  placeholder="Search name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px 8px 36px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {loadingTx ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>No transactions found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px', fontWeight: '600' }}>Order ID</th>
                    <th style={{ padding: '12px', fontWeight: '600' }}>Customer</th>
                    <th style={{ padding: '12px', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '12px', fontWeight: '600' }}>Amount</th>
                    <th style={{ padding: '12px', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px 12px', color: '#ea580c', fontWeight: '500', fontSize: '0.9rem' }}>#{tx._id.slice(-6).toUpperCase()}</td>
                      <td style={{ padding: '16px 12px', color: '#111827', fontWeight: '500' }}>{tx.deliveryInfo?.name || 'Unknown'}</td>
                      <td style={{ padding: '16px 12px', color: '#4b5563', fontSize: '0.9rem' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '16px 12px', color: '#111827', fontWeight: '600' }}>{formatCurrency(tx.totalPrice)}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '999px', 
                          fontSize: '0.75rem', 
                          fontWeight: '600',
                          backgroundColor: tx.deliveryStatus === 'delivered' ? '#dcfce7' : '#fef3c7',
                          color: tx.deliveryStatus === 'delivered' ? '#166534' : '#92400e'
                        }}>
                          {tx.deliveryStatus.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
  );
};

export default OwnerDashboardPage;
