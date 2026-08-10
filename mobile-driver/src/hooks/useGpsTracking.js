// mobile-driver/src/hooks/useGpsTracking.js

import { useRef, useEffect, useState } from "react";
import api from "../services/api";

// How often (in milliseconds) we send the latest known position to the backend
const SEND_INTERVAL_MS = 5000;

// tripId: pass a real trip ID to start tracking; pass null/undefined to stop
export const useGpsTracking = (tripId) => {
  const [gpsStatus, setGpsStatus] = useState("idle"); // idle | tracking | error
  const [gpsError, setGpsError] = useState("");
  const [lastSentAt, setLastSentAt] = useState(null);

  // Refs let us access the LATEST values inside callbacks/intervals
  // without those callbacks needing to be recreated on every render
  const latestPositionRef = useRef(null);
  const watchIdRef = useRef(null);
  const intervalIdRef = useRef(null);

  useEffect(() => {
    // If there's no active trip, make sure any previous tracking is stopped,
    // and do nothing further
    if (!tripId) {
      stopTracking();
      setGpsStatus("idle");
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatus("error");
      setGpsError("Geolocation is not supported on this device/browser.");
      return;
    }

    // Start watching position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        latestPositionRef.current = position;
        setGpsStatus("tracking");
        setGpsError("");
      },
      (error) => {
        setGpsStatus("error");
        setGpsError(getGeolocationErrorMessage(error));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0, // never use a cached position, always get fresh data
        timeout: 15000,
      }
    );

    // Every SEND_INTERVAL_MS, send whatever the latest known position is
    intervalIdRef.current = setInterval(async () => {
      const position = latestPositionRef.current;
      if (!position) return; // no GPS fix yet, nothing to send

      const { longitude, latitude, speed, heading } = position.coords;

      try {
        await api.post("/trips/update-location", {
          tripId,
          longitude,
          latitude,
          speed: speed || 0,
          heading: heading !== null ? heading : undefined,
        });
        setLastSentAt(new Date());
      } catch (err) {
        console.error("Failed to send location update:", err);
      }
    }, SEND_INTERVAL_MS);

    // Cleanup: runs when tripId changes OR component unmounts
    return () => {
      stopTracking();
    };
  }, [tripId]);

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    latestPositionRef.current = null;
  };

  return { gpsStatus, gpsError, lastSentAt };
};

// Converts the browser's numeric error codes into readable messages
const getGeolocationErrorMessage = (error) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission denied. Please enable it in your browser settings.";
    case error.POSITION_UNAVAILABLE:
      return "Location information is currently unavailable.";
    case error.TIMEOUT:
      return "Location request timed out. Retrying...";
    default:
      return "An unknown error occurred while getting your location.";
  }
};