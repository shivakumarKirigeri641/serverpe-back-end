/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - WINSTON LOGGER
 * ==============================================
 * Enterprise-grade logging with Winston.
 * Supports file and console transports with different log levels.
 */

const winston = require('winston');
const path = require('path');
const config = require('../config');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let log = `${timestamp} ${level}: ${message}`;
    if (Object.keys(meta).length > 0 && meta.stack === undefined) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// Create transports array
const transports = [
  new winston.transports.Console({
    format: consoleFormat,
    level: config.server.isDevelopment ? 'debug' : 'info',
  }),
];

// Add file transport in non-test environments
if (!config.server.isTest) {
  // Ensure logs directory exists
  const fs = require('fs');
  const logsDir = path.dirname(config.logging.file);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  transports.push(
    new winston.transports.File({
      filename: config.logging.file,
      format: logFormat,
      level: config.logging.level,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(path.dirname(config.logging.file), 'error.log'),
      format: logFormat,
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Stream for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;
