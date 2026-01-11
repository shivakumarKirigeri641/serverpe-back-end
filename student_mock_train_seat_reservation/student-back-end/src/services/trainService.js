/**
 * ============================================================================
 * TRAIN SERVICE - Business Logic Layer
 * ============================================================================
 * 
 * This service encapsulates all train-related API calls to the ServerPE backend.
 * Each method corresponds to a function in train.repo.js on the main server.
 * 
 * ARCHITECTURE:
 * Frontend → trainRouter.js → trainService.js → apiClient.js → ServerPE API
 * 
 * STUDENT NOTE:
 * - All methods include proper try-catch-finally blocks
 * - Errors are transformed to user-friendly AppError instances
 * - Each method logs its execution for debugging
 * 
 * ============================================================================
 */

const apiClient = require('../utils/apiClient');
const AppError = require('../utils/AppError');
const config = require('../config/config');

/**
 * Helper function for consistent logging
 */
function logServiceCall(methodName, params = {}) {
  if (config.debug) {
    console.log(`📞 TrainService.${methodName}()`, params);
  }
}

/**
 * Helper function for consistent error logging
 */
function logServiceError(methodName, error) {
  console.error(`❌ TrainService.${methodName}() failed:`, error.message);
}

// =============================================================================
// STATION & REFERENCE DATA
// =============================================================================

/**
 * Get all reserved stations
 * 
 * Fetches the list of all stations available for reservation.
 * Used for populating source/destination dropdowns.
 * 
 * @returns {Promise<Object>} Station list with count
 */
async function getReservedStations() {
  const methodName = 'getReservedStations';
  logServiceCall(methodName);

  try {
    const response = await apiClient.get('/stations');
    return response;
  } catch (error) {
    logServiceError(methodName, error);
    throw error;
  } finally {
    if (config.debug) {
      console.log(`✅ ${methodName} completed`);
    }
  }
}

/**
 * Get all reservation types
 * 
 * Fetches reservation type options (General, Tatkal, Ladies, etc.)
 * 
 * @returns {Promise<Object>} Reservation types list
 */
async function getReservationTypes() {
  const methodName = 'getReservationTypes';
  logServiceCall(methodName);

  try {
    const response = await apiClient.get('/reservation-types');
    return response;
  } catch (error) {
    logServiceError(methodName, error);
    throw error;
  } finally {
    if (config.debug) {
      console.log(`✅ ${methodName} completed`);
    }
  }
}

/**
 * Get all coach types
 * 
 * Fetches available coach types (SL, 3A, 2A, 1A, CC, etc.)
 * 
 * @returns {Promise<Object>} Coach types list
 */
async function getCoachTypes() {
  const methodName = 'getCoachTypes';
  logServiceCall(methodName);

  try {
    const response = await apiClient.get('/coach-types');
    return response;
  } catch (error) {
    logServiceError(methodName, error);
    throw error;
  } finally {
    if (config.debug) {
      console.log(`✅ ${methodName} completed`);
    }
  }
}

// =============================================================================
// TRAIN SEARCH & INFORMATION
// =============================================================================

/**
 * Search for trains between stations
 * 
 * @param {string} sourceCode - Source station code (e.g., 'NDLS')
 * @param {string} destinationCode - Destination station code
 * @param {string} doj - Date of journey (YYYY-MM-DD format)
 * @returns {Promise<Object>} List of available trains with seat availability
 */
async function searchTrains(sourceCode, destinationCode, doj) {
  const methodName = 'searchTrains';
  logServiceCall(methodName, { sourceCode, destinationCode, doj });

  // Input validation
  if (!sourceCode || !destinationCode || !doj) {
    throw AppError.validationError(
      'Source, destination, and date',
      'Missing required parameters: source_code, destination_code, doj'
    );
  }

  try {
    const response = await apiClient.post('/search-trains', {
      source_code: sourceCode,
      destination_code: destinationCode,
      doj: doj
    });
    return response;
  } catch (error) {
    logServiceError(methodName, error);
    throw error;
  } finally {
    if (config.debug) {
      console.log(`✅ ${methodName} completed`);
    }
  }
}

/**
 * Get train schedule
 * 
 * @param {string} trainNumber - Train number (e.g., '12301')
 * @returns {Promise<Object>} Train schedule with all stops
 */
