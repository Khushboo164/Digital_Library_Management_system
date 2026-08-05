import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import mainImage from "../assets/main.png";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaSignInAlt, FaUserPlus, FaBook } from "react-icons/fa";
import { toast } from "react-toastify";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success(response.data.message || "Login Successful");

      const userRole = response.data.user.role;
      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "librarian") {
        navigate("/librarian/dashboard");
      } else {
        navigate("/member/dashboard");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Fluid Blobs */}
      <div className="login-blob-1"></div>
      <div className="login-blob-2"></div>
      <div className="login-blob-3"></div>

      <div className="login-card animate-fade-in-up">
        {/* Form Side */}
        <div className="login-form-side">
          <div className="login-brand-container">
            <div className="login-brand">
              <div className="brand-icon-wrapper">
                <FaBook className="login-brand-icon-only" />
              </div>
              <span className="login-brand-text">BookSphere</span>
            </div>
            <span className="login-brand-tagline">Explore • Learn • Grow</span>
          </div>

          <div className="login-header">
            <h2 className="login-welcome">Welcome Back! <span className="sparkle">✨</span></h2>
            <p className="login-subtitle">Login to continue your reading journey.</p>
            <div className="header-line"></div>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-field">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <div className="icon-box">
                  <FaEnvelope className="field-icon" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-filled input-with-field-icon"
                  placeholder="sanjanapirwani446@gmail.com"
                />
                <div className="input-success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
              </div>
              <div className="forgot-password-wrapper">
                <Link to="/forgot-password" className="login-forgot">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <div className="icon-box">
                  <FaLock className="field-icon" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-filled input-with-field-icon"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn login-submit-btn"
            >
              <FaSignInAlt /> {loading ? "Logging in..." : "Login"}
            </button>

            <div className="login-divider">
              <span>or</span>
            </div>

            <p className="login-footer-text">
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </form>
        </div>

        {/* Visual Side */}
        <div className="login-visual-side">
          <div className="visual-background-circle"></div>
          <img
            src={mainImage}
            alt="Library Illustration"
            className="login-visual-img"
          />
          <div className="quote-card">
            <div className="quote-icon">❝</div>
            <div className="quote-content">
              <p className="quote-text">A room without books is like a body without a soul.</p>
              <p className="quote-author">— Cicero</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
