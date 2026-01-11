/**
 * ============================================================================
 * API CLIENT - ServerPE API Communication Layer
 * ============================================================================
 * 
 * This module handles all HTTP communication with the main ServerPE API.
 * It automatically injects license key and fingerprint into every request.
 * 
 * FEATURES:
 * - Automatic license key injection in headers
 * - Automatic fingerprint injection in headers
 * - Connection health checking
 * - Comprehensive error handling
 * - Request/Response logging (in debug mode)
 * 
 * STUDENT NOTE:
 * - All API calls to ServerPE should go through this client
 * - Never make direct axios calls to ServerPE from other modules
 * 
 * ============================================================================
 */

const axios = require('axios');
const config = require('../config/config');
const { getFingerprint } = require('./fingerprintGenerator');
const AppError = require('./AppError');

/**
 * Connection status tracking
 */
let connectionStatus = {
  lastCheck: null,
  isConnected: false,
  lastError: null,
  checkedAt: null
};

/**
 * Create the Axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: config.serverpeApiUrl,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Request Interceptor
 * 
 * Automatically adds license key and fingerprint to every request
 */
apiClient.interceptors.request.use(
  (requestConfig) => {
    try {
      // Inject license key
      if (config.licenseKey) {
        requestConfig.headers['x-license-key'] = config.licenseKey;
      }

      // Inject fingerprint
      const fingerprint = getFingerprint();
      if (fingerprint) {
        requestConfig.headers['x-device-fingerprint'] = fingerprint;
      }

      // Debug logging
      if (config.debug) {
        console.log('📤 API Request:', {
          method: requestConfig.method?.toUpperCase(),
          url: requestConfig.url,
          hasLicense: !!config.licenseKey,
          hasFingerprint: !!fingerprint
        });
      }

      return requestConfig;
    } catch (error) {
      console.error('❌ Request interceptor error:', error.message);
      return requestConfig;
    }
  },
  (error) => {
    console.error('❌ Request interceptor error:', error.message);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles successful responses and transforms errors
 */
apiClient.interceptors.response.use(
  (response) => {
    // Update connection status on successful response
    connectionStatus.isConnected = true;
    connectionStatus.lastCheck = Date.now();
    connectionStatus.lastError = null;

    // Debug logging
    if (config.debug) {
      console.log('📥 API Response:', {
        status: response.status,
        url: response.config.url,
        success: response.data?.successstatus
      });
    }

    return response;
  },
  (error) => {
    // Update connection status on error
    connectionStatus.lastCheck = Date.now();
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      connectionStatus.isConnected = false;
      connectionStatus.lastError = error.message;
    }

    // Debug logging
    if (config.debug) {
      console.error('❌ API Error:', {
        code: error.code,
        message: error.message,
        url: error.config?.url,
        status: error.response?.status
      });
    }

    // Convert to AppError for consistent error handling
    const appError = AppError.fromAxiosError(error);
    return Promise.reject(appError);
  }
);

// =============================================================================
// PUBLIC API METHODS
// =============================================================================

/**
 * Make a GET request to the ServerPE API
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/stations')
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response data
 */
async function get(endpoint, params = {}) {
  try {
    const url = `${config.apiPrefix}${endpoint}`;
    const response = await apiClient.get(url, { params });
    return response.data;
  } catch (error) {
    // Re-throw if already an AppError
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.fromAxiosError(error);
  }
}

/**
 * Make a POST request to the ServerPE API
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/search-trains')
 * @param {Object} data - Request body data
 * @returns {Promise<Object>} API response data
 */
async function post(endpoint, data = {}) {
  try {
    const url = `${config.apiPrefix}${endpoint}`;
    const response = await apiClient.post(url, data);
    return response.data;
  } catch (error) {
    // Re-throw if already an AppError
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.fromAxiosError(error);
  }
}

/**
 * Check connection to ServerPE API
 * 
 * @returns {Promise<Object>} Connection status object
 */
async function checkConnection() {
  try {
    // Make a simple request to test connectivity
    const response = await axios.get(config.serverpeApiUrl, {
      timeout: 5000
    });

    connectionStatus = {
      isConnected: true,
      lastCheck: Date.now(),
      lastError: null,
      checkedAt: new Date().toISOString(),
      serverResponse: response.data?.status || 'OK'
    };

    return connectionStatus;
  } catch (error) {
    connectionStatus = {
      isConnected: false,
      lastCheck: Date.now(),
      lastError: error.message,
      checkedAt: new Date().toISOString(),
      serverResponse: null
    };

    return connectionStatus;
  }
}

/**
 * Get current connection status
 * 
 * @returns {Object} Current connection status
 */
function getConnectionStatus() {
  return {
    ...connectionStatus,
    licenseConfigured: config.isLicenseConfigured(),
    serverUrl: config.serverpeApiUrl
  };
}

/**
 * Check license validity
 * 
 * @returns {Promise<Object>} License validation result
 */
async function validateLicense() {
  if (!config.isLicenseConfigured()) {
    return {
      valid: false,
      message: 'License key not configured',
      error: 'LICENSE_NOT_CONFIGURED'
    };
  }

  try {
    // Try to make a simple API call to validate license
    const response = await get('/stations');
    
    return {
      valid: true,
      message: response.message || 'License validated successfully',
      licenseInfo: response.license_info
    };
  } catch (error) {
    return {
      valid: false,
      message: error.userMessage || 'License validation failed',
      error: error.errorCode || 'LICENSE_VALIDATION_FAILED',
      technicalMessage: error.technicalMessage
    };
  }
}

module.exports = {
  get,
  post,
  checkConnection,
  getConnectionStatus,
  validateLicense,
  apiClient // Export for advanced usage
};