async function getTrainSchedule(trainNumber) {
  const methodName = 'getTrainSchedule';
  logServiceCall(methodName, { trainNumber });

  if (!trainNumber) {
    throw AppError.validationError('Train number', 'Train number is required');
  }

  try {
    const response = await apiClient.post('/train-schedule', {
      train_number: trainNumber
    });
    return response;
  } catch (error) {
    logServiceError(methodName, error);
    throw error;
  } finally {
    if (config.debug) {
      console.log(`✅ ${methodName} completed`);
    }
  }
}

/**
 * Get live train running status
 * 
 * @param {string} trainNumber - Train number
 * @returns {Promise<Object>} Live status with current position
 */
async function getLiveTrainStatus(trainNumber) {
  const methodName = 'getLiveTrainStatus';
  logServiceCall(methodName, { trainNumber });

  if (!trainNumber) {
    throw AppError.validationError('Train number', 'Train number is required');
  }

  try {
    const response = await apiClient.post('/train-live-running-status', {
      train_number: trainNumber
    });
    return response;
  } catch (error) {
    logServiceError(methodName, error);
    throw error;
  } finally {
    if (config.debug) {
      console.log(`✅ ${methodName} completed`);
    }
  }
}

/**
 * Get trains at a station
 * 
 * @param {string} stationCode - Station code
 * @param {number} nextHours - Hours window (default: 2)
 * @returns {Promise<Object>} List of trains at the station
 */
async function getTrainsAtStation(stationCode, nextHours = 2) {
  const methodName = 'getTrainsAtStation';
  logServiceCall(methodName, { stationCode, nextHours });

  if (!stationCode) {
    throw AppError.validationError('Station code', 'Station code is required');
  }

  try {
    const response = await apiClient.post('/live-station', {
      station_code: stationCode,
      next_hours: nextHours
    });
    return response;
  } catch (error) {
    logServiceError(methodName, error);
    throw error;
  } finally {
    if (config.debug) {
      console.log(`✅ ${methodName} completed`);
    }
  }
}

// =============================================================================
// FARE & BOOKING
// =============================================================================

/**
 * Calculate fare for a journey
 * 
 * @param {Object} params - Fare calculation parameters
 * @returns {Promise<Object>} Fare breakdown details
 */
async function calculateFare(params) {
  const methodName = 'calculateFare';
  logServiceCall(methodName, params);

  const { trainNumber, sourceCode, destinationCode, doj, coachCode, reservationType, passengers } = params;

  if (!trainNumber || !sourceCode || !destinationCode || !coachCode) {
    throw AppError.validationError(
      'booking details',
      'Missing required parameters for fare calculation'
    );
  }

  try {
    const response = await apiClient.post('/calculate-fare', {
      train_number: trainNumber,
      source_code: sourceCode,
      destination_code: destinationCode,
      doj: doj,
      coach_code: coachCode,
      reservation_type: reservationType,
      passenger_details: passengers
    });
    return response;
  } catch (error) {
    logServiceError(methodName, error);
    throw error;
  } finally {
    if (config.debug) {
      console.log(`✅ ${methodName} completed`);
    }
  }
}

/**
 * Confirm ticket booking
 * 
 * @param {Object} bookingDetails - Complete booking details
 * @returns {Promise<Object>} Booking confirmation with PNR
 */
async function confirmTicket(bookingDetails) {
  const methodName = 'confirmTicket';
  logServiceCall(methodName, { trainNumber: bookingDetails.trainNumber });

  const {
    trainNumber,
    sourceCode,
    destinationCode,
    doj,
    coachCode,
    reservationType,
    passengers,
    mobileNumber,
    totalFare,
    email
  } = bookingDetails;

  // Comprehensive validation
  if (!trainNumber || !sourceCode || !destinationCode || !doj) {
    throw AppError.validationError(
      'booking details',
      'Missing required booking parameters'
    );
  }

  if (!passengers || passengers.length === 0) {
    throw AppError.validationError(
      'passenger details',
      'At least one passenger is required'
    );
  }

  if (!email) {
    throw AppError.validationError('email', 'Email is required for booking');
  }

  try {
    const response = await apiClient.post('/confirm-ticket', {
      train_number: trainNumber,
      source_code: sourceCode,
      destination_code: destinationCode,
      doj: doj,
      coach_code: coachCode,
      reservation_type: reservationType,
      passenger_details: passengers,
      mobile_number: mobileNumber,
      total_fare: totalFare,
      email: email
    });
    return response;
  } catch (error) {
    logServiceError(methodName, error);
    throw error;
  } finally {
    if (config.debug) {
      console.log(`✅ ${methodName} completed`);
    }
  }
}

