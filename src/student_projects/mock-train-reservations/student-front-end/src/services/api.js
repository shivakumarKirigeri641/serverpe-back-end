import axios from "axios";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    const errorCode = error.response?.data?.error_code;

    // Handle API key validation errors
    if (
      errorCode &&
      [
        "API_KEY_MISSING",
        "API_KEY_INVALID",
        "API_KEY_EXPIRED",
        "DOMAIN_NOT_ALLOWED",
      ].includes(errorCode)
    ) {
      // Show API key error modal or redirect to error page
      window.location.href =
        "/api-key-error?error=" +
        errorCode +
        "&message=" +
        encodeURIComponent(message);
      return Promise.reject({
        message,
        status: error.response?.status,
        errorCode,
      });
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      errorCode,
    });
  }
);

// ============================================
// AUTHENTICATION APIS
// ============================================

export const authApi = {
  // Send OTP to email
  sendOtp: async (email, ispayment = false) => {
    return api.post("/student/auth/send-otp", { email, ispayment });
  },

  // Verify OTP and login
  verifyOtp: async (email, otp) => {
    return api.post("/student/auth/verify-otp", { email, otp });
  },

  // Verify payment OTP (without JWT token)
  verifyPaymentOtp: async (email, otp) => {
    return api.post("/student/auth/verify-payment-otp", { email, otp });
  },

  // Check authentication status
  checkAuth: async () => {
    return api.get("/student/auth/check-auth");
  },

  // Get current user info
  getMe: async () => {
    return api.get("/student/auth/me");
  },

  // Logout
  logout: async () => {
    return api.post("/student/auth/logout");
  },
};

// ============================================
// MASTER DATA APIS
// ============================================

export const masterApi = {
  // Get all stations
  getStations: async () => {
    return api.get("/student/train/stations");
  },

  // Get reservation types
  getReservationTypes: async () => {
    return api.get("/student/train/reservation-types");
  },

  // Get coach types
  getCoachTypes: async () => {
    return api.get("/student/train/coach-types");
  },
};

// ============================================
// TRAIN SEARCH APIS
// ============================================

export const trainApi = {
  // Autocomplete trains
  autocomplete: async (query) => {
    return api.get("/student/train/autocomplete", {
      params: { q: query },
    });
  },

  // Search trains
  searchTrains: async (source, destination, doj) => {
    return api.get("/student/train/search", {
      params: { source, destination, doj },
    });
  },

  // Get train schedule
  getSchedule: async (trainInput) => {
    return api.get(`/student/train/schedule/${trainInput}`);
  },

  // Get live status
  getLiveStatus: async (trainInput) => {
    return api.get(`/student/train/live-status/${trainInput}`);
  },

  // Get trains at station
  getTrainsAtStation: async (stationCode, nextHours = 2) => {
    return api.get(`/student/train/station/${stationCode}`, {
      params: { next_hours: nextHours },
    });
  },

  // Calculate fare
  calculateFare: async (fareData) => {
    return api.post("/student/train/calculate-fare", fareData);
  },
  bookTicket: async (bookingData) => {
    return api.post("/student/train/book-ticket", bookingData);
  },
};

// ============================================
// BOOKING APIS
// ============================================

export const bookingApi = {
  // Book ticket
  bookTicket: async (bookingData) => {
    return api.post("/student/train/book-ticket", bookingData);
  },

  // Cancel ticket
  cancelTicket: async (pnr, passengerIds) => {
    return api.post("/student/train/cancel-ticket", {
      pnr,
      passenger_ids: passengerIds,
    });
  },

  // Get PNR status
  getPnrStatus: async (pnr) => {
    return api.get(`/student/train/pnr-status/${pnr}`);
  },

  // Get booking history
  getBookingHistory: async (email) => {
    return api.get(
      `/student/train/booking-history/${encodeURIComponent(email)}`
    );
  },

  // Download ticket PDF
  downloadTicket: async (pnr) => {
    const response = await axios({
      url: `${API_BASE_URL}/student/train/download-ticket/${pnr}`,
      method: "GET",
      responseType: "blob",
      withCredentials: true,
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `QuickSmart_Ticket_${pnr}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

// ============================================
// HEALTH CHECK
// ============================================

export const healthApi = {
  check: async () => {
    return api.get("/health");
  },

  detailed: async () => {
    return api.get("/health/detailed");
  },
};

export default api;
