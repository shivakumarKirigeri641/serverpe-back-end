const express = require("express");
const path = require("path");
const sendMockPaymentOtpMailTemplate = require("../utils/emails/sendMockPaymentOtpMailTemplate");
const sendOtpMailTemplate = require("../utils/emails/sendOtpMailTemplate");
const jwt = require("jsonwebtoken");
const { generateTrainTicketPdf } = require("../utils/generateTrainTicketPdf");
const trainRouter = express.Router();
const checkStudentAPIKey = require("../middleware/checkStudentAPIKey");
require("dotenv").config();

// Import repository functions
const trainRepo = require("../SQL/mocktrainseatreservation/train.repo");
const { sendMail } = require("../utils/emails/sendMail");
const { flushPages } = require("pdfkit");

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
trainRouter.get("/train/stations", checkStudentAPIKey, async (req, res) => {
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
trainRouter.get(
  "/train/reservation-types",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const reservation_types = await trainRepo.getReservationTypes();
      sendSuccess(
        res,
        { reservation_types },
        "Reservation types fetched successfully"
      );
    } catch (err) {
      console.error("Error fetching reservation types:", err);
      sendError(res, 500, "Failed to fetch reservation types", err.message);
    }
  }
);

/**
 * GET /train/coach-types
 * Get all available coach types (1A, 2A, 3A, SL, etc.)
 */
