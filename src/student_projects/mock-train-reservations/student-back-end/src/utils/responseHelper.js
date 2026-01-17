/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - RESPONSE HELPER
 * ==============================================
 * Standardized API response formatting for consistent responses.
 */

const config = require('../config');

/**
 * Send a standardized success response
 * @param {Response} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    poweredby: 'quicksmart-student.serverpe.in',
    mock_data: true,
    status: 'Success',
    successstatus: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send a standardized error response
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object|string} details - Optional error details
 */
const sendError = (res, statusCode, message, details = null) => {
  const response = {
    poweredby: 'quicksmart-student.serverpe.in',
    mock_data: true,
    status: 'Failed',
    successstatus: false,
    message,
    timestamp: new Date().toISOString(),
  };

  // Include error details in development mode
  if (details && config.server.isDevelopment) {
    response.error_details = typeof details === 'string' ? { message: details } : details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a validation error response
 * @param {Response} res - Express response object
 * @param {Array} errors - Validation errors array
 */
const sendValidationError = (res, errors) => {
  return res.status(400).json({
    poweredby: 'quicksmart-student.serverpe.in',
    mock_data: true,
    status: 'Failed',
    successstatus: false,
    message: 'Validation failed',
    errors: errors.map(err => ({
      field: err.path || err.param,
      message: err.msg || err.message,
      value: err.value,
    })),
    timestamp: new Date().toISOString(),
  });
};

/**
 * HTTP Status Codes Constants
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  HTTP_STATUS,
};
