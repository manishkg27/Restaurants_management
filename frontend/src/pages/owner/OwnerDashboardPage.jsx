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
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Simple Shop Banner Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
              <Store size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 m-0">
                {restaurant ? restaurant.name : "My Restaurant"}
              </h2>
              <p className="text-xs text-gray-500 m-0 mt-1">
                Owner Dashboard Stats & Real-time Live Orders Panel
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link to="/owner/menu" className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-semibold py-1.5 px-4 rounded text-xs no-underline">
              Manage Menu
            </Link>
            <Link to="/owner/orders" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-1.5 px-4 rounded text-xs no-underline">
              View Orders
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0">
              <IndianRupee size={18} />
            </div>
            <div>
              <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider block">Total Revenue</span>
              <h3 className="text-base font-extrabold text-green-600 m-0 mt-1">
                {formatCurrency(stats?.totalRevenue || 0)}
              </h3>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
              <ClipboardList size={18} />
            </div>
            <div>
              <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider block">Total Orders</span>
              <h3 className="text-base font-extrabold text-orange-600 m-0 mt-1">
                {stats?.totalOrders || 0}
              </h3>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded bg-yellow-50 text-yellow-600 flex items-center justify-center flex-shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider block">Pending</span>
              <h3 className="text-base font-extrabold text-yellow-600 m-0 mt-1">
                {stats?.pendingOrders || 0}
              </h3>
            </div>
          </div>

          {/* Delivered */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider block">Delivered</span>
              <h3 className="text-base font-extrabold text-green-600 m-0 mt-1">
                {stats?.deliveredOrders || 0}
              </h3>
            </div>
          </div>
        </div>

        {/* Live Notification Area */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
            <Bell size={18} />
          </div>
          <h3 className="text-sm font-bold text-gray-800 m-0">
            Real-Time Engine Active
          </h3>
          <p className="text-xs text-gray-500 max-w-md leading-relaxed m-0">
            This dashboard is connected to the backend WebSocket stream. Newly placed customer orders will trigger immediate desktop alerts and automatically refresh metrics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
