/**
 * ============================================================================
 * FINGERPRINT GENERATOR
 * ============================================================================
 *
 * Generates a unique device fingerprint for this student backend installation.
 * The fingerprint is used for license validation and device binding.
 *
 * FEATURES:
 * - Stable: Uses hardware identifiers (machine-id) for persistence
 * - Secure: SHA-256 hashed to protect privacy
 * - Persistent: Stored in a file to avoid regeneration on every start
 *
 * STUDENT NOTE:
 * - This fingerprint binds your license to this specific computer.
 * - Changing major hardware or the OS might change this fingerprint.
 *
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { machineIdSync } = require('node-machine-id');

// File path to store the fingerprint (persists across package re-downloads if kept)
const FINGERPRINT_FILE = path.join(__dirname, '..', '..', '.fingerprint');

/**
 * In-memory cache for the fingerprint
 */
let cachedFingerprint = null;

/**
 * Generate a new unique fingerprint based on Hardware ID
 *
 * @returns {string} A unique fingerprint hash
 */
function generateNewFingerprint() {
  try {
    // Get unique Machine ID (hardware based)
    const mid = machineIdSync();
    
    // Combine with a seed to make it specific to this application
    const seed = 'serverpe-student-mock-train-v1';
    
    // Create a SHA-256 hash
    const hash = crypto
      .createHash('sha256')
      .update(`${mid}-${seed}`)
      .digest('hex');

    console.log('ðŸ”‘ Generated stable device fingerprint based on Hardware ID');
    return hash;
  } catch (error) {
    console.warn('âš ï¸ Hardware ID check failed, falling back to random fingerprint');
    // Fallback to random if machine-id fails
    return crypto.randomBytes(32).toString('hex');
  }
}

/**
 * Save fingerprint to file for persistence
 *
 * @param {string} fingerprint - The fingerprint to save
 */
function saveFingerprintToFile(fingerprint) {
  try {
    fs.writeFileSync(FINGERPRINT_FILE, fingerprint, 'utf8');
    console.log('ðŸ’¾ Fingerprint persisted to file');
  } catch (error) {
    console.error('âš ï¸ Could not save fingerprint to file:', error.message);
  }
}

/**
 * Load fingerprint from file
 *
 * @returns {string|null} The stored fingerprint, or null if not found
 */
function loadFingerprintFromFile() {
  try {
    if (fs.existsSync(FINGERPRINT_FILE)) {
      const fingerprint = fs.readFileSync(FINGERPRINT_FILE, 'utf8').trim();
      if (fingerprint && fingerprint.length === 64) {
        console.log('ðŸ“ Loaded existing fingerprint');
        return fingerprint;
      }
    }
  } catch (error) {
    // Ignore read errors
  }
  return null;
}

/**
 * Get the device fingerprint
 *
 * @returns {string} The unique device fingerprint
 */
function getFingerprint() {
  if (cachedFingerprint) {
    return cachedFingerprint;
  }

  // Always try to generate from hardware first to see if it matches
  // This ensures that even if the .fingerprint file is deleted,
  // the same machine produces the same fingerprint.
  const hardwareFingerprint = generateNewFingerprint();
  
  // Verify with stored one to log info
  const storedFingerprint = loadFingerprintFromFile();
  
  if (storedFingerprint && storedFingerprint !== hardwareFingerprint) {
    console.log('âš ï¸ Fingerprint mismatch! Stored: ' + (storedFingerprint ? storedFingerprint.substring(0,8) : 'None') + ', Current: ' + hardwareFingerprint.substring(0,8));
    console.log('   Using current Hardware ID for validation.');
  }

  cachedFingerprint = hardwareFingerprint;
  
  // Ensure it's saved correctly
  if (storedFingerprint !== hardwareFingerprint) {
    saveFingerprintToFile(hardwareFingerprint);
  }

  return cachedFingerprint;
}

/**
 * Initialize the fingerprint on server startup
 */
function initializeFingerprint() {
  console.log('============================================');
  console.log('ðŸ” FINGERPRINT INITIALIZATION');
  console.log('============================================');

  const fingerprint = getFingerprint();

  // Show first and last 8 characters for verification
  const masked = `${fingerprint.substring(0, 8)}...${fingerprint.substring(fingerprint.length - 8)}`;
  console.log(`   Fingerprint: ${masked} (Stable ID)`);
  console.log(`   Length: ${fingerprint.length} characters`);
  console.log('============================================');

  return fingerprint;
}

/**
 * Reset the fingerprint
 */
function resetFingerprint() {
  try {
    if (fs.existsSync(FINGERPRINT_FILE)) {
      fs.unlinkSync(FINGERPRINT_FILE);
    }
    cachedFingerprint = null;
    console.log('ðŸ”„ Fingerprint file removed.');
  } catch (error) {
    console.error('âŒ Error resetting fingerprint:', error.message);
  }
}

module.exports = {
  getFingerprint,
  initializeFingerprint,
  resetFingerprint
};
