import React, { useState, useEffect } from "react";
import StarRating from "./StarRating";
import { submitFeedback, checkFeedback, updateFeedback } from "../api/feedbackAPI";
import { toast } from "react-toastify";
import "./FeedbackForm.css";

const FeedbackForm = ({ itemId, orderId, onSuccess = null }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingFeedbackId, setExistingFeedbackId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExistingFeedback = async () => {
      if (!orderId || !itemId) return;
      try {
        const response = await checkFeedback(orderId, itemId);
        if (response.success && response.hasReviewed) {
          setExistingFeedbackId(response.data._id);
          setRating(response.data.rating);
          setComment(response.data.experience);
        }
      } catch (error) {
        console.error("Failed to check existing feedback", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExistingFeedback();
  }, [orderId, itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Please provide a rating between 1 and 5");
      return;
    }
    setSubmitting(true);
    try {
      let response;
      if (existingFeedbackId) {
        response = await updateFeedback(existingFeedbackId, { rating, experience: comment });
      } else {
        response = await submitFeedback({ itemId, orderId, rating, experience: comment });
      }
      
      if (response.success) {
        toast.success(response.message || "Feedback saved successfully!");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="feedback-form">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="feedback-form">
      <h4 className="feedback-form__title">
        {existingFeedbackId ? "Edit your review" : "Review this item"}
      </h4>

      <div className="feedback-form__rating-row">
        <span className="feedback-form__rating-label">Rating:</span>
        <StarRating rating={rating} onChange={setRating} size={22} />
      </div>

      <div className="form-group">
        <label htmlFor="comment" className="form-label">
          Share your experience (Optional)
        </label>
        <textarea
          id="comment"
          className="form-input feedback-form__textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like or dislike about this dish?"
          rows={3}
        />
      </div>

      <button type="submit" className="btn btn--primary feedback-form__submit-btn" disabled={submitting}>
        {submitting ? "Saving..." : (existingFeedbackId ? "Update Review" : "Submit Review")}
      </button>
    </form>
  );
};

export default FeedbackForm;
