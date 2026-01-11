const express = require("express");
const jwt = require("jsonwebtoken");
const trainRouter = express.Router();
const checkServerPeUser = require("../middleware/checkServerPeUser");
require("dotenv").config();

// Import repository functions
const trainRepo = require("../SQL/mocktrainseatreservation/train.repo");

/* ============================================================
   🛠️ ERROR RESPONSE HELPER
   ============================================================ */

/**
 * Standardized API error response
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} details - Optional error details
 */
const sendError = (res, statusCode, message, details = null) => {
  const response = {
    poweredby: "serverpe.in",
    mock_data: true,
    status: "Failed",
    successstatus: false,
    message,
  };
  if (details && process.env.NODE_ENV === "development") {
    response.error_details = details;
  }
  return res.status(statusCode).json(response);
};

/**
 * Standardized API success response
 * @param {Response} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Optional success message
 */
const sendSuccess = (res, data, message = "Success") => {
  return res.status(200).json({
    poweredby: "serverpe.in",
    mock_data: true,
    status: "Success",
    successstatus: true,
    message,
    data,
  });
};

/* ============================================================
   📋 MASTER DATA ENDPOINTS (Public - No Auth Required)
   ============================================================ */

/**
 * GET /train/stations
 * Get all available stations for source/destination selection
 */
trainRouter.get("/train/stations", async (req, res) => {
  try {
    const stations = await trainRepo.getReservedStations();
    sendSuccess(res, { stations }, "Stations fetched successfully");
  } catch (err) {
    console.error("Error fetching stations:", err);
    sendError(res, 500, "Failed to fetch stations", err.message);
  }
});

/**
 * GET /train/reservation-types
 * Get all available reservation types (Tatkal, General, Ladies, etc.)
 */
trainRouter.get("/train/reservation-types", async (req, res) => {
  try {
    const reservation_types = await trainRepo.getReservationTypes();
    sendSuccess(res, { reservation_types }, "Reservation types fetched successfully");
  } catch (err) {
    console.error("Error fetching reservation types:", err);
    sendError(res, 500, "Failed to fetch reservation types", err.message);
  }
});

/**
 * GET /train/coach-types
 * Get all available coach types (1A, 2A, 3A, SL, etc.)
 */
trainRouter.get("/train/coach-types", async (req, res) => {
  try {
    const coach_types = await trainRepo.getCoachTypes();
    sendSuccess(res, { coach_types }, "Coach types fetched successfully");
  } catch (err) {
    console.error("Error fetching coach types:", err);
    sendError(res, 500, "Failed to fetch coach types", err.message);
  }
});

/* ============================================================
   🔍 TRAIN SEARCH ENDPOINTS
   ============================================================ */

/**
 * GET /train/search
 * Search trains between source and destination on a specific date
 * Query params: source, destination, doj (date of journey - YYYY-MM-DD)
 */
trainRouter.get("/train/search", async (req, res) => {
  try {
    const { source, destination, doj } = req.query;

    // Validation
    if (!source || !destination || !doj) {
      return sendError(res, 400, "Missing required parameters: source, destination, doj");
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(doj)) {
      return sendError(res, 400, "Invalid date format. Use YYYY-MM-DD");
    }

    const trains = await trainRepo.getTrains(source, destination, doj);
    sendSuccess(res, { 
      query: { source, destination, doj },
      trains_count: trains.length,
      trains 
    }, "Trains fetched successfully");
  } catch (err) {
    console.error("Error searching trains:", err);
    sendError(res, 500, "Failed to search trains", err.message);
  }
});

/**
 * GET /train/schedule/:train_input
 * Get complete schedule for a specific train
 * Accepts train number (e.g., "12951") or train name (e.g., "Rajdhani")
 */
trainRouter.get("/train/schedule/:train_input", async (req, res) => {
  try {
    const { train_input } = req.params;

    if (!train_input) {
      return sendError(res, 400, "Train number or name is required");
    }

    const schedule = await trainRepo.getTrainSchedule(train_input);

    if (!schedule) {
      return sendError(res, 404, `Train "${train_input}" not found`);
    }

    sendSuccess(res, { schedule }, "Train schedule fetched successfully");
  } catch (err) {
    console.error("Error fetching train schedule:", err);
    sendError(res, 500, "Failed to fetch train schedule", err.message);
  }
});

