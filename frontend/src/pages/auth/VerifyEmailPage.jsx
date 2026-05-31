import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../../api/authAPI";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "./Auth.css";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        if (response.success) {
          toast.success(response.message);
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Email verification failed");
        toast.error(err.response?.data?.message || "Email verification failed");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <h2 className="auth-title">Email Verification</h2>
        {loading ? (
          <div style={{ padding: "2rem" }}>
            <LoadingSpinner />
            <p style={{ marginTop: "1rem" }}>Verifying your email...</p>
          </div>
        ) : error ? (
          <div style={{ padding: "2rem" }}>
            <div style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</div>
            <button className="btn btn-primary" onClick={() => navigate("/login")}>
              Back to Login
            </button>
          </div>
        ) : (
          <div style={{ padding: "2rem" }}>
            <div style={{ color: "#22c55e", marginBottom: "1rem" }}>
              Email verified successfully!
            </div>
            <p>Redirecting you to login...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
