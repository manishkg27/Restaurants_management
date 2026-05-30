const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const setupSocket = require("./socket/socketHandler");
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const crypto = require('crypto');
const { errorHandler } = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// (Your MongoDB connection logic goes here)
const connectDB = require('./config/db');
connectDB();

const app = express();

// Wrap Express with HTTP Server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io with CORS settings
const ALLOWED_ORIGINS = [process.env.FRONTEND_URL || 'http://localhost:5173'];
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Make 'io' globally accessible to our Express controllers
app.set("io", io);

// Initialize WebSocket handler
setupSocket(io);

// Request ID & Logging
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  next();
});

morgan.token('id', function getId(req) {
  return req.id;
});

const isDev = process.env.NODE_ENV === "development";
if (isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan(':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));
}

// Middleware
app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Rate Limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many attempts, please try again later.' });
const feedbackLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: 'Too many feedback submissions, please try again later.' });

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/feedback', feedbackLimiter);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy", timestamp: new Date() });
});

// Routes Hookup
app.use("/api/v1/auth", require("./routes/v1/authRoutes"));
app.use("/api/v1/users", require("./routes/v1/userRoutes"));
app.use("/api/v1/restaurants", require("./routes/v1/restaurantRoutes"));
app.use("/api/v1/items", require("./routes/v1/itemRoutes"));
app.use("/api/v1/cart", require("./routes/v1/cartRoutes"));
app.use("/api/v1/orders", require("./routes/v1/orderRoutes"));
app.use("/api/v1/payments", require("./routes/v1/paymentRoutes"));
app.use("/api/v1/feedback", require("./routes/v1/feedbackRoutes"));
app.use("/api/v1/managers", require("./routes/v1/managerRoutes"));
app.use("/api/v1/notifications", require("./routes/v1/notificationRoutes"));

// 404 Catch-All Route
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler
app.use(errorHandler);

// Important: Use server.listen instead of app.listen!
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Eatify MERN Server running on port ${PORT}`);
});
