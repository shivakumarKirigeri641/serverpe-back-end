const validateLicenseWithFingerprint = require("../SQL/main/validateLicenseWithFingerprint");
const extractFingerprint = require("../utils/extractFingerprint");
const extractLicenseKey = require("../utils/extractLicenseKey");

/**
 * License-only middleware for student offline API usage
 * 
 * Students don't need to be logged in - just license + fingerprint!
 * 
 * Validates:
 * 1. License key is provided
 * 2. Device fingerprint is provided  
 * 3. License is active
 * 4. Fingerprint matches (or binds on first use)
 * 
 * NO authentication required - perfect for offline student usage
 */
const checkStudentLicenseOnly = (pool) => {
  return async (req, res, next) => {
    try {
      /* ------------------------------------
         1️⃣ EXTRACT LICENSE KEY
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
         2️⃣ EXTRACT DEVICE FINGERPRINT
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
         3️⃣ VALIDATE LICENSE + FINGERPRINT
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
      req.isAdminAccess = false; // Student access

      next();
    } catch (err) {
      console.error("Student License Validation Error:", err.message);

      return res.status(500).json({
        poweredby: "serverpe.in",
        mock_data: true,
        status: "Failed",
        successstatus: false,
        message: "Invalid License"
      });
    }
  };
};

module.exports = checkStudentLicenseOnly;
