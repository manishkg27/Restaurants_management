import API from "./axios";

export const getItems = async () => {
  const response = await API.get("/items");
  return response.data;
};

export const searchItems = async (params) => {
  const response = await API.get("/items/search", { params });
  return response.data;
};

export const createItem = async (restaurantId, formData) => {
  const response = await API.post(`/items/${restaurantId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
