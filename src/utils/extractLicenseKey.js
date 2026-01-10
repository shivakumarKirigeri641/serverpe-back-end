/**
 * Extracts license key from request
 * Checks multiple sources in priority order:
 * 1. Headers: x-license-key or authorization header
 * 2. Query params: license_key
 * 3. Body: license_key
 * 
 * @param {Object} req - Express request object
 * @returns {string|null} License key or null if not found
 */
const extractLicenseKey = (req) => {
  // Priority 1: Check headers
  const headerLicenseKey = req.headers["x-license-key"];

  if (headerLicenseKey) {
    return headerLicenseKey;
  }

  // Check authorization header (format: "License YOUR-LICENSE-KEY")
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("License ")) {
    return authHeader.substring(8);
  }

  // Priority 2: Check query params
  if (req.query && req.query.license_key) {
    return req.query.license_key;
  }

  // Priority 3: Check body
  if (req.body && req.body.license_key) {
    return req.body.license_key;
  }

  return null;
};

module.exports = extractLicenseKey;