/**
 * Cancel ticket
 * 
 * @param {string} pnr - PNR number
 * @param {Array<number>} passengerIds - List of passenger IDs to cancel
 * @returns {Promise<Object>} Cancellation result
 */
async function cancelTicket(pnr, passengerIds) {
  const methodName = 'cancelTicket';
  logServiceCall(methodName, { pnr, passengerIds });

  if (!pnr) {
    throw AppError.validationError('PNR', 'PNR number is required');
  }

  if (!passengerIds || !Array.isArray(passengerIds) || passengerIds.length === 0) {
    throw AppError.validationError(
      'passenger selection',
      'At least one passenger must be selected for cancellation'
    );
  }

  try {
    const response = await apiClient.post('/cancel-ticket', {
      pnr: pnr,
      passenger_ids: passengerIds
    });
    return response;
  } catch (error) {
    logServiceError(methodName, error);
    throw error;
  } finally {
    if (config.debug) {
      console.log(`✅ ${methodName} completed`);
    }
  }
}

// =============================================================================
// PNR & BOOKING HISTORY
// =============================================================================

/**
 * Get PNR status
 * 
 * @param {string} pnr - PNR number
 * @returns {Promise<Object>} PNR status details
 */
async function getPnrStatus(pnr) {
  const methodName = 'getPnrStatus';
  logServiceCall(methodName, { pnr });

  if (!pnr) {
    throw AppError.validationError('PNR', 'PNR number is required');
  }

  try {
    const response = await apiClient.get(`/pnr-status/${pnr}`);
    return response;
  } catch (error) {
    logServiceError(methodName, error);
    throw error;
  } finally {
    if (config.debug) {
      console.log(`✅ ${methodName} completed`);
    }
  }
}

/**
 * Get booking history for a user
 * 
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Booking history list
 */
async function getBookingHistory(email) {
  const methodName = 'getBookingHistory';
  logServiceCall(methodName, { email });

  if (!email) {
    throw AppError.validationError('email', 'Email is required');
  }

  try {
    const response = await apiClient.post('/dashboard', {
      email: email
    });
    return response;
  } catch (error) {
    logServiceError(methodName, error);
    throw error;
  } finally {
    if (config.debug) {
      console.log(`✅ ${methodName} completed`);
    }
  }
}

// =============================================================================
// AUTHENTICATION (OTP)
// =============================================================================

/**
 * Send OTP to email
 * 
 * @param {string} email - User's email address
 * @returns {Promise<Object>} OTP send confirmation
 */
async function sendEmailOtp(email) {
  const methodName = 'sendEmailOtp';
  logServiceCall(methodName, { email });

  if (!email) {
    throw AppError.validationError('email', 'Email is required');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw AppError.validationError('email', 'Invalid email format');
  }

  try {
    const response = await apiClient.post('/send-email-otp', {
      email: email
    });
    return response;
  } catch (error) {
    logServiceError(methodName, error);
    throw error;
  } finally {
    if (config.debug) {
      console.log(`✅ ${methodName} completed`);
    }
  }
}

/**
 * Verify email OTP
 * 
 * @param {string} email - User's email address
 * @param {string} otp - OTP entered by user
 * @returns {Promise<Object>} Verification result
 */
async function verifyEmailOtp(email, otp) {
  const methodName = 'verifyEmailOtp';
  logServiceCall(methodName, { email, otp: '****' });

  if (!email || !otp) {
    throw AppError.validationError('credentials', 'Email and OTP are required');
  }

  try {
    const response = await apiClient.post('/verify-email-otp', {
      email: email,
      otp: otp
    });
    return response;
  } catch (error) {
    logServiceError(methodName, error);
    throw error;
  } finally {
    if (config.debug) {
      console.log(`✅ ${methodName} completed`);
    }
  }
}

// =============================================================================
// EXPORT ALL SERVICE METHODS
// =============================================================================

module.exports = {
  // Station & Reference Data
  getReservedStations,
  getReservationTypes,
  getCoachTypes,

  // Train Search & Information
  searchTrains,
  getTrainSchedule,
  getLiveTrainStatus,
  getTrainsAtStation,

  // Fare & Booking
  calculateFare,
  confirmTicket,
  cancelTicket,

  // PNR & History
  getPnrStatus,
  getBookingHistory,

  // Authentication
  sendEmailOtp,
  verifyEmailOtp
};
