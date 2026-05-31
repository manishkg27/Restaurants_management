import API from "./axios";

export const register = async (userData) => {
  const response = await API.post("/auth/register", userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await API.post("/auth/login", credentials);
  return response.data;
};

export const getProfile = async () => {
  const response = await API.get("/auth/profile");
  return response.data;
};

export const logout = async () => {
  const response = await API.post("/auth/logout");
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await API.get(`/auth/verify-email/${token}`);
  return response.data;
};

export const resendVerification = async (email) => {
  const response = await API.post("/auth/resend-verification", { email });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await API.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await API.put(`/auth/reset-password/${token}`, { password });
  return response.data;
};

export const setupManager = async (token, password) => {
  const response = await API.put(`/auth/setup-manager/${token}`, { password });
  return response.data;
};
