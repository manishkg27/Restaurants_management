import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

const StaffRoute = ({ children }) => {
  const { user, loading, isRestaurantStaff } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isRestaurantStaff()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default StaffRoute;
