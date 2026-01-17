/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - AUTH MIDDLEWARE
 * ==============================================
 * Middleware to verify JWT token for authenticated endpoints.
 */

const jwt = require("jsonwebtoken");
const { sendError, HTTP_STATUS } = require("../utils/responseHelper");
const logger = require("../utils/logger");
const config = require("../config");

/**
 * Middleware to check for valid JWT token
 * Looks for token in:
 * 1. Cookie (token)
 * 2. Authorization header (Bearer token)
 */
const checkAuth = (req, res, next) => {
  try {
    // Extract token from cookie or Authorization header
    const token =
      req.cookies?.[config.jwt.cookieName] ||
      req.headers["authorization"]?.replace("Bearer ", "");

    if (!token || token === "null" || token === "undefined") {
      logger.warn("Token not found", {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      return sendError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        config.messages.error.tokenNotFound
      );
    }

    // Verify the token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Attach decoded data to request
    req.user = {
      email: decoded.email,
      mobile_number: decoded.mobile_number,
    };
    req.email = decoded.email;
    req.mobile_number = decoded.mobile_number;

    logger.debug("Token verified", {
      email: decoded.email,
      path: req.path,
    });

    next();
  } catch (error) {
    logger.warn("Token verification failed", {
      error: error.message,
      path: req.path,
    });

    if (error.name === "TokenExpiredError") {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, "Token has expired");
    }

    if (error.name === "JsonWebTokenError") {
      return sendError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        config.messages.error.invalidToken
      );
    }

    return sendError(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      config.messages.error.invalidToken
    );
  }
};

/**
 * Optional auth middleware - doesn't fail if no token
 * Attaches user data if token is present and valid
 */
const optionalAuth = (req, res, next) => {
  try {
    const token =
      req.cookies?.[config.jwt.cookieName] ||
      req.headers["authorization"]?.replace("Bearer ", "");

    if (token && token !== "null" && token !== "undefined") {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = {
        email: decoded.email,
        mobile_number: decoded.mobile_number,
      };
      req.email = decoded.email;
      req.mobile_number = decoded.mobile_number;
    }
  } catch (error) {
    // Silently ignore auth errors in optional mode
    logger.debug("Optional auth failed", { error: error.message });
  }

  next();
};

/**
 * Generate JWT token for a user
 * @param {Object} payload - Token payload (email, mobile_number)
 * @returns {string} - JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Set auth cookie on response
 * @param {Response} res - Express response object
 * @param {string} token - JWT token
 */
const setAuthCookie = (res, token) => {
  res.cookie(config.jwt.cookieName, token, config.jwt.cookieOptions);
};

/**
 * Clear auth cookie on response
 * @param {Response} res - Express response object
 */
const clearAuthCookie = (res) => {
  res.clearCookie(config.jwt.cookieName, {
    path: "/",
    httpOnly: true,
    secure: config.server.isProduction,
    sameSite: "lax",
  });
};

module.exports = {
  checkAuth,
  optionalAuth,
  generateToken,
  setAuthCookie,
  clearAuthCookie,
};
