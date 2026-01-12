/**
 * =====================================================
 * API CLIENT WITH LICENSE KEY AUTHENTICATION
 * =====================================================
 * 
 * This client connects to the ServerPE backend API.
 * All requests include your license key for authentication.
 * 
 * IMPORTANT: Set your license key in .env file!
 * REACT_APP_LICENSE_KEY=YOUR_KEY_HERE
 * 
 * @author ServerPE
 */

import axios from 'axios';

// Configuration from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.serverpe.in/api';
const LICENSE_KEY = process.env.REACT_APP_LICENSE_KEY || '';

// Validate license key is set
if (!LICENSE_KEY || LICENSE_KEY === 'YOUR_LICENSE_KEY_HERE') {
    console.warn('⚠️ WARNING: License key not configured!');
    console.warn('Please set REACT_APP_LICENSE_KEY in your .env file');
}

// Create axios instance with license key
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'x-license-key': LICENSE_KEY
    }
});

// Request interceptor to always include license key
apiClient.interceptors.request.use(
    (config) => {
        // Ensure license key is always in headers
        config.headers['x-license-key'] = LICENSE_KEY;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle network errors
        if (!error.response) {
            return Promise.reject({
                success: false,
                message: 'Unable to connect to server',
                error_code: 'NETWORK_ERROR',
                help: 'Check your internet connection and try again'
            });
        }

        // Handle license errors specifically
        const { status, data } = error.response;
        
        if (status === 401 || status === 403) {
            const errorCode = data?.error_code || '';
            
            if (errorCode.includes('LICENSE') || errorCode.includes('KEY')) {
                // Store license error for UI display
                window.localStorage.setItem('licenseError', JSON.stringify({
                    code: errorCode,
                    message: data.message,
                    help: data.help
                }));
                
                // Dispatch custom event for license error
                window.dispatchEvent(new CustomEvent('licenseError', { detail: data }));
            }
        }

        return Promise.reject(data || error.response.data);
    }
);

// =====================================================
// HELPER TO CHECK LICENSE STATUS
// =====================================================

export const getLicenseStatus = () => {
    if (!LICENSE_KEY) return { valid: false, reason: 'Not configured' };
    if (LICENSE_KEY === 'YOUR_LICENSE_KEY_HERE') return { valid: false, reason: 'Default value' };
    if (LICENSE_KEY === 'DEMO_LICENSE_KEY_1234') return { valid: true, isDemo: true };
    return { valid: true, isDemo: false };
};

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
