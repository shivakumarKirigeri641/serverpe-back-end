const {
  connectMockTrainTicketsDb,
  connectMainDB,
} = require("../database/connectDB");

/**
 * Middleware to check Student API Key against license table
 * This ensures only valid licensed users can access the serverpe-back-end APIs
 */
const checkStudentAPIKey = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"] || req.headers["X-API-Key"];

    if (!apiKey) {
      return res.status(401).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Failed",
        successstatus: false,
        message: "API key is required. Please provide X-API-Key header.",
        error_code: "API_KEY_MISSING",
        timestamp: new Date().toISOString(),
      });
    }

    // Check API key in license table
    const pool = connectMainDB();
    const query = `
      SELECT 
        id,
        license_key,
        status,
        expiry_date
      FROM licenses
      WHERE api_key = $1 
        AND status = true
        AND (expiry_date IS NULL OR expiry_date > NOW())
      LIMIT 1
    `;

    const result = await pool.query(query, [apiKey]);

    if (result.rows.length === 0) {
      return res.status(403).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Failed",
        successstatus: false,
        message: "Invalid or expired API key. Please check your license.",
        error_code: "API_KEY_INVALID",
        timestamp: new Date().toISOString(),
      });
    }

    const license = result.rows[0];

    // Check if license has expired
    if (license.expiry_date && new Date(license.expiry_date) < new Date()) {
      return res.status(403).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Failed",
        successstatus: false,
        message: "API key has expired. Please renew your license.",
        error_code: "API_KEY_EXPIRED",
        timestamp: new Date().toISOString(),
      });
    }

    // Add license info to request for potential use in other middlewares
    req.license = {
      id: license.id,
      key: license.license_key,
      student_name: license.student_name,
      student_email: license.student_email,
      expires_at: license.expires_at,
    };

    // Log successful API key validation
    console.log(
      `✅ Valid API key used by: ${license.student_name} (${license.student_email})`
    );

    next();
  } catch (error) {
    console.error("Error validating API key:", error);
    return res.status(500).json({
      poweredby: "serverpe.in",
      mock_data: true,
      status: "Failed",
      successstatus: false,
      message: "Internal server error during API key validation.",
      error_code: "VALIDATION_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = checkStudentAPIKey;
