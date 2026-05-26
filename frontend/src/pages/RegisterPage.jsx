import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/authAPI";
import { toast } from "react-toastify";
import "./RegisterPage.css";
import { User, Mail, Lock, UserPlus, Shield } from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await register({ username, email, password, role });
      if (response.success) {
        toast.success("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <div className="auth-page__header">
          <h2 className="auth-page__title">
            Create Account
          </h2>
          <p className="auth-page__subtitle">
            Join Eatify to explore delicious foods.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-page__form">
          <div className="auth-page__form-group">
            <label className="auth-page__label" htmlFor="username">
              Username
            </label>
            <div className="auth-page__input-wrapper">
              <User size={16} className="auth-page__input-icon" />
              <input
                id="username"
                type="text"
                className="auth-page__input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="john_doe"
                required
              />
            </div>
          </div>

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
                placeholder="john@example.com"
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
                type="password"
                className="auth-page__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="auth-page__form-group">
            <label className="auth-page__label" htmlFor="role">
              I want to:
            </label>
            <div className="auth-page__input-wrapper">
              <Shield size={16} className="auth-page__input-icon" />
              <select
                id="role"
                className="auth-page__input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="customer">Order Food (Customer)</option>
                <option value="owner">Register Restaurant (Owner)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="auth-page__button"
            disabled={loading}
          >
            <UserPlus size={16} />
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-page__footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-page__link">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
