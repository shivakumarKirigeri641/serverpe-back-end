/**
 * @file studentsTrainSeatReserveRouter.js
 * @description Licensed API Router for Students' Mock Train APIs
 * 
 * Architecture:
 * - Students receive: trains.router.js & trains.service.js
 * - Their service calls these licensed endpoints
 * - Endpoints are protected by license verification middleware
 * - Endpoints call train.repo.js for actual database operations
 * 
 * All endpoints require valid LICENSE_KEY and FINGERPRINT headers
 */

const express = require("express");
const studentsTrainSeatReserveRouter = express.Router();
const { getMainPool } = require("../database/connectDB");
const checkStudentLicenseOnly = require("../middleware/checkStudentLicense");

// Import the actual train repository
const trainRepo = require("../SQL/mocktrainseatreservation/train.repo");

// License check middleware
const licenseCheck = checkStudentLicenseOnly(getMainPool());

// ============================================================================
// HELPER: Standard Response Wrapper
// ============================================================================
const wrapResponse = (req, data, message) => {
  const baseResponse = {
    poweredby: "serverpe.in",
    mock_data: true,
    status: "Success",
    successstatus: true,
    message
  };

  if (req.isAdminAccess) {
    return {
      ...baseResponse,
      admin_info: {
        user_name: req.user?.user_name,
        email: req.user?.email
      },
      data
    };
  }

  const { licenseInfo } = req;
  return {
    ...baseResponse,
    license_info: {
      user_name: licenseInfo?.user_name,
      project_title: licenseInfo?.project_title,
      project_code: licenseInfo?.project_code,
      first_use: licenseInfo?.first_use
    },
    data
  };
};

const errorResponse = (res, statusCode, message, errorCode = "ERROR") => {
  return res.status(statusCode).json({
    poweredby: "serverpe.in",
    mock_data: true,
    status: "Error",
    successstatus: false,
    message,
    errorCode
  });
};

// ============================================================================
// STATION ENDPOINTS
// ============================================================================

/**
 * @route GET /mockapis/serverpeuser/api/mocktrain/reserved/stations
 */
studentsTrainSeatReserveRouter.get(
  "/mockapis/serverpeuser/api/mocktrain/reserved/stations",
  licenseCheck,
  async (req, res) => {
    try {
      const stations = await trainRepo.getReservedStations();
      const data = { count: stations.length, stations };
      return res.status(200).json(wrapResponse(req, data, "Stations fetched successfully"));
    } catch (err) {
      console.error("Error fetching stations:", err);
      return errorResponse(res, err.statusCode || 500, err.message, err.errorCode || "INTERNAL_ERROR");
    }
  }
);

/**
 * @route GET /mockapis/serverpeuser/api/mocktrain/reserved/reservation-types
 */
studentsTrainSeatReserveRouter.get(
  "/mockapis/serverpeuser/api/mocktrain/reserved/reservation-types",
  licenseCheck,
  async (req, res) => {
    try {
      const reservationtypes = await trainRepo.getReservationTypes();
      const data = { count: reservationtypes.length, reservationtypes };
      return res.status(200).json(wrapResponse(req, data, "Reservation types fetched"));
    } catch (err) {
      console.error("Error fetching reservation types:", err);
      return errorResponse(res, err.statusCode || 500, err.message, err.errorCode || "INTERNAL_ERROR");
    }
  }
);

/**
 * @route GET /mockapis/serverpeuser/api/mocktrain/reserved/coach-types
 */
studentsTrainSeatReserveRouter.get(
  "/mockapis/serverpeuser/api/mocktrain/reserved/coach-types",
  licenseCheck,
  async (req, res) => {
    try {
      const coachTypes = await trainRepo.getCoachTypes();
      const data = { count: coachTypes.length, coachTypes };
      return res.status(200).json(wrapResponse(req, data, "Coach types fetched"));
    } catch (err) {
      console.error("Error fetching coach types:", err);
      return errorResponse(res, err.statusCode || 500, err.message, err.errorCode || "INTERNAL_ERROR");
    }
  }
);

// ============================================================================
// TRAIN SEARCH
// ============================================================================

/**
 * @route POST /mockapis/serverpeuser/api/mocktrain/reserved/search-trains
 */
studentsTrainSeatReserveRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/search-trains",
  licenseCheck,
  async (req, res) => {
    try {
      const { source_code, destination_code, doj } = req.body;
      
      if (!source_code || !destination_code || !doj) {
        return errorResponse(res, 400, "Source, destination, and date are required", "VALIDATION_ERROR");
      }
      
      const trainslist = await trainRepo.getTrains(source_code, destination_code, doj);
      const data = { count: trainslist.length, trainslist };
      return res.status(200).json(wrapResponse(req, data, "Trains found"));
    } catch (err) {
      console.error("Error searching trains:", err);
      return errorResponse(res, err.statusCode || 500, err.message, err.errorCode || "INTERNAL_ERROR");
    }
  }
);

// ============================================================================
// FARE CALCULATION
// ============================================================================

/**
 * @route POST /mockapis/serverpeuser/api/mocktrain/reserved/calculate-fare
 */
studentsTrainSeatReserveRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/calculate-fare",
  licenseCheck,
  async (req, res) => {
    try {
      const { train_number, source_code, destination_code, doj, coach_code, reservation_type, passenger_details } = req.body;
      
      if (!train_number || !source_code || !destination_code || !coach_code) {
        return errorResponse(res, 400, "Missing required fare calculation parameters", "VALIDATION_ERROR");
      }
      
      const fare_calculation_details = await trainRepo.calculateTotalFare(
        train_number, source_code, destination_code, doj, coach_code, reservation_type, passenger_details
      );
      
      const data = { fare_calculation_details };
      return res.status(200).json(wrapResponse(req, data, "Fare calculated"));
    } catch (err) {
      console.error("Error calculating fare:", err);
      return errorResponse(res, err.statusCode || 500, err.message, err.errorCode || "INTERNAL_ERROR");
    }
  }
);

// ============================================================================
// TICKET BOOKING
// ============================================================================

/**
 * @route POST /mockapis/serverpeuser/api/mocktrain/reserved/confirm-ticket
 */
studentsTrainSeatReserveRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/confirm-ticket",
  licenseCheck,
  async (req, res) => {
    try {
      const { train_number, source_code, destination_code, doj, coach_code, reservation_type, passenger_details, mobile_number, total_fare, email } = req.body;
      
      if (!train_number || !source_code || !destination_code || !doj) {
        return errorResponse(res, 400, "Missing required booking details", "VALIDATION_ERROR");
      }
      
      const bookingResult = await trainRepo.confirmTicket(
        train_number, source_code, destination_code, doj, coach_code, reservation_type, passenger_details, mobile_number, total_fare, email
      );
      
      return res.status(200).json(wrapResponse(req, bookingResult, "Booking confirmed! PNR: " + bookingResult.pnr));
    } catch (err) {
      console.error("Error confirming ticket:", err);
      return errorResponse(res, err.statusCode || 500, err.message, err.errorCode || "INTERNAL_ERROR");
    }
  }
);

// ============================================================================
// TRAIN SCHEDULE
// ============================================================================

/**
 * @route POST /mockapis/serverpeuser/api/mocktrain/reserved/train-schedule
 */
studentsTrainSeatReserveRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/train-schedule",
  licenseCheck,
  async (req, res) => {
    try {
      const { train_number } = req.body;
      
      if (!train_number) {
        return errorResponse(res, 400, "Train number is required", "VALIDATION_ERROR");
      }
      
      const train_schedule_details = await trainRepo.getTrainSchedule(train_number);
      
      if (!train_schedule_details) {
        return errorResponse(res, 404, "Train not found", "NOT_FOUND");
      }
      
      const data = { train_schedule_details };
      return res.status(200).json(wrapResponse(req, data, "Schedule fetched"));
    } catch (err) {
      console.error("Error fetching schedule:", err);
      return errorResponse(res, err.statusCode || 500, err.message, err.errorCode || "INTERNAL_ERROR");
    }
  }
);

// ============================================================================
// LIVE STATUS ENDPOINTS
// ============================================================================

/**
 * @route POST /mockapis/serverpeuser/api/mocktrain/reserved/train-live-running-status
 */
studentsTrainSeatReserveRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/train-live-running-status",
  licenseCheck,
  async (req, res) => {
    try {
      const { train_number } = req.body;
      
      if (!train_number) {
        return errorResponse(res, 400, "Train number is required", "VALIDATION_ERROR");
      }
      
      const schedule = await trainRepo.getLiveTrainStatus(train_number);
      
      if (!schedule || schedule.length === 0) {
        return errorResponse(res, 404, "Train schedule not found", "NOT_FOUND");
      }

      // Business logic for live status calculation
      const trainConfig = schedule[0];
      const runningDaysMap = {
        0: trainConfig.train_runs_on_sun === 'Y',
        1: trainConfig.train_runs_on_mon === 'Y',
        2: trainConfig.train_runs_on_tue === 'Y',
        3: trainConfig.train_runs_on_wed === 'Y',
        4: trainConfig.train_runs_on_thu === 'Y',
        5: trainConfig.train_runs_on_fri === 'Y',
        6: trainConfig.train_runs_on_sat === 'Y',
      };

      const now = new Date();
      const maxDayCount = Math.max(...schedule.map(s => s.running_day));
      
      let activeStartDate = null;
      let activeTrainFound = false;

      for (let offset = 0; offset <= maxDayCount + 1; offset++) {
        const candidateDate = new Date(now);
        candidateDate.setDate(now.getDate() - offset);
        const candidateDow = candidateDate.getDay();
        if (runningDaysMap[candidateDow]) {
          activeStartDate = new Date(candidateDate);
          activeStartDate.setHours(0, 0, 0, 0);
          activeTrainFound = true;
          break;
        }
      }

      if (!activeTrainFound) {
        return res.status(200).json(wrapResponse(req, {
          message: "Train is not scheduled to run on recent dates.",
          train_number
        }, "Train status fetched"));
      }

      const stationStatuses = schedule.map(stop => {
        const stopDate = new Date(activeStartDate);
        stopDate.setDate(activeStartDate.getDate() + (stop.running_day - 1));
        const dateStr = stopDate.toLocaleDateString('en-CA');

        const formTimestamp = (timeStr) => new Date(`${dateStr}T${timeStr}`);
        const arrivalTime = formTimestamp(stop.arrival);
        const departureTime = formTimestamp(stop.departure);

        let status = "On Time";
        let liveStatus = "";
        const diffMinutes = (a, b) => Math.round((a - b) / 60000);

        if (now > departureTime) {
          liveStatus = `Departed ${diffMinutes(now, departureTime)} mins ago`;
        } else if (now >= arrivalTime && now <= departureTime) {
          liveStatus = "At Station";
        } else {
          liveStatus = `Arriving in ${diffMinutes(arrivalTime, now)} mins`;
        }

        return {
          station_code: stop.station_code,
          station_name: stop.station_name,
          expected_arrival: stop.arrival,
          expected_departure: stop.departure,
          date: dateStr,
          status,
          live_status: liveStatus
        };
      });

      const data = {
        train_number,
        start_date: activeStartDate.toLocaleDateString(),
        current_time: now.toLocaleTimeString(),
        stations: stationStatuses
      };

      return res.status(200).json(wrapResponse(req, data, "Live train status fetched"));
    } catch (err) {
      console.error("Error fetching live status:", err);
      return errorResponse(res, err.statusCode || 500, err.message, err.errorCode || "INTERNAL_ERROR");
    }
  }
);

/**
 * @route POST /mockapis/serverpeuser/api/mocktrain/reserved/live-station
 */
studentsTrainSeatReserveRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/live-station",
  licenseCheck,
  async (req, res) => {
    try {
      const { station_code, next_hours = 2 } = req.body;
      
      if (!station_code) {
        return errorResponse(res, 400, "Station code is required", "VALIDATION_ERROR");
      }
      
      const trains = await trainRepo.getTrainsAtStation(station_code);

      if (!trains || trains.length === 0) {
        return errorResponse(res, 404, "No trains found for this station", "NOT_FOUND");
      }

      const now = new Date();
      const windowStart = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const windowEnd = new Date(now.getTime() + next_hours * 60 * 60 * 1000);

      const liveTrains = trains.map(train => ({
        train_number: train.train_number,
        train_name: train.train_name,
        train_type: train.train_type,
        expected_arrival: train.arrival,
        expected_departure: train.departure,
        platform: "TBD",
        status: "On Time"
      }));

      const data = {
        station_code,
        window_size_hours: next_hours,
        current_time: now.toLocaleTimeString(),
        trains: liveTrains
      };

      return res.status(200).json(wrapResponse(req, data, "Station status fetched"));
    } catch (err) {
      console.error("Error fetching station status:", err);
      return errorResponse(res, err.statusCode || 500, err.message, err.errorCode || "INTERNAL_ERROR");
    }
  }
);

// ============================================================================
// TICKET CANCELLATION
// ============================================================================

