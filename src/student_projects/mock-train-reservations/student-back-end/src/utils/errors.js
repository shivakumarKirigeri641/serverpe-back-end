/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - CUSTOM ERROR CLASS
 * ==============================================
 * Custom error classes for structured error handling.
 */

/**
 * Base application error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error (401)
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', details = null) {
    super(message, 401, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error (403)
 */
class AuthorizationError extends AppError {
  constructor(message = 'Access denied', details = null) {
    super(message, 403, details);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error (404)
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error (409)
 */
class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = null) {
    super(message, 409, details);
    this.name = 'ConflictError';
  }
}

/**
 * Rate limit error (429)
 */
class RateLimitError extends AppError {
  constructor(message = 'Too many requests', details = null) {
    super(message, 429, details);
    this.name = 'RateLimitError';
  }
}

/**
 * External service error (503)
 */
class ExternalServiceError extends AppError {
  constructor(message = 'External service unavailable', details = null) {
    super(message, 503, details);
    this.name = 'ExternalServiceError';
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
  ExternalServiceError,
};
