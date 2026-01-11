/**
 * ============================================================================
 * TRAIN ROUTER - REST API Endpoints
 * ============================================================================
 *
 * This router defines all REST API endpoints for the train reservation system.
 * Each endpoint calls the corresponding service method and returns a
 * standardized response.
 *
 * ENDPOINT CATEGORIES:
 * 1. Reference Data (GET) - Stations, Coach Types, Reservation Types
 * 2. Train Information (POST) - Search, Schedule, Live Status
 * 3. Booking (POST) - Calculate Fare, Confirm, Cancel
 * 4. User (POST/GET) - PNR Status, Booking History
 * 5. Authentication (POST) - Send OTP, Verify OTP
 *
 * STUDENT NOTE:
 * - All endpoints use asyncHandler for automatic error catching
 * - Responses follow a consistent format
 * - Input validation is done in the service layer
 *
 * ============================================================================
 */

const express = require('express');
const router = express.Router();

const trainService = require('../services/trainService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Helper to wrap successful responses
 */
const successResponse = (data, message = 'Success') => ({
  successstatus: true,
  status: 'Success',
  message,
  data
});

// =============================================================================
// REFERENCE DATA ENDPOINTS (GET)
// =============================================================================

/**
 * @route   GET /api/stations
 * @desc    Get all available train stations
 * @access  Public
 */
router.get('/stations', asyncHandler(async (req, res) => {
  const result = await trainService.getReservedStations();
  res.json(successResponse(result.data, result.message));
}));

/**
 * @route   GET /api/reservation-types
 * @desc    Get available reservation quotas (GEN, TATKAL, etc.)
 * @access  Public
 */
router.get('/reservation-types', asyncHandler(async (req, res) => {
  const result = await trainService.getReservationTypes();
  res.json(successResponse(result.data, result.message));
}));

/**
 * @route   GET /api/coach-types
 * @desc    Get available coach classes (1A, 2A, SL, etc.)
 * @access  Public
 */
router.get('/coach-types', asyncHandler(async (req, res) => {
  const result = await trainService.getCoachTypes();
  res.json(successResponse(result.data, result.message));
}));

// =============================================================================
// TRAIN INFORMATION ENDPOINTS (POST)
// =============================================================================

/**
 * @route   POST /api/search-trains
 * @desc    Search for trains between two stations
 * @body    { source_code, destination_code, doj }
 * @access  Public
 */
router.post('/search-trains', asyncHandler(async (req, res) => {
  const { source_code, destination_code, doj } = req.body;
  const result = await trainService.searchTrains(source_code, destination_code, doj);
  res.json(successResponse(result.data, result.message));
}));

/**
 * @route   POST /api/train-schedule
 * @desc    Get detailed route and schedule for a specific train
 * @body    { train_number }
 * @access  Public
 */
router.post('/train-schedule', asyncHandler(async (req, res) => {
  const { train_number } = req.body;
  const result = await trainService.getTrainSchedule(train_number);
  res.json(successResponse(result.data, result.message));
}));

/**
 * @route   POST /api/live-train-status
 * @desc    Get real-time running status of a train
 * @body    { train_number }
 * @access  Public
 */
router.post('/live-train-status', asyncHandler(async (req, res) => {
  const { train_number } = req.body;
  const result = await trainService.getLiveTrainStatus(train_number);
  res.json(successResponse(result.data, result.message));
}));

/**
 * @route   POST /api/live-station
 * @desc    Get trains arriving/departing from a station in next N hours
 * @body    { station_code, next_hours }
 * @access  Public
 */
router.post('/live-station', asyncHandler(async (req, res) => {
  const { station_code, next_hours } = req.body;
  const result = await trainService.getTrainsAtStation(station_code, next_hours);
  res.json(successResponse(result.data, result.message));
}));

// =============================================================================
// BOOKING ENDPOINTS (POST)
// =============================================================================

/**
 * @route   POST /api/calculate-fare
 * @desc    Calculate total fare for a journey and set of passengers
 * @body    { train_number, source_code, destination_code, doj, coach_code, reservation_type, passengers }
 * @access  Public
 */
router.post('/calculate-fare', asyncHandler(async (req, res) => {
  const result = await trainService.calculateFare(req.body);
  res.json(successResponse(result.data, result.message));
}));

/**
 * @route   POST /api/confirm-ticket
 * @desc    Confirm a booking and generate a PNR
 * @body    { train_number, source_code, destination_code, doj, coach_code, reservation_type, passengers, mobile_number, total_fare, email }
 * @access  Public
 */
router.post('/confirm-ticket', asyncHandler(async (req, res) => {
  const result = await trainService.confirmTicket(req.body);
  res.json(successResponse(result.data, result.message));
}));

/**
 * @route   POST /api/cancel-ticket
 * @desc    Cancel a booking or specific passengers from a PNR
 * @body    { pnr, passenger_ids }
 * @access  Public
 */
router.post('/cancel-ticket', asyncHandler(async (req, res) => {
  const { pnr, passenger_ids } = req.body;
  const result = await trainService.cancelTicket(pnr, passenger_ids);
  res.json(successResponse(result.data, result.message));
}));

// =============================================================================
// PNR & HISTORY ENDPOINTS
// =============================================================================

/**
 * @route   GET /api/pnr-status/:pnr
 * @desc    Get current status of a booking by PNR
 * @access  Public
 */
router.get('/pnr-status/:pnr', asyncHandler(async (req, res) => {
  const { pnr } = req.params;
  const result = await trainService.getPnrStatus(pnr);
  res.json(successResponse(result.data, result.message));
}));

/**
 * @route   POST /api/booking-history
 * @desc    Get all bookings for a user by email
 * @body    { email }
 * @access  Public
 */
router.post('/booking-history', asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await trainService.getBookingHistory(email);
  res.json(successResponse(result.data, result.message));
}));

// =============================================================================
// AUTHENTICATION ENDPOINTS (POST)
// =============================================================================

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to email for login
 * @body    { email }
 * @access  Public
 */
router.post('/auth/send-otp', asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await trainService.sendEmailOtp(email);
  res.json(successResponse(result.data, result.message));
}));

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and login
 * @body    { email, otp }
 * @access  Public
 */
router.post('/auth/verify-otp', asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await trainService.verifyEmailOtp(email, otp);
  res.json(successResponse(result.data, result.message));
}));

module.exports = router;
