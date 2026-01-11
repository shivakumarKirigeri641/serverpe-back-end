/**
 * ============================================================================
 * CUSTOM ERROR CLASS - AppError
 * ============================================================================
 * 
 * This class provides a standardized way to handle errors throughout the
 * application. It includes both user-friendly and technical error messages.
 * 
 * STUDENT NOTE:
 * - userMessage: Show this to end users (non-technical, friendly)
 * - technicalMessage: Use for debugging and logging
 * - errorCode: Unique identifier for the error type
 * - statusCode: HTTP status code to return
 * 
 * USAGE EXAMPLE:
 * throw new AppError(
 *   'Unable to search trains. Please try again.',
 *   'Database connection timeout after 5000ms',
 *   'DB_TIMEOUT',
 *   503
 * );
 * 
 * ============================================================================
 */

class AppError extends Error {
  /**
   * Create a new AppError instance
   * 
   * @param {string} userMessage - Human-readable message for end users
   * @param {string} technicalMessage - Detailed message for developers/debugging
   * @param {string} errorCode - Unique error identifier (e.g., 'LICENSE_INVALID')
   * @param {number} statusCode - HTTP status code (default: 500)
   */
  constructor(
    userMessage = 'Something went wrong. Please try again.',
    technicalMessage = 'An unexpected error occurred',
    errorCode = 'INTERNAL_ERROR',
    statusCode = 500
  ) {
    // Call parent Error constructor with technical message
    super(technicalMessage);

    // Custom properties for enhanced error handling
    this.userMessage = userMessage;
    this.technicalMessage = technicalMessage;
    this.errorCode = errorCode;
    this.statusCode = statusCode;

    // Preserve stack trace (important for debugging)
    Error.captureStackTrace(this, this.constructor);

    // Set the error name to the class name
    this.name = 'AppError';

    // Timestamp for logging purposes
    this.timestamp = new Date().toISOString();
  }

  /**
   * Convert error to a JSON-safe object for API responses
   * 
   * @param {boolean} includeStack - Whether to include stack trace (dev mode only)
   * @returns {Object} Error object suitable for JSON response
   */
  toJSON(includeStack = false) {
    const errorResponse = {
      userMessage: this.userMessage,
      technicalMessage: this.technicalMessage,
      errorCode: this.errorCode,
      statusCode: this.statusCode,
      timestamp: this.timestamp
    };

    // Only include stack trace in development/debug mode
    if (includeStack) {
      errorResponse.stack = this.stack;
    }

    return errorResponse;
  }

  /**
   * Log the error to console with formatted output
   */
  log() {
    console.error('============================================');
    console.error(`🚨 ERROR: ${this.errorCode}`);
    console.error('============================================');
    console.error(`   User Message: ${this.userMessage}`);
    console.error(`   Technical: ${this.technicalMessage}`);
    console.error(`   Status Code: ${this.statusCode}`);
    console.error(`   Timestamp: ${this.timestamp}`);
    console.error('--------------------------------------------');
    console.error('Stack Trace:');
    console.error(this.stack);
    console.error('============================================');
  }

  // ===========================================================================
  // STATIC FACTORY METHODS
  // ===========================================================================
  // These methods provide convenient ways to create common error types

  /**
   * Create a license-related error
   */
  static licenseError(technicalDetails = 'License validation failed') {
    return new AppError(
      'Invalid or expired license. Please check your license key.',
      technicalDetails,
      'LICENSE_INVALID',
      403
    );
  }

  /**
   * Create a connection error
   */
  static connectionError(technicalDetails = 'Connection failed') {
    return new AppError(
      'Unable to connect to the server. Please check your internet connection.',
      technicalDetails,
      'CONNECTION_ERROR',
      503
    );
  }

  /**
   * Create a validation error
   */
  static validationError(field, technicalDetails = 'Validation failed') {
    return new AppError(
      `Invalid ${field}. Please check your input and try again.`,
      technicalDetails,
      'VALIDATION_ERROR',
      400
    );
  }

  /**
   * Create a not found error
   */
  static notFoundError(resource, technicalDetails = 'Resource not found') {
    return new AppError(
      `${resource} not found. Please verify and try again.`,
      technicalDetails,
      'NOT_FOUND',
      404
    );
  }

  /**
   * Create an authentication error
   */
  static authError(technicalDetails = 'Authentication failed') {
    return new AppError(
      'Authentication required. Please log in to continue.',
      technicalDetails,
      'AUTH_REQUIRED',
      401
    );
  }

  /**
   * Create from an Axios error
   */
  static fromAxiosError(axiosError) {
    // Handle different types of Axios errors
    if (axiosError.code === 'ECONNREFUSED') {
      return AppError.connectionError(
        `Connection refused: ${axiosError.config?.url || 'Unknown URL'}`
      );
    }

    if (axiosError.code === 'ETIMEDOUT' || axiosError.code === 'ECONNABORTED') {
      return new AppError(
        'Request timed out. The server is taking too long to respond.',
        `Timeout: ${axiosError.message}`,
        'TIMEOUT_ERROR',
        504
      );
    }

    // Handle API response errors
    if (axiosError.response) {
      const { status, data } = axiosError.response;
      return new AppError(
        data?.message || 'Server returned an error. Please try again.',
        `API Error: ${status} - ${JSON.stringify(data)}`,
        data?.errorCode || 'API_ERROR',
        status
      );
    }

    // Generic network error
    return new AppError(
      'Network error. Please check your connection.',
      axiosError.message,
      'NETWORK_ERROR',
      500
    );
  }
}

module.exports = AppError;
