/**
 * ============================================================================
 * MAIN APP - QuickSmart Mock Train Reservation
 * ============================================================================
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ConnectionStatus from './components/ConnectionStatus';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SearchTrainsPage from './pages/SearchTrainsPage';
import PnrStatusPage from './pages/PnrStatusPage';
import TrainSchedulePage from './pages/TrainSchedulePage';
import LiveTrainStatusPage from './pages/LiveTrainStatusPage';
import LiveStationPage from './pages/LiveStationPage';

// Dashboard & Protected Pages
import Dashboard, { DashboardHome } from './pages/Dashboard';
import BookTicketPage from './pages/BookTicketPage';
import CancelTicketPage from './pages/CancelTicketPage';
import BookingHistoryPage from './pages/BookingHistoryPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              color: '#fff',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        {/* Main Layout */}
        <div className="min-h-screen">
          <Navbar />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/search-trains" element={<SearchTrainsPage />} />
            <Route path="/pnr-status" element={<PnrStatusPage />} />
            <Route path="/train-schedule" element={<TrainSchedulePage />} />
            <Route path="/live-train-status" element={<LiveTrainStatusPage />} />
            <Route path="/live-station" element={<LiveStationPage />} />

            {/* Dashboard Routes (Protected) */}
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="book-ticket" element={<BookTicketPage />} />
              <Route path="pnr-status" element={<PnrStatusPage />} />
              <Route path="cancel-ticket" element={<CancelTicketPage />} />
              <Route path="booking-history" element={<BookingHistoryPage />} />
              <Route path="train-schedule" element={<TrainSchedulePage />} />
              <Route path="live-train-status" element={<LiveTrainStatusPage />} />
              <Route path="live-station" element={<LiveStationPage />} />
            </Route>

            {/* 404 Fallback */}
            <Route
              path="*"
              element={
                <div className="min-h-screen pt-20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🚂</div>
                    <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
                    <p className="text-gray-400 mb-6">
                      The page you're looking for doesn't exist.
                    </p>
                    <a href="/" className="btn-primary">
                      Go Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>

        {/* Global Connection Status Monitor */}
        <div className="fixed bottom-4 left-4 z-[9999] max-w-[240px] hidden md:block animate-slide-up">
          <ConnectionStatus />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
