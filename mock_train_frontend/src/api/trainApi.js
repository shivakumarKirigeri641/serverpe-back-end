import axios from 'axios';

// API base URL - change this based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// MASTER DATA APIs
// ============================================================

export const getStations = () => api.get('/train/stations');
export const getCoachTypes = () => api.get('/train/coach-types');
export const getReservationTypes = () => api.get('/train/reservation-types');

// ============================================================
// TRAIN SEARCH APIs
// ============================================================

export const searchTrains = (source, destination, doj) => 
  api.get('/train/search', { params: { source, destination, doj } });

export const getTrainSchedule = (trainInput) => 
  api.get(`/train/schedule/${encodeURIComponent(trainInput)}`);

export const getLiveTrainStatus = (trainInput) => 
  api.get(`/train/live-status/${encodeURIComponent(trainInput)}`);

export const getTrainsAtStation = (stationCode) => 
  api.get(`/train/station/${stationCode}`);

// ============================================================
// FARE & BOOKING APIs
// ============================================================

export const calculateFare = (data) => api.post('/train/calculate-fare', data);
export const bookTicket = (data) => api.post('/train/book-ticket', data);
export const cancelTicket = (pnr, passengerIds) => 
  api.post('/train/cancel-ticket', { pnr, passenger_ids: passengerIds });

// ============================================================
// PNR & BOOKING HISTORY APIs
// ============================================================

export const getPnrStatus = (pnr) => api.get(`/train/pnr-status/${pnr}`);
export const getBookingHistory = (email) => api.get(`/train/booking-history/${email}`);

// ============================================================
// OTP APIs
// ============================================================

export const sendOtp = (email) => api.post('/train/send-otp', { email });
export const verifyOtp = (email, otp) => api.post('/train/verify-otp', { email, otp });

export default api;
