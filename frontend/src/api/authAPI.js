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
