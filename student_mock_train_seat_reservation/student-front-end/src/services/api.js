/**
 * ============================================================================
 * API SERVICE - Frontend to Backend Communication
 * ============================================================================
 * 
 * This service handles all HTTP requests from the frontend to the student
 * backend. It includes error handling and response transformation.
 * 
 * ============================================================================
 */

import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:7777/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Transform error to user-friendly format
    const errorResponse = {
      success: false,
      userMessage: 'Something went wrong. Please try again.',
      technicalMessage: error.message,
      errorCode: 'UNKNOWN_ERROR',
      statusCode: 500,
    };

    if (error.response) {
      // Server responded with error
      const data = error.response.data;
      errorResponse.userMessage = data?.error?.userMessage || data?.message || errorResponse.userMessage;
      errorResponse.technicalMessage = data?.error?.technicalMessage || error.message;
      errorResponse.errorCode = data?.error?.errorCode || 'API_ERROR';
      errorResponse.statusCode = error.response.status;
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      errorResponse.userMessage = 'Cannot connect to the server. Please check if the backend is running.';
      errorResponse.technicalMessage = `Connection refused: ${API_BASE_URL}`;
      errorResponse.errorCode = 'CONNECTION_ERROR';
      errorResponse.statusCode = 503;
    } else if (error.code === 'ECONNABORTED') {
      errorResponse.userMessage = 'Request timed out. Please try again.';
      errorResponse.technicalMessage = 'Request timeout exceeded';
      errorResponse.errorCode = 'TIMEOUT_ERROR';
      errorResponse.statusCode = 504;
    }

    return Promise.reject(errorResponse);
  }
);

// ============================================================================
// CONNECTION STATUS
// ============================================================================

export async function checkConnectionStatus() {
  try {
    const response = await api.get('/connection-status');
    return {
      studentBackend: true,
      mainApi: response.mainApi,
      licenseConfigured: response.licenseConfigured,
      error: null,
    };
  } catch (error) {
    return {
      studentBackend: false,
      mainApi: false,
      licenseConfigured: false,
      error: error.userMessage || 'Connection failed',
    };
  }
}

export async function getHealthStatus() {
  try {
    const response = await api.get('/health');
    return response;
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// REFERENCE DATA
// ============================================================================

export async function getStations() {
  try {
    const response = await api.get('/stations');
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getReservationTypes() {
  try {
    const response = await api.get('/reservation-types');
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getCoachTypes() {
  try {
    const response = await api.get('/coach-types');
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// TRAIN SEARCH & INFORMATION
// ============================================================================

export async function searchTrains(sourceCode, destinationCode, doj) {
  try {
    const response = await api.post('/search-trains', {
      source_code: sourceCode,
      destination_code: destinationCode,
      doj: doj,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getTrainSchedule(trainNumber) {
  try {
    const response = await api.post('/train-schedule', {
      train_number: trainNumber,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getLiveTrainStatus(trainNumber) {
  try {
    const response = await api.post('/live-train-status', {
      train_number: trainNumber,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getLiveStation(stationCode, nextHours = 2) {
  try {
    const response = await api.post('/live-station', {
      station_code: stationCode,
      next_hours: nextHours,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// FARE & BOOKING
// ============================================================================

export async function calculateFare(params) {
  try {
    const response = await api.post('/calculate-fare', {
      train_number: params.trainNumber,
      source_code: params.sourceCode,
      destination_code: params.destinationCode,
      doj: params.doj,
      coach_code: params.coachCode,
      reservation_type: params.reservationType,
      passengers: params.passengers,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function confirmTicket(bookingDetails) {
  try {
    const response = await api.post('/confirm-ticket', {
      train_number: bookingDetails.trainNumber,
      source_code: bookingDetails.sourceCode,
      destination_code: bookingDetails.destinationCode,
      doj: bookingDetails.doj,
      coach_code: bookingDetails.coachCode,
      reservation_type: bookingDetails.reservationType,
      passengers: bookingDetails.passengers,
      mobile_number: bookingDetails.mobileNumber,
      total_fare: bookingDetails.totalFare,
      email: bookingDetails.email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function cancelTicket(pnr, passengerIds) {
  try {
    const response = await api.post('/cancel-ticket', {
      pnr: pnr,
      passenger_ids: passengerIds,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// PNR & BOOKING HISTORY
// ============================================================================

export async function getPnrStatus(pnr) {
  try {
    const response = await api.get(`/pnr-status/${pnr}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getBookingHistory(email) {
  try {
    const response = await api.post('/booking-history', {
      email: email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export async function sendOtp(email) {
  try {
    const response = await api.post('/auth/send-otp', {
      email: email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function verifyOtp(email, otp) {
  try {
    const response = await api.post('/auth/verify-otp', {
      email: email,
      otp: otp,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Export axios instance for direct use if needed
export default api;
