import React, { useState } from "react";
import { Star } from "lucide-react";

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
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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
            style={{
              background: "none",
              border: "none",
              cursor: onChange ? "pointer" : "default",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform var(--transition-fast)",
            }}
            onMouseOver={(e) => {
              if (onChange) e.currentTarget.style.transform = "scale(1.15)";
            }}
            onMouseOut={(e) => {
              if (onChange) e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Star
              size={size}
              fill={isFilled ? "#f59e0b" : "none"}
              color={isFilled ? "#f59e0b" : "var(--text-muted)"}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
