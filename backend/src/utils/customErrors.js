/**
 * Custom Error Classes
 * Định nghĩa các loại lỗi khác nhau trong hệ thống
 */

class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
    this.isOperational = true; // Lỗi được handle (không phải bug)

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 - Bad Request (Validation Error)
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details; // { field, message }
  }
}

/**
 * 401 - Unauthorized (Authentication Error)
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * 403 - Forbidden (Authorization Error)
 */
class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * 404 - Not Found
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource', identifier = '') {
    const message = `${resource} not found${identifier ? ': ' + identifier : ''}`;
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

/**
 * 409 - Conflict (Duplicate, Constraint Violation)
 */
class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

/**
 * 429 - Too Many Requests (Rate Limit)
 */
class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later', retryAfter = 60) {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.retryAfter = retryAfter;
  }
}

/**
 * 422 - Unprocessable Entity (Business Logic Error)
 */
class UnprocessableEntityError extends AppError {
  constructor(message, details = null) {
    super(message, 422, 'UNPROCESSABLE_ENTITY_ERROR');
    this.details = details;
  }
}

/**
 * 500 - Database Error
 */
class DatabaseError extends AppError {
  constructor(message = 'Database error occurred', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

/**
 * 500 - External Service Error
 */
class ExternalServiceError extends AppError {
  constructor(service = 'External Service', message = 'Service unavailable') {
    super(`${service} error: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR');
  }
}

module.exports = {
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
