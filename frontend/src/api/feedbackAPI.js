import API from "./axios";

export const submitFeedback = async (feedbackData) => {
  const response = await API.post("/feedback", feedbackData);
  return response.data;
};

export const getItemFeedback = async (itemId) => {
  const response = await API.get(`/feedback/item/${itemId}`);
  return response.data;
};
