const { Server } = require("socket.io");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Update this to your frontend URL in production (e.g., "http://localhost:3000")
      methods: ["GET", "POST"],
    },
  });

  // Authentication Middleware (Placeholder for Phase 8)
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    // In Phase 8, we will verify the JWT here and attach user details to the socket
    // if (!token) return next(new Error("Authentication error"));
    next();
  });

  io.on("connection", (socket) => {
    console.log(`New client connected via Socket.io: ${socket.id}`);

    // Owner joins their specific restaurant room for order notifications
    socket.on("joinRestaurantRoom", ({ restaurantId }) => {
      socket.join(`restaurant_${restaurantId}`);
      console.log(
        `Socket ${socket.id} joined room: restaurant_${restaurantId}`,
      );
    });

    // Customer joins personal room for delivery updates
    socket.on("joinUserRoom", ({ userId }) => {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined room: user_${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initializeSocket;
