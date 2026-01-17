/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - AUTH SERVICE
 * ==============================================
 * Service layer for authentication operations.
 * This layer proxies to serverpe-back-end for actual authentication.
 */

const { authRepository } = require("../repositories");
const logger = require("../utils/logger");
const { isValidEmail } = require("../utils/validators");
const { ValidationError, AuthenticationError } = require("../utils/errors");

/**
 * Auth Service - Business Logic Layer for Authentication
 */
const authService = {
  /**
   * Send OTP to email via serverpe-back-end
   * @param {string} email - Email address
   * @param {boolean} ispayment - Is payment OTP (4-digit)
   * @returns {Promise<Object>} - OTP send result
   */
  sendOtp: async (email, ispayment = false) => {
    // Validate email
    if (!email || !isValidEmail(email)) {
      throw new ValidationError("Invalid email format");
    }

    logger.info("Sending OTP via serverpe-back-end", { email, ispayment });

    // Call serverpe-back-end API
    const result = await authRepository.sendOtp(email, ispayment);

    logger.info("OTP sent successfully", {
      email,
      ispayment,
      expiresIn: result.expires_in,
    });

    return result;
  },

  /**
   * Verify OTP via serverpe-back-end
   * @param {string} email - Email address
   * @param {string} otp - OTP to verify
   * @returns {Promise<Object>} - Verification result with cookie
   */
  verifyOtp: async (email, otp) => {
    // Validate inputs
    if (!email || !isValidEmail(email)) {
      throw new ValidationError("Invalid email format");
    }

    if (!otp || typeof otp !== "string") {
      throw new ValidationError("OTP is required");
    }

    logger.info("Verifying OTP via serverpe-back-end", { email });

    // Call serverpe-back-end API
    const result = await authRepository.verifyOtp(email, otp);

    if (!result.verified) {
      logger.warn("OTP verification failed", { email });
      throw new AuthenticationError("Invalid or expired OTP");
    }

    logger.info("OTP verified successfully", { email });

    return result;
  },

  /**
   * Verify payment OTP via serverpe-back-end (without JWT token)
   * @param {string} email - Email address
   * @param {string} otp - OTP to verify
   * @returns {Promise<Object>} - Verification result without cookie
   */
  verifyPaymentOtp: async (email, otp) => {
    // Validate inputs
    if (!email || !isValidEmail(email)) {
      throw new ValidationError("Invalid email format");
    }

    if (!otp || typeof otp !== "string") {
      throw new ValidationError("OTP is required");
    }

    logger.info("Verifying payment OTP via serverpe-back-end", { email });

    // Call serverpe-back-end API for payment OTP verification
    const result = await authRepository.verifyPaymentOtp(email, otp);

    if (!result.verified) {
      logger.warn("Payment OTP verification failed", { email });
      throw new AuthenticationError("Invalid or expired payment OTP");
    }

    logger.info("Payment OTP verified successfully", { email });

    return result;
  },

  /**
   * Check authentication status via serverpe-back-end
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} - User authentication data
   */
  checkAuth: async (token) => {
    if (!token) {
      throw new AuthenticationError("No authentication token provided");
    }

    logger.info("Checking auth status via serverpe-back-end");

    const result = await authRepository.checkAuth(token);

    if (!result) {
      throw new AuthenticationError("Not authenticated");
    }

    return result;
  },

  /**
   * Check if user is authenticated (from middleware)
   * @param {Object} user - User object from request
   * @returns {Object} - User authentication status
   */
  checkAuthStatus: (user) => {
    if (!user || !user.email) {
      throw new AuthenticationError("Not authenticated");
    }

    return {
      email: user.email,
      mobile_number: user.mobile_number,
      authenticated: true,
    };
  },

  /**
   * Logout via serverpe-back-end
   * @returns {Promise<Object>} - Logout result
   */
  logout: async () => {
    logger.info("Logging out via serverpe-back-end");
    return await authRepository.logout();
  },
};

module.exports = authService;
