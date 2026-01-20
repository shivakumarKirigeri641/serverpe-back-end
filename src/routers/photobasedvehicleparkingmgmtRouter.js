const express = require("express");
const path = require("path");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const parkingRouter = express.Router();
const checkStudentAPIKey = require("../middleware/checkStudentAPIKey");
require("dotenv").config();

// Import repository functions
const parkingRepo = require("../SQL/photobasedvehicleparkingmgmt/photobasedvehicleparkingmgmt.repo");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../images/parking");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "vehicle-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

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
   👤 STAFF AUTHENTICATION ENDPOINTS
   ============================================================ */

/**
 * POST /parking/staff/login
 * Staff login with email - sends OTP to email
 * Body: { email }
 */
parkingRouter.post(
  "/parking/staff/login",
  checkStudentAPIKey,
  async (req, res) => {
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

      // Check if staff exists and is active
      const staff = await parkingRepo.getStaffByEmail(email);
      if (!staff) {
        return sendError(
          res,
          404,
          "Staff not found or inactive. Please contact administrator.",
        );
      }

      // Generate 4-digit OTP
      //const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const otp = "1234";
      // Get client IP address
      const ipAddress =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress;

      // Log the login attempt
      await parkingRepo.logStaffLogin(staff.id, otp, ipAddress);

      // TODO: Send OTP via email service
      // For development, we'll return the OTP
      const response = {
        email,
        staff_name: staff.staff_name,
        role: staff.role,
        otp_sent: true,
        expires_in: "10 minutes",
      };

      if (process.env.NODE_ENV === "development") {
        response.otp = otp; // Only in development
      }

      sendSuccess(res, response, "OTP sent successfully to your email");
    } catch (err) {
      console.error("Error in staff login:", err);
      sendError(res, 500, "Failed to process login request", err.message);
    }
  },
);

/**
 * POST /parking/staff/verify-otp
 * Verify staff OTP and complete login
 * Body: { email, login_otp }
 */
parkingRouter.post(
  "/parking/staff/verify-otp",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { email, login_otp } = req.body;

      if (!email || !login_otp) {
        return sendError(res, 400, "Email and OTP are required");
      }

      // Validate OTP format (4 digits)
      if (!/^\d{4}$/.test(login_otp)) {
        return sendError(res, 400, "OTP must be 4 digits");
      }

      // Verify OTP
      const result = await parkingRepo.verifyStaffOtp(email, login_otp);

      if (!result.success) {
        return sendError(res, 401, result.message);
      }

      // Return staff details
      sendSuccess(
        res,
        {
          staff_id: result.staff.id,
          email: result.staff.email,
          staff_name: result.staff.staff_name,
          role: result.staff.role,
        },
        "OTP verified successfully",
      );
    } catch (err) {
      console.error("Error verifying OTP:", err);
      sendError(res, 500, "Failed to verify OTP", err.message);
    }
  },
);

/**
 * GET /parking/staff
 * Get all parking staff (for admin purposes)
 */
parkingRouter.get("/parking/staff", checkStudentAPIKey, async (req, res) => {
  try {
    const staff = await parkingRepo.getAllParkingStaff();
    sendSuccess(
      res,
      {
        count: staff.length,
        staff,
      },
      "Staff list fetched successfully",
    );
  } catch (err) {
    console.error("Error fetching staff:", err);
    sendError(res, 500, "Failed to fetch staff list", err.message);
  }
});

/* ============================================================
   �️ PLATE RECOGNITION ENDPOINT
   ============================================================ */

/**
 * POST /parking/recognize-plate
 * Upload vehicle photo and recognize plate using PlateRecognizer API
 * Body: multipart/form-data with 'photo' field
 */
