const express = require("express");
const tollRouter = express.Router();
const checkStudentAPIKey = require("../middleware/checkStudentAPIKey");
require("dotenv").config();

// Import repository functions
const tollRepo = require("../SQL/photobasedvehiclemgmt/toll.repo");

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
 * GET /toll/health
 * API health check endpoint
 */
tollRouter.get("/toll/health", (req, res) => {
  sendSuccess(
    res,
    {
      service: "Photo Based Vehicle Toll Management",
      status: "operational",
      timestamp: new Date().toISOString(),
    },
    "Service is healthy"
  );
});

/* ============================================================
   🚗 MOCK VAHAN (Vehicle Registry) ENDPOINTS
   ============================================================ */

/**
 * GET /toll/vehicles
 * Get all vehicles with optional search
 * Query params: q (search query), limit
 */
tollRouter.get("/toll/vehicles", checkStudentAPIKey, async (req, res) => {
  try {
    const { q, limit } = req.query;
    const vehicles = await tollRepo.getAllVehicles(q, parseInt(limit) || 50);
    sendSuccess(res, { vehicles, count: vehicles.length }, "Vehicles fetched successfully");
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch vehicles", err.message);
  }
});

/**
 * GET /toll/vehicles/:id
 * Get vehicle by ID
 */
tollRouter.get("/toll/vehicles/:id", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid vehicle ID is required");
    }

    const vehicle = await tollRepo.getVehicleById(id);

    if (!vehicle) {
      return sendError(res, 404, "Vehicle not found");
    }

    sendSuccess(res, { vehicle }, "Vehicle fetched successfully");
  } catch (err) {
    console.error("Error fetching vehicle:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch vehicle", err.message);
  }
});

/**
 * GET /toll/vehicles/number/:vehicleNumber
 * Get vehicle by vehicle number
 */
tollRouter.get("/toll/vehicles/number/:vehicleNumber", checkStudentAPIKey, async (req, res) => {
  try {
    const { vehicleNumber } = req.params;

    if (!vehicleNumber) {
      return sendError(res, 400, "Vehicle number is required");
    }

    const vehicle = await tollRepo.getVehicleByNumber(vehicleNumber);

    if (!vehicle) {
      return sendError(res, 404, "Vehicle not found");
    }

    sendSuccess(res, { vehicle }, "Vehicle fetched successfully");
  } catch (err) {
    console.error("Error fetching vehicle:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch vehicle", err.message);
  }
});

/**
 * POST /toll/vehicles
 * Register a new vehicle
 * Body: { vehicle_number, mobile_number, tag_balance }
 */
tollRouter.post("/toll/vehicles", checkStudentAPIKey, async (req, res) => {
  try {
    const { vehicle_number, mobile_number, tag_balance } = req.body;

    if (!vehicle_number || !mobile_number) {
      return sendError(res, 400, "Vehicle number and mobile number are required");
    }

    // Validate Indian vehicle number format (basic validation)
    const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$/i;
    if (!vehicleRegex.test(vehicle_number.replace(/\s/g, ""))) {
      return sendError(res, 400, "Invalid vehicle number format");
    }

    const vehicle = await tollRepo.registerVehicle({
      vehicle_number: vehicle_number.replace(/\s/g, ""),
      mobile_number,
      tag_balance,
    });

    sendSuccess(res, { vehicle }, "Vehicle registered successfully");
  } catch (err) {
    console.error("Error registering vehicle:", err);
    sendError(res, err.statusCode || 500, "Failed to register vehicle", err.message);
  }
});

/**
 * PUT /toll/vehicles/:id
 * Update vehicle details
 */
tollRouter.put("/toll/vehicles/:id", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { mobile_number } = req.body;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid vehicle ID is required");
    }

    const vehicle = await tollRepo.updateVehicle(id, { mobile_number });

    if (!vehicle) {
      return sendError(res, 404, "Vehicle not found");
    }

    sendSuccess(res, { vehicle }, "Vehicle updated successfully");
  } catch (err) {
    console.error("Error updating vehicle:", err);
    sendError(res, err.statusCode || 500, "Failed to update vehicle", err.message);
  }
});

/**
 * GET /toll/vehicles/:id/balance
 * Get vehicle tag balance
 */
tollRouter.get("/toll/vehicles/:id/balance", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid vehicle ID is required");
    }

    const balance = await tollRepo.getVehicleBalance(id);

    if (!balance) {
      return sendError(res, 404, "Vehicle not found");
    }

    sendSuccess(res, { balance }, "Vehicle balance fetched successfully");
  } catch (err) {
    console.error("Error fetching vehicle balance:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch vehicle balance", err.message);
  }
});

