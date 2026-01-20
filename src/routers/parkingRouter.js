const express = require("express");
const parkingRouter = express.Router();
const checkStudentAPIKey = require("../middleware/checkStudentAPIKey");
require("dotenv").config();

// Import repository functions
const parkingRepo = require("../SQL/photobasedvehiclemgmt/parking.repo");

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
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };
  if (details) {
    response.details = details;
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
    success: true,
    statusCode: 200,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/* ============================================================
   🩺 HEALTH CHECK
   ============================================================ */

/**
 * GET /parking/health
 * API health check endpoint
 */
parkingRouter.get("/parking/health", (req, res) => {
  sendSuccess(
    res,
    {
      service: "Photo Based Vehicle Parking Management",
      status: "operational",
      timestamp: new Date().toISOString(),
    },
    "Service is healthy"
  );
});

/* ============================================================
   🏢 PARKING FIELDS ENDPOINTS
   ============================================================ */

/**
 * GET /parking/fields
 * Get all parking fields with optional filters
 * Query params: city, district, state_union
 */
parkingRouter.get("/parking/fields", checkStudentAPIKey, async (req, res) => {
  try {
    const { city, district, state_union } = req.query;
    const fields = await parkingRepo.getAllParkingFields({
      city,
      district,
      state_union,
    });
    sendSuccess(res, { fields, count: fields.length }, "Parking fields fetched successfully");
  } catch (err) {
    console.error("Error fetching parking fields:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch parking fields", err.message);
  }
});

/**
 * GET /parking/fields/:id
 * Get parking field by ID
 */
parkingRouter.get("/parking/fields/:id", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid parking field ID is required");
    }

    const field = await parkingRepo.getParkingFieldById(id);
    
    if (!field) {
      return sendError(res, 404, "Parking field not found");
    }

    sendSuccess(res, { field }, "Parking field fetched successfully");
  } catch (err) {
    console.error("Error fetching parking field:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch parking field", err.message);
  }
});

/**
 * POST /parking/fields
 * Create a new parking field
 * Body: { field_name, place_name, city, district, state_union }
 */
parkingRouter.post("/parking/fields", checkStudentAPIKey, async (req, res) => {
  try {
    const { field_name, place_name, city, district, state_union } = req.body;

    if (!field_name) {
      return sendError(res, 400, "Field name is required");
    }

    const field = await parkingRepo.createParkingField({
      field_name,
      place_name,
      city,
      district,
      state_union,
    });

    sendSuccess(res, { field }, "Parking field created successfully");
  } catch (err) {
    console.error("Error creating parking field:", err);
    sendError(res, err.statusCode || 500, "Failed to create parking field", err.message);
  }
});

/**
 * PUT /parking/fields/:id
 * Update a parking field
 */
parkingRouter.put("/parking/fields/:id", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { field_name, place_name, city, district, state_union } = req.body;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid parking field ID is required");
    }

    const field = await parkingRepo.updateParkingField(id, {
      field_name,
      place_name,
      city,
      district,
      state_union,
    });

    if (!field) {
      return sendError(res, 404, "Parking field not found");
    }

    sendSuccess(res, { field }, "Parking field updated successfully");
  } catch (err) {
    console.error("Error updating parking field:", err);
    sendError(res, err.statusCode || 500, "Failed to update parking field", err.message);
  }
});

/**
 * DELETE /parking/fields/:id
 * Delete a parking field
 */
parkingRouter.delete("/parking/fields/:id", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid parking field ID is required");
    }

    const field = await parkingRepo.deleteParkingField(id);

    if (!field) {
      return sendError(res, 404, "Parking field not found");
    }

    sendSuccess(res, { field }, "Parking field deleted successfully");
  } catch (err) {
    console.error("Error deleting parking field:", err);
    sendError(res, err.statusCode || 500, "Failed to delete parking field", err.message);
  }
});

/* ============================================================
   👷 STAFF MANAGEMENT ENDPOINTS
   ============================================================ */

/**
 * GET /parking/staff/field/:fieldId
 * Get all staff for a parking field
 */
parkingRouter.get("/parking/staff/field/:fieldId", checkStudentAPIKey, async (req, res) => {
  try {
    const { fieldId } = req.params;

    if (!fieldId || isNaN(fieldId)) {
      return sendError(res, 400, "Valid parking field ID is required");
    }

    const staff = await parkingRepo.getStaffByParkingField(fieldId);
    sendSuccess(res, { staff, count: staff.length }, "Staff list fetched successfully");
  } catch (err) {
    console.error("Error fetching staff:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch staff", err.message);
  }
});

/**
 * GET /parking/staff/:id
 * Get staff by ID
 */
