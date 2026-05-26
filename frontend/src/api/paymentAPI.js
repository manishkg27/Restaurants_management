import API from "./axios";

export const checkoutOrder = async (orderId) => {
  const response = await API.post(`/payments/checkout/${orderId}`);
  return response.data;
};

export const verifyPayment = async (verificationData) => {
  const response = await API.post("/payments/verify", verificationData);
  return response.data;
};
