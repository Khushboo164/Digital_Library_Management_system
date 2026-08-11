import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import mainImage from "../assets/main.png";
import { FaUser, FaEnvelope, FaLock, FaKey, FaArrowLeft, FaUserPlus, FaBook, FaEye, FaEyeSlash, FaCheckCircle, FaRedoAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  
  // Step State
  const [step, setStep] = useState(1);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [secretCode, setSecretCode] = useState("");
  const [otp, setOtp] = useState("");
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(300);
  
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    if (role === "admin" || role === "librarian") {
      if (!secretCode) {
        toast.error(`Secret code is required for ${role} role`);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await api.post("/auth/send-otp", { email });
      toast.success(response.data.message || "OTP sent to your email!");
      setStep(2);
      setTimer(300);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    
    setLoading(true);

    try {
      const payload = { name, email, password, role, otp };
      if (role === "admin" || role === "librarian") {
        payload.secretCode = secretCode;
      }

      const response = await api.post("/auth/register", payload);
      toast.success(response.data.message || "Registration Successful! Please login.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Fluid Blobs */}
      <div className="register-blob-1"></div>
      <div className="register-blob-2"></div>
      <div className="register-blob-3"></div>

      <div className="register-card animate-fade-in-up">
        {/* Form Side */}
        <div className="register-form-side">
          <div className="register-brand-container">
            <div className="register-brand">
              <div className="brand-icon-wrapper">
                <FaBook className="register-brand-icon-only" />
              </div>
              <span className="register-brand-text">BookSphere</span>
            </div>
            <span className="register-brand-tagline">Explore • Learn • Grow</span>
          </div>
          
          <div className="register-header">
            <h2 className="register-welcome">
              {step === 1 ? 'Create Account' : 'Verify Email'} <span className="sparkle">✨</span>
            </h2>
            {step === 1 ? (
                <p className="register-subtitle">
                  Join us and start your reading journey.
                </p>
            ) : (
                <button type="button" className="back-link" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <FaArrowLeft /> Change Email
                </button>
            )}
            <div className="header-line"></div>
          </div>

          {step === 1 ? (
              <>
                  <div className="role-picker">
                    <button
                      type="button"
                      className={`role-option ${role === "member" ? "active" : ""}`}
                      onClick={() => { setRole("member"); setSecretCode(""); }}
                    >
                      Member
                    </button>
                    <button
                      type="button"
                      className={`role-option ${role === "librarian" ? "active" : ""}`}
                      onClick={() => { setRole("librarian"); setSecretCode(""); }}
                    >
                      Librarian
                    </button>
                    <button
                      type="button"
                      className={`role-option ${role === "admin" ? "active" : ""}`}
                      onClick={() => { setRole("admin"); setSecretCode(""); }}
                    >
                      Admin
                    </button>
                  </div>

                  <form onSubmit={handleSendOtp} className="register-form">
                    <div className="form-field">
                      <label className="form-label">Full Name</label>
                      <div className="input-wrapper">
                        <div className="icon-box">
                          <FaUser className="field-icon" />
                        </div>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="input input-filled input-with-field-icon"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

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
                          placeholder="you@example.com"
                        />
                        <div className="input-success-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
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
                          placeholder="Min 6 characters"
                          minLength="6"
                        />
                        <button type="button" className="toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    {(role === "admin" || role === "librarian") && (
                      <div className="form-field secret-code-field">
                        <label className="form-label">{role.charAt(0).toUpperCase() + role.slice(1)} Secret Code</label>
                        <div className="input-wrapper">
                          <div className="icon-box">
                            <FaKey className="field-icon" />
                          </div>
                          <input
                            type="password"
                            required
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value)}
                            className="input input-filled input-with-field-icon"
                            placeholder="Enter secret code"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn register-submit-btn"
                    >
                      <FaUserPlus /> {loading ? "Sending OTP..." : "Continue to Verify"}
                    </button>

                    <div className="register-divider">
                      <span>or</span>
                    </div>

                    <p className="register-footer-text">
                      Already have an account? <Link to="/login">Sign In</Link>
                    </p>
                  </form>
              </>
          ) : (
              <form onSubmit={handleRegister} className="register-form otp-form animate-fade-in-up">
                  <div className="otp-info">
                      <p>We've sent a 6-digit verification code to:</p>
                      <strong>{email}</strong>
                  </div>
                  
                  <div className="form-field">
                    <label className="form-label">Verification Code</label>
                    <div className="otp-input-container">
                        <input
                          type="text"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                          className="input input-filled otp-input"
                          placeholder="000000"
                          maxLength="6"
                        />
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--primary-light)', padding: '10px 12px', borderRadius: '6px' }}>
                      <strong>💡 Demo Mode:</strong> Use code <strong>123456</strong> to verify instantly.
                    </div>
                  </div>
                  
                  <div className="otp-actions">
                      <span className={`timer ${timer === 0 ? 'expired' : ''}`}>
                          {timer > 0 ? `Code expires in ${formatTime(timer)}` : 'Code expired'}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleSendOtp()} 
                        disabled={timer > 0 || loading}
                        className="btn-resend"
                      >
                          <FaRedoAlt /> Resend Code
                      </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="btn register-submit-btn"
                    style={{ marginTop: '1rem' }}
                  >
                    <FaCheckCircle /> {loading ? "Verifying..." : "Verify & Create Account"}
                  </button>
              </form>
          )}
        </div>

        {/* Visual Side */}
        <div className="register-visual-side">
          <div className="visual-background-circle"></div>
          <img
            src={mainImage}
            alt="Library Illustration"
            className="register-visual-img"
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

export default Register;
