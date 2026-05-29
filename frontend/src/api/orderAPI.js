import API from "./axios";

export const placeOrder = async (payload) => {
  const response = await API.post("/orders", payload);
  return response.data;
};

export const getMyOrders = async (status) => {
  const response = await API.get("/orders/my-orders", {
    params: { status },
  });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await API.get("/orders/dashboard-stats");
  return response.data;
};

export const getTransactions = async (searchQuery = "", startDate = "", endDate = "") => {
  const response = await API.get("/orders/transactions", {
    params: { search: searchQuery, startDate, endDate },
  });
  return response.data;
};

export const getRestaurantOrders = async () => {
  const response = await API.get("/orders/restaurant-orders");
  return response.data;
};

export const updateDeliveryStatus = async (orderId, deliveryStatus) => {
  const response = await API.patch(`/orders/${orderId}/delivery`, {
    deliveryStatus,
  });
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await API.delete(`/orders/${orderId}`);
  return response.data;
};


