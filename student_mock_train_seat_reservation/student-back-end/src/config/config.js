/**
 * ============================================================================
 * CONFIGURATION MODULE
 * ============================================================================
 * 
 * This module centralizes all configuration settings for the student backend.
 * It loads environment variables and provides sensible defaults.
 * 
 * STUDENT NOTE:
 * - Copy .env.example to .env before running
 * - Configure your LICENSE_KEY from ServerPE
 * - Set SERVERPE_API_URL to point to the main API
 * 
 * ============================================================================
 */

require('dotenv').config();

/**
 * Application Configuration Object
 * 
 * All configuration is loaded from environment variables with fallback defaults.
 * This makes the application portable and secure (no hardcoded secrets).
 */
const config = {
  // ==========================================================================
  // SERVER SETTINGS
  // ==========================================================================
  
  /**
   * Port on which this backend server runs
   * Default: 7777 (chosen to avoid conflicts with common ports)
   */
  port: process.env.PORT || 7777,

  /**
   * Node environment (development, production, test)
   */
  nodeEnv: process.env.NODE_ENV || 'development',

  /**
   * Enable debug mode for detailed logging
   */
  debug: process.env.DEBUG === 'true',

  // ==========================================================================
  // SERVERPE API SETTINGS
  // ==========================================================================
  
  /**
   * Base URL of the main ServerPE API
   * This is where all train reservation API calls are forwarded
   */
  serverpeApiUrl: process.env.SERVERPE_API_URL || 'http://localhost:8888',

  /**
   * API endpoint prefix for mock train APIs
   */
  apiPrefix: '/mockapis/serverpeuser/api/mocktrain/reserved',

  // ==========================================================================
  // LICENSE SETTINGS
  // ==========================================================================
  
  /**
   * Your unique ServerPE license key
   * Format: XXXX-XXXX-XXXX-XXXX
   */
  licenseKey: process.env.LICENSE_KEY || '',

  // ==========================================================================
  // CORS SETTINGS
  // ==========================================================================
  
  /**
   * Frontend URL for CORS configuration
   */
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  
  /**
   * Get the full API URL for a given endpoint
   * @param {string} endpoint - The API endpoint (e.g., '/stations')
   * @returns {string} Full URL to the ServerPE API
   */
  getApiUrl(endpoint) {
    return `${this.serverpeApiUrl}${this.apiPrefix}${endpoint}`;
  },

  /**
   * Check if license is configured
   * @returns {boolean} True if license key is set
   */
  isLicenseConfigured() {
    return this.licenseKey && this.licenseKey !== 'YOUR_LICENSE_KEY_HERE';
  },

  /**
   * Log configuration (safe - doesn't log sensitive data)
   */
  logConfig() {
    console.log('============================================');
    console.log('📋 CONFIGURATION LOADED');
    console.log('============================================');
    console.log(`   Port: ${this.port}`);
    console.log(`   Environment: ${this.nodeEnv}`);
    console.log(`   Debug Mode: ${this.debug}`);
    console.log(`   ServerPE API: ${this.serverpeApiUrl}`);
    console.log(`   License: ${this.isLicenseConfigured() ? '✅ Configured' : '❌ Not Configured'}`);
    console.log(`   Frontend URL: ${this.frontendUrl}`);
    console.log('============================================');
  }
};

module.exports = config;
