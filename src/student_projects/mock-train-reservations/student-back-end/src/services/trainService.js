/**
 * ==============================================
 * QUICKSMART TRAIN RESERVATION - TRAIN SERVICE
 * ==============================================
 * Service layer containing business logic for train operations.
 * This layer sits between the router and repository.
 */

const { trainRepository } = require("../repositories");
const logger = require("../utils/logger");
const { toUpperCase } = require("../utils/validators");
const { ValidationError, NotFoundError } = require("../utils/errors");

/**
 * Train Service - Business Logic Layer
 */
const trainService = {
  /* ============================================================
     📋 MASTER DATA METHODS
     ============================================================ */

  /**
   * Get all available stations
   * @returns {Promise<Array>} - List of stations
   */
  getAllStations: async () => {
    logger.info("Fetching all stations");
    const stations = await trainRepository.getStations();
    logger.info(`Fetched ${stations.length} stations`);
    return stations;
  },

  /**
   * Get all reservation types
   * @returns {Promise<Array>} - List of reservation types
   */
  getAllReservationTypes: async () => {
    logger.info("Fetching all reservation types");
    const types = await trainRepository.getReservationTypes();
    logger.info(`Fetched ${types.length} reservation types`);
    return types;
  },

  /**
   * Get all coach types
   * @returns {Promise<Array>} - List of coach types
   */
  getAllCoachTypes: async () => {
    logger.info("Fetching all coach types");
    const types = await trainRepository.getCoachTypes();
    logger.info(`Fetched ${types.length} coach types`);
    return types;
  },

  /* ============================================================
     🔍 TRAIN SEARCH METHODS
     ============================================================ */

  /**
   * Autocomplete train search
   * @param {string} query - Search query (train number or name)
   * @returns {Promise<Object>} - Autocomplete suggestions
   */
  autocompleteTrains: async (query) => {
    const normalizedQuery = toUpperCase(query);
    logger.info("Autocompleting trains", { query: normalizedQuery });

    const result = await trainRepository.autocompleteTrains(normalizedQuery);

    logger.info(`Found ${result.count || 0} train suggestions`);

    return result;
  },

  /**
   * Search trains between source and destination
   * @param {string} source - Source station code
   * @param {string} destination - Destination station code
   * @param {string} doj - Date of journey
   * @returns {Promise<Object>} - Search results with train list
   */
  searchTrains: async (source, destination, doj) => {
    // Normalize inputs
    const normalizedSource = toUpperCase(source);
    const normalizedDestination = toUpperCase(destination);

    logger.info("Searching trains", {
      source: normalizedSource,
      destination: normalizedDestination,
      doj,
    });

    // Business validation
    if (normalizedSource === normalizedDestination) {
      throw new ValidationError("Source and destination cannot be the same");
    }

    const result = await trainRepository.searchTrains(
      normalizedSource,
      normalizedDestination,
      doj
    );

    logger.info(
      `Found ${result.trains_count || result.trains?.length || 0} trains`
    );

    return {
      query: {
        source: normalizedSource,
        destination: normalizedDestination,
        doj,
      },
      trains_count: result.trains_count || result.trains?.length || 0,
      trains: result.trains || [],
    };
  },

  /**
   * Get train schedule by train number or name
   * @param {string} trainInput - Train number or name
   * @returns {Promise<Object>} - Train schedule
   */
  getTrainSchedule: async (trainInput) => {
    const normalizedInput = toUpperCase(trainInput);
    logger.info("Fetching train schedule", { trainInput: normalizedInput });

    const schedule = await trainRepository.getTrainSchedule(normalizedInput);

    if (!schedule) {
      throw new NotFoundError(`Train "${trainInput}" not found`);
    }

    logger.info("Train schedule fetched", {
      trainNumber: schedule.train_number,
      stopsCount: schedule.schedule?.length || 0,
    });

    return schedule;
  },

  /**
   * Get live train status
   * @param {string} trainInput - Train number or name
   * @returns {Promise<Object>} - Live status data
   */
  getLiveStatus: async (trainInput) => {
    const normalizedInput = toUpperCase(trainInput);
    logger.info("Fetching live train status", { trainInput: normalizedInput });

    const status = await trainRepository.getLiveStatus(normalizedInput);

    if (!status || status.length === 0) {
      throw new NotFoundError(`Train "${trainInput}" not found`);
    }

    logger.info("Live status fetched", { stopsCount: status.length });

    return {
      train_input: normalizedInput,
      live_status: status,
    };
  },

  /**
   * Get trains at a specific station
   * @param {string} stationCode - Station code
   * @returns {Promise<Object>} - Trains at station
   */
  getTrainsAtStation: async (stationCode) => {
    const normalizedCode = toUpperCase(stationCode);
    logger.info("Fetching trains at station", { stationCode: normalizedCode });

    const trains = await trainRepository.getTrainsAtStation(normalizedCode);

    logger.info(`Found ${trains.length} trains at station`, {
      stationCode: normalizedCode,
    });

    return {
      station_code: normalizedCode,
      trains_count: trains.length,
      trains,
    };
  },

  /* ============================================================
     💰 FARE CALCULATION
     ============================================================ */

  /**
   * Calculate fare for a journey
   * @param {Object} fareData - Fare calculation parameters
   * @returns {Promise<Object>} - Calculated fare details
   */
  calculateFare: async (fareData) => {
    const {
      train_number,
      source_code,
      destination_code,
      doj,
      coach_code,
      reservation_type,
      passengers,
    } = fareData;

    logger.info("Calculating fare", {
      train_number,
      source_code,
      destination_code,
      coach_code,
      passengersCount: passengers.length,
    });

    // Normalize inputs
    const normalizedData = {
      train_number: toUpperCase(train_number),
      source_code: toUpperCase(source_code),
      destination_code: toUpperCase(destination_code),
      doj,
      coach_code: toUpperCase(coach_code),
      reservation_type: toUpperCase(reservation_type),
      passengers,
    };

    const fare = await trainRepository.calculateFare(normalizedData);

    logger.info("Fare calculated", {
      totalFare: fare?.fare?.grandTotal,
    });

    return fare;
  },

  /* ============================================================
     🎫 BOOKING METHODS
     ============================================================ */

  /**
   * Book a train ticket
   * @param {Object} bookingData - Booking details
   * @param {string} token - User auth token
   * @returns {Promise<Object>} - Booking confirmation
   */
  bookTicket: async (bookingData, token) => {
    const {
      train_number,
      source_code,
      destination_code,
      doj,
      coach_code,
      reservation_type,
      passengers,
      mobile_number,
      email,
      total_fare,
    } = bookingData;

    logger.info("Booking ticket", {
      train_number,
      source_code,
      destination_code,
      doj,
      passengersCount: passengers.length,
      email,
    });

    // Normalize inputs
    const normalizedData = {
      train_number: toUpperCase(train_number),
      source_code: toUpperCase(source_code),
      destination_code: toUpperCase(destination_code),
      doj,
      coach_code: toUpperCase(coach_code),
      reservation_type: toUpperCase(reservation_type),
      passengers: passengers.map((p) => ({
        ...p,
        passenger_gender: toUpperCase(p.passenger_gender),
      })),
      mobile_number,
      email,
      total_fare,
    };

    const booking = await trainRepository.bookTicket(normalizedData, token);

    logger.info("Ticket booked successfully", {
      pnr: booking?.pnr,
      status: booking?.pnr_status,
    });

    return booking;
  },

  /**
   * Cancel a ticket
   * @param {string} pnr - PNR number
   * @param {Array} passengerIds - Passenger IDs to cancel
   * @param {string} token - User auth token
   * @returns {Promise<Object>} - Cancellation result
   */
  cancelTicket: async (pnr, passengerIds, token) => {
    logger.info("Cancelling ticket", { pnr, passengerIds });

    const result = await trainRepository.cancelTicket(pnr, passengerIds, token);

    logger.info("Ticket cancelled", { pnr });

    return result;
  },

  /* ============================================================
     📊 PNR & BOOKING HISTORY
     ============================================================ */

  /**
   * Get PNR status
   * @param {string} pnr - PNR number
   * @returns {Promise<Object>} - PNR status details
   */
  getPnrStatus: async (pnr) => {
    const normalizedPnr = toUpperCase(pnr);
    logger.info("Fetching PNR status", { pnr: normalizedPnr });

    const status = await trainRepository.getPnrStatus(normalizedPnr);

    if (!status) {
      throw new NotFoundError("PNR not found");
    }

    logger.info("PNR status fetched", {
      pnr: normalizedPnr,
      status: status.pnr_status,
    });

    return status;
  },

  /**
   * Get booking history for a user
   * @param {string} email - User email
   * @param {string} token - User auth token
   * @returns {Promise<Object>} - Booking history
   */
  getBookingHistory: async (email, token) => {
    logger.info("Fetching booking history", { email });

    const bookings = await trainRepository.getBookingHistory(email, token);

    logger.info(`Fetched ${bookings.length} bookings for user`, { email });

    return {
      email,
      bookings_count: bookings.length,
      bookings,
    };
  },

  /**
   * Download ticket PDF
   * @param {string} pnr - PNR number
   * @param {string} token - JWT token for authentication
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  downloadTicket: async (pnr, token, res) => {
    logger.info("Downloading ticket", { pnr });

    // Proxy to serverpe-back-end for PDF generation and download
    await trainRepository.downloadTicket(pnr, token, res);

    logger.info("Ticket download initiated", { pnr });
  },
};

module.exports = trainService;
