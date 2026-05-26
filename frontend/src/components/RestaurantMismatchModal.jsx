import React from "react";
import { useCart } from "../context/CartContext";
import { AlertTriangle, X } from "lucide-react";
import "./RestaurantMismatchModal.css";

const RestaurantMismatchModal = () => {
  const { showMismatchModal, setShowMismatchModal, mismatchData, confirmMismatchAction } = useCart();

  if (!showMismatchModal || !mismatchData) return null;

  const { currentRestaurant, newRestaurant } = mismatchData;

  return (
    <div className="mismatch-modal__backdrop">
      <div className="mismatch-modal__panel">
        <button
          onClick={() => setShowMismatchModal(false)}
          className="mismatch-modal__close-btn"
        >
          <X size={18} />
        </button>

        <div className="mismatch-modal__content">
          <div className="mismatch-modal__icon-wrapper">
            <AlertTriangle size={24} />
          </div>

          <h3 className="mismatch-modal__title">
            Replace cart items?
          </h3>

          <p className="mismatch-modal__desc">
            Your cart already contains items from <strong className="mismatch-modal__desc-current">{currentRestaurant?.name}</strong>.
            Adding items from <strong className="mismatch-modal__desc-new">{newRestaurant?.name}</strong> will discard your existing selections.
          </p>

          <div className="mismatch-modal__actions">
            <button
              onClick={confirmMismatchAction}
              className="mismatch-modal__btn mismatch-modal__btn--primary"
            >
              Clear Cart & Add Item
            </button>
            <button
              onClick={() => setShowMismatchModal(false)}
              className="mismatch-modal__btn mismatch-modal__btn--secondary"
            >
              Keep Current Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantMismatchModal;
