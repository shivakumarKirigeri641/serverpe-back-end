import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import TrainSchedule from './pages/TrainSchedule';
import LiveStatus from './pages/LiveStatus';
import PnrStatus from './pages/PnrStatus';
import BookTicket from './pages/BookTicket';
import BookingHistory from './pages/BookingHistory';
import LoginPage from './pages/LoginPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/schedule/:trainInput" element={<TrainSchedule />} />
              <Route path="/live-status/:trainInput" element={<LiveStatus />} />
              <Route path="/pnr-status" element={<PnrStatus />} />
              
              {/* Private Routes */}
              <Route 
                path="/book/:trainNumber" 
                element={
                  <ProtectedRoute>
                    <BookTicket />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <BookingHistory />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        
        {/* Footer */}
        <footer className="border-t border-slate-800 mt-12 py-6">
          <div className="container mx-auto px-4 text-center text-slate-400">
            <p>🚂 Mock Train Seat Reservation - Student Training Package</p>
            <p className="text-sm mt-2">Powered by <span className="text-orange-500 font-semibold">ServerPE.in</span></p>
          </div>
        </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
