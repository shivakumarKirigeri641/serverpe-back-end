/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - TRAIN REPOSITORY
 * ==============================================
 * Repository layer to communicate with serverpe-back-end API.
 * This layer handles all external API calls to the main backend.
 */

const axios = require("axios");
const config = require("../config");
const logger = require("../utils/logger");
const { ExternalServiceError } = require("../utils/errors");

// Create axios instance for serverpe API
const serverpeApi = axios.create({
  baseURL: config.api.baseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": config.api.demoApiKey,
  },
  withCredentials: true,
});

// Request interceptor for logging
serverpeApi.interceptors.request.use(
  (reqConfig) => {
    logger.debug("External API request", {
      method: reqConfig.method?.toUpperCase(),
      url: reqConfig.url,
      baseURL: reqConfig.baseURL,
    });
    return reqConfig;
  },
  (error) => {
    logger.error("External API request error", { error: error.message });
    return Promise.reject(error);
  }
);

// Response interceptor for logging
serverpeApi.interceptors.response.use(
  (response) => {
    logger.debug("External API response", {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    logger.error("External API response error", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

/**
 * Handle API errors and convert to application errors
 * @param {Error} error - Axios error
 * @param {string} operation - Operation being performed
 */
const handleApiError = (error, operation) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || `Failed to ${operation}`;
    throw new ExternalServiceError(message, {
      statusCode: error.response.status,
      operation,
    });
  } else if (error.request) {
    // Request made but no response
    throw new ExternalServiceError(
      "External service not responding. Please try again later.",
      { operation }
    );
  } else {
    // Request setup error
    throw new ExternalServiceError(`Service error: ${error.message}`, {
      operation,
    });
  }
};

/**
 * Train Repository Methods
 * Each method calls the corresponding endpoint in serverpe-back-end
 */
const trainRepository = {
  /**
   * Autocomplete trains by number or name
   * @param {string} query - Search query
   * @returns {Promise<Object>} - Autocomplete suggestions
   */
  autocompleteTrains: async (query) => {
    try {
      const response = await serverpeApi.get("/train/autocomplete", {
        params: { q: query },
      });
      return {
        query: response.data?.data?.query || query,
        count: response.data?.data?.count || 0,
        suggestions: response.data?.data?.suggestions || [],
      };
    } catch (error) {
      handleApiError(error, "autocomplete trains");
    }
  },

  /**
   * Get all available stations
   * @returns {Promise<Array>} - List of stations
   */
  getStations: async () => {
    try {
      const response = await serverpeApi.get("/train/stations");
      return response.data?.data?.stations || [];
    } catch (error) {
      handleApiError(error, "fetch stations");
    }
  },

  /**
   * Get all reservation types
   * @returns {Promise<Array>} - List of reservation types
   */
  getReservationTypes: async () => {
    try {
      const response = await serverpeApi.get("/train/reservation-types");
      return response.data?.data?.reservation_types || [];
    } catch (error) {
      handleApiError(error, "fetch reservation types");
    }
  },

  /**
   * Get all coach types
   * @returns {Promise<Array>} - List of coach types
   */
  getCoachTypes: async () => {
    try {
      const response = await serverpeApi.get("/train/coach-types");
      return response.data?.data?.coach_types || [];
    } catch (error) {
      handleApiError(error, "fetch coach types");
    }
  },

  /**
   * Search trains between source and destination
   * @param {string} source - Source station code
   * @param {string} destination - Destination station code
   * @param {string} doj - Date of journey (YYYY-MM-DD)
   * @returns {Promise<Object>} - Search results
   */
  searchTrains: async (source, destination, doj) => {
    try {
      const response = await serverpeApi.get("/train/search", {
        params: { source, destination, doj },
      });
      return response.data?.data || { trains: [], trains_count: 0 };
    } catch (error) {
      handleApiError(error, "search trains");
    }
  },

  /**
   * Get train schedule
   * @param {string} trainInput - Train number or name
   * @returns {Promise<Object>} - Train schedule
   */
  getTrainSchedule: async (trainInput) => {
    try {
      const response = await serverpeApi.get(`/train/schedule/${trainInput}`);
      return response.data?.data?.schedule || null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      handleApiError(error, "fetch train schedule");
    }
  },

  /**
   * Get live train status
   * @param {string} trainInput - Train number or name
   * @returns {Promise<Object>} - Live status
   */
  getLiveStatus: async (trainInput) => {
    try {
      const response = await serverpeApi.get(
        `/train/live-status/${trainInput}`
      );
      return response.data?.data?.live_status || [];
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      handleApiError(error, "fetch live train status");
    }
  },

  /**
   * Get trains at a specific station
   * @param {string} stationCode - Station code
   * @returns {Promise<Array>} - List of trains
   */
  getTrainsAtStation: async (stationCode) => {
    try {
      const response = await serverpeApi.get(`/train/station/${stationCode}`);
      return response.data?.data?.trains || [];
    } catch (error) {
      handleApiError(error, "fetch trains at station");
    }
  },

  /**
   * Calculate fare for a journey
   * @param {Object} fareData - Fare calculation data
   * @returns {Promise<Object>} - Fare details
   */
  calculateFare: async (fareData) => {
    try {
      const response = await serverpeApi.post(
        "/train/calculate-fare",
        fareData
      );
      return response.data?.data?.fare || null;
    } catch (error) {
      handleApiError(error, "calculate fare");
    }
  },

  /**
   * Book a ticket
   * @param {Object} bookingData - Booking details
   * @param {string} token - Not used (kept for signature compatibility)
   * @returns {Promise<Object>} - Booking confirmation
   */
  bookTicket: async (bookingData, token) => {
    try {
      const response = await serverpeApi.post(
        "/train/book-ticket",
        bookingData
      );
      return response.data?.data?.booking || null;
    } catch (error) {
      handleApiError(error, "book ticket");
    }
  },

  /**
   * Cancel a ticket
   * @param {string} pnr - PNR number
   * @param {Array} passengerIds - Passenger IDs to cancel
   * @param {string} token - Not used (kept for signature compatibility)
   * @returns {Promise<Object>} - Cancellation result
   */
  cancelTicket: async (pnr, passengerIds, token) => {
    try {
      const response = await serverpeApi.post("/train/cancel-ticket", {
        pnr,
        passenger_ids: passengerIds,
      });
      return response.data?.data?.cancellation || null;
    } catch (error) {
      handleApiError(error, "cancel ticket");
    }
  },

  /**
   * Get PNR status
   * @param {string} pnr - PNR number
   * @returns {Promise<Object>} - PNR status
   */
  getPnrStatus: async (pnr) => {
    try {
      const response = await serverpeApi.get(`/train/pnr-status/${pnr}`);
      return response.data?.data?.pnr_status || null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      handleApiError(error, "fetch PNR status");
    }
  },

  /**
   * Get booking history for a user
   * @param {string} email - User email
   * @param {string} token - Not used (kept for signature compatibility)
   * @returns {Promise<Array>} - Booking history
   */
  getBookingHistory: async (email, token) => {
    try {
      const response = await serverpeApi.get(`/train/booking-history/${email}`);
      return response.data?.data?.bookings || [];
    } catch (error) {
      handleApiError(error, "fetch booking history");
    }
  },

  /**
   * Send OTP via serverpe backend
   * @param {string} email - Email address
   * @returns {Promise<Object>} - OTP send result
   */
  sendOtp: async (email) => {
    try {
      const response = await serverpeApi.post("/train/send-otp", { email });
      return response.data?.data || null;
    } catch (error) {
      handleApiError(error, "send OTP");
    }
  },

  /**
   * Verify OTP via serverpe backend
   * @param {string} email - Email address
   * @param {string} otp - OTP to verify
   * @returns {Promise<Object>} - Verification result with token
   */
  verifyOtp: async (email, otp) => {
    try {
      const response = await serverpeApi.post("/train/verify-otp", {
        email,
        otp,
      });
      return {
        verified: response.data?.successstatus || false,
        data: response.data?.data,
      };
    } catch (error) {
      if (error.response?.status === 401) {
        return { verified: false, data: null };
      }
      handleApiError(error, "verify OTP");
    }
  },

  /**
   * Download ticket PDF
   * @param {string} pnr - PNR number
   * @param {string} token - JWT token (not needed for serverpe, kept for signature compatibility)
   * @param {Object} res - Express response object
   */
  downloadTicket: async (pnr, token, res) => {
    try {
      logger.info("Proxying ticket download request to serverpe", { pnr });

      const response = await serverpeApi.get(`/train/download-ticket/${pnr}`, {
        responseType: "stream",
      });

      // Set headers for file download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="QuickSmart_Ticket_${pnr}.pdf"`
      );

      // Pipe the response stream to the client
      response.data.pipe(res);
    } catch (error) {
      handleApiError(error, "download ticket");
    }
  },
};

module.exports = trainRepository;
