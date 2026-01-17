/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - AUTH REPOSITORY
 * ==============================================
 * Repository layer to communicate with serverpe-back-end API for authentication.
 */

const axios = require("axios");
const config = require("../config");
const logger = require("../utils/logger");
const { ExternalServiceError } = require("../utils/errors");

// Create axios instance for serverpe API
const serverpeApi = axios.create({
  baseURL: config.api.baseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": config.api.demoApiKey,
  },
  withCredentials: true,
});

// Request interceptor for logging
serverpeApi.interceptors.request.use(
  (reqConfig) => {
    logger.debug("Auth API request", {
      method: reqConfig.method?.toUpperCase(),
      url: reqConfig.url,
    });
    return reqConfig;
  },
  (error) => {
    logger.error("Auth API request error", { error: error.message });
    return Promise.reject(error);
  }
);

// Response interceptor for logging
serverpeApi.interceptors.response.use(
  (response) => {
    logger.debug("Auth API response", {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    logger.error("Auth API response error", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

/**
 * Handle API errors and convert to application errors
 * @param {Error} error - Axios error
 * @param {string} operation - Operation being performed
 */
const handleApiError = (error, operation) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || `Failed to ${operation}`;
    throw new ExternalServiceError(message, {
      statusCode: error.response.status,
      operation,
    });
  } else if (error.request) {
    // Request made but no response
    throw new ExternalServiceError(
      "Authentication service not responding. Please try again later.",
      { operation }
    );
  } else {
    // Request setup error
    throw new ExternalServiceError(`Service error: ${error.message}`, {
      operation,
    });
  }
};

/**
 * Auth Repository Methods
 * Each method calls the corresponding endpoint in serverpe-back-end
 */
const authRepository = {
  /**
   * Send OTP to email via serverpe-back-end
   * @param {string} email - Email address
   * @param {boolean} ispayment - Is payment OTP
   * @returns {Promise<Object>} - OTP send result
   */
  sendOtp: async (email, ispayment = false) => {
    try {
      const response = await serverpeApi.post("/train/send-otp", {
        email,
        ispayment,
      });
      return {
        email: response.data?.data?.email || email,
        expires_in: response.data?.data?.expires_in || "10 minutes",
        otp: response.data?.data?.otp, // Only in development
      };
    } catch (error) {
      handleApiError(error, "send OTP");
    }
  },

  /**
   * Verify OTP via serverpe-back-end
   * @param {string} email - Email address
   * @param {string} otp - OTP to verify
   * @returns {Promise<Object>} - Verification result with cookie
   */
  verifyOtp: async (email, otp) => {
    try {
      const response = await serverpeApi.post("/train/verify-otp", {
        email,
        otp,
      });

      // Extract set-cookie header from response
      const setCookieHeader = response.headers["set-cookie"];

      return {
        email: response.data?.data?.email || email,
        verified: response.data?.data?.verified || true,
        token_expires_in: response.data?.data?.token_expires_in || "7 days",
        cookie: setCookieHeader ? setCookieHeader[0] : null,
      };
    } catch (error) {
      handleApiError(error, "verify OTP");
    }
  },

  /**
   * Check authentication status via serverpe-back-end
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} - User authentication data
   */
  checkAuth: async (token) => {
    try {
      const response = await serverpeApi.get("/train/check-auth", {
        headers: token ? { Cookie: `token=${token}` } : {},
      });
      return response.data?.data || null;
    } catch (error) {
      if (error.response?.status === 401) {
        return null;
      }
      handleApiError(error, "check authentication");
    }
  },

  /**
   * Verify payment OTP via serverpe-back-end (without JWT token)
   * @param {string} email - Email address
   * @param {string} otp - OTP to verify
   * @returns {Promise<Object>} - Verification result without JWT token
   */
  verifyPaymentOtp: async (email, otp) => {
    try {
      const response = await serverpeApi.post("/train/verify-payment-otp", {
        email,
        otp,
      });

      return {
        verified: response.data?.successstatus || false,
        email: email,
        data: response.data?.data,
      };
    } catch (error) {
      if (error.response?.status === 401) {
        return { verified: false, email: email };
      }
      handleApiError(error, "verify payment OTP");
    }
  },

  /**
   * Logout via serverpe-back-end
   * @returns {Promise<Object>} - Logout result
   */
  logout: async () => {
    try {
      const response = await serverpeApi.post("/train/logout");
      return {
        success: response.data?.successstatus || true,
      };
    } catch (error) {
      handleApiError(error, "logout");
    }
  },
};

module.exports = authRepository;