/* ============================================================
   🏛️ TOLL PLAZA ENDPOINTS
   ============================================================ */

/**
 * GET /toll/plazas
 * Get all toll plazas with optional filters
 * Query params: district, state_union
 */
tollRouter.get("/toll/plazas", checkStudentAPIKey, async (req, res) => {
  try {
    const { district, state_union } = req.query;
    const plazas = await tollRepo.getAllTollPlazas({ district, state_union });
    sendSuccess(res, { plazas, count: plazas.length }, "Toll plazas fetched successfully");
  } catch (err) {
    console.error("Error fetching toll plazas:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch toll plazas", err.message);
  }
});

/**
 * GET /toll/plazas/:id
 * Get toll plaza by ID
 */
tollRouter.get("/toll/plazas/:id", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid toll plaza ID is required");
    }

    const plaza = await tollRepo.getTollPlazaById(id);

    if (!plaza) {
      return sendError(res, 404, "Toll plaza not found");
    }

    sendSuccess(res, { plaza }, "Toll plaza fetched successfully");
  } catch (err) {
    console.error("Error fetching toll plaza:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch toll plaza", err.message);
  }
});

/**
 * GET /toll/plazas/code/:plazaId
 * Get toll plaza by plaza ID (unique identifier)
 */
tollRouter.get("/toll/plazas/code/:plazaId", checkStudentAPIKey, async (req, res) => {
  try {
    const { plazaId } = req.params;

    if (!plazaId) {
      return sendError(res, 400, "Plaza ID is required");
    }

    const plaza = await tollRepo.getTollPlazaByPlazaId(plazaId);

    if (!plaza) {
      return sendError(res, 404, "Toll plaza not found");
    }

    sendSuccess(res, { plaza }, "Toll plaza fetched successfully");
  } catch (err) {
    console.error("Error fetching toll plaza:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch toll plaza", err.message);
  }
});

/**
 * POST /toll/plazas
 * Create a new toll plaza
 * Body: { plaza_id, plaza_name, place_name, district, state_union }
 */
tollRouter.post("/toll/plazas", checkStudentAPIKey, async (req, res) => {
  try {
    const { plaza_id, plaza_name, place_name, district, state_union } = req.body;

    if (!plaza_id || !plaza_name) {
      return sendError(res, 400, "Plaza ID and plaza name are required");
    }

    const plaza = await tollRepo.createTollPlaza({
      plaza_id,
      plaza_name,
      place_name,
      district,
      state_union,
    });

    sendSuccess(res, { plaza }, "Toll plaza created successfully");
  } catch (err) {
    console.error("Error creating toll plaza:", err);
    sendError(res, err.statusCode || 500, "Failed to create toll plaza", err.message);
  }
});

/**
 * PUT /toll/plazas/:id
 * Update toll plaza
 */
tollRouter.put("/toll/plazas/:id", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { plaza_name, place_name, district, state_union } = req.body;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid toll plaza ID is required");
    }

    const plaza = await tollRepo.updateTollPlaza(id, {
      plaza_name,
      place_name,
      district,
      state_union,
    });

    if (!plaza) {
      return sendError(res, 404, "Toll plaza not found");
    }

    sendSuccess(res, { plaza }, "Toll plaza updated successfully");
  } catch (err) {
    console.error("Error updating toll plaza:", err);
    sendError(res, err.statusCode || 500, "Failed to update toll plaza", err.message);
  }
});

/**
 * DELETE /toll/plazas/:id
 * Delete toll plaza
 */
tollRouter.delete("/toll/plazas/:id", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid toll plaza ID is required");
    }

    const plaza = await tollRepo.deleteTollPlaza(id);

    if (!plaza) {
      return sendError(res, 404, "Toll plaza not found");
    }

    sendSuccess(res, { plaza }, "Toll plaza deleted successfully");
  } catch (err) {
    console.error("Error deleting toll plaza:", err);
    sendError(res, err.statusCode || 500, "Failed to delete toll plaza", err.message);
  }
});

/**
 * GET /toll/plazas/:id/statistics
 * Get toll plaza statistics
 * Query params: date (YYYY-MM-DD)
 */
tollRouter.get("/toll/plazas/:id/statistics", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid toll plaza ID is required");
    }

    const statistics = await tollRepo.getTollPlazaStatistics(id, date);

    if (!statistics) {
      return sendError(res, 404, "Toll plaza not found or no data available");
    }

    sendSuccess(res, { statistics }, "Toll plaza statistics fetched successfully");
  } catch (err) {
    console.error("Error fetching toll plaza statistics:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch toll plaza statistics", err.message);
  }
});

