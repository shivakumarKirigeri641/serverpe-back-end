/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - ERROR HANDLER MIDDLEWARE
 * ==============================================
 * Global error handling middleware.
 */

const { sendError, HTTP_STATUS } = require("../utils/responseHelper");
const { AppError } = require("../utils/errors");
const logger = require("../utils/logger");
const config = require("../config");

/**
 * Handle 404 - Not Found errors
 */
const notFoundHandler = (req, res, next) => {
  logger.warn("Route not found", {
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  return sendError(
    res,
    HTTP_STATUS.NOT_FOUND,
    `Route ${req.method} ${req.path} not found`
  );
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error("Error occurred", {
    message: err.message,
    stack: config.server.isDevelopment ? err.stack : undefined,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
  });

  // Handle known operational errors
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.details);
  }

  // Handle validation errors (express-validator)
  if (err.array && typeof err.array === "function") {
    return sendError(
      res,
      HTTP_STATUS.BAD_REQUEST,
      "Validation failed",
      err.array()
    );
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, HTTP_STATUS.UNAUTHORIZED, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, HTTP_STATUS.UNAUTHORIZED, "Token expired");
  }

  // Handle Axios errors (from external API calls)
  if (err.isAxiosError) {
    const message = err.response?.data?.message || "External service error";
    const statusCode = err.response?.status || HTTP_STATUS.SERVICE_UNAVAILABLE;
    return sendError(res, statusCode, message, {
      originalError: config.server.isDevelopment ? err.message : undefined,
    });
  }

  // Handle syntax errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return sendError(
      res,
      HTTP_STATUS.BAD_REQUEST,
      "Invalid JSON in request body"
    );
  }

  // Default error response
  return sendError(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    config.server.isProduction
      ? config.messages.error.internalServerError
      : err.message,
    config.server.isDevelopment ? { stack: err.stack } : undefined
  );
};

/**
 * Async wrapper to catch errors in async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncHandler,
};
