import API from "./axios";

export const getCart = async () => {
  const response = await API.get("/cart");
  return response.data;
};

export const addToCart = async (itemId) => {
  const response = await API.post("/cart", { itemId });
  return response.data;
};

export const updateCartQuantity = async (cartId, quantity) => {
  const response = await API.patch(`/cart/${cartId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (cartId) => {
  const response = await API.delete(`/cart/${cartId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await API.delete("/cart/clear");
  return response.data;
};