trainRouter.get("/train/coach-types", checkStudentAPIKey, async (req, res) => {
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
 * GET /train/autocomplete
 * Autocomplete train search by train number or name
 * Query params: q (search query)
 */
trainRouter.get("/train/autocomplete", checkStudentAPIKey, async (req, res) => {
  try {
    const { q } = req.query;

    console.log("🔍 Autocomplete request received. Query:", q);

    // Validation
    if (!q || q.length < 2) {
      console.log("❌ Query too short:", q);
      return sendError(res, 400, "Search query must be at least 2 characters");
    }

    console.log("✅ Calling trainRepo.getTrainsList...");
    const trains = await trainRepo.getTrainsList(q);
    console.log("✅ Got trains:", trains.length);
    sendSuccess(
      res,
      {
        query: q,
        count: trains.length,
        suggestions: trains,
      },
      "Train suggestions fetched successfully"
    );
  } catch (err) {
    console.error("Error autocompleting trains:", err);
    sendError(res, 500, "Failed to fetch train suggestions", err.message);
  }
});

/**
 * GET /train/search
 * Search trains between source and destination on a specific date
 * Query params: source, destination, doj (date of journey - YYYY-MM-DD)
 */
trainRouter.get("/train/search", checkStudentAPIKey, async (req, res) => {
  try {
    const { source, destination, doj } = req.query;

    // Validation
    if (!source || !destination || !doj) {
      return sendError(
        res,
        400,
        "Missing required parameters: source, destination, doj"
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(doj)) {
      return sendError(res, 400, "Invalid date format. Use YYYY-MM-DD");
    }

    const trains = await trainRepo.getTrains(source, destination, doj);
    sendSuccess(
      res,
      {
        query: { source, destination, doj },
        trains_count: trains.length,
        trains,
      },
      "Trains fetched successfully"
    );
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
trainRouter.get(
  "/train/schedule/:train_input",
  checkStudentAPIKey,
  async (req, res) => {
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
  }
);

/**
 * GET /train/live-status/:train_input
 * Get live running status for a specific train
 * Accepts train number (e.g., "12951") or train name (e.g., "Rajdhani")
 */
trainRouter.get(
  "/train/live-status/:train_input",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { train_input } = req.params;

      if (!train_input) {
        return sendError(res, 400, "Train number or name is required");
      }

      const status = await trainRepo.getLiveTrainStatus(train_input);

      if (!status || status.length === 0) {
        return sendError(res, 404, `Train "${train_input}" not found`);
      }

      sendSuccess(
        res,
        {
          train_input,
          live_status: status,
        },
        "Live train status fetched successfully"
      );
    } catch (err) {
      console.error("Error fetching live train status:", err);
      sendError(res, 500, "Failed to fetch live train status", err.message);
    }
  }
);

/**
 * GET /train/station/:station_code
 * Get all trains arriving/departing at a specific station in next N hours
 * Query params: next_hours (optional, default: 2, allowed: 2, 4, 8)
 */
trainRouter.get(
  "/train/station/:station_code",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { station_code } = req.params;
      let { next_hours } = req.query;

      if (!station_code) {
        return sendError(res, 400, "Station code is required");
      }

      // Validate and set default for next_hours
      next_hours = parseInt(next_hours) || 2;
      if (![2, 4, 8].includes(next_hours)) {
        return sendError(res, 400, "next_hours must be 2, 4, or 8");
      }

      const trains = await trainRepo.getTrainsAtStation(
        station_code.toUpperCase(),
        next_hours
      );

      sendSuccess(
        res,
        {
          station_code: station_code.toUpperCase(),
          next_hours,
          trains_count: trains.length,
          trains,
        },
        "Trains at station fetched successfully"
      );
    } catch (err) {
      console.error("Error fetching trains at station:", err);
      sendError(res, 500, "Failed to fetch trains at station", err.message);
    }
  }
);

/* ============================================================
   💰 FARE CALCULATION ENDPOINT
   ============================================================ */

/**
 * POST /train/calculate-fare
 * Calculate total fare for a journey
 * Body: { train_number, source_code, destination_code, doj, coach_code, reservation_type, passengers[] }
 */
trainRouter.post(
  "/train/calculate-fare",
  checkStudentAPIKey,
  async (req, res) => {
    try {
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
          400,
          "Missing required fields: train_number, source_code, destination_code, doj, coach_code, reservation_type"
        );
      }

      if (
        !passengers ||
        !Array.isArray(passengers) ||
        passengers.length === 0
      ) {
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
  }
);

/* ============================================================
   🎫 BOOKING ENDPOINTS (Protected - Auth Required)
   ============================================================ */

/**
 * POST /train/book-ticket
 * Confirm ticket booking
 * Body: { train_number, source_code, destination_code, doj, coach_code, reservation_type, passengers[], mobile_number, email, total_fare }
 */
trainRouter.post("/train/book-ticket", checkStudentAPIKey, async (req, res) => {
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
      total_fare,
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
        return sendError(
          res,
          400,
          `Passenger ${i + 1}: Name is required (min 2 characters)`
        );
      }
      if (!p.passenger_age || p.passenger_age < 0 || p.passenger_age > 120) {
        return sendError(
          res,
          400,
          `Passenger ${i + 1}: Valid age is required (0-120)`
        );
      }
      if (
        !p.passenger_gender ||
        !["M", "F", "O"].includes(p.passenger_gender.toUpperCase())
      ) {
        return sendError(
          res,
          400,
          `Passenger ${i + 1}: Gender must be M, F, or O`
        );
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
trainRouter.post(
  "/train/cancel-ticket",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { pnr, passenger_ids } = req.body;

      // Validation
      if (!pnr) {
        return sendError(res, 400, "PNR is required");
      }

      if (
        !passenger_ids ||
        !Array.isArray(passenger_ids) ||
        passenger_ids.length === 0
      ) {
        return sendError(
          res,
          400,
          "At least one passenger ID is required for cancellation"
        );
      }

      const result = await trainRepo.cancelTicket(pnr, passenger_ids);

      sendSuccess(
        res,
        { cancellation: result },
        "Ticket cancelled successfully"
      );
    } catch (err) {
      console.error("Error cancelling ticket:", err);
      sendError(res, 500, "Failed to cancel ticket", err.message);
    }
  }
);

/* ============================================================
   📊 PNR & BOOKING HISTORY ENDPOINTS
   ============================================================ */

/**
 * GET /train/pnr-status/:pnr
 * Check PNR status
 */
trainRouter.get(
  "/train/pnr-status/:pnr",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { pnr } = req.params;

      if (!pnr) {
        return sendError(res, 400, "PNR is required");
      }

      const status = await trainRepo.getPnrStatus(pnr);

      if (!status) {
        return sendError(res, 404, "PNR not found");
      }

      sendSuccess(
        res,
        { pnr_status: status },
        "PNR status fetched successfully"
      );
    } catch (err) {
      console.error("Error fetching PNR status:", err);
      sendError(res, 500, "Failed to fetch PNR status", err.message);
    }
  }
);

/**
 * GET /train/booking-history/:email
 * Get booking history for an email (Protected)
 */
trainRouter.get(
  "/train/booking-history/:email",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { email } = req.params;

      if (!email) {
        return sendError(res, 400, "Email is required");
      }

      const history = await trainRepo.getBookingHistory(email);

      sendSuccess(
        res,
        {
          email,
          bookings_count: history.length,
          bookings: history,
        },
        "Booking history fetched successfully"
      );
    } catch (err) {
      console.error("Error fetching booking history:", err);
      sendError(res, 500, "Failed to fetch booking history", err.message);
    }
  }
);

/* ============================================================
   🔐 OTP ENDPOINTS (For Email Verification)
   ============================================================ */

/**
 * POST /train/send-otp
 * Send OTP to email for verification
 * Body: { email }
 */
