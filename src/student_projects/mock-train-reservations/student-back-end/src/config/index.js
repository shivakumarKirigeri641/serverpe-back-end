/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - CONFIGURATION
 * ==============================================
 * Central configuration management for the application.
 * All environment variables and application settings are defined here.
 */

require("dotenv").config();

const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 4000,
    env: process.env.NODE_ENV || "development",
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
  },

  // API Configuration
  api: {
    baseUrl: process.env.SERVERPE_BASE_URL || "http://localhost:3000",
    demoApiKey:
      process.env.DEMO_API_KEY || "QS_DEMO_API_KEY_2026_STUDENT_TRAIN",
    version: "v1",
    prefix: "/api/v1",
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || "quicksmart_jwt_secret_key_2026_secure",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    cookieName: "token",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    },
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 1 * 60 * 1000, // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 1000, // Much higher for development
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || "debug",
    file: process.env.LOG_FILE || "logs/app.log",
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  },

  // Validation Constants
  validation: {
    maxPassengersPerBooking: 6,
    minPassengerNameLength: 2,
    maxPassengerAge: 120,
    minPassengerAge: 0,
    validGenders: ["M", "F", "O"],
    dateFormat: /^\d{4}-\d{2}-\d{2}$/,
    emailFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    otpLength: 4,
    otpExpiryMinutes: 10,
  },

  // Response Messages
  messages: {
    success: {
      stationsFetched: "Stations fetched successfully",
      reservationTypesFetched: "Reservation types fetched successfully",
      coachTypesFetched: "Coach types fetched successfully",
      autocompleteSuccess: "Train suggestions fetched successfully",
      trainSearched: "Trains fetched successfully",
      scheduleFetched: "Train schedule fetched successfully",
      liveStatusFetched: "Live train status fetched successfully",
      trainsAtStationFetched: "Trains at station fetched successfully",
      fareCalculated: "Fare calculated successfully",
      ticketBooked: "Ticket booked successfully",
      ticketCancelled: "Ticket cancelled successfully",
      pnrStatusFetched: "PNR status fetched successfully",
      bookingHistoryFetched: "Booking history fetched successfully",
      otpSent: "OTP sent successfully",
      otpVerified: "OTP verified successfully",
      loggedOut: "Logged out successfully",
      authenticated: "Authenticated",
    },
    error: {
      invalidApiKey: "Invalid or missing API key",
      invalidToken: "Invalid or expired token",
      tokenNotFound: "Token not found!",
      missingParameters: "Missing required parameters",
      invalidDateFormat: "Invalid date format. Use YYYY-MM-DD",
      trainNotFound: "Train not found",
      pnrNotFound: "PNR not found",
      invalidEmail: "Invalid email format",
      invalidOtp: "Invalid or expired OTP",
      maxPassengersExceeded: "Maximum 6 passengers allowed per booking",
      passengerRequired: "At least one passenger is required",
      internalServerError: "Internal server error",
      serviceUnavailable: "Service temporarily unavailable",
    },
  },
};

// Freeze config to prevent modifications
Object.freeze(config);

module.exports = config;
