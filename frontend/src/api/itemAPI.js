import API from "./axios";

export const getItems = async (params = {}) => {
  const response = await API.get("/items", { params });
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

export const updateItem = async (itemId, formData) => {
  const response = await API.put(`/items/${itemId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteItem = async (itemId) => {
  const response = await API.delete(`/items/${itemId}`);
  return response.data;
};
