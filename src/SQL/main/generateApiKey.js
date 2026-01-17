/**
 * =====================================================
 * GENERATE API KEY UTILITY
 * =====================================================
 *
 * Generates secure random API keys for UI Only projects.
 * Format: SRV-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
 *
 * @author ServerPE
 */

const crypto = require("crypto");

/**
 * Generate a random API key based on user_id and order_number
 *
 * @param {number|string} user_id - User's ID
 * @param {string} order_number - Order number
 * @returns {string} API key in format SRV-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
 */
const generateApiKey = (user_id, order_number) => {
  // Character set: uppercase letters and numbers (excluding confusing chars like 0,O,1,I)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const length = 24;

  // Create unique seed combining user_id, order_number, timestamp, and random bytes
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(16).toString("hex");
  const seed = `${user_id}-${order_number}-${timestamp}-${randomBytes}`;

  // Generate SHA256 hash for randomness
  const hash = crypto.createHash("sha256").update(seed).digest();

  // Build the key using hash bytes
  let key = "";
  for (let i = 0; i < length; i++) {
    key += chars[hash[i % hash.length] % chars.length];
  }

  // Format with dashes: SRV-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
  const formatted = key.match(/.{1,4}/g).join("-");

  return `SRV-${formatted}`;
};

/**
 * Validate API key format
 *
 * @param {string} apiKey - Key to validate
 * @returns {boolean} True if valid format
 */
const validateApiKeyFormat = (apiKey) => {
  if (!apiKey || typeof apiKey !== "string") return false;

  // Must start with SRV-
  if (!apiKey.startsWith("SRV-")) return false;

  // Remove prefix and dashes, check length
  const cleanKey = apiKey.substring(4).replace(/-/g, "");

  // Should be 24 characters
  if (cleanKey.length < 20 || cleanKey.length > 32) return false;

  // Should only contain valid characters
  return /^[A-Z0-9]+$/.test(cleanKey);
};

module.exports = { generateApiKey, validateApiKeyFormat };
