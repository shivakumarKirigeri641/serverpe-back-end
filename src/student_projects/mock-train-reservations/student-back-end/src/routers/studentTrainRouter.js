/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - STUDENT TRAIN ROUTER
 * ==============================================
 * API Router for all train-related endpoints.
 * Each endpoint requires valid API key authentication.
 * This is a replica of serverpe trainRouter for student development.
 */

const express = require("express");
const studentTrainRouter = express.Router();

// Import middleware
const { checkAuth, asyncHandler } = require("../middleware");

// Import services
const { trainService } = require("../services");

// Import helpers
const {
  sendSuccess,
  sendError,
  HTTP_STATUS,
} = require("../utils/responseHelper");
const {
  isValidDate,
  isNotPastDate,
  validatePassengers,
  isValidEmail,
} = require("../utils/validators");
const config = require("../config");
const logger = require("../utils/logger");

/* ============================================================
   📋 MASTER DATA ENDPOINTS (API Key Required)
   ============================================================ */

/**
 * GET /student/train/stations
 * Get all available stations for source/destination selection
 */
studentTrainRouter.get(
  "/train/stations",
  asyncHandler(async (req, res) => {
    const stations = await trainService.getAllStations();
    sendSuccess(res, { stations }, config.messages.success.stationsFetched);
  })
);

/**
 * GET /student/train/reservation-types
 * Get all available reservation types (Tatkal, General, Ladies, etc.)
 */
studentTrainRouter.get(
  "/train/reservation-types",
  asyncHandler(async (req, res) => {
    const reservation_types = await trainService.getAllReservationTypes();
    sendSuccess(
      res,
      { reservation_types },
      config.messages.success.reservationTypesFetched
    );
  })
);

/**
 * GET /student/train/coach-types
 * Get all available coach types (1A, 2A, 3A, SL, etc.)
 */
studentTrainRouter.get(
  "/train/coach-types",
  asyncHandler(async (req, res) => {
    const coach_types = await trainService.getAllCoachTypes();
    sendSuccess(
      res,
      { coach_types },
      config.messages.success.coachTypesFetched
    );
  })
);

/* ============================================================
   🔍 TRAIN SEARCH ENDPOINTS
   ============================================================ */

/**
 * GET /student/train/autocomplete
 * Autocomplete train search by train number or name
 * Query params: q (search query - minimum 2 characters)
 */
studentTrainRouter.get(
  "/train/autocomplete",
  asyncHandler(async (req, res) => {
    const { q } = req.query;

    // Validation
    if (!q || q.length < 2) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Search query must be at least 2 characters"
      );
    }

    const result = await trainService.autocompleteTrains(q);
    sendSuccess(res, result, config.messages.success.autocompleteSuccess);
  })
);

/**
 * GET /student/train/search
 * Search trains between source and destination on a specific date
 * Query params: source, destination, doj (date of journey - YYYY-MM-DD)
 */
studentTrainRouter.get(
  "/train/search",
  asyncHandler(async (req, res) => {
    const { source, destination, doj } = req.query;

    // Validation
    if (!source || !destination || !doj) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Missing required parameters: source, destination, doj"
      );
    }

    // Validate date format
    if (!isValidDate(doj)) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        config.messages.error.invalidDateFormat
      );
    }

    const result = await trainService.searchTrains(source, destination, doj);
    sendSuccess(res, result, config.messages.success.trainSearched);
  })
);

/**
 * GET /student/train/schedule/:train_input
 * Get complete schedule for a specific train
 * Accepts train number (e.g., "12951") or train name (e.g., "Rajdhani")
 */
studentTrainRouter.get(
  "/train/schedule/:train_input",
  asyncHandler(async (req, res) => {
    const { train_input } = req.params;

    if (!train_input) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Train number or name is required"
      );
    }

    const schedule = await trainService.getTrainSchedule(train_input);
    sendSuccess(res, { schedule }, config.messages.success.scheduleFetched);
  })
);

/**
 * GET /student/train/live-status/:train_input
 * Get live running status for a specific train
 */
studentTrainRouter.get(
  "/train/live-status/:train_input",
  asyncHandler(async (req, res) => {
    const { train_input } = req.params;

    if (!train_input) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Train number or name is required"
      );
    }

    const result = await trainService.getLiveStatus(train_input);
    sendSuccess(res, result, config.messages.success.liveStatusFetched);
  })
);

/**
 * GET /student/train/station/:station_code
 * Get all trains passing through a specific station
 */
studentTrainRouter.get(
  "/train/station/:station_code",
  asyncHandler(async (req, res) => {
    const { station_code } = req.params;

    if (!station_code) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Station code is required"
      );
    }

    const result = await trainService.getTrainsAtStation(station_code);
    sendSuccess(res, result, config.messages.success.trainsAtStationFetched);
  })
);

/* ============================================================
   💰 FARE CALCULATION ENDPOINT
   ============================================================ */

/**
 * POST /student/train/calculate-fare
 * Calculate total fare for a journey
 * Body: { train_number, source_code, destination_code, doj, coach_code, reservation_type, passengers[] }
 */
