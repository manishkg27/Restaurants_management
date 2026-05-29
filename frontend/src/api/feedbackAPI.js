import API from "./axios";

export const submitFeedback = async (feedbackData) => {
  const response = await API.post("/feedback", feedbackData);
  return response.data;
};

export const getItemFeedback = async (itemId) => {
  const response = await API.get(`/feedback/item/${itemId}`);
  return response.data;
};

export const checkFeedback = async (orderId, itemId) => {
  const response = await API.get(`/feedback/check/${orderId}/${itemId}`);
  return response.data;
};

export const updateFeedback = async (feedbackId, feedbackData) => {
  const response = await API.put(`/feedback/${feedbackId}`, feedbackData);
  return response.data;
};
