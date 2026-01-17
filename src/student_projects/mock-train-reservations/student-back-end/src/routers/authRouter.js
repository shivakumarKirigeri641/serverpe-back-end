/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - AUTH ROUTER
 * ==============================================
 * API Router for authentication endpoints.
 * Handles OTP-based email verification and session management.
 */

const express = require("express");
const authRouter = express.Router();

// Import middleware
const {
  checkAuth,
  asyncHandler,
  generateToken,
  setAuthCookie,
  clearAuthCookie,
} = require("../middleware");

// Import services
const { authService } = require("../services");

// Import helpers
const {
  sendSuccess,
  sendError,
  HTTP_STATUS,
} = require("../utils/responseHelper");
const { isValidEmail, isValidOtp } = require("../utils/validators");
const config = require("../config");
const logger = require("../utils/logger");

/* ============================================================
   🔐 OTP ENDPOINTS
   ============================================================ */

/**
 * POST /student/auth/send-otp
 * Send OTP to email for verification
 * Body: { email, ispayment }
 */
authRouter.post(
  "/auth/send-otp",
  asyncHandler(async (req, res) => {
    const { email, ispayment = false } = req.body;

    // Validation
    if (!email) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, "Email is required");
    }

    if (!isValidEmail(email)) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        config.messages.error.invalidEmail
      );
    }

    const result = await authService.sendOtp(email, ispayment);
    sendSuccess(res, result, config.messages.success.otpSent);
  })
);

/**
 * POST /student/auth/verify-otp
 * Verify OTP and establish session (proxies to serverpe-back-end)
 * Body: { email, otp }
 */
authRouter.post(
  "/auth/verify-otp",
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Email and OTP are required"
      );
    }

    if (!isValidEmail(email)) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        config.messages.error.invalidEmail
      );
    }

    // Verify OTP via serverpe-back-end
    const result = await authService.verifyOtp(email, otp);

    // Generate OUR OWN JWT token for student-back-end session
    const token = generateToken({ email, mobile_number: result.mobile_number });
    
    // Set OUR OWN cookie (not serverpe's cookie)
    setAuthCookie(res, token);

    logger.info("User authenticated - JWT cookie set", { email });

    return res.status(HTTP_STATUS.OK).json({
      poweredby: "quicksmart-student.serverpe.in",
      mock_data: true,
      status: "Success",
      successstatus: true,
      message: config.messages.success.otpVerified,
      data: {
        email: result.email,
        verified: true,
        token_expires_in: config.jwt.expiresIn,
      },
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /student/auth/verify-payment-otp
 * Verify payment OTP without establishing session (no JWT token)
 * Body: { email, otp }
 */
authRouter.post(
  "/auth/verify-payment-otp",
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Email and OTP are required"
      );
    }

    if (!isValidEmail(email)) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        config.messages.error.invalidEmail
      );
    }

    // Verify payment OTP via serverpe-back-end (without JWT token)
    const result = await authService.verifyPaymentOtp(email, otp);

    logger.info("Payment OTP verified", { email });

    return res.status(HTTP_STATUS.OK).json({
      poweredby: "quicksmart-student.serverpe.in",
      mock_data: true,
      status: "Success",
      successstatus: true,
      message: "Payment OTP verified successfully",
      data: {
        email: result.email,
        verified: true,
        payment_authorized: true,
      },
      timestamp: new Date().toISOString(),
    });
  })
);

/* ============================================================
   🔍 AUTH CHECK ENDPOINTS
   ============================================================ */

/**
 * GET /student/auth/check-auth
 * Verify authentication status and return user data
 */
authRouter.get(
  "/auth/check-auth",
  checkAuth,
  asyncHandler(async (req, res) => {
    const authStatus = authService.checkAuthStatus(req.user);
    sendSuccess(res, authStatus, config.messages.success.authenticated);
  })
);

/**
 * POST /student/auth/logout
 * Clear authentication cookie and logout (proxies to serverpe-back-end)
 */
authRouter.post(
  "/auth/logout",
  asyncHandler(async (req, res) => {
    // Call serverpe-back-end logout
    await authService.logout();

    // Clear local cookie
    clearAuthCookie(res);

    logger.info("User logged out via serverpe-back-end", {
      email: req.user?.email || "unknown",
    });

    sendSuccess(res, null, config.messages.success.loggedOut);
  })
);

/* ============================================================
   ℹ️ USER INFO ENDPOINT
   ============================================================ */

/**
 * GET /student/auth/me
 * Get current authenticated user info
 */
authRouter.get(
  "/auth/me",
  checkAuth,
  asyncHandler(async (req, res) => {
    sendSuccess(
      res,
      {
        email: req.email,
        mobile_number: req.mobile_number,
      },
      "User info fetched successfully"
    );
  })
);

module.exports = authRouter;
