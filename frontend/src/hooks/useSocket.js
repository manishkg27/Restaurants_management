import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const VITE_API = import.meta.env.VITE_API_URL;
const API_BASE = VITE_API ? VITE_API.split("/api")[0] : null;

const BROWSER_FALLBACK = typeof window !== "undefined"
  ? (window.location.hostname === "localhost" ? "http://localhost:8000" : window.location.origin)
  : "http://localhost:8000";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE || BROWSER_FALLBACK;

const useSocket = (user) => {
  const socketRef = useRef(null);
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Connect to socket server
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
      setSocketInstance(socketRef.current);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  const joinRestaurantRoom = (restaurantId) => {
    if (socketRef.current) {
      socketRef.current.emit("joinRestaurantRoom", { restaurantId });
    }
  };

  const joinUserRoom = (userId) => {
    if (socketRef.current) {
      socketRef.current.emit("joinUserRoom", { userId });
    }
  };

  const listen = (eventName, callback) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback);
      return () => socketRef.current.off(eventName, callback);
    }
  };

  const stopListening = (eventName, callback) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(eventName, callback);
      } else {
        socketRef.current.off(eventName);
      }
    }
  };

  const emit = (eventName, data) => {
    if (socketRef.current) {
      socketRef.current.emit(eventName, data);
    }
  };

  return {
    socket: socketInstance,
    joinRestaurantRoom,
    joinUserRoom,
    listen,
    stopListening,
    emit,
  };
};

export default useSocket;