parkingRouter.get("/parking/staff/:id", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid staff ID is required");
    }

    const staff = await parkingRepo.getStaffById(id);

    if (!staff) {
      return sendError(res, 404, "Staff not found");
    }

    sendSuccess(res, { staff }, "Staff fetched successfully");
  } catch (err) {
    console.error("Error fetching staff:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch staff", err.message);
  }
});

/**
 * POST /parking/staff
 * Create a new staff member
 * Body: { fkparkingfield, ipaddress, login_code, is_checkin }
 */
parkingRouter.post("/parking/staff", checkStudentAPIKey, async (req, res) => {
  try {
    const { fkparkingfield, ipaddress, login_code, is_checkin } = req.body;

    if (!fkparkingfield || !ipaddress || !login_code) {
      return sendError(res, 400, "Parking field ID, IP address, and login code are required");
    }

    const staff = await parkingRepo.createStaff({
      fkparkingfield,
      ipaddress,
      login_code,
      is_checkin,
    });

    sendSuccess(res, { staff }, "Staff created successfully");
  } catch (err) {
    console.error("Error creating staff:", err);
    sendError(res, err.statusCode || 500, "Failed to create staff", err.message);
  }
});

/**
 * PUT /parking/staff/:id
 * Update staff member
 */
parkingRouter.put("/parking/staff/:id", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { ipaddress, login_code, is_checkin } = req.body;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid staff ID is required");
    }

    const staff = await parkingRepo.updateStaff(id, {
      ipaddress,
      login_code,
      is_checkin,
    });

    if (!staff) {
      return sendError(res, 404, "Staff not found");
    }

    sendSuccess(res, { staff }, "Staff updated successfully");
  } catch (err) {
    console.error("Error updating staff:", err);
    sendError(res, err.statusCode || 500, "Failed to update staff", err.message);
  }
});

/**
 * DELETE /parking/staff/:id
 * Delete staff member
 */
parkingRouter.delete("/parking/staff/:id", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid staff ID is required");
    }

    const staff = await parkingRepo.deleteStaff(id);

    if (!staff) {
      return sendError(res, 404, "Staff not found");
    }

    sendSuccess(res, { staff }, "Staff deleted successfully");
  } catch (err) {
    console.error("Error deleting staff:", err);
    sendError(res, err.statusCode || 500, "Failed to delete staff", err.message);
  }
});

/**
 * POST /parking/staff/authenticate
 * Authenticate staff by login code and IP address
 * Body: { login_code, ipaddress }
 */
parkingRouter.post("/parking/staff/authenticate", checkStudentAPIKey, async (req, res) => {
  try {
    const { login_code, ipaddress } = req.body;

    if (!login_code || !ipaddress) {
      return sendError(res, 400, "Login code and IP address are required");
    }

    const staff = await parkingRepo.authenticateStaff(login_code, ipaddress);

    if (!staff) {
      return sendError(res, 401, "Invalid credentials or unauthorized IP address");
    }

    // Create login log
    const loginLog = await parkingRepo.createStaffLoginLog(staff.pkstaff);

    sendSuccess(res, { staff, session: loginLog }, "Authentication successful");
  } catch (err) {
    console.error("Error authenticating staff:", err);
    sendError(res, err.statusCode || 500, "Authentication failed", err.message);
  }
});

/**
 * POST /parking/staff/logout/:logId
 * Log out staff
 */
parkingRouter.post("/parking/staff/logout/:logId", checkStudentAPIKey, async (req, res) => {
  try {
    const { logId } = req.params;

    if (!logId || isNaN(logId)) {
      return sendError(res, 400, "Valid log ID is required");
    }

    const log = await parkingRepo.updateStaffLogoutLog(logId);

    if (!log) {
      return sendError(res, 404, "Session not found");
    }

    sendSuccess(res, { log }, "Logout successful");
  } catch (err) {
    console.error("Error logging out staff:", err);
    sendError(res, err.statusCode || 500, "Logout failed", err.message);
  }
});

/**
 * GET /parking/staff/:staffId/logs
 * Get staff login/logout logs
 */
parkingRouter.get("/parking/staff/:staffId/logs", checkStudentAPIKey, async (req, res) => {
  try {
    const { staffId } = req.params;
    const { limit } = req.query;

    if (!staffId || isNaN(staffId)) {
      return sendError(res, 400, "Valid staff ID is required");
    }

    const logs = await parkingRepo.getStaffLogs(staffId, parseInt(limit) || 50);
    sendSuccess(res, { logs, count: logs.length }, "Staff logs fetched successfully");
  } catch (err) {
    console.error("Error fetching staff logs:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch staff logs", err.message);
  }
});

/* ============================================================
   💰 PARKING FEES ENDPOINTS
   ============================================================ */

