/**
 * Global Error Handler Middleware
 * Middleware này phải được gọi sau tất cả các routes
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Default error response
  const errorResponse = {
    error: err.name || 'Error',
    message,
    timestamp: new Date().toISOString()
  };

  // Thêm request info nếu development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.path = req.path;
    errorResponse.method = req.method;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found Handler
 * Middleware này phải được gọi cuối cùng
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
