/**
 * API Client for Backend Communication
 * Handles all HTTP requests to the train reservation backend
 */

import axios from 'axios';

// Backend base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7777/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true, // For cookie-based auth
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle network errors
        if (!error.response) {
            return Promise.reject({
                success: false,
                message: 'Unable to connect to server. Please check if backend is running.',
                error: 'NETWORK_ERROR'
            });
        }
        return Promise.reject(error.response.data);
    }
);

// =====================================================
// API FUNCTIONS
// =====================================================

// Health check
export const checkHealth = async () => {
    const response = await apiClient.get('/health');
    return response.data;
};

// Get all stations
export const getStations = async () => {
    const response = await apiClient.get('/train/stations');
    return response.data;
};

// Get coach types
export const getCoachTypes = async () => {
    const response = await apiClient.get('/train/coach-types');
    return response.data;
};

// Get reservation types
export const getReservationTypes = async () => {
    const response = await apiClient.get('/train/reservation-types');
    return response.data;
};

// Search trains
export const searchTrains = async (source, destination, doj) => {
    const response = await apiClient.get('/train/search', {
        params: { source, destination, doj }
    });
    return response.data;
};

// Get train schedule
export const getTrainSchedule = async (trainInput) => {
    const response = await apiClient.get(`/train/schedule/${trainInput}`);
    return response.data;
};

// Get live train status
export const getLiveTrainStatus = async (trainInput) => {
    const response = await apiClient.get(`/train/live-status/${trainInput}`);
    return response.data;
};

// Get trains at station
export const getTrainsAtStation = async (stationCode) => {
    const response = await apiClient.get(`/train/station/${stationCode}`);
    return response.data;
};

// Get PNR status
export const getPnrStatus = async (pnr) => {
    const response = await apiClient.get(`/train/pnr-status/${pnr}`);
    return response.data;
};

// Calculate fare
export const calculateFare = async (fareData) => {
    const response = await apiClient.post('/train/calculate-fare', fareData);
    return response.data;
};

// Send OTP
export const sendOtp = async (email) => {
    const response = await apiClient.post('/train/send-otp', { email });
    return response.data;
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
    const response = await apiClient.post('/train/verify-otp', { email, otp });
    return response.data;
};

// Check authentication
export const checkAuth = async () => {
    const response = await apiClient.get('/train/check-auth');
    return response.data;
};

// Logout
export const logout = async () => {
    const response = await apiClient.post('/train/logout');
    return response.data;
};

// Book ticket
export const bookTicket = async (bookingData) => {
    const response = await apiClient.post('/train/book-ticket', bookingData);
    return response.data;
};

// Cancel ticket
export const cancelTicket = async (pnr, passengerIds) => {
    const response = await apiClient.post('/train/cancel-ticket', {
        pnr,
        passenger_ids: passengerIds
    });
    return response.data;
};

// Get booking history
export const getBookingHistory = async (email) => {
    const response = await apiClient.get(`/train/booking-history/${email}`);
    return response.data;
};

export default apiClient;