studentTrainRouter.post(
  "/train/calculate-fare",
  asyncHandler(async (req, res) => {
    const {
      train_number,
      source_code,
      destination_code,
      doj,
      coach_code,
      reservation_type,
      passengers,
    } = req.body;

    // Validation
    if (
      !train_number ||
      !source_code ||
      !destination_code ||
      !doj ||
      !coach_code ||
      !reservation_type
    ) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Missing required fields: train_number, source_code, destination_code, doj, coach_code, reservation_type"
      );
    }

    // Validate passengers
    const passengerValidation = validatePassengers(passengers);
    if (!passengerValidation.isValid) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        passengerValidation.errors.join("; ")
      );
    }

    const fare = await trainService.calculateFare(req.body);
    sendSuccess(res, { fare }, config.messages.success.fareCalculated);
  })
);

/* ============================================================
   🎫 BOOKING ENDPOINTS (API Key + Auth Required)
   ============================================================ */

/**
 * POST /student/train/book-ticket
 * Confirm ticket booking
 * Body: { train_number, source_code, destination_code, doj, coach_code, reservation_type, passengers[], mobile_number, email, total_fare }
 */
studentTrainRouter.post(
  "/train/book-ticket",
  checkAuth,
  asyncHandler(async (req, res) => {
    const {
      train_number,
      source_code,
      destination_code,
      doj,
      coach_code,
      reservation_type,
      passengers,
      mobile_number,
      email,
      total_fare,
    } = req.body;

    // Validation - Journey Details
    if (
      !train_number ||
      !source_code ||
      !destination_code ||
      !doj ||
      !coach_code ||
      !reservation_type
    ) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Missing required journey details"
      );
    }

    // Validate passengers
    const passengerValidation = validatePassengers(passengers);
    if (!passengerValidation.isValid) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        passengerValidation.errors.join("; ")
      );
    }

    // Validate contact info
    if (!mobile_number) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Mobile number is required"
      );
    }

    if (!email || !isValidEmail(email)) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, "Valid email is required");
    }

    // Get token from request for forwarding to serverpe
    const token = req.cookies?.[config.jwt.cookieName];

    const booking = await trainService.bookTicket(req.body, token);
    sendSuccess(res, { booking }, config.messages.success.ticketBooked);
  })
);

/**
 * POST /student/train/cancel-ticket
 * Cancel ticket (full or partial)
 * Body: { pnr, passenger_ids[] }
 */
studentTrainRouter.post(
  "/train/cancel-ticket",
  checkAuth,
  asyncHandler(async (req, res) => {
    const { pnr, passenger_ids } = req.body;

    // Validation
    if (!pnr) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, "PNR is required");
    }

    if (
      !passenger_ids ||
      !Array.isArray(passenger_ids) ||
      passenger_ids.length === 0
    ) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "At least one passenger ID is required for cancellation"
      );
    }

    // Get token from request
    const token = req.cookies?.[config.jwt.cookieName];

    const result = await trainService.cancelTicket(pnr, passenger_ids, token);
    sendSuccess(
      res,
      { cancellation: result },
      config.messages.success.ticketCancelled
    );
  })
);

/* ============================================================
   📊 PNR & BOOKING HISTORY ENDPOINTS
   ============================================================ */

/**
 * GET /student/train/pnr-status/:pnr
 * Check PNR status
 */
studentTrainRouter.get(
  "/train/pnr-status/:pnr",
  asyncHandler(async (req, res) => {
    const { pnr } = req.params;

    if (!pnr) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, "PNR is required");
    }

    const status = await trainService.getPnrStatus(pnr);
    sendSuccess(
      res,
      { pnr_status: status },
      config.messages.success.pnrStatusFetched
    );
  })
);

/**
 * GET /student/train/booking-history/:email
 * Get booking history for an email (API Key + Auth Required)
 */
studentTrainRouter.get(
  "/train/booking-history/:email",
  checkAuth,
  asyncHandler(async (req, res) => {
    const { email } = req.params;

    if (!email || !isValidEmail(email)) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, "Valid email is required");
    }

    // Security check - users can only see their own booking history
    if (req.email !== email) {
      logger.warn("Unauthorized booking history access attempt", {
        requestedEmail: email,
        authenticatedEmail: req.email,
      });
      return sendError(
        res,
        HTTP_STATUS.FORBIDDEN,
        "You can only view your own booking history"
      );
    }

    const token = req.cookies?.[config.jwt.cookieName];
    const result = await trainService.getBookingHistory(email, token);
    sendSuccess(res, result, config.messages.success.bookingHistoryFetched);
  })
);

/**
 * GET /student/train/download-ticket/:pnr
 * Download ticket PDF
 * Requires authentication
 */
studentTrainRouter.get(
  "/train/download-ticket/:pnr",
  checkAuth,
  asyncHandler(async (req, res) => {
    const { pnr } = req.params;

    if (!pnr) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, "PNR is required");
    }

    const token = req.cookies?.[config.jwt.cookieName];
    await trainService.downloadTicket(pnr, token, res);
  })
);

module.exports = studentTrainRouter;