/**
 * GET /parking/fees/:fieldId
 * Get parking fees for a parking field
 */
parkingRouter.get("/parking/fees/:fieldId", checkStudentAPIKey, async (req, res) => {
  try {
    const { fieldId } = req.params;

    if (!fieldId || isNaN(fieldId)) {
      return sendError(res, 400, "Valid parking field ID is required");
    }

    const fees = await parkingRepo.getParkingFeesByField(fieldId);

    if (!fees) {
      return sendError(res, 404, "Parking fees not configured for this field");
    }

    sendSuccess(res, { fees }, "Parking fees fetched successfully");
  } catch (err) {
    console.error("Error fetching parking fees:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch parking fees", err.message);
  }
});

/**
 * POST /parking/fees/:fieldId
 * Create or update parking fees for a parking field
 * Body: { two_wheeler_minimum, three_wheeler_minimum, four_wheeler_minimum, others_minimum, 
 *         two_wheeler_per_hour, three_wheeler_per_hour, four_wheeler_per_hour, others_wheeler_per_hour }
 */
parkingRouter.post("/parking/fees/:fieldId", checkStudentAPIKey, async (req, res) => {
  try {
    const { fieldId } = req.params;

    if (!fieldId || isNaN(fieldId)) {
      return sendError(res, 400, "Valid parking field ID is required");
    }

    const fees = await parkingRepo.upsertParkingFees(fieldId, req.body);
    sendSuccess(res, { fees }, "Parking fees saved successfully");
  } catch (err) {
    console.error("Error saving parking fees:", err);
    sendError(res, err.statusCode || 500, "Failed to save parking fees", err.message);
  }
});

/* ============================================================
   🚗 VEHICLE ENTRY/EXIT ENDPOINTS
   ============================================================ */

/**
 * POST /parking/vehicle/entry
 * Register vehicle entry
 * Body: { fkmock_vahan, fkparkingfield, fkstaff }
 */
parkingRouter.post("/parking/vehicle/entry", checkStudentAPIKey, async (req, res) => {
  try {
    const { fkmock_vahan, fkparkingfield, fkstaff } = req.body;

    if (!fkmock_vahan || !fkparkingfield || !fkstaff) {
      return sendError(res, 400, "Vehicle ID, parking field ID, and staff ID are required");
    }

    const entry = await parkingRepo.registerVehicleEntry({
      fkmock_vahan,
      fkparkingfield,
      fkstaff,
    });

    sendSuccess(res, { entry }, "Vehicle entry registered successfully");
  } catch (err) {
    console.error("Error registering vehicle entry:", err);
    sendError(res, err.statusCode || 500, "Failed to register vehicle entry", err.message);
  }
});

/**
 * GET /parking/vehicle/active/:fieldId
 * Get all active (parked) vehicles in a parking field
 */
parkingRouter.get("/parking/vehicle/active/:fieldId", checkStudentAPIKey, async (req, res) => {
  try {
    const { fieldId } = req.params;

    if (!fieldId || isNaN(fieldId)) {
      return sendError(res, 400, "Valid parking field ID is required");
    }

    const vehicles = await parkingRepo.getActiveVehicleEntries(fieldId);
    sendSuccess(res, { vehicles, count: vehicles.length }, "Active vehicles fetched successfully");
  } catch (err) {
    console.error("Error fetching active vehicles:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch active vehicles", err.message);
  }
});

/**
 * GET /parking/vehicle/otp/:otp
 * Get vehicle entry by OTP (for exit verification)
 */
parkingRouter.get("/parking/vehicle/otp/:otp", checkStudentAPIKey, async (req, res) => {
  try {
    const { otp } = req.params;

    if (!otp || otp.length !== 4) {
      return sendError(res, 400, "Valid 4-digit OTP is required");
    }

    const entry = await parkingRepo.getVehicleEntryByOTP(otp);

    if (!entry) {
      return sendError(res, 404, "No active parking entry found for this OTP");
    }

    sendSuccess(res, { entry }, "Vehicle entry fetched successfully");
  } catch (err) {
    console.error("Error fetching vehicle entry by OTP:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch vehicle entry", err.message);
  }
});

/**
 * POST /parking/vehicle/calculate-fee
 * Calculate parking fee for a vehicle
 * Body: { pkvehicle_entry_exit, vehicle_type }
 */
parkingRouter.post("/parking/vehicle/calculate-fee", checkStudentAPIKey, async (req, res) => {
  try {
    const { pkvehicle_entry_exit, vehicle_type } = req.body;

    if (!pkvehicle_entry_exit) {
      return sendError(res, 400, "Vehicle entry exit ID is required");
    }

    const feeCalculation = await parkingRepo.calculateParkingFee(
      pkvehicle_entry_exit,
      vehicle_type || "four_wheeler"
    );

    if (!feeCalculation) {
      return sendError(res, 404, "Vehicle entry not found");
    }

    sendSuccess(res, { fee: feeCalculation }, "Parking fee calculated successfully");
  } catch (err) {
    console.error("Error calculating parking fee:", err);
    sendError(res, err.statusCode || 500, "Failed to calculate parking fee", err.message);
  }
});

