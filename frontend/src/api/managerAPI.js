import API from "./axios";

export const createManager = async (managerData) => {
  const response = await API.post("/managers", managerData);
  return response.data;
};

export const getMyManager = async () => {
  const response = await API.get("/managers/my-restaurant");
  return response.data;
};

export const updateManager = async (managerId, managerData) => {
  const response = await API.put(`/managers/${managerId}`, managerData);
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await API.put("/users/profile", profileData);
  return response.data;
};
