// frontend/src/context/AuthContext.jsx

import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

// Create the actual Context object
const AuthContext = createContext();

// A custom hook — lets any component just call useAuth() instead of
// importing useContext + AuthContext separately every time
export const useAuth = () => useContext(AuthContext);

// The Provider component — wraps our whole app, and holds the real state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load (e.g., page refresh), check if a token already
  // exists in localStorage, and if so, restore the user's session
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        // We trust the saved user data immediately for a fast UI,
        // but let's confirm the token is still valid with the backend
        try {
          const response = await api.get("/auth/me");
          setUser(response.data.user);
        } catch (error) {
          // Token expired or invalid — clear everything
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  // Called from the Register page
  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);
    const { token, user: newUser } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);

    return newUser;
  };

  // Called from the Login page
  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user: loggedInUser } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return loggedInUser;
  };

  // Called from anywhere (e.g., a "Logout" button)
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};