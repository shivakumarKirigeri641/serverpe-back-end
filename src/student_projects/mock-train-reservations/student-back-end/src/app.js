/**
 * ==============================================
 * QUICKSMART MOCK TRAIN RESERVATION SYSTEM
 * ==============================================
 * Student Backend - Express Application Entry Point
 *
 * This is the main application file that bootstraps
 * the Express server with all middleware and routes.
 *
 * @author ServerPE Student
 * @version 1.0.0
 * @license ISC
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

// Load configuration
const config = require("./config");

// Import middleware
const {
  notFoundHandler,
  errorHandler,
  requestLogger,
} = require("./middleware");

// Import routers
const { studentTrainRouter, authRouter, healthRouter } = require("./routers");

// Import logger
const logger = require("./utils/logger");

// Create Express application
const app = express();

/* ============================================================
   🛡️ SECURITY MIDDLEWARE
   ============================================================ */

// Helmet - Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS - Cross-Origin Resource Sharing
app.use(cors(config.cors));

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    poweredby: "quicksmart-student.serverpe.in",
    mock_data: true,
    status: "Failed",
    successstatus: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

/* ============================================================
   📝 PARSING & LOGGING MIDDLEWARE
   ============================================================ */

// Body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie parser
app.use(cookieParser());

// HTTP logging with Morgan (only in development)
if (config.server.isDevelopment) {
  app.use(morgan("dev"));
}

// Custom request logger
app.use(requestLogger);

/* ============================================================
   🛤️ ROUTES
   ============================================================ */

// Health check routes (no prefix)
app.use("/", healthRouter);

// Student API routes with /student prefix
app.use("/student", studentTrainRouter);
app.use("/student", authRouter);

/* ============================================================
   ❌ ERROR HANDLING
   ============================================================ */

// 404 Handler - Must be after all routes
app.use(notFoundHandler);

// Global Error Handler - Must be last
app.use(errorHandler);

/* ============================================================
   🚀 SERVER STARTUP
   ============================================================ */

const PORT = config.server.port;

// Only start server if not in test mode
if (!config.server.isTest) {
  app.listen(PORT, () => {
    logger.info("=".repeat(50));
    logger.info("🚂 QUICKSMART TRAIN RESERVATION - STUDENT BACKEND");
    logger.info("=".repeat(50));
    logger.info(`📍 Server running on port ${PORT}`);
    logger.info(`🌍 Environment: ${config.server.env}`);
    logger.info(`🔗 ServerPE API: ${config.api.baseUrl}`);
    logger.info(
      `🔑 Demo API Key: ${config.api.demoApiKey.substring(0, 15)}...`
    );
    logger.info("=".repeat(50));
    logger.info("📚 Available Endpoints:");
    logger.info("   Health:  GET  /health");
    logger.info("   Auth:    POST /student/auth/send-otp");
    logger.info("   Auth:    POST /student/auth/verify-otp");
    logger.info("   Auth:    GET  /student/auth/check-auth");
    logger.info("   Train:   GET  /student/train/stations");
    logger.info("   Train:   GET  /student/train/search");
    logger.info("   Train:   POST /student/train/book-ticket");
    logger.info("   Train:   GET  /student/train/pnr-status/:pnr");
    logger.info("=".repeat(50));
  });
}

// Export app for testing
module.exports = app;
