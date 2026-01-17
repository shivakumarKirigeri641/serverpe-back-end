/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - REQUEST LOGGER MIDDLEWARE
 * ==============================================
 * Middleware to log all incoming API requests.
 */

const logger = require("../utils/logger");

/**
 * Request logger middleware
 * Logs request details including method, path, query, body (sanitized)
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.http("Incoming request", {
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Log response on finish
  res.on("finish", () => {
    const duration = Date.now() - startTime;

    const logLevel = res.statusCode >= 400 ? "warn" : "http";

    logger[logLevel]("Response sent", {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

module.exports = requestLogger;
