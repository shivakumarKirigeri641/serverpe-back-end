/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - VALIDATORS
 * ==============================================
 * Validation utility functions for request data.
 */

const config = require('../config');

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return config.validation.emailFormat.test(email);
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Date string to validate
 * @returns {boolean} - True if valid
 */
const isValidDate = (date) => {
  if (!date || typeof date !== 'string') return false;
  if (!config.validation.dateFormat.test(date)) return false;

  // Also validate it's a real date
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

/**
 * Validate date is not in the past
 * @param {string} date - Date string to validate
 * @returns {boolean} - True if valid (today or future)
 */
const isNotPastDate = (date) => {
  if (!isValidDate(date)) return false;
  
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return inputDate >= today;
};

/**
 * Validate passenger details
 * @param {Array} passengers - Array of passenger objects
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
const validatePassengers = (passengers) => {
  const errors = [];
  const { validation } = config;

  if (!passengers || !Array.isArray(passengers)) {
    return { isValid: false, errors: ['Passengers must be an array'] };
  }

  if (passengers.length === 0) {
    return { isValid: false, errors: ['At least one passenger is required'] };
  }

  if (passengers.length > validation.maxPassengersPerBooking) {
    return { 
      isValid: false, 
      errors: [`Maximum ${validation.maxPassengersPerBooking} passengers allowed per booking`] 
    };
  }

  passengers.forEach((passenger, index) => {
    const passengerNum = index + 1;

    // Validate name
    if (!passenger.passenger_name || typeof passenger.passenger_name !== 'string') {
      errors.push(`Passenger ${passengerNum}: Name is required`);
    } else if (passenger.passenger_name.trim().length < validation.minPassengerNameLength) {
      errors.push(`Passenger ${passengerNum}: Name must be at least ${validation.minPassengerNameLength} characters`);
    }

    // Validate age
    if (passenger.passenger_age === undefined || passenger.passenger_age === null) {
      errors.push(`Passenger ${passengerNum}: Age is required`);
    } else {
      const age = parseInt(passenger.passenger_age, 10);
      if (isNaN(age) || age < validation.minPassengerAge || age > validation.maxPassengerAge) {
        errors.push(`Passenger ${passengerNum}: Age must be between ${validation.minPassengerAge} and ${validation.maxPassengerAge}`);
      }
    }

    // Validate gender
    if (!passenger.passenger_gender) {
      errors.push(`Passenger ${passengerNum}: Gender is required`);
    } else if (!validation.validGenders.includes(passenger.passenger_gender.toUpperCase())) {
      errors.push(`Passenger ${passengerNum}: Gender must be one of: ${validation.validGenders.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate OTP format
 * @param {string} otp - OTP to validate
 * @returns {boolean} - True if valid
 */
const isValidOtp = (otp) => {
  if (!otp || typeof otp !== 'string') return false;
  return otp.length === config.validation.otpLength && /^\d+$/.test(otp);
};

/**
 * Validate PNR format (alphanumeric)
 * @param {string} pnr - PNR to validate
 * @returns {boolean} - True if valid
 */
const isValidPnr = (pnr) => {
  if (!pnr || typeof pnr !== 'string') return false;
  return /^[A-Z0-9]{6,10}$/i.test(pnr);
};

/**
 * Validate station code format
 * @param {string} code - Station code to validate
 * @returns {boolean} - True if valid
 */
const isValidStationCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  return /^[A-Z]{2,5}$/i.test(code);
};

/**
 * Validate train number format
 * @param {string} trainNumber - Train number to validate
 * @returns {boolean} - True if valid
 */
const isValidTrainNumber = (trainNumber) => {
  if (!trainNumber || typeof trainNumber !== 'string') return false;
  return /^[A-Z0-9]{4,6}$/i.test(trainNumber);
};

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input) => {
  if (!input || typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Normalize to uppercase
 * @param {string} input - Input to normalize
 * @returns {string} - Uppercase string
 */
const toUpperCase = (input) => {
  if (!input || typeof input !== 'string') return '';
  return input.trim().toUpperCase();
};

module.exports = {
  isValidEmail,
  isValidDate,
  isNotPastDate,
  validatePassengers,
  isValidOtp,
  isValidPnr,
  isValidStationCode,
  isValidTrainNumber,
  sanitizeString,
  toUpperCase,
};
