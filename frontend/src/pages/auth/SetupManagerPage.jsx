import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { setupManager } from "../../api/authAPI";
import { toast } from "react-toastify";
import "./Auth.css";

const SetupManagerPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      const res = await setupManager(token, password);
      if (res.success) {
        toast.success(res.message || "Account verified and password set! You can now log in.");
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to setup account. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Verify & Setup Account</h2>
        <p className="auth-subtitle">
          Welcome! Please set a secure password to verify your email and activate your manager account.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password" className="form-label">New Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Setting up..." : "Verify & Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupManagerPage;
