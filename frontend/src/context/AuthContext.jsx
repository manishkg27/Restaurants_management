import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { login as apiLogin, getProfile, logout as apiLogout } from "../api/authAPI";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const profileResponse = await getProfile();
          if (profileResponse.success) {
            setUser(profileResponse.data);
          } else {
            // Clean up invalid token
        }
      } catch (error) {
        console.error("Bootstrap auth failed:", error);
        setUser(null);
      }
      setLoading(false);
    };

    bootstrapAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await apiLogin(credentials);
      if (response.success && response.data) {
        setUser(response.data);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message || "Failed to login" };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Invalid credentials",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("API logout error:", error);
    } finally {
      setUser(null);
    }
  }, []);

  const isOwner = useCallback(() => {
    return user && user.role === "owner";
  }, [user]);

  const isRestaurantStaff = useCallback(() => {
    return user && (user.role === "owner" || user.role === "manager");
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    isOwner,
    isRestaurantStaff,
    setUser,
  }), [user, loading, login, logout, isOwner, isRestaurantStaff]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
