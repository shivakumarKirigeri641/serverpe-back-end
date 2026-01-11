/**
 * ============================================================================
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * ============================================================================
 * 
 * This middleware catches all errors thrown in the application and returns
 * a consistent, user-friendly error response.
 * 
 * ERROR RESPONSE FORMAT:
 * {
 *   "success": false,
 *   "error": {
 *     "userMessage": "Human-readable message for UI",
 *     "technicalMessage": "Debug info for developers",
 *     "errorCode": "ERROR_CODE",
 *     "statusCode": 500
 *   },
 *   "timestamp": "2026-01-11T12:00:00.000Z"
 * }
 * 
 * STUDENT NOTE:
 * - userMessage should be shown to end users
 * - technicalMessage should be logged or shown in debug mode
 * - errorCode can be used for programmatic error handling
 * 
 * ============================================================================
 */

const config = require('../config/config');
const AppError = require('../utils/AppError');

/**
 * Global Error Handler Middleware
 * 
 * Place this AFTER all routes to catch any unhandled errors
 */
function errorHandler(err, req, res, next) {
  // Log error details
  console.error('============================================');
  console.error('🚨 ERROR CAUGHT BY GLOBAL HANDLER');
  console.error('============================================');
  console.error(`   Path: ${req.method} ${req.path}`);
  console.error(`   Error: ${err.message}`);
  
  if (config.debug) {
    console.error('   Stack:', err.stack);
  }
  
  console.error('============================================');

  // Convert to AppError if not already
  let appError;
  
  if (err instanceof AppError) {
    appError = err;
  } else if (err.name === 'ValidationError') {
    // Handle validation errors
    appError = AppError.validationError('input', err.message);
  } else if (err.name === 'SyntaxError') {
    // Handle JSON parsing errors
    appError = new AppError(
      'Invalid request format. Please check your input.',
      err.message,
      'INVALID_JSON',
      400
    );
  } else {
    // Generic error
    appError = new AppError(
      'Something went wrong. Please try again later.',
      err.message,
      'INTERNAL_ERROR',
      500
    );
  }

  // Build error response
  const errorResponse = {
    success: false,
    poweredBy: 'ServerPE Student Package',
    error: {
      userMessage: appError.userMessage,
      technicalMessage: config.debug ? appError.technicalMessage : undefined,
      errorCode: appError.errorCode,
      statusCode: appError.statusCode
    },
    timestamp: new Date().toISOString()
  };

  // Include stack trace only in debug mode
  if (config.debug && appError.stack) {
    errorResponse.error.stack = appError.stack.split('\n').slice(0, 5);
  }

  // Send error response
  res.status(appError.statusCode).json(errorResponse);
}

/**
 * Not Found Handler
 * 
 * Handle requests to undefined routes
 */
function notFoundHandler(req, res, next) {
  const error = new AppError(
    `The requested endpoint '${req.path}' was not found.`,
    `404 Not Found: ${req.method} ${req.path}`,
    'ENDPOINT_NOT_FOUND',
    404
  );
  
  next(error);
}

/**
 * Async Handler Wrapper
 * 
 * Wraps async route handlers to automatically catch errors
 * and pass them to the error handler middleware.
 * 
 * USAGE:
 * router.get('/example', asyncHandler(async (req, res) => {
 *   // Your async code here
 *   // Errors are automatically caught!
 * }));
 * 
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function with error handling
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Try-Catch-Finally Wrapper
 * 
 * Provides a structured way to handle async operations with
 * explicit try, catch, and finally blocks.
 * 
 * USAGE:
 * const result = await tryCatchFinally(
 *   async () => { // Try
 *     return await someAsyncOperation();
 *   },
 *   (error) => { // Catch
 *     console.error('Operation failed:', error);
 *     throw AppError.fromAxiosError(error);
 *   },
 *   () => { // Finally
 *     console.log('Operation completed');
 *   }
 * );
 * 
 * @param {Function} tryFn - The main operation to execute
 * @param {Function} catchFn - Error handler function
 * @param {Function} finallyFn - Cleanup function (always runs)
 * @returns {Promise<any>} Result of the try function
 */
async function tryCatchFinally(tryFn, catchFn = null, finallyFn = null) {
  try {
    const result = await tryFn();
    return result;
  } catch (error) {
    if (catchFn) {
      return await catchFn(error);
    }
    throw error;
  } finally {
    if (finallyFn) {
      await finallyFn();
    }
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  tryCatchFinally
};