/* ============================================================
   🛤️ TOLL PLAZA LANE ENDPOINTS
   ============================================================ */

/**
 * GET /toll/lanes/plaza/:plazaId
 * Get all lanes for a toll plaza
 */
tollRouter.get("/toll/lanes/plaza/:plazaId", checkStudentAPIKey, async (req, res) => {
  try {
    const { plazaId } = req.params;

    if (!plazaId || isNaN(plazaId)) {
      return sendError(res, 400, "Valid toll plaza ID is required");
    }

    const lanes = await tollRepo.getLanesByTollPlaza(plazaId);
    sendSuccess(res, { lanes, count: lanes.length }, "Toll plaza lanes fetched successfully");
  } catch (err) {
    console.error("Error fetching toll plaza lanes:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch toll plaza lanes", err.message);
  }
});

/**
 * GET /toll/lanes/:id
 * Get lane by ID
 */
tollRouter.get("/toll/lanes/:id", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid lane ID is required");
    }

    const lane = await tollRepo.getLaneById(id);

    if (!lane) {
      return sendError(res, 404, "Lane not found");
    }

    sendSuccess(res, { lane }, "Lane fetched successfully");
  } catch (err) {
    console.error("Error fetching lane:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch lane", err.message);
  }
});

/**
 * GET /toll/lanes/ip/:ipAddress
 * Get lane by IP address
 */
tollRouter.get("/toll/lanes/ip/:ipAddress", checkStudentAPIKey, async (req, res) => {
  try {
    const { ipAddress } = req.params;

    if (!ipAddress) {
      return sendError(res, 400, "IP address is required");
    }

    const lane = await tollRepo.getLaneByIP(ipAddress);

    if (!lane) {
      return sendError(res, 404, "Lane not found");
    }

    sendSuccess(res, { lane }, "Lane fetched successfully");
  } catch (err) {
    console.error("Error fetching lane:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch lane", err.message);
  }
});

/**
 * POST /toll/lanes
 * Create a new toll plaza lane
 * Body: { fktoll_plaza, laneid, ip_address }
 */
tollRouter.post("/toll/lanes", checkStudentAPIKey, async (req, res) => {
  try {
    const { fktoll_plaza, laneid, ip_address } = req.body;

    if (!fktoll_plaza || !laneid || !ip_address) {
      return sendError(res, 400, "Toll plaza ID, lane ID, and IP address are required");
    }

    const lane = await tollRepo.createLane({
      fktoll_plaza,
      laneid,
      ip_address,
    });

    sendSuccess(res, { lane }, "Lane created successfully");
  } catch (err) {
    console.error("Error creating lane:", err);
    sendError(res, err.statusCode || 500, "Failed to create lane", err.message);
  }
});

/**
 * PUT /toll/lanes/:id
 * Update toll plaza lane
 */
tollRouter.put("/toll/lanes/:id", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { laneid, ip_address } = req.body;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid lane ID is required");
    }

    const lane = await tollRepo.updateLane(id, { laneid, ip_address });

    if (!lane) {
      return sendError(res, 404, "Lane not found");
    }

    sendSuccess(res, { lane }, "Lane updated successfully");
  } catch (err) {
    console.error("Error updating lane:", err);
    sendError(res, err.statusCode || 500, "Failed to update lane", err.message);
  }
});

/**
 * DELETE /toll/lanes/:id
 * Delete toll plaza lane
 */
tollRouter.delete("/toll/lanes/:id", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid lane ID is required");
    }

    const lane = await tollRepo.deleteLane(id);

    if (!lane) {
      return sendError(res, 404, "Lane not found");
    }

    sendSuccess(res, { lane }, "Lane deleted successfully");
  } catch (err) {
    console.error("Error deleting lane:", err);
    sendError(res, err.statusCode || 500, "Failed to delete lane", err.message);
  }
});

/**
 * GET /toll/lanes/:id/transactions
 * Get deduction history for a toll plaza lane
 * Query params: date, limit
 */
tollRouter.get("/toll/lanes/:id/transactions", checkStudentAPIKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, limit } = req.query;

    if (!id || isNaN(id)) {
      return sendError(res, 400, "Valid lane ID is required");
    }

    const transactions = await tollRepo.getLaneDeductionHistory(
      id,
      date,
      parseInt(limit) || 100
    );

    sendSuccess(
      res,
      { transactions, count: transactions.length },
      "Lane transactions fetched successfully"
    );
  } catch (err) {
    console.error("Error fetching lane transactions:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch lane transactions", err.message);
  }
});

