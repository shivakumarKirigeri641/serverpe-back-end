/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - MIDDLEWARE INDEX
 * ==============================================
 * Central export for all middleware modules.
 */

const {
  checkAuth,
  optionalAuth,
  generateToken,
  setAuthCookie,
  clearAuthCookie,
} = require("./checkAuth");
const {
  notFoundHandler,
  errorHandler,
  asyncHandler,
} = require("./errorHandler");
const requestLogger = require("./requestLogger");

module.exports = {
  // Auth middleware
  checkAuth,
  // Auth middleware
  checkAuth,
  optionalAuth,
  generateToken,
  setAuthCookie,
  clearAuthCookie,

  // Error handling
  notFoundHandler,
  errorHandler,
  asyncHandler,

  // Logging
  requestLogger,
};
