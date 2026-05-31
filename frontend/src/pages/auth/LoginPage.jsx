import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./LoginPage.css";
import { resendVerification } from "../../api/authAPI";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const result = await login({ email, password });
    if (result.success) {
      toast.success(result.message || "Login successful!");
      navigate("/");
    } else {
      toast.error(result.message || "Failed to login");
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Please enter your email address to resend verification");
      return;
    }
    setLoading(true);
    try {
      const result = await resendVerification(email);
      if (result.success) {
        toast.success(result.message || "Verification email resent successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <div className="auth-page__header">
          <h2 className="auth-page__title">
            Welcome Back
          </h2>
          <p className="auth-page__subtitle">
            Login to satisfy your food cravings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-page__form">
          <div className="auth-page__form-group">
            <label className="auth-page__label" htmlFor="email">
              Email Address
            </label>
            <div className="auth-page__input-wrapper">
              <Mail size={16} className="auth-page__input-icon" />
              <input
                id="email"
                type="email"
                className="auth-page__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="auth-page__form-group">
            <label className="auth-page__label" htmlFor="password">
              Password
            </label>
            <div className="auth-page__input-wrapper">
              <Lock size={16} className="auth-page__input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="auth-page__input auth-page__input--password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="auth-page__password-toggle"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              <button 
                type="button" 
                onClick={handleResendVerification}
                disabled={loading}
                style={{ background: 'none', border: 'none', padding: 0, fontSize: "0.85rem", color: "#ea580c", cursor: loading ? "not-allowed" : "pointer" }}
              >
                Resend Verification?
              </button>
              <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "#ea580c", textDecoration: "none" }}>
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="auth-page__button"
            disabled={loading}
          >
            <LogIn size={16} />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-page__footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-page__link">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
