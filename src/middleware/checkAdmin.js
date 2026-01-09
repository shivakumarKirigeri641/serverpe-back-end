const jwt = require("jsonwebtoken");
const { getMainPool } = require("../database/connectDB");
require("dotenv").config();

/**
 * Admin authentication middleware
 * 
 * Validates that:
 * 1. User has valid JWT token
 * 2. User exists in database
 * 3. User has admin privileges (is_admin = true)
 * 
 * Attaches user info to req.user and req.adminUser
 */
const checkAdmin = async (req, res, next) => {
  try {
    /* ------------------------------------
       1️⃣ VALIDATE JWT TOKEN
    ------------------------------------ */
    const token = req.cookies.token;

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        poweredby: "serverpe.in",
        status: "Failed",
        successstatus: false,
        message: "Authentication required"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    /* ------------------------------------
       2️⃣ CHECK ADMIN STATUS FROM DATABASE
    ------------------------------------ */
    const pool = getMainPool();
    const result = await pool.query(
      `SELECT id, user_name, email, mobile_number, is_admin
       FROM users
       WHERE mobile_number = $1`,
      [decoded.mobile_number]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        poweredby: "serverpe.in",
        status: "Failed",
        successstatus: false,
        message: "User not found"
      });
    }

    const user = result.rows[0];

    /* ------------------------------------
       3️⃣ VERIFY ADMIN PRIVILEGES
    ------------------------------------ */
    if (!user.is_admin) {
      return res.status(403).json({
        poweredby: "serverpe.in",
        status: "Failed",
        successstatus: false,
        message: "Admin access required"
      });
    }

    /* ------------------------------------
       ✅ ATTACH USER INFO TO REQUEST
    ------------------------------------ */
    req.user = user;
    req.adminUser = user; // Explicit admin user reference
    req.mobile_number = user.mobile_number;

    next();
  } catch (err) {
    console.error("Admin Auth Error:", err.message);

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        poweredby: "serverpe.in",
        status: "Failed",
        successstatus: false,
        message: "Invalid token"
      });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        poweredby: "serverpe.in",
        status: "Failed",
        successstatus: false,
        message: "Token expired"
      });
    }

    return res.status(500).json({
      poweredby: "serverpe.in",
      status: "Failed",
      successstatus: false,
      message: "Internal server error"
    });
  }
};

module.exports = checkAdmin;
