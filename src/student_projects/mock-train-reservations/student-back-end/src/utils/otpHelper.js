/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - OTP HELPER
 * ==============================================
 * OTP generation and management utilities.
 */

const config = require('../config');

// In-memory OTP store (for demo purposes)
// In production, use Redis or database
const otpStore = new Map();

/**
 * Generate a random OTP
 * @param {number} length - OTP length (default from config)
 * @returns {string} - Generated OTP
 */
const generateOtp = (length = config.validation.otpLength) => {
  // For demo purposes, always return '1234'
  // In production, use random generation
  if (config.server.isDevelopment || config.server.isTest) {
    return '1234';
  }
  
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Save OTP for an email
 * @param {string} email - Email address
 * @param {string} otp - OTP to save
 * @returns {Object} - Saved OTP details
 */
const saveOtp = (email, otp) => {
  const expiresAt = new Date(Date.now() + config.validation.otpExpiryMinutes * 60 * 1000);
  
  const otpData = {
    otp,
    email,
    expiresAt,
    createdAt: new Date(),
    attempts: 0,
  };

  // Store with email as key
  otpStore.set(email.toLowerCase(), otpData);

  return {
    email,
    expiresAt,
    expiresIn: `${config.validation.otpExpiryMinutes} minutes`,
  };
};

/**
 * Verify OTP for an email
 * @param {string} email - Email address
 * @param {string} otp - OTP to verify
 * @returns {boolean} - True if OTP is valid
 */
const verifyOtp = (email, otp) => {
  const emailKey = email.toLowerCase();
  const storedData = otpStore.get(emailKey);

  if (!storedData) {
    return false;
  }

  // Check expiration
  if (new Date() > storedData.expiresAt) {
    otpStore.delete(emailKey);
    return false;
  }

  // Check OTP match
  if (storedData.otp !== otp) {
    // Increment attempts
    storedData.attempts += 1;
    
    // Max 3 attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(emailKey);
    }
    
    return false;
  }

  // Valid OTP - delete from store
  otpStore.delete(emailKey);
  return true;
};

/**
 * Clear OTP for an email
 * @param {string} email - Email address
 */
const clearOtp = (email) => {
  otpStore.delete(email.toLowerCase());
};

/**
 * Get OTP data (for development/testing)
 * @param {string} email - Email address
 * @returns {Object|null} - OTP data or null
 */
const getOtpData = (email) => {
  if (!config.server.isDevelopment && !config.server.isTest) {
    return null;
  }
  return otpStore.get(email.toLowerCase()) || null;
};

module.exports = {
  generateOtp,
  saveOtp,
  verifyOtp,
  clearOtp,
  getOtpData,
};
