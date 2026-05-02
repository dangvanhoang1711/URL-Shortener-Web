/**
 * Global Error Handler Middleware
 * Middleware này phải được gọi sau tất cả các routes
 * Handle tất cả loại errors: validation, database, auth, etc.
 */

const {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  UnprocessableEntityError,
  DatabaseError,
  ExternalServiceError
} = require('../utils/customErrors');

/**
 * Logging utility
 */
const logger = {
  error: (err, req, context = '') => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${context}`);
    console.error(`Method: ${req.method} | Path: ${req.path}`);
    console.error(`Error: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.error(`Stack: ${err.stack}`);
    }
  },
  warn: (message, context = '') => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${context}: ${message}`);
  },
  info: (message, context = '') => {
    console.log(`[INFO] ${new Date().toISOString()} - ${context}: ${message}`);
  }
};

/**
 * Handle Prisma errors
 */
const handlePrismaError = (error) => {
  const { code, meta } = error;

  // Unique constraint violation
  if (code === 'P2002') {
    const field = meta?.target?.[0] || 'field';
    return new ConflictError(`The ${field} is already in use`);
  }

  // Record not found
  if (code === 'P2025') {
    return new NotFoundError('Record');
  }

  // Foreign key constraint violation
  if (code === 'P2003') {
    const field = meta?.field_name || 'field';
    return new ValidationError(`Invalid reference to ${field}`);
  }

  // Records cannot be deleted due to relations
  if (code === 'P2014') {
    return new ConflictError('Cannot delete record due to existing relations');
  }

  // Unknown error
  return new DatabaseError('Database operation failed', error);
};

/**
 * Handle JWT errors
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token has expired');
  }
  return new AuthenticationError('Token verification failed');
};

/**
 * Handle validation errors (express-validator)
 */
const handleValidationError = (error) => {
  const errors = error.array();
  const firstError = errors[0];
  return new ValidationError(
    firstError?.msg || 'Validation failed',
    {
      field: firstError?.param,
      message: firstError?.msg
    }
  );
};

/**
 * Format error response
 */
const formatErrorResponse = (err, req, isDevelopment = false) => {
  const response = {
    error: err.errorCode || err.name || 'Error',
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500,
    timestamp: new Date().toISOString()
  };

  // Development mode - add extra details
  if (isDevelopment) {
    response.path = req.path;
    response.method = req.method;
    response.details = err.details || null;
    if (err.stack) {
      response.stack = err.stack.split('\n');
    }
  }

  // Rate limit - add retry-after
  if (err instanceof RateLimitError) {
    response.retryAfter = err.retryAfter;
  }

  return response;
};

/**
 * Main error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let appError = err;
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    // Handle different error types
    if (err.name === 'PrismaClientKnownRequestError' || err.code === 'P2002') {
      appError = handlePrismaError(err);
      logger.warn(err.message, 'Prisma Error');
    } else if (
      err.name === 'JsonWebTokenError' ||
      err.name === 'TokenExpiredError'
    ) {
      appError = handleJWTError(err);
      logger.warn(err.message, 'JWT Error');
    } else if (err.array && typeof err.array === 'function') {
      // express-validator error
      appError = handleValidationError(err);
      logger.warn(err.message, 'Validation Error');
    } else if (!(err instanceof AppError)) {
      // Unknown error - don't expose details
      logger.error(err, req, 'Unhandled Error');
      appError = new AppError(
        isDevelopment ? err.message : 'Internal Server Error',
        err.statusCode || 500,
        'INTERNAL_ERROR'
      );
    } else {
      // Already an AppError
      if (err.statusCode >= 500) {
        logger.error(err, req, 'Server Error');
      } else {
        logger.warn(err.message, 'Client Error');
      }
    }

    // Log error details
    const logContext = `[${req.method} ${req.path}]`;
    if (appError.statusCode >= 500) {
      logger.error(appError, req, logContext);
    }

    // Format and send response
    const errorResponse = formatErrorResponse(appError, req, isDevelopment);

    // Set additional headers if needed
    const responseHeaders = {};
    if (appError instanceof RateLimitError) {
      responseHeaders['Retry-After'] = appError.retryAfter;
    }

    res.status(appError.statusCode).set(responseHeaders).json(errorResponse);
  } catch (handlerError) {
    // Error in error handler itself
    logger.error(handlerError, req, 'Error Handler Exception');
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 404 Not Found Handler
 * Middleware này phải được gọi cuối cùng
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError('Endpoint', `${req.method} ${req.path}`);
  res.status(error.statusCode).json({
    error: error.errorCode,
    message: error.message,
    timestamp: error.timestamp,
    path: req.path,
    method: req.method
  });
};

/**
 * Async error wrapper
 * Dùng để wrap các async route handlers để catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validation error handler
 * Dùng sau express-validator checks
 */
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    const error = new ValidationError(firstError.msg, {
      field: firstError.param,
      message: firstError.msg
    });
    return res.status(error.statusCode).json({
      error: error.errorCode,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString()
    });
  }
  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  handleValidationErrors,
  logger,
  // Export error classes for use in controllers
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  UnprocessableEntityError,
  DatabaseError,
  ExternalServiceError
};