trainRouter.post("/train/send-otp", checkStudentAPIKey, async (req, res) => {
  try {
    const { email, ispayment = false } = req.body;

    if (!email) {
      return sendError(res, 400, "Email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 400, "Invalid email format");
    }

    // Generate 4-digit OTP for login, 6-digit OTP for payment
    const otp = ispayment ? "123456" : "1234";
    /*const otp = ispayment
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : Math.floor(1000 + Math.random() * 9000).toString();

    // Send email based on OTP type
    if (false == ispayment) {
      await sendMail({
        to: email,
        subject: "Your OTP for Mock Train Reservation Login",
        html: await sendOtpMailTemplate({ otp }),
        text: `Your OTP for login is ${otp}. Valid for 10 minutes.`,
      });
    } else {
      // Payment OTP
      await sendMail({
        to: email,
        subject: "Mock Payment OTP – QuickSmart Train Reservation",
        html: await sendMockPaymentOtpMailTemplate({
          otp,
          expiryMinutes: 10,
        }),
        text: `Your OTP to confirm the mock payment is ${otp}.\nThis is a demo transaction. Don't worry, No real money will be debited.\nOTP is valid for 10 minutes.`,
        attachments: [
          {
            filename: "serverpe-logo.jpg",
            path: path.join(__dirname, "../images/ServerPe_Logo.jpg"),
            cid: "serverpe-logo",
          },
        ],
      });
    }*/

    // OTP expires in 10 minutes
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    await trainRepo.saveOtp(
      email,
      otp,
      expires_at,
      true === ispayment ? true : false
    );

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
trainRouter.post("/train/verify-otp", checkStudentAPIKey, async (req, res) => {
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
    const token = jwt.sign({ email }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

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
        token_expires_in: "7 days",
      },
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    sendError(res, 500, "Failed to verify OTP", err.message);
  }
});

/**
 * POST /train/verify-payment-otp
 * Verify payment OTP without generating JWT token (for payment verification only)
 */
trainRouter.post(
  "/train/verify-payment-otp",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return sendError(res, 400, "Email and OTP are required");
      }

      const isValid = await trainRepo.verifyOtp(email, otp);

      if (!isValid) {
        return sendError(res, 401, "Invalid or expired payment OTP");
      }

      // Return success without JWT token for payment verification
      return res.status(200).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Success",
        successstatus: true,
        message: "Payment OTP verified successfully",
        data: {
          email,
          verified: true,
          payment_authorized: true,
        },
      });
    } catch (err) {
      console.error("Error verifying payment OTP:", err);
      sendError(res, 500, "Failed to verify payment OTP", err.message);
    }
  }
);

/**
 * GET /train/check-auth
 * Verify authentication status and return user data
 */
trainRouter.get("/train/check-auth", checkStudentAPIKey, (req, res) => {
  sendSuccess(
    res,
    {
      email: req.email,
      mobile_number: req.mobile_number,
      authenticated: true,
    },
    "Authenticated"
  );
});

/**
 * POST /train/logout
 * Clear authentication cookie
 */
trainRouter.post("/train/logout", checkStudentAPIKey, (req, res) => {
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  sendSuccess(res, null, "Logged out successfully");
});

/* ============================================================
   📥 DOWNLOAD TICKET PDF
   ============================================================ */
trainRouter.get(
  "/train/download-ticket/:pnr",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { pnr } = req.params;
      const userId = req.user?.id;

      if (!pnr) {
        return sendError(res, 400, "PNR is required");
      }

      // Get booking details with all necessary information
      const booking = await trainRepo.getBookingByPNR(pnr);

      if (!booking) {
        return sendError(res, 404, "Booking not found");
      }

      // Verify ownership (if user is logged in)
      if (userId && booking.fk_user_id !== userId) {
        return sendError(res, 403, "Unauthorized access to ticket");
      }

      // Check if PDF already exists
      const existingPdfPath = path.join(
        __dirname,
        "../../src/secure-storage/downloads/projects/mock-train-reservation/tickets",
        `ticket_${pnr}.pdf`
      );

      let pdfPath;

      if (require("fs").existsSync(existingPdfPath)) {
        pdfPath = existingPdfPath;
      } else {
        // Generate PDF
        pdfPath = await generateTrainTicketPdf({
          pnr: booking.pnr,
          train_number: booking.train_number,
          train_name: booking.train_name,
          source_station: booking.source_station_name,
          destination_station: booking.destination_station_name,
          departure_time: booking.departure_time,
          arrival_time: booking.arrival_time,
          journey_date: booking.journey_date,
          coach_type: booking.coach_type,
          reservation_type: booking.reservation_type,
          passengers: booking.passengers || [],
          total_fare: booking.total_fare,
          booking_date: booking.booking_date,
          booking_status: booking.booking_status,
          contact_mobile: booking.mobile_number,
          contact_email: booking.email,
        });
      }

      // Send file for download
      res.download(pdfPath, `QuickSmart_Ticket_${pnr}.pdf`, (err) => {
        if (err) {
          console.error("Download error:", err);
          return sendError(res, 500, "Failed to download ticket");
        }
      });
    } catch (error) {
      console.error("Download Ticket Error:", error);
      return sendError(res, 500, "Failed to download ticket", error.message);
    }
  }
);

module.exports = trainRouter;
