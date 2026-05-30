import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Core Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";
import OwnerRoute from "./components/common/OwnerRoute";
import CartSidebar from "./components/cart/CartSidebar";
import RestaurantMismatchModal from "./components/cart/RestaurantMismatchModal";

import ErrorBoundary from "./components/common/ErrorBoundary";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Customer Pages
const HomePage = lazy(() => import("./pages/customer/HomePage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const RestaurantsPage = lazy(() => import("./pages/customer/RestaurantsPage"));
const RestaurantDetailPage = lazy(() => import("./pages/customer/RestaurantDetailPage"));
const SearchPage = lazy(() => import("./pages/customer/SearchPage"));
const CheckoutPage = lazy(() => import("./pages/customer/CheckoutPage"));
const OrdersPage = lazy(() => import("./pages/customer/OrdersPage"));
const ProfilePage = lazy(() => import("./pages/customer/ProfilePage"));
const OrderConfirmationPage = lazy(() => import("./pages/customer/OrderConfirmationPage"));
const NotFoundPage = lazy(() => import("./pages/customer/NotFoundPage"));

// Owner Pages
const OwnerDashboardPage = lazy(() => import("./pages/owner/OwnerDashboardPage"));
const RestaurantSetupPage = lazy(() => import("./pages/owner/RestaurantSetupPage"));
const MenuManagementPage = lazy(() => import("./pages/owner/MenuManagementPage"));
const OrdersManagementPage = lazy(() => import("./pages/owner/OrdersManagementPage"));
const ManagerProfilePage = lazy(() => import("./pages/owner/ManagerProfilePage"));

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            {/* Sticky Navigation */}
            <Navbar onCartClick={() => setIsCartOpen(true)} />

            {/* Cart Slide-in Sidebar */}
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* 409 Conflict Dialog */}
            <RestaurantMismatchModal />

            {/* Main Content Area */}
            <main style={{ flexGrow: 1 }}>
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner fullPage />}>
                  <Routes>
                    {/* Public Customer Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                    <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                    <Route path="/restaurants" element={<RestaurantsPage />} />
                    <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
                    <Route path="/search" element={<SearchPage />} />

                    {/* Protected Customer Routes */}
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <OrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/order-confirmation/:orderId"
                      element={
                        <ProtectedRoute>
                          <OrderConfirmationPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Protected Owner Routes */}
                    <Route
                      path="/owner/dashboard"
                      element={
                        <OwnerRoute>
                          <OwnerDashboardPage />
                        </OwnerRoute>
                      }
                    />
                    <Route
                      path="/owner/restaurant"
                      element={
                        <OwnerRoute>
                          <RestaurantSetupPage />
                        </OwnerRoute>
                      }
                    />
                    <Route
                      path="/owner/menu"
                      element={
                        <OwnerRoute>
                          <MenuManagementPage />
                        </OwnerRoute>
                      }
                    />
                    <Route
                      path="/owner/orders"
                      element={
                        <OwnerRoute>
                          <OrdersManagementPage />
                        </OwnerRoute>
                      }
                    />
                    <Route
                      path="/owner/manager"
                      element={
                        <OwnerRoute>
                          <ManagerProfilePage />
                        </OwnerRoute>
                      }
                    />
                    
                    {/* 404 Catch-All */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>

            {/* Global Footer */}
            <Footer />
          </div>

          {/* Alert Toasts */}
          <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
