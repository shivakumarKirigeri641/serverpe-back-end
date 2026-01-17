import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Context
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import SearchTrains from "./pages/SearchTrains";
import BookingPage from "./pages/BookingPage";
import MyBookings from "./pages/MyBookings";
import PnrStatus from "./pages/PnrStatus";
import TrainSchedule from "./pages/TrainSchedule";
import LiveStatus from "./pages/LiveStatus";
import StationStatus from "./pages/StationStatus";
import APIKeyErrorPage from "./pages/APIKeyErrorPage";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#1f2937",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              padding: "16px",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
        <Routes>
          {/* Public Home Page */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/api-key-error" element={<APIKeyErrorPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="search" element={<SearchTrains />} />
            <Route path="book" element={<BookingPage />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="pnr" element={<PnrStatus />} />
            <Route path="schedule" element={<TrainSchedule />} />
            <Route path="live-status" element={<LiveStatus />} />
            <Route path="station" element={<StationStatus />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
