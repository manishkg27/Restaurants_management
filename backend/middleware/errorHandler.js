const AppError = require('../utils/AppError');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  console.error(`[ReqID: ${req.id}]`, err);
  
  let error = { ...err };
  error.message = err.message;
  
  // Zod Validation Error
  if (err.name === 'ZodError') {
    const message = err.errors.map((e) => e.message).join(', ');
    error = new AppError(message, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new AppError(message, 400);
  }
  
  const isDev = process.env.NODE_ENV === "development";
  const statusCode = error.statusCode || 500;
  
  // If it's an operational error (AppError), we trust the message enough to send to client.
  // Otherwise, if production, hide the internal message.
  const message = error.isOperational 
    ? error.message 
    : (isDev ? error.message : "Internal Server Error");
  
  res.status(statusCode).json({
    success: false,
    message: message,
    stack: isDev ? err.stack : undefined,
    requestId: req.id
  });
};

module.exports = {
  asyncHandler,
  errorHandler
};
