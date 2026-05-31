import API from "./axios";

export const getRestaurants = async (params) => {
  const response = await API.get("/restaurants", { params });
  return response.data;
};

export const getMyRestaurant = async () => {
  const response = await API.get("/restaurants/mine");
  return response.data;
};

export const getRestaurantById = async (id) => {
  const response = await API.get(`/restaurants/${id}`);
  return response.data;
};

export const createRestaurant = async (formData) => {
  const response = await API.post("/restaurants", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateRestaurant = async (id, formData) => {
  const response = await API.put(`/restaurants/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteRestaurant = async (id) => {
  const response = await API.delete(`/restaurants/${id}`);
  return response.data;
};
