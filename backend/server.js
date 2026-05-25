const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const initializeSocket = require("./socket/socketHandler");

// Load env vars
dotenv.config();

// Connect to database
connectDB();


// Middleware
app.use(cors()); // Allow Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// HTTP Server creation (needed for Socket.io)
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Make io accessible to our routers via req.app.get('io')
app.set("io", io);

// Basic Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Eatify API is running...",
  });
});

// Phase 2-9 Route Imports will go here
// e.g., app.use('/api/auth', authRoutes);
app.use("/api/restaurants", require("./routes/restaurantRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Global Error Handler (Section 6.3 of Architecture)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
