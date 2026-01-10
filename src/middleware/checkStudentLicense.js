const validateLicenseWithFingerprint = require("../SQL/main/validateLicenseWithFingerprint");
const extractFingerprint = require("../utils/extractFingerprint");
const extractLicenseKey = require("../utils/extractLicenseKey");

/**
 * Middleware to validate student license with device fingerprint
 * 
 * Enforces:
 * 1. Valid license key must be provided
 * 2. Device fingerprint must be provided
 * 3. License must be active
 * 4. Fingerprint must match (or be bound on first use)
 * 
 * Attaches license_info to req.licenseInfo on success
 */
const checkStudentLicense = (pool) => {
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

      next();
    } catch (err) {
      console.error("License Validation Error:", err.message);

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

module.exports = checkStudentLicense;