/**
 * GET /train/live-status/:train_input
 * Get live running status for a specific train
 * Accepts train number (e.g., "12951") or train name (e.g., "Rajdhani")
 */
trainRouter.get("/train/live-status/:train_input", async (req, res) => {
  try {
    const { train_input } = req.params;

    if (!train_input) {
      return sendError(res, 400, "Train number or name is required");
    }

    const status = await trainRepo.getLiveTrainStatus(train_input);

    if (!status || status.length === 0) {
      return sendError(res, 404, `Train "${train_input}" not found`);
    }

    sendSuccess(res, { 
      train_input,
      live_status: status 
    }, "Live train status fetched successfully");
  } catch (err) {
    console.error("Error fetching live train status:", err);
    sendError(res, 500, "Failed to fetch live train status", err.message);
  }
});

/**
 * GET /train/station/:station_code
 * Get all trains passing through a specific station
 */
trainRouter.get("/train/station/:station_code", async (req, res) => {
  try {
    const { station_code } = req.params;

    if (!station_code) {
      return sendError(res, 400, "Station code is required");
    }

    const trains = await trainRepo.getTrainsAtStation(station_code.toUpperCase());

    sendSuccess(res, { 
      station_code: station_code.toUpperCase(),
      trains_count: trains.length,
      trains 
    }, "Trains at station fetched successfully");
  } catch (err) {
    console.error("Error fetching trains at station:", err);
    sendError(res, 500, "Failed to fetch trains at station", err.message);
  }
});

/* ============================================================
   💰 FARE CALCULATION ENDPOINT
   ============================================================ */

/**
 * POST /train/calculate-fare
 * Calculate total fare for a journey
 * Body: { train_number, source_code, destination_code, doj, coach_code, reservation_type, passengers[] }
 */
trainRouter.post("/train/calculate-fare", async (req, res) => {
  try {
    const { 
      train_number, 
      source_code, 
      destination_code, 
      doj, 
      coach_code, 
      reservation_type, 
      passengers 
    } = req.body;

    // Validation
    if (!train_number || !source_code || !destination_code || !doj || !coach_code || !reservation_type) {
      return sendError(res, 400, "Missing required fields: train_number, source_code, destination_code, doj, coach_code, reservation_type");
    }

    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return sendError(res, 400, "At least one passenger is required");
    }

    if (passengers.length > 6) {
      return sendError(res, 400, "Maximum 6 passengers allowed per booking");
    }

    const fare = await trainRepo.calculateTotalFare(
      train_number,
      source_code,
      destination_code,
      doj,
      coach_code,
      reservation_type,
      passengers
    );

    sendSuccess(res, { fare }, "Fare calculated successfully");
  } catch (err) {
    console.error("Error calculating fare:", err);
    sendError(res, 500, "Failed to calculate fare", err.message);
  }
});

/* ============================================================
   🎫 BOOKING ENDPOINTS (Protected - Auth Required)
   ============================================================ */

/**
 * POST /train/book-ticket
 * Confirm ticket booking
 * Body: { train_number, source_code, destination_code, doj, coach_code, reservation_type, passengers[], mobile_number, email, total_fare }
 */
trainRouter.post("/train/book-ticket", checkServerPeUser, async (req, res) => {
  try {
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
      total_fare
    } = req.body;

    // Validation
    if (!train_number || !source_code || !destination_code || !doj || !coach_code || !reservation_type) {
      return sendError(res, 400, "Missing required journey details");
    }

    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return sendError(res, 400, "At least one passenger is required");
    }

    if (passengers.length > 6) {
      return sendError(res, 400, "Maximum 6 passengers allowed per booking");
    }

    if (!mobile_number) {
      return sendError(res, 400, "Mobile number is required");
    }

    if (!email) {
      return sendError(res, 400, "Email is required");
    }

    // Validate passenger details
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.passenger_name || p.passenger_name.trim().length < 2) {
        return sendError(res, 400, `Passenger ${i + 1}: Name is required (min 2 characters)`);
      }
      if (!p.passenger_age || p.passenger_age < 0 || p.passenger_age > 120) {
        return sendError(res, 400, `Passenger ${i + 1}: Valid age is required (0-120)`);
      }
      if (!p.passenger_gender || !["M", "F", "O"].includes(p.passenger_gender.toUpperCase())) {
        return sendError(res, 400, `Passenger ${i + 1}: Gender must be M, F, or O`);
      }
    }

    const booking = await trainRepo.confirmTicket(
      train_number,
      source_code,
      destination_code,
      doj,
      coach_code,
      reservation_type,
      passengers,
      mobile_number,
      total_fare,
      email
    );

    sendSuccess(res, { booking }, "Ticket booked successfully");
  } catch (err) {
    console.error("Error booking ticket:", err);
    sendError(res, 500, "Failed to book ticket", err.message);
  }
});

