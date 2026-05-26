const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const setupSocket = require("./socket/socketHandler");

// Load env vars
dotenv.config();

// (Your MongoDB connection logic goes here)
const connectDB = require('./config/db');
connectDB();

const app = express();

// Wrap Express with HTTP Server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io with CORS settings
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// Make 'io' globally accessible to our Express controllers
app.set("io", io);

// Initialize WebSocket handler
setupSocket(io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes Hookup
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/restaurants", require("./routes/restaurantRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/managers", require("./routes/managerRoutes"));

// Global Error Handler (Optional but recommended catch-all)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Important: Use server.listen instead of app.listen!
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Eatify MERN Server running on port ${PORT}`);
});
