import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [shakeFields, setShakeFields] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();
  const btnRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (shakeFields[e.target.name]) {
      setShakeFields((s) => ({ ...s, [e.target.name]: false }));
    }
  };

  const handleRipple = (e) => {
    if (loading || !btnRef.current) return;
    const btn = btnRef.current;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement("span");
    ripple.className = "ripple-ink";
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await register({ ...formData, role: "passenger" });
      setSuccess("Account created! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
      const nextShake = {};
      Object.keys(formData).forEach((k) => (nextShake[k] = true));
      setShakeFields(nextShake);
      setTimeout(() => setShakeFields({}), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="subtitle">Sign up to start tracking your bus</p>

        {error && <div className="error-message" role="alert">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className={`form-group fade-in-up delay-1 ${shakeFields.name ? "has-error" : ""}`}>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className={`form-group fade-in-up delay-2 ${shakeFields.email ? "has-error" : ""}`}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="jane@college.edu"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className={`form-group fade-in-up delay-3 ${shakeFields.phone ? "has-error" : ""}`}>
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="+91 9XXXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          <div className={`form-group fade-in-up delay-4 ${shakeFields.password ? "has-error" : ""}`}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="fade-in-up delay-5" style={{ marginTop: "8px" }}>
            <button
              ref={btnRef}
              type="submit"
              className="btn-primary"
              disabled={loading || !!success}
              onClick={handleRipple}
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Creating account...</span>
                </>
              ) : success ? (
                <>
                  <span style={{ animation: "bounceIn 0.5s both" }}>🎉</span>
                  <span>Welcome aboard!</span>
                </>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>

        <div className="auth-footer fade-in delay-7">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
