import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000";

const useSocket = (token) => {
  const socketRef = useRef(null);
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    if (!token) return;

    // Connect to socket server
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
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
  }, [token]);

  const joinRoom = (roomName) => {
    if (socketRef.current) {
      socketRef.current.emit("joinRoom", roomName);
      // Wait, let's look at how the backend handles join.
      // In backend controllers, it might use customized joining methods, or generic rooms.
      // In the backend orderController we saw:
      // io.to(`restaurant_${restaurantId}`).emit('newOrder', ...)
      // io.to(`user_${order.user}`).emit('orderStatusUpdate', ...)
      // Let's make sure we emit whatever custom event or standard action is expected.
      // Let's check `backend/socket/socketHandler.js` to see what socket methods are expected.
    }
  };

  const listen = (eventName, callback) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback);
    }
  };

  const stopListening = (eventName) => {
    if (socketRef.current) {
      socketRef.current.off(eventName);
    }
  };

  const emit = (eventName, data) => {
    if (socketRef.current) {
      socketRef.current.emit(eventName, data);
    }
  };

  return {
    socket: socketInstance,
    joinRoom,
    listen,
    stopListening,
    emit,
  };
};

export default useSocket;
