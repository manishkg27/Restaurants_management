import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Core Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import OwnerRoute from "./components/OwnerRoute";
import CartSidebar from "./components/CartSidebar";
import RestaurantMismatchModal from "./components/RestaurantMismatchModal";

// Customer Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RestaurantsPage from "./pages/RestaurantsPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import SearchPage from "./pages/SearchPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";

// Owner Pages
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";
import RestaurantSetupPage from "./pages/owner/RestaurantSetupPage";
import MenuManagementPage from "./pages/owner/MenuManagementPage";
import OrdersManagementPage from "./pages/owner/OrdersManagementPage";
import ManagerProfilePage from "./pages/owner/ManagerProfilePage";

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
              <Routes>
                {/* Public Customer Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
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
              </Routes>
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