/**
 * @route POST /mockapis/serverpeuser/api/mocktrain/reserved/cancel-ticket
 */
studentsTrainSeatReserveRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/cancel-ticket",
  licenseCheck,
  async (req, res) => {
    try {
      const { pnr, passenger_ids } = req.body;
      
      if (!pnr || !passenger_ids || !Array.isArray(passenger_ids)) {
        return errorResponse(res, 400, "PNR and passenger_ids are required", "VALIDATION_ERROR");
      }
      
      const result = await trainRepo.cancelTicket(pnr, passenger_ids);
      return res.status(200).json(wrapResponse(req, result, "Ticket cancelled"));
    } catch (err) {
      console.error("Error cancelling ticket:", err);
      return errorResponse(res, err.statusCode || 500, err.message, err.errorCode || "INTERNAL_ERROR");
    }
  }
);

// ============================================================================
// EMAIL OTP ENDPOINTS
// ============================================================================

/**
 * @route POST /mockapis/serverpeuser/api/mocktrain/reserved/send-email-otp
 */
studentsTrainSeatReserveRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/send-email-otp",
  licenseCheck,
  async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return errorResponse(res, 400, "Email is required", "VALIDATION_ERROR");
      }
      
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 180000); // 3 min expiry
      
      await trainRepo.saveOtp(email, otp, expiresAt);
      
      console.log(`[OTP] Generated for ${email}: ${otp}`);
      
      const data = { message: "OTP sent successfully", email };
      return res.status(200).json(wrapResponse(req, data, "OTP sent to " + email));
    } catch (err) {
      console.error("Error sending OTP:", err);
      return errorResponse(res, err.statusCode || 500, err.message, err.errorCode || "INTERNAL_ERROR");
    }
  }
);

/**
 * @route POST /mockapis/serverpeuser/api/mocktrain/reserved/verify-email-otp
 */
studentsTrainSeatReserveRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/verify-email-otp",
  licenseCheck,
  async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return errorResponse(res, 400, "Email and OTP are required", "VALIDATION_ERROR");
      }
      
      const isValid = await trainRepo.verifyOtp(email, otp);
      
      if (!isValid) {
        return errorResponse(res, 400, "Invalid or expired OTP", "INVALID_OTP");
      }
      
      const data = { message: "OTP verified successfully", valid: true };
      return res.status(200).json(wrapResponse(req, data, "Login successful"));
    } catch (err) {
      console.error("Error verifying OTP:", err);
      return errorResponse(res, err.statusCode || 500, err.message, err.errorCode || "INTERNAL_ERROR");
    }
  }
);

// ============================================================================
// DASHBOARD & PNR
// ============================================================================

/**
 * @route POST /mockapis/serverpeuser/api/mocktrain/reserved/dashboard
 */
studentsTrainSeatReserveRouter.post(
  "/mockapis/serverpeuser/api/mocktrain/reserved/dashboard",
  licenseCheck,
  async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return errorResponse(res, 400, "Email is required", "VALIDATION_ERROR");
      }
      
      const history = await trainRepo.getBookingHistory(email);
      
      const data = {
        email,
        total_bookings: history.length,
        recent_bookings: history.slice(0, 10)
      };
      
      return res.status(200).json(wrapResponse(req, data, "Dashboard fetched"));
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      return errorResponse(res, err.statusCode || 500, err.message, err.errorCode || "INTERNAL_ERROR");
    }
  }
);

/**
 * @route GET /mockapis/serverpeuser/api/mocktrain/reserved/pnr-status/:pnr
 */
studentsTrainSeatReserveRouter.get(
  "/mockapis/serverpeuser/api/mocktrain/reserved/pnr-status/:pnr",
  licenseCheck,
  async (req, res) => {
    try {
      const { pnr } = req.params;
      
      if (!pnr) {
        return errorResponse(res, 400, "PNR is required", "VALIDATION_ERROR");
      }
      
      const status = await trainRepo.getPnrStatus(pnr);
      
      if (!status) {
        return errorResponse(res, 404, "PNR not found", "NOT_FOUND");
      }
      
      return res.status(200).json(wrapResponse(req, status, "PNR status fetched"));
    } catch (err) {
      console.error("Error fetching PNR status:", err);
      return errorResponse(res, err.statusCode || 500, err.message, err.errorCode || "INTERNAL_ERROR");
    }
  }
);

module.exports = studentsTrainSeatReserveRouter;
