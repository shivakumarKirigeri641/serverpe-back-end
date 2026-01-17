/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - HEALTH ROUTER
 * ==============================================
 * Health check and status endpoints.
 */

const express = require("express");
const healthRouter = express.Router();
const config = require("../config");

/**
 * GET /health
 * Basic health check endpoint
 */
healthRouter.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "quicksmart-train-reservation-student",
    version: "1.0.0",
    environment: config.server.env,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/detailed
 * Detailed health check with dependencies
 */
healthRouter.get("/health/detailed", async (req, res) => {
  const healthStatus = {
    status: "healthy",
    service: "quicksmart-train-reservation-student",
    version: "1.0.0",
    environment: config.server.env,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
    },
    dependencies: {
      serverpe_api: {
        url: config.api.baseUrl,
        status: "configured",
      },
    },
  };

  res.status(200).json(healthStatus);
});

/**
 * GET /
 * Root endpoint - API info
 */
healthRouter.get("/", (req, res) => {
  res.status(200).json({
    name: "Quicksmart Mock Train Reservation API",
    version: "1.0.0",
    description: "Student backend for train reservation system",
    poweredby: "quicksmart-student.serverpe.in",
    documentation: "/docs",
    endpoints: {
      health: "/health",
      auth: "/student/auth/*",
      train: "/student/train/*",
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = healthRouter;
