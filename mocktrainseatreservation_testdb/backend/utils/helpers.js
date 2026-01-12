/**
 * =====================================================
 * UTILITY FUNCTIONS
 * =====================================================
 * 
 * Common utility functions for the application.
 * 
 * @author ServerPE
 */

/**
 * Standardized API success response
 * @param {Response} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default 200)
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

/**
 * Standardized API error response
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} error - Error code
 * @param {Object} details - Additional error details (only in development)
 */
const sendError = (res, message, statusCode = 500, error = 'SERVER_ERROR', details = null) => {
    const response = {
        success: false,
        message,
        error,
        timestamp: new Date().toISOString()
    };

    // Include details in development mode
    if (details && process.env.NODE_ENV === 'development') {
        response.details = details;
    }

    return res.status(statusCode).json(response);
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid
 */
const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Validate mobile number (10 digits)
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} True if valid
 */
const isValidMobile = (mobile) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(mobile);
};

/**
 * Calculate seat/berth details based on coach type and sequence
 * @param {string} coachCode - Coach type code
 * @param {number} seatSequence - Seat sequence number
 * @returns {Object} Seat details
 */
const calculateSeatDetails = (coachCode, seatSequence) => {
    const seatConfigs = {
        'SL': { seatsPerCoach: 72, berthPattern: ['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'] },
        '3A': { seatsPerCoach: 64, berthPattern: ['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'] },
        '2A': { seatsPerCoach: 48, berthPattern: ['LB', 'UB', 'LB', 'UB', 'SL', 'SU'] },
        '1A': { seatsPerCoach: 18, berthPattern: ['LB', 'UB'] },
        'CC': { seatsPerCoach: 78, berthPattern: ['W', 'M', 'A', 'M', 'W'] },
        '2S': { seatsPerCoach: 108, berthPattern: ['W', 'M', 'M', 'A', 'M', 'M'] },
        'EC': { seatsPerCoach: 56, berthPattern: ['W', 'M', 'A'] },
        'FC': { seatsPerCoach: 18, berthPattern: ['LB', 'UB'] }
    };

    const config = seatConfigs[coachCode] || seatConfigs['SL'];
    const coachNumber = Math.ceil(seatSequence / config.seatsPerCoach);
    const seatInCoach = ((seatSequence - 1) % config.seatsPerCoach) + 1;
    const berthIndex = (seatInCoach - 1) % config.berthPattern.length;
    const berthType = config.berthPattern[berthIndex];

    return {
        coach_code: `${coachCode}${coachNumber}`,
        seat_number: seatInCoach,
        berth_type: berthType,
        status: 'CONFIRMED'
    };
};

/**
 * Calculate fare for a journey
 * @param {number} distanceKm - Journey distance in kilometers
 * @param {Object} fareRule - Fare rule object
 * @param {Array} passengers - Array of passenger objects
 * @returns {Object} Fare breakdown
 */
const calculateFare = (distanceKm, fareRule, passengers) => {
    const { fare_per_km, discount_percent, flat_addon } = fareRule;
    
    let totalBaseFare = 0;
    let totalDiscount = 0;
    let passengerBreakdown = [];

    passengers.forEach(p => {
        let baseFare = distanceKm * fare_per_km;
        let discount = discount_percent;

        // Apply special discounts
        if (p.passenger_ispwd || p.is_pwd) discount = 50;
        else if (p.passenger_age >= 60 || p.is_senior) discount = 40;
        else if (p.passenger_age < 5) {
            // Free for children under 5
            baseFare = 0;
            discount = 0;
        }

        const discountAmount = (baseFare * discount) / 100;
        const fareAfterDiscount = baseFare - discountAmount + flat_addon;

        totalBaseFare += baseFare;
        totalDiscount += discountAmount;

        passengerBreakdown.push({
            name: p.passenger_name || p.p_name,
            base_fare: baseFare.toFixed(2),
            discount: discountAmount.toFixed(2),
            fare_after_discount: fareAfterDiscount.toFixed(2)
        });
    });

    const gstAmount = (totalBaseFare - totalDiscount + (flat_addon * passengers.length)) * 0.18;
    const totalFare = totalBaseFare - totalDiscount + (flat_addon * passengers.length) + gstAmount;

    return {
        distance_km: distanceKm,
        base_fare: totalBaseFare.toFixed(2),
        total_discount: totalDiscount.toFixed(2),
        service_charges: (flat_addon * passengers.length).toFixed(2),
        gst: gstAmount.toFixed(2),
        total_fare: totalFare.toFixed(2),
        passenger_breakdown: passengerBreakdown
    };
};

module.exports = {
    sendSuccess,
    sendError,
    isValidDate,
    isValidEmail,
    isValidMobile,
    calculateSeatDetails,
    calculateFare
};
