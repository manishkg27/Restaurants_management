import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ fullPage = false }) => {
  const spinnerElement = (
    <>
      <div className="loading-spinner__circle" />
      <p className="loading-spinner__text">
        Loading Eatify...
      </p>
    </>
  );

  if (fullPage) {
    return (
      <div className="loading-spinner loading-spinner--full-page">
        {spinnerElement}
      </div>
    );
  }

  return (
    <div className="loading-spinner">
      {spinnerElement}
    </div>
  );
};

export default LoadingSpinner;