/**
 * POST /parking/vehicle/exit
 * Process vehicle exit with payment
 * Body: { pkvehicle_entry_exit, pay_type, payment }
 */
parkingRouter.post("/parking/vehicle/exit", checkStudentAPIKey, async (req, res) => {
  try {
    const { pkvehicle_entry_exit, pay_type, payment } = req.body;

    if (!pkvehicle_entry_exit || payment === undefined) {
      return sendError(res, 400, "Vehicle entry exit ID and payment amount are required");
    }

    const exit = await parkingRepo.processVehicleExit(pkvehicle_entry_exit, {
      pay_type,
      payment,
    });

    if (!exit) {
      return sendError(res, 404, "Vehicle entry not found");
    }

    sendSuccess(res, { exit }, "Vehicle exit processed successfully");
  } catch (err) {
    console.error("Error processing vehicle exit:", err);
    sendError(res, err.statusCode || 500, "Failed to process vehicle exit", err.message);
  }
});

/**
 * GET /parking/vehicle/history
 * Get vehicle entry/exit history
 * Query params: fkparkingfield, fkmock_vahan, from_date, to_date, limit
 */
parkingRouter.get("/parking/vehicle/history", checkStudentAPIKey, async (req, res) => {
  try {
    const { fkparkingfield, fkmock_vahan, from_date, to_date, limit } = req.query;

    const history = await parkingRepo.getVehicleHistory(
      { fkparkingfield, fkmock_vahan, from_date, to_date },
      parseInt(limit) || 100
    );

    sendSuccess(res, { history, count: history.length }, "Vehicle history fetched successfully");
  } catch (err) {
    console.error("Error fetching vehicle history:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch vehicle history", err.message);
  }
});

/**
 * POST /parking/vehicle/blacklist
 * Mark a vehicle entry as blacklisted
 * Body: { pkvehicle_entry_exit, reason, penalty }
 */
parkingRouter.post("/parking/vehicle/blacklist", checkStudentAPIKey, async (req, res) => {
  try {
    const { pkvehicle_entry_exit, reason, penalty } = req.body;

    if (!pkvehicle_entry_exit || !reason) {
      return sendError(res, 400, "Vehicle entry exit ID and reason are required");
    }

    const result = await parkingRepo.blacklistVehicleEntry(
      pkvehicle_entry_exit,
      reason,
      penalty || 0
    );

    if (!result) {
      return sendError(res, 404, "Vehicle entry not found");
    }

    sendSuccess(res, { result }, "Vehicle blacklisted successfully");
  } catch (err) {
    console.error("Error blacklisting vehicle:", err);
    sendError(res, err.statusCode || 500, "Failed to blacklist vehicle", err.message);
  }
});

/**
 * POST /parking/vehicle/share-otp/:entryId
 * Mark OTP as shared for a vehicle entry
 */
parkingRouter.post("/parking/vehicle/share-otp/:entryId", checkStudentAPIKey, async (req, res) => {
  try {
    const { entryId } = req.params;

    if (!entryId || isNaN(entryId)) {
      return sendError(res, 400, "Valid entry ID is required");
    }

    const result = await parkingRepo.markOTPShared(entryId);

    if (!result) {
      return sendError(res, 404, "Vehicle entry not found");
    }

    sendSuccess(res, { result }, "OTP marked as shared");
  } catch (err) {
    console.error("Error marking OTP as shared:", err);
    sendError(res, err.statusCode || 500, "Failed to mark OTP as shared", err.message);
  }
});

/**
 * GET /parking/statistics/:fieldId
 * Get parking statistics for a field
 * Query params: date (YYYY-MM-DD)
 */
parkingRouter.get("/parking/statistics/:fieldId", checkStudentAPIKey, async (req, res) => {
  try {
    const { fieldId } = req.params;
    const { date } = req.query;

    if (!fieldId || isNaN(fieldId)) {
      return sendError(res, 400, "Valid parking field ID is required");
    }

    const statistics = await parkingRepo.getParkingStatistics(fieldId, date);

    if (!statistics) {
      return sendError(res, 404, "Parking field not found or no data available");
    }

    sendSuccess(res, { statistics }, "Parking statistics fetched successfully");
  } catch (err) {
    console.error("Error fetching parking statistics:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch parking statistics", err.message);
  }
});

module.exports = parkingRouter;
