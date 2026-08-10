// frontend/src/components/NotificationBell.jsx

import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import socket from "../services/socket";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for real-time "bus near stop" events, and prepend them
    // to our list immediately, incrementing the unread badge
    const handleBusNearStop = (data) => {
      setNotifications((prev) => [
        {
          _id: `temp-${Date.now()}`, // temporary key until next real fetch
          message: data.message,
          createdAt: new Date().toISOString(),
          bus: { busNumber: "" },
          stop: { stopName: data.stopName },
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("busNearStop", handleBusNearStop);

    return () => {
      socket.off("busNearStop", handleBusNearStop);
    };
  }, []);

  // Close the dropdown when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setUnreadCount(0); // mark as "read" when opened
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={handleToggle}
        style={{
          background: "none",
          border: "none",
          fontSize: "22px",
          cursor: "pointer",
          position: "relative",
          color: "#f1f5f9",
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              backgroundColor: "#ef4444",
              color: "#fff",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 700,
              padding: "1px 6px",
              minWidth: "18px",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "36px",
            right: 0,
            width: "320px",
            maxHeight: "400px",
            overflowY: "auto",
            backgroundColor: "#1e293b",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            zIndex: 100,
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #334155",
              fontWeight: 600,
            }}
          >
            Notifications
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: "20px", color: "#94a3b8", fontSize: "14px" }}>
              No notifications yet.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #334155",
                  fontSize: "13px",
                }}
              >
                <div>{notif.message}</div>
                <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
                  {formatTime(notif.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;