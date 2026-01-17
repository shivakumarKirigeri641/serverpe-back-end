const crypto = require("crypto");

/**
 * Generate a unique 10-character license key based on user ID
 * Format: XXXX-XXXXXX (e.g., A3K9-F7M2PL)
 *
 * Uses crypto for randomness + user ID for uniqueness
 * @param {number|string} userId - The user's ID
 * @returns {string} 10-character license key (excluding hyphen)
 */
const getLicenseKey = (userId) => {
  // Create a unique seed combining userId, timestamp, and random bytes
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(8).toString("hex");
  const seed = `${userId}-${timestamp}-${randomBytes}`;

  // Generate SHA256 hash and convert to base36 (alphanumeric)
  const hash = crypto.createHash("sha256").update(seed).digest("hex");

  // Take first 10 characters and convert to uppercase alphanumeric
  const licenseKey = hash
    .substring(0, 10)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "X");

  // Format as XXXX-XXXXXX for readability
  return `${licenseKey.substring(0, 4)}-${licenseKey.substring(4, 10)}`;
};

module.exports = getLicenseKey;
