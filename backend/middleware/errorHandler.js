const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  console.error(`[ReqID: ${req.id}] ${err.stack}`);
  
  const isDev = process.env.NODE_ENV === "development";
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: isDev ? (err.message || "Server Error") : "Internal Server Error",
    stack: isDev ? err.stack : undefined,
    requestId: req.id
  });
};

module.exports = {
  asyncHandler,
  errorHandler
};
