import React, { useState } from "react";
import StarRating from "./StarRating";
import { submitFeedback } from "../api/feedbackAPI";
import { toast } from "react-toastify";
import "./FeedbackForm.css";

const FeedbackForm = ({ itemId, onSuccess = null }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Please provide a rating between 1 and 5");
      return;
    }
    setSubmitting(true);
    try {
      const response = await submitFeedback({ itemId, rating, experience: comment });
      if (response.success) {
        toast.success(response.message || "Feedback submitted successfully!");
        setComment("");
        setRating(5);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="feedback-form">
      <h4 className="feedback-form__title">
        Review this item
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
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

export default FeedbackForm;