parkingRouter.post(
  "/parking/recognize-plate",
  checkStudentAPIKey,
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return sendError(res, 400, "Photo is required");
      }

      const filePath = req.file.path;

      // Call PlateRecognizer API
      const formData = new FormData();
      formData.append("upload", fs.createReadStream(filePath));

      const plateRecognizerApiKey = process.env.PLATERECOGNIZERAPIKEY;
      if (!plateRecognizerApiKey) {
        return sendError(res, 500, "PlateRecognizer API key not configured");
      }

      const response = await axios.post(
        "https://api.platerecognizer.com/v1/plate-reader/",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Token ${plateRecognizerApiKey}`,
          },
          timeout: 30000,
        },
      );

      const plateData = response.data;

      // Extract recognized plate
      let recognizedPlate = null;
      let confidence = 0;

      if (
        plateData.results &&
        plateData.results.length > 0 &&
        plateData.results[0].plate
      ) {
        recognizedPlate = plateData.results[0].plate.toUpperCase();
        confidence = plateData.results[0].score || 0;
      }

      // If plate recognized, move file to secure storage
      let secureFilePath = req.file.filename;
      if (recognizedPlate) {
        try {
          // Create date-based folder structure: YYYY/MM/DD
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const day = String(now.getDate()).padStart(2, "0");
          const hour = String(now.getHours()).padStart(2, "0");
          const minute = String(now.getMinutes()).padStart(2, "0");

          const secureDir = path.join(
            __dirname,
            "../secure_storage/projects/photobasedvehicleparkingmgmt",
            year.toString(),
            month,
            day,
          );

          // Create directory if it doesn't exist
          if (!fs.existsSync(secureDir)) {
            fs.mkdirSync(secureDir, { recursive: true });
          }

          // New filename: vehicle_number_HHMM.jpg
          const fileExt = path.extname(req.file.originalname) || ".jpg";
          const secureFileName = `${recognizedPlate}_${hour}${minute}${fileExt}`;
          const secureFileFullPath = path.join(secureDir, secureFileName);

          // Move file from temp location to secure storage
          fs.renameSync(filePath, secureFileFullPath);

          // Update secure file path for response
          secureFilePath = `${year}/${month}/${day}/${secureFileName}`;

          console.log(`Vehicle photo stored securely: ${secureFilePath}`);
        } catch (moveErr) {
          console.error("Error moving file to secure storage:", moveErr);
          // Continue even if move fails - file is still in temp location
        }
      }

      sendSuccess(
        res,
        {
          photo_filename: req.file.filename,
          secure_photo_path: secureFilePath,
          recognized_plate: recognizedPlate,
          confidence: confidence,
          plate_recognition_data: plateData,
        },
        recognizedPlate
          ? "Plate recognized successfully"
          : "Photo uploaded but no plate detected",
      );
    } catch (err) {
      console.error("Error in plate recognition:", err);
      sendError(
        res,
        500,
        "Failed to recognize plate",
        err.response?.data || err.message,
      );
    }
  },
);
/**
 * POST /parking/get-vehicle-details
 * Get vehicle details from eVAHAN, create if not exists
 * Body: { vehicle_number }
 */
parkingRouter.post(
  "/parking/get-vehicle-details",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { vehicle_number } = req.body;

      if (!vehicle_number) {
        return sendError(res, 400, "Vehicle number is required");
      }

      // Get vehicle from eVAHAN
      let vehicle = await parkingRepo.getVehicleFromEvahan(vehicle_number);

      if (vehicle) {
        // Vehicle exists in eVAHAN
        sendSuccess(
          res,
          {
            vehicle_number: vehicle.vehicle_number,
            vehicle_type: vehicle.vehicle_type,
            mobile_number: vehicle.mobile_number,
            owner_name: vehicle.owner_name,
            source: "evahan",
          },
          "Vehicle details found in eVAHAN",
        );
      } else {
        // Vehicle not found - get student mobile and create
        const studentMobile = await parkingRepo.getStudentMobileForProject(
          "photobasedvehicleparkingmgmt",
        );

        // Default to CAR if not specified, will be updated if needed
        const defaultVehicleType = "CAR";

        // Create vehicle in eVAHAN
        vehicle = await parkingRepo.createVehicleInEvahan(
          vehicle_number,
          defaultVehicleType,
          studentMobile,
        );

        sendSuccess(
          res,
          {
            vehicle_number: vehicle.vehicle_number,
            vehicle_type: vehicle.vehicle_type,
            mobile_number: vehicle.mobile_number,
            owner_name: vehicle.owner_name,
            source: "auto_created",
          },
          "Vehicle created in eVAHAN with student's mobile number",
        );
      }
    } catch (err) {
      console.error("Error getting vehicle details:", err);
      sendError(res, 500, "Failed to get vehicle details", err.message);
    }
  },
);
/* ============================================================
   �📋 TARIFF ENDPOINTS
   ============================================================ */

/**
 * GET /parking/tariffs
 * Get all parking tariffs
 */
parkingRouter.get("/parking/tariffs", checkStudentAPIKey, async (req, res) => {
  try {
    const tariffs = await parkingRepo.getAllParkingTariffs();
    sendSuccess(
      res,
      {
        count: tariffs.length,
        tariffs,
      },
      "Parking tariffs fetched successfully",
    );
  } catch (err) {
    console.error("Error fetching tariffs:", err);
    sendError(res, 500, "Failed to fetch parking tariffs", err.message);
  }
});

/**
 * GET /parking/tariff/:vehicle_type
 * Get parking tariff by vehicle type
 * Params: vehicle_type (CAR, BIKE)
 */
parkingRouter.get(
  "/parking/tariff/:vehicle_type",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { vehicle_type } = req.params;

      if (!vehicle_type) {
        return sendError(res, 400, "Vehicle type is required");
      }

      const tariff = await parkingRepo.getParkingTariff(vehicle_type);

      if (!tariff) {
        return sendError(
          res,
          404,
          `Tariff not found for vehicle type: ${vehicle_type}`,
        );
      }

      sendSuccess(res, { tariff }, "Tariff fetched successfully");
    } catch (err) {
      console.error("Error fetching tariff:", err);
      sendError(res, 500, "Failed to fetch tariff", err.message);
    }
  },
);

/* ============================================================
   🚗 VEHICLE CHECK-IN ENDPOINTS
   ============================================================ */

/**
 * POST /parking/evahan/verify
 * Verify vehicle from eVAHAN database
 * Body: { vehicle_number }
 */
parkingRouter.post(
  "/parking/evahan/verify",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { vehicle_number } = req.body;

      if (!vehicle_number) {
        return sendError(res, 400, "Vehicle number is required");
      }

      // Validate vehicle number format (basic validation)
      const vehicleNumberPattern = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$/;
      if (!vehicleNumberPattern.test(vehicle_number.toUpperCase())) {
        return sendError(
          res,
          400,
          "Invalid vehicle number format. Expected format: KA01AB1234",
        );
      }

      const vehicleData =
        await parkingRepo.getVehicleFromEvahan(vehicle_number);

      if (!vehicleData) {
        return sendError(
          res,
          404,
          "Vehicle not found in eVAHAN database. Please verify the vehicle number.",
        );
      }

      sendSuccess(
        res,
        { vehicle: vehicleData },
        "Vehicle verified successfully from eVAHAN",
      );
    } catch (err) {
      console.error("Error verifying vehicle from eVAHAN:", err);
      sendError(res, 500, "Failed to verify vehicle from eVAHAN", err.message);
    }
  },
);

/**
 * POST /parking/checkin
 * Check-in a vehicle to parking
 * Body: { vehicle_number, vehicle_type, mobile_number, staff_id, vehicle_photo_path }
 */
parkingRouter.post("/parking/checkin", checkStudentAPIKey, async (req, res) => {
  try {
    const {
      vehicle_number,
      vehicle_type,
      mobile_number,
      staff_id,
      vehicle_photo_path,
    } = req.body;

    // Validation
    if (!vehicle_number) {
      return sendError(res, 400, "Vehicle number is required");
    }

    if (!vehicle_type) {
      return sendError(res, 400, "Vehicle type is required");
    }

    if (!mobile_number) {
      return sendError(res, 400, "Mobile number is required");
    }

    if (!staff_id) {
      return sendError(res, 400, "Staff ID is required");
    }

    if (!vehicle_photo_path) {
      return sendError(res, 400, "Vehicle photo is required");
    }

    // Validate mobile number (10 digits)
    if (!/^[0-9]{10}$/.test(mobile_number)) {
      return sendError(res, 400, "Invalid mobile number. Must be 10 digits.");
    }

    // Check if vehicle is already parked
    const existingVehicle =
      await parkingRepo.getVehicleByNumber(vehicle_number);
    if (existingVehicle) {
      const activeEntry = await parkingRepo.getActiveVehicleEntry(
        existingVehicle.id,
      );
      if (activeEntry) {
        console.log(
          `Vehicle ${vehicle_number} is already parked. Entry ID: ${activeEntry.id}`,
        );
        return sendError(
          res,
          409,
          `Vehicle ${vehicle_number} is already in parking. Exit OTP: ${activeEntry.exit_otp}. Please check-out first before new entry.`,
          {
            entry_id: activeEntry.id,
            checkin_time: activeEntry.checkin_time,
            exit_otp: activeEntry.exit_otp,
            vehicle_number: vehicle_number,
          },
        );
      }
    }

    // Add or update vehicle in master
    const vehicle = await parkingRepo.addOrGetVehicle(
      vehicle_number,
      vehicle_type,
      mobile_number,
    );

    // Create vehicle entry
    const entry = await parkingRepo.createVehicleEntry(
      vehicle.id,
      staff_id,
      vehicle_photo_path,
    );

    sendSuccess(
      res,
      {
        entry_id: entry.id,
        vehicle_number: vehicle.vehicle_number,
        vehicle_type: vehicle.vehicle_type,
        checkin_time: entry.checkin_time,
        exit_otp: entry.exit_otp,
        status: entry.status,
        message:
          "Vehicle checked in successfully. Please share the exit OTP with the vehicle owner.",
      },
      "Vehicle checked in successfully",
    );
  } catch (err) {
    console.error("Error during check-in:", err);
    sendError(res, 500, "Failed to check-in vehicle", err.message);
  }
});

/**
 * POST /parking/search-by-otp
 * Search for vehicle entry by exit OTP
 * Body: { exit_otp }
 */
parkingRouter.post(
  "/parking/search-by-otp",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { exit_otp } = req.body;

      if (!exit_otp) {
        return sendError(res, 400, "Exit OTP is required");
      }

      // Validate OTP format (4 digits)
      if (!/^\d{4}$/.test(exit_otp)) {
        return sendError(res, 400, "Exit OTP must be 4 digits");
      }

      console.log(`Searching for vehicle with exit OTP: ${exit_otp}`);

      // Find active entry by OTP
      const entry = await parkingRepo.getActiveEntryByOtp(exit_otp);

      if (!entry) {
        return sendError(
          res,
          404,
          `No active vehicle found with exit OTP: ${exit_otp}. Please verify the OTP.`,
        );
      }

      sendSuccess(res, { entry: entry }, "Vehicle found successfully");
    } catch (err) {
      console.error("Error searching by OTP:", err);
      sendError(res, 500, "Failed to search vehicle", err.message);
    }
  },
);

/**
 * GET /parking/active-entry/:vehicle_number
 * Get active parking entry for a vehicle
 */
parkingRouter.get(
  "/parking/active-entry/:vehicle_number",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { vehicle_number } = req.params;

      if (!vehicle_number) {
        return sendError(res, 400, "Vehicle number is required");
      }

      const vehicle = await parkingRepo.getVehicleByNumber(vehicle_number);
      if (!vehicle) {
        return sendError(res, 404, "Vehicle not found in system");
      }

      const activeEntry = await parkingRepo.getActiveVehicleEntry(vehicle.id);
      if (!activeEntry) {
        return sendError(
          res,
          404,
          "No active parking entry found for this vehicle",
        );
      }

      sendSuccess(
        res,
        { entry: activeEntry },
        "Active parking entry fetched successfully",
      );
    } catch (err) {
      console.error("Error fetching active entry:", err);
      sendError(res, 500, "Failed to fetch active entry", err.message);
    }
  },
);

/* ============================================================
   🚪 VEHICLE CHECK-OUT ENDPOINTS
   ============================================================ */

/**
 * POST /parking/checkout
 * Check-out a vehicle from parking
 * Body: { entry_id, exit_otp, checkout_staff_id }
 */
parkingRouter.post(
  "/parking/checkout",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { entry_id, exit_otp, checkout_staff_id } = req.body;

      // Validation
      if (!entry_id) {
        return sendError(res, 400, "Entry ID is required");
      }

      if (!exit_otp) {
        return sendError(res, 400, "Exit OTP is required");
      }

      if (!checkout_staff_id) {
        return sendError(res, 400, "Checkout staff ID is required");
      }

      // Verify OTP length (4 digits)
      if (!/^[0-9]{4}$/.test(exit_otp)) {
        return sendError(res, 400, "Invalid OTP format. Must be 4 digits.");
      }

      // Process checkout
      const result = await parkingRepo.processVehicleCheckout(
        entry_id,
        exit_otp,
        checkout_staff_id,
      );

      if (!result) {
        return sendError(
          res,
          401,
          "Invalid OTP or entry not found. Please verify the OTP and try again.",
        );
      }

      // Get complete entry details
      const entryDetails = await parkingRepo.getVehicleEntryById(entry_id);

      sendSuccess(
        res,
        {
          entry_id: result.id,
          vehicle_number: entryDetails.vehicle_number,
          checkin_time: result.checkin_time,
          checkout_time: result.checkout_time,
          parking_duration_minutes: result.parking_minutes,
          parking_amount: parseFloat(result.parking_amount),
          status: result.status,
          message: `Vehicle checked out successfully. Parking amount: ₹${result.parking_amount}`,
        },
        "Vehicle checked out successfully",
      );
    } catch (err) {
      console.error("Error during check-out:", err);
      sendError(res, 500, "Failed to check-out vehicle", err.message);
    }
  },
);

/**
 * POST /parking/verify-exit-otp
 * Verify exit OTP before checkout (for validation only)
 * Body: { entry_id, exit_otp }
 */
parkingRouter.post(
  "/parking/verify-exit-otp",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { entry_id, exit_otp } = req.body;

      if (!entry_id || !exit_otp) {
        return sendError(res, 400, "Entry ID and exit OTP are required");
      }

      // Get entry details
      const entry = await parkingRepo.getVehicleEntryById(entry_id);

      if (!entry) {
        return sendError(res, 404, "Entry not found");
      }

      if (entry.status !== "IN") {
        return sendError(res, 400, "Vehicle has already been checked out");
      }

      if (entry.exit_otp !== exit_otp) {
        return sendError(res, 401, "Invalid exit OTP");
      }

      // Calculate estimated parking duration and amount
      const currentTime = new Date();
      const checkinTime = new Date(entry.checkin_time);
      const durationMinutes = Math.floor(
        (currentTime - checkinTime) / (1000 * 60),
      );
      const durationHours = Math.ceil(durationMinutes / 60);

      // Get tariff
      const tariff = await parkingRepo.getParkingTariff(entry.vehicle_type);
      const estimatedAmount = tariff
        ? durationHours * tariff.first_hour_amount
        : 0;

      sendSuccess(
        res,
        {
          otp_valid: true,
          entry_id: entry.id,
          vehicle_number: entry.vehicle_number,
          checkin_time: entry.checkin_time,
          estimated_duration_minutes: durationMinutes,
          estimated_amount: estimatedAmount,
        },
        "Exit OTP verified successfully",
      );
    } catch (err) {
      console.error("Error verifying exit OTP:", err);
      sendError(res, 500, "Failed to verify exit OTP", err.message);
    }
  },
);

/* ============================================================
   📊 PARKING STATISTICS & REPORTS
   ============================================================ */

/**
 * GET /parking/stats
 * Get overall parking statistics
 */
parkingRouter.get("/parking/stats", checkStudentAPIKey, async (req, res) => {
  try {
    const stats = await parkingRepo.getParkingStats();
    sendSuccess(
      res,
      {
        vehicles_currently_parked: parseInt(stats.vehicles_inside),
        total_exits_today: parseInt(stats.total_exits),
        total_entries: parseInt(stats.total_entries),
        total_revenue: parseFloat(stats.total_revenue),
        unique_vehicles: parseInt(stats.unique_vehicles),
      },
      "Parking statistics fetched successfully",
    );
  } catch (err) {
    console.error("Error fetching parking stats:", err);
    sendError(res, 500, "Failed to fetch parking statistics", err.message);
  }
});

/**
 * GET /parking/entries
 * Get all parking entries with optional filters
 * Query params: status (IN/OUT), limit, offset
 */
parkingRouter.get("/parking/entries", checkStudentAPIKey, async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;

    // Validate status if provided
    if (status && !["IN", "OUT"].includes(status.toUpperCase())) {
      return sendError(res, 400, "Status must be either 'IN' or 'OUT'");
    }

    // Validate limit
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 500) {
      return sendError(res, 400, "Limit must be between 1 and 500");
    }

    // Validate offset
    const parsedOffset = parseInt(offset);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return sendError(res, 400, "Offset must be a non-negative number");
    }

    const entries = await parkingRepo.getAllVehicleEntries(
      status ? status.toUpperCase() : null,
      parsedLimit,
      parsedOffset,
    );

    sendSuccess(
      res,
      {
        count: entries.length,
        limit: parsedLimit,
        offset: parsedOffset,
        entries,
      },
      "Parking entries fetched successfully",
    );
  } catch (err) {
    console.error("Error fetching parking entries:", err);
    sendError(res, 500, "Failed to fetch parking entries", err.message);
  }
});

/**
 * GET /parking/entry/:entry_id
 * Get specific parking entry details
 */
parkingRouter.get(
  "/parking/entry/:entry_id",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { entry_id } = req.params;

      if (!entry_id) {
        return sendError(res, 400, "Entry ID is required");
      }

      const entry = await parkingRepo.getVehicleEntryById(parseInt(entry_id));

      if (!entry) {
        return sendError(res, 404, "Entry not found");
      }

      sendSuccess(res, { entry }, "Entry details fetched successfully");
    } catch (err) {
      console.error("Error fetching entry details:", err);
      sendError(res, 500, "Failed to fetch entry details", err.message);
    }
  },
);

/**
 * GET /parking/history/:vehicle_number
 * Get parking history for a specific vehicle
 */
parkingRouter.get(
  "/parking/history/:vehicle_number",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { vehicle_number } = req.params;

      if (!vehicle_number) {
        return sendError(res, 400, "Vehicle number is required");
      }

      const history =
        await parkingRepo.getVehicleParkingHistory(vehicle_number);

      sendSuccess(
        res,
        {
          vehicle_number: vehicle_number.toUpperCase(),
          visits_count: history.length,
          history,
        },
        "Parking history fetched successfully",
      );
    } catch (err) {
      console.error("Error fetching parking history:", err);
      sendError(res, 500, "Failed to fetch parking history", err.message);
    }
  },
);

/**
 * GET /parking/vehicle/:vehicle_number
 * Get vehicle details from master
 */
parkingRouter.get(
  "/parking/vehicle/:vehicle_number",
  checkStudentAPIKey,
  async (req, res) => {
    try {
      const { vehicle_number } = req.params;

      if (!vehicle_number) {
        return sendError(res, 400, "Vehicle number is required");
      }

      const vehicle = await parkingRepo.getVehicleByNumber(vehicle_number);

      if (!vehicle) {
        return sendError(
          res,
          404,
          "Vehicle not found in system. Vehicle needs to check-in first.",
        );
      }

      sendSuccess(res, { vehicle }, "Vehicle details fetched successfully");
    } catch (err) {
      console.error("Error fetching vehicle details:", err);
      sendError(res, 500, "Failed to fetch vehicle details", err.message);
    }
  },
);

/* ============================================================
   🏥 HEALTH CHECK
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
    "Service is healthy",
  );
});

module.exports = parkingRouter;