/**
 * POST /train/cancel-ticket
 * Cancel ticket (full or partial)
 * Body: { pnr, passenger_ids[] }
 */
trainRouter.post("/train/cancel-ticket", checkServerPeUser, async (req, res) => {
  try {
    const { pnr, passenger_ids } = req.body;

    // Validation
    if (!pnr) {
      return sendError(res, 400, "PNR is required");
    }

    if (!passenger_ids || !Array.isArray(passenger_ids) || passenger_ids.length === 0) {
      return sendError(res, 400, "At least one passenger ID is required for cancellation");
    }

    const result = await trainRepo.cancelTicket(pnr, passenger_ids);

    sendSuccess(res, { cancellation: result }, "Ticket cancelled successfully");
  } catch (err) {
    console.error("Error cancelling ticket:", err);
    sendError(res, 500, "Failed to cancel ticket", err.message);
  }
});

/* ============================================================
   📊 PNR & BOOKING HISTORY ENDPOINTS
   ============================================================ */

/**
 * GET /train/pnr-status/:pnr
 * Check PNR status
 */
trainRouter.get("/train/pnr-status/:pnr", async (req, res) => {
  try {
    const { pnr } = req.params;

    if (!pnr) {
      return sendError(res, 400, "PNR is required");
    }

    const status = await trainRepo.getPnrStatus(pnr);

    if (!status) {
      return sendError(res, 404, "PNR not found");
    }

    sendSuccess(res, { pnr_status: status }, "PNR status fetched successfully");
  } catch (err) {
    console.error("Error fetching PNR status:", err);
    sendError(res, 500, "Failed to fetch PNR status", err.message);
  }
});

/**
 * GET /train/booking-history/:email
 * Get booking history for an email (Protected)
 */
trainRouter.get("/train/booking-history/:email", checkServerPeUser, async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return sendError(res, 400, "Email is required");
    }

    const history = await trainRepo.getBookingHistory(email);

    sendSuccess(res, { 
      email,
      bookings_count: history.length,
      bookings: history 
    }, "Booking history fetched successfully");
  } catch (err) {
    console.error("Error fetching booking history:", err);
    sendError(res, 500, "Failed to fetch booking history", err.message);
  }
});

/* ============================================================
   🔐 OTP ENDPOINTS (For Email Verification)
   ============================================================ */

/**
 * POST /train/send-otp
 * Send OTP to email for verification
 * Body: { email }
 */
trainRouter.post("/train/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, "Email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 400, "Invalid email format");
    }

    // Generate 6-digit OTP
    //const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = '1234';
    
    // OTP expires in 10 minutes
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await trainRepo.saveOtp(email, otp, expires_at);

    // TODO: Send OTP via email service (Nodemailer)
    // For now, in development, we return the OTP
    const response = { email, expires_in: "10 minutes" };
    if (process.env.NODE_ENV === "development") {
      response.otp = otp; // Only in development
    }

    sendSuccess(res, response, "OTP sent successfully");
  } catch (err) {
    console.error("Error sending OTP:", err);
    sendError(res, 500, "Failed to send OTP", err.message);
  }
});

/**
 * POST /train/verify-otp
 * Verify OTP
 * Body: { email, otp }
 */
trainRouter.post("/train/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(res, 400, "Email and OTP are required");
    }

    const isValid = await trainRepo.verifyOtp(email, otp);

    if (!isValid) {
      return sendError(res, 401, "Invalid or expired OTP");
    }

    // 🔐 Generate JWT token after successful OTP verification
    const token = jwt.sign(
      { email },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    // 🍪 Set token as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return res.status(200).json({
      poweredby: "serverpe.in",
      mock_data: true,
      status: "Success",
      successstatus: true,
      message: "OTP verified successfully",
      data: { 
        email, 
        verified: true,
        token_expires_in: "7 days"
      },
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    sendError(res, 500, "Failed to verify OTP", err.message);
  }
});

module.exports = trainRouter;
