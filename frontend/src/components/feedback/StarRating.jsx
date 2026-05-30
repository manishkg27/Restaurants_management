import React, { useState } from "react";
import { Star } from "lucide-react";
import "./StarRating.css";

const StarRating = ({ rating, onChange = null, maxStars = 5, size = 18 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index) => {
    if (onChange) setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (onChange) setHoverRating(0);
  };

  const handleClick = (index) => {
    if (onChange) onChange(index);
  };

  return (
    <div className="star-rating">
      {[...Array(maxStars)].map((_, i) => {
        const starIndex = i + 1;
        const isFilled = hoverRating ? starIndex <= hoverRating : starIndex <= rating;

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            className={`star-rating__btn ${onChange ? 'star-rating__btn--interactive' : ''}`}
          >
            <Star
              size={size}
              fill={isFilled ? "#f59e0b" : "none"}
              color={isFilled ? "#f59e0b" : "var(--color-text-muted)"}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
