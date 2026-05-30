import React, { useState, useEffect } from "react";
import { getItemFeedback } from "../../api/feedbackAPI";
import { X, Star, User } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import "./ReviewsModal.css";

const ReviewsModal = ({ itemId, itemName, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getItemFeedback(itemId);
        if (data.success) {
          setReviews(data.data);
        } else {
          setError(data.message || "Failed to load reviews");
        }
      } catch (err) {
        setError("Error loading reviews");
      } finally {
        setLoading(false);
      }
    };
    
    if (itemId) {
      fetchReviews();
    }
  }, [itemId]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="reviews-modal__backdrop" onClick={onClose}>
      <div className="reviews-modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="reviews-modal__header">
          <h3 className="reviews-modal__title">Reviews for {itemName}</h3>
          <button className="reviews-modal__close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="reviews-modal__content">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="reviews-modal__message reviews-modal__message--error">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="reviews-modal__message">No reviews found for this item.</div>
          ) : (
            <div className="reviews-modal__list">
              {reviews.map((review) => (
                <div key={review._id} className="reviews-modal__item">
                  <div className="reviews-modal__item-header">
                    <div className="reviews-modal__user">
                      <div className="reviews-modal__avatar">
                        <User size={16} />
                      </div>
                      <span className="reviews-modal__username">
                        {review.user?.profile?.fullName || review.user?.username || "Anonymous"}
                      </span>
                    </div>
                    <div className="reviews-modal__rating">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          fill={i < review.rating ? "#f59e0b" : "transparent"} 
                          color={i < review.rating ? "#f59e0b" : "#ccc"} 
                        />
                      ))}
                    </div>
                  </div>
                  {review.experience && (
                    <p className="reviews-modal__experience">{review.experience}</p>
                  )}
                  <span className="reviews-modal__date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;
