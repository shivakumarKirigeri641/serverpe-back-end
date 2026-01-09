/**
 * Extracts device fingerprint from request
 * Checks multiple sources in priority order:
 * 1. Headers: x-device-fingerprint or x-fingerprint
 * 2. Body: fingerprint or device_fingerprint
 * 3. Query params: fingerprint
 * 
 * @param {Object} req - Express request object
 * @returns {string|null} Device fingerprint or null if not found
 */
const extractFingerprint = (req) => {
  // Priority 1: Check headers
  const headerFingerprint =
    req.headers["x-device-fingerprint"] ||
    req.headers["x-fingerprint"];

  if (headerFingerprint) {
    return headerFingerprint;
  }

  // Priority 2: Check body
  if (req.body) {
    const bodyFingerprint =
      req.body.fingerprint ||
      req.body.device_fingerprint;

    if (bodyFingerprint) {
      return bodyFingerprint;
    }
  }

  // Priority 3: Check query params
  if (req.query && req.query.fingerprint) {
    return req.query.fingerprint;
  }

  return null;
};

module.exports = extractFingerprint;
