// mobile-driver/src/context/DriverAuthContext.jsx

import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const DriverAuthContext = createContext();

export const useDriverAuth = () => useContext(DriverAuthContext);

export const DriverAuthProvider = ({ children }) => {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("driverToken");

      if (token) {
        try {
          const response = await api.get("/auth/me");
          // Security check: this app is for drivers only —
          // if somehow a non-driver token got in here, reject it
          if (response.data.user.role !== "driver") {
            localStorage.removeItem("driverToken");
            setDriver(null);
          } else {
            setDriver(response.data.user);
          }
        } catch (error) {
          localStorage.removeItem("driverToken");
          setDriver(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user } = response.data;

    if (user.role !== "driver") {
      throw new Error("This login is only for drivers.");
    }

    localStorage.setItem("driverToken", token);
    setDriver(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("driverToken");
    setDriver(null);
  };

  const value = { driver, loading, login, logout };

  return (
    <DriverAuthContext.Provider value={value}>
      {children}
    </DriverAuthContext.Provider>
  );
};