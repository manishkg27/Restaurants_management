import React, { useEffect, useState } from "react";
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
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-xl mx-auto px-4">
        {/* Title */}
        <div className="flex items-center gap-2 mb-6">
          <ClipboardList size={22} className="text-orange-600" />
          <h2 className="text-lg font-bold text-gray-900 m-0">My Orders</h2>
        </div>

        {/* Tab Selectors: Rounded Buttons with Spacing */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
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
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer border transition shadow-xs ${
                  isSelected
                    ? "bg-orange-600 border-orange-600 text-white"
                    : "bg-white border-gray-300 text-gray-600 hover:text-orange-600 hover:border-orange-200"
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
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500 text-xs shadow-sm">
            <ClipboardList size={30} className="mx-auto mb-3 opacity-30 text-gray-400" />
            <p className="m-0 font-medium">No orders found in this category.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col gap-4"
              >
                {/* Header: Restaurant Name & Order Id */}
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-800 m-0">
                    {order.restaurant?.name || "Premium Restaurant"}
                  </h3>
                  <span className="text-xxs font-semibold text-gray-400 block mt-1">
                    Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </span>
                </div>

                {/* Body Details */}
                <div className="flex flex-col gap-2.5 text-xs text-gray-700">
                  {/* Status */}
                  <div className="flex items-center gap-1 font-semibold">
                    <span>Status:</span>
                    <span
                      className={`capitalize ${
                        order.deliveryStatus === "delivered"
                          ? "text-green-600"
                          : "text-orange-600 animate-pulse"
                      }`}
                    >
                      {order.deliveryStatus}
                    </span>
                  </div>

                  {/* Items list */}
                  <div>
                    <span className="font-semibold block mb-1">Items:</span>
                    <ul className="list-disc pl-5 m-0 flex flex-col gap-1 text-gray-600">
                      {order.items?.map((item, idx) => (
                        <li key={idx}>
                          <span>
                            {item.itemName} <strong className="text-gray-400 text-[10px]">x{item.quantity}</strong>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Grand Total */}
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center font-bold">
                    <span className="text-gray-600 text-xxs uppercase tracking-wider">Total Amount</span>
                    <span className="text-base text-gray-800">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {order.deliveryStatus !== "delivered" ? (
                    <button
                      onClick={() => alert(`Tracking your order from ${order.restaurant?.name}. Status is currently: ${order.deliveryStatus}`)}
                      className="flex-grow bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded text-xs cursor-pointer border-none text-center block no-underline"
                    >
                      Track Order
                    </button>
                  ) : (
                    <div className="w-full flex flex-col gap-2">
                      <span className="text-xxs font-bold text-gray-400 uppercase tracking-widest block text-center mb-1">
                        Help us improve
                      </span>
                      <div className="flex gap-2">
                        {order.items?.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedItemForFeedback(item.item || item._id)}
                            className="flex-grow bg-white hover:bg-orange-50 text-orange-600 border border-orange-600 font-semibold py-1 px-3 rounded text-xxs cursor-pointer"
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
                  <div className="mt-2 border-t border-gray-100 pt-4">
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
