const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust this path based on your folder structure
const cookie = require("cookie");

const initializeSocket = (io) => {

  // ✅ Completed Phase 8 Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.eatify_token || socket.handshake.auth.token?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Extract the actual token string and verify it
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user to ensure they still exist in the database
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Attach the user object to the socket for use in event listeners
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    // Now you can safely log the authenticated user's name!
    console.log(`New client connected: ${socket.user.username} (${socket.id})`);

    // Owner joins their specific restaurant room
    socket.on("joinRestaurantRoom", ({ restaurantId }) => {
      // Security Check: Ensure they are actually an owner
      if (socket.user.role === "owner") {
        socket.join(`restaurant_${restaurantId}`);
        console.log(
          `${socket.user.username} joined room: restaurant_${restaurantId}`,
        );
      }
    });

    // Customer joins personal room
    socket.on("joinUserRoom", ({ userId }) => {
      // Security Check: Prevent users from joining other people's rooms
      if (socket.user._id.toString() === userId) {
        socket.join(`user_${userId}`);
        console.log(`${socket.user.username} joined room: user_${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.user.username}`);
    });
  });

  return io;
};

module.exports = initializeSocket;