/* ============================================================
   💳 WALLET CREDIT ENDPOINTS
   ============================================================ */

/**
 * POST /toll/wallet/credit
 * Add credit to vehicle tag wallet
 * Body: { fkmock_vahan, credit_amount, pay_type }
 */
tollRouter.post("/toll/wallet/credit", checkStudentAPIKey, async (req, res) => {
  try {
    const { fkmock_vahan, credit_amount, pay_type } = req.body;

    if (!fkmock_vahan || !credit_amount) {
      return sendError(res, 400, "Vehicle ID and credit amount are required");
    }

    if (credit_amount <= 0) {
      return sendError(res, 400, "Credit amount must be positive");
    }

    const result = await tollRepo.addWalletCredit({
      fkmock_vahan,
      credit_amount,
      pay_type,
    });

    sendSuccess(res, result, "Wallet credit added successfully");
  } catch (err) {
    console.error("Error adding wallet credit:", err);
    sendError(res, err.statusCode || 500, "Failed to add wallet credit", err.message);
  }
});

/**
 * GET /toll/wallet/:vehicleId/credits
 * Get credit history for a vehicle
 */
tollRouter.get("/toll/wallet/:vehicleId/credits", checkStudentAPIKey, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { limit } = req.query;

    if (!vehicleId || isNaN(vehicleId)) {
      return sendError(res, 400, "Valid vehicle ID is required");
    }

    const credits = await tollRepo.getWalletCreditHistory(vehicleId, parseInt(limit) || 50);
    sendSuccess(res, { credits, count: credits.length }, "Credit history fetched successfully");
  } catch (err) {
    console.error("Error fetching credit history:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch credit history", err.message);
  }
});

/* ============================================================
   💸 WALLET DEDUCTION ENDPOINTS
   ============================================================ */

/**
 * POST /toll/wallet/deduct
 * Process toll deduction from vehicle wallet
 * Body: { fkmock_vahan, fktoll_plaza_lane, amount_deducted }
 */
tollRouter.post("/toll/wallet/deduct", checkStudentAPIKey, async (req, res) => {
  try {
    const { fkmock_vahan, fktoll_plaza_lane, amount_deducted } = req.body;

    if (!fkmock_vahan || !fktoll_plaza_lane || !amount_deducted) {
      return sendError(res, 400, "Vehicle ID, lane ID, and deduction amount are required");
    }

    if (amount_deducted <= 0) {
      return sendError(res, 400, "Deduction amount must be positive");
    }

    const result = await tollRepo.processTollDeduction({
      fkmock_vahan,
      fktoll_plaza_lane,
      amount_deducted,
    });

    if (!result.success) {
      return sendError(res, 402, result.message, {
        error_code: result.error,
        current_balance: result.current_balance,
      });
    }

    sendSuccess(res, result, "Toll deduction processed successfully");
  } catch (err) {
    console.error("Error processing toll deduction:", err);
    sendError(res, err.statusCode || 500, "Failed to process toll deduction", err.message);
  }
});

/**
 * GET /toll/wallet/:vehicleId/deductions
 * Get deduction history for a vehicle
 */
tollRouter.get("/toll/wallet/:vehicleId/deductions", checkStudentAPIKey, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { limit } = req.query;

    if (!vehicleId || isNaN(vehicleId)) {
      return sendError(res, 400, "Valid vehicle ID is required");
    }

    const deductions = await tollRepo.getWalletDeductionHistory(vehicleId, parseInt(limit) || 50);
    sendSuccess(
      res,
      { deductions, count: deductions.length },
      "Deduction history fetched successfully"
    );
  } catch (err) {
    console.error("Error fetching deduction history:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch deduction history", err.message);
  }
});

/**
 * GET /toll/wallet/:vehicleId/transactions
 * Get complete wallet transaction history for a vehicle
 */
tollRouter.get("/toll/wallet/:vehicleId/transactions", checkStudentAPIKey, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { limit } = req.query;

    if (!vehicleId || isNaN(vehicleId)) {
      return sendError(res, 400, "Valid vehicle ID is required");
    }

    const transactions = await tollRepo.getWalletTransactionHistory(
      vehicleId,
      parseInt(limit) || 50
    );

    sendSuccess(
      res,
      { transactions, count: transactions.length },
      "Transaction history fetched successfully"
    );
  } catch (err) {
    console.error("Error fetching transaction history:", err);
    sendError(res, err.statusCode || 500, "Failed to fetch transaction history", err.message);
  }
});

module.exports = tollRouter;
