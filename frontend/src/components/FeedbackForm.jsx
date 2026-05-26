import React, { useState } from "react";
import StarRating from "./StarRating";
import { submitFeedback } from "../api/feedbackAPI";
import { toast } from "react-toastify";

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
      const response = await submitFeedback({ item: itemId, rating, comment });
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
    <form onSubmit={handleSubmit} className="glass" style={{ padding: "20px", borderRadius: "var(--radius-md)" }}>
      <h4 style={{ fontFamily: "var(--font-heading)", marginBottom: "12px", fontSize: "1.1rem" }}>
        Review this item
      </h4>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}>Rating:</span>
        <StarRating rating={rating} onChange={setRating} size={22} />
      </div>

      <div className="form-group">
        <label htmlFor="comment" className="form-label">
          Share your experience (Optional)
        </label>
        <textarea
          id="comment"
          className="form-input"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like or dislike about this dish?"
          rows={3}
          style={{ resize: "none", height: "auto" }}
        />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

export default FeedbackForm;
