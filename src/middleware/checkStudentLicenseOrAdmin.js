const jwt = require("jsonwebtoken");
const { getMainPool } = require("../database/connectDB");
const validateLicenseWithFingerprint = require("../SQL/main/validateLicenseWithFingerprint");
const extractFingerprint = require("../utils/extractFingerprint");
const extractLicenseKey = require("../utils/extractLicenseKey");
require("dotenv").config();

/**
 * Flexible middleware for student train seat reservation
 * 
 * Access Rules:
 * 1. Admin users → Granted access without license check
 * 2. Regular users → Must have valid license + fingerprint
 * 
 * Attaches user info and/or license info to request
 */
const checkStudentLicenseOrAdmin = async (req, res, next) => {
  try {
    /* ------------------------------------
       1️⃣ CHECK IF USER IS AUTHENTICATED
    ------------------------------------ */
    const token = req.cookies.token;

    if (!token || token === "null" || token === "undefined") {
      return res.status(403).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Failed",
        successstatus: false,
        message: "Invalid License"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    /* ------------------------------------
       2️⃣ CHECK IF USER IS ADMIN
    ------------------------------------ */
    const pool = getMainPool();
    const userResult = await pool.query(
      `SELECT id, user_name, email, mobile_number, is_admin
       FROM users
       WHERE mobile_number = $1`,
      [decoded.mobile_number]
    );

    if (userResult.rowCount === 0) {
      return res.status(403).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Failed",
        successstatus: false,
        message: "Invalid License"
      });
    }

    const user = userResult.rows[0];

    /* ------------------------------------
       3️⃣ IF ADMIN → GRANT ACCESS
    ------------------------------------ */
    if (user.is_admin) {
      req.user = user;
      req.adminUser = user;
      req.mobile_number = user.mobile_number;
      req.isAdminAccess = true; // Flag to indicate admin access
      
      console.log(`[ADMIN ACCESS] ${user.user_name} accessing student API without license`);
      
      return next();
    }

    /* ------------------------------------
       4️⃣ NOT ADMIN → REQUIRE LICENSE
    ------------------------------------ */
    const licenseKey = extractLicenseKey(req);

    if (!licenseKey) {
      return res.status(403).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Failed",
        successstatus: false,
        message: "Invalid License"
      });
    }

    /* ------------------------------------
       5️⃣ EXTRACT DEVICE FINGERPRINT
    ------------------------------------ */
    const deviceFingerprint = extractFingerprint(req);

    if (!deviceFingerprint) {
      return res.status(403).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Failed",
        successstatus: false,
        message: "Invalid License"
      });
    }

    /* ------------------------------------
       6️⃣ VALIDATE LICENSE + FINGERPRINT
    ------------------------------------ */
    const validationResult = await validateLicenseWithFingerprint(
      pool,
      licenseKey,
      deviceFingerprint
    );

    if (!validationResult.successstatus) {
      return res.status(validationResult.statuscode).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: validationResult.status,
        successstatus: validationResult.successstatus,
        message: validationResult.message
      });
    }

    /* ------------------------------------
       ✅ ATTACH LICENSE INFO TO REQUEST
    ------------------------------------ */
    req.licenseInfo = validationResult.license_info;
    req.user = user;
    req.mobile_number = user.mobile_number;
    req.isAdminAccess = false; // Regular student access

    next();
  } catch (err) {
    console.error("Student License/Admin Validation Error:", err.message);

    return res.status(500).json({
      poweredby: "serverpe.in",
      mock_data: true,
      status: "Failed",
      successstatus: false,
      message: "Invalid License"
    });
  }
};

module.exports = checkStudentLicenseOrAdmin;
