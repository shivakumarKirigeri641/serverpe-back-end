/**
 * =====================================================
 * MOCK TRAIN RESERVATION - UI ONLY VERSION
 * =====================================================
 * 
 * This version connects to the ServerPE backend API.
 * A valid license key is required.
 * 
 * Set your license key in .env:
 * REACT_APP_LICENSE_KEY=YOUR_KEY
 * 
 * @author ServerPE
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { getLicenseStatus } from './api/apiClient';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import LicenseError from './components/LicenseError';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SearchTrainsPage from './pages/SearchTrainsPage';
import PnrStatusPage from './pages/PnrStatusPage';
import TrainSchedulePage from './pages/TrainSchedulePage';
import LiveTrainStatusPage from './pages/LiveTrainStatusPage';
import StationStatusPage from './pages/StationStatusPage';
import BookTicketPage from './pages/BookTicketPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import CancelTicketPage from './pages/CancelTicketPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner text="Checking authentication..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: window.location }} replace />;
    }

    return children;
};

// App Layout
const AppLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-900">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
};

// Main App
function App() {
    const [licenseError, setLicenseError] = useState(null);
    const licenseStatus = getLicenseStatus();

    // Check license on mount
    useEffect(() => {
        if (!licenseStatus.valid) {
            setLicenseError({
                code: 'NO_LICENSE_KEY',
                message: 'License key not configured',
                help: 'Add REACT_APP_LICENSE_KEY to your .env file'
            });
        }
    }, [licenseStatus.valid]);

    // Handle license errors from API
    const handleLicenseError = (error) => {
        setLicenseError(error);
    };

    // Show license error screen
    if (licenseError && !licenseStatus.valid) {
        return (
            <LicenseError 
                error={licenseError} 
                onRetry={() => {
                    setLicenseError(null);
                    window.location.reload();
                }}
            />
        );
    }

    return (
        <AuthProvider>
            <Router>
                <AppLayout>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/search" element={<SearchTrainsPage />} />
                        <Route path="/pnr-status" element={<PnrStatusPage />} />
                        <Route path="/train-schedule" element={<TrainSchedulePage />} />
                        <Route path="/live-train-status" element={<LiveTrainStatusPage />} />
                        <Route path="/station-status" element={<StationStatusPage />} />

                        {/* Protected Routes */}
                        <Route path="/dashboard/book-ticket" element={
                            <ProtectedRoute><BookTicketPage /></ProtectedRoute>
                        } />
                        <Route path="/dashboard/booking-history" element={
                            <ProtectedRoute><BookingHistoryPage /></ProtectedRoute>
                        } />
                        <Route path="/dashboard/cancel-ticket" element={
                            <ProtectedRoute><CancelTicketPage /></ProtectedRoute>
                        } />

                        {/* 404 */}
                        <Route path="*" element={
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🚫</div>
                                    <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
                                    <a href="/" className="btn-primary">Go Home</a>
                                </div>
                            </div>
                        } />
                    </Routes>
                </AppLayout>

                {/* License Badge */}
                {licenseStatus.isDemo && (
                    <div className="fixed bottom-4 right-4 bg-yellow-500/90 text-black px-4 py-2 rounded-lg text-sm font-medium">
                        🎓 Demo Mode - Limited Features
                    </div>
                )}

                <ToastContainer position="top-right" theme="dark" />
            </Router>
        </AuthProvider>
    );
}

export default App;
