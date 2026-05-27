import axios from "axios";

const API_URL = "http://localhost:8000/api/notifications";

const getAuthConfig = () => {
  const token = localStorage.getItem("eatify_token");
  if (!token) throw new Error("No token found");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getNotifications = async () => {
  try {
    const response = await axios.get(API_URL, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markAsRead = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/read`, {}, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await axios.patch(`${API_URL}/read-all`, {}, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};
