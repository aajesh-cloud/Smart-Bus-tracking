import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDriverAuth } from "../context/DriverAuthContext";

const DriverLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeFields, setShakeFields] = useState(false);
  const [success, setSuccess] = useState(false);
  const btnRef = useRef(null);

  const { login } = useDriverAuth();
  const navigate = useNavigate();

  const createRipple = (e) => {
    if (!btnRef.current) return;
    const btn = btnRef.current;
    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    const rect = btn.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.className = "ripple-ink";
    const existingRipple = btn.querySelector(".ripple-ink");
    if (existingRipple) existingRipple.remove();
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 650);
  };

  const clearShakeOnInput = () => {
    if (shakeFields) setShakeFields(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      setShakeFields(true);
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      setSuccess(true);
      setTimeout(() => navigate("/home"), 850);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Login failed";
      setError(message);
      setShakeFields(true);
    } finally {
      if (!success) setLoading(false);
    }
  };

  return (
    <div className="mobile-page">
      <div className="auth-mobile-wrap">
        <div className="mobile-card auth-mobile-card fade-in-scale">
          <div className="fade-in-up">
            <h2 className="auth-mobile-title">Driver Login</h2>
            <p className="auth-mobile-subtitle">Smart Bus Tracking System</p>
          </div>

          {error && (
            <div className="error-message fade-in-up">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group fade-in-up delay-1">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearShakeOnInput();
                }}
                className={shakeFields ? "has-error" : ""}
                placeholder="driver@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group fade-in-up delay-2">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearShakeOnInput();
                }}
                className={shakeFields ? "has-error" : ""}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="fade-in-up delay-3" style={{ marginTop: "6px" }}>
              <button
                type="submit"
                className={success ? "btn-success" : "btn-primary"}
                disabled={loading || success}
                ref={btnRef}
                onClick={createRipple}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Signing in...
                  </>
                ) : success ? (
                  <>
                    <span className="bounce-in">✅</span>
                    Welcome!
                  </>
                ) : (
                  <>
                    <span>🔐</span>
                    Login
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverLogin;
