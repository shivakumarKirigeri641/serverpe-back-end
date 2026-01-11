/**
 * ============================================================================
 * BOOKING HISTORY PAGE
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookingHistory } from '../services/api';
import { PageLoader } from '../components/Loader';
import { FiClock, FiMapPin, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function BookingHistoryPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.email) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const result = await getBookingHistory(user.email);
      setBookings(result.recent_bookings || []);
    } catch (err) {
      setError(err);
      toast.error(err.userMessage || 'Failed to fetch booking history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader text="Loading booking history..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold gradient-text">Booking History</h1>
        <Link to="/dashboard/book-ticket" className="btn-primary text-sm">
          + Book New Ticket
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-card p-4 mb-6 border-l-4 border-l-red-500">
          <p className="text-red-400">{error.userMessage}</p>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking, idx) => (
            <div key={idx} className="train-card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Booking Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    🎫
                  </div>
                  <div>
                    <Link
                      to={`/dashboard/pnr-status?pnr=${booking.pnr}`}
                      className="font-bold text-blue-400 hover:underline"
                    >
                      PNR: {booking.pnr}
                    </Link>
                    <p className="text-gray-400 text-sm">
                      {booking.train_name} ({booking.train_number})
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiMapPin className="text-green-400" />
                        {booking.source_name}
                      </span>
                      <span>→</span>
                      <span className="flex items-center gap-1">
                        <FiMapPin className="text-red-400" />
                        {booking.destination_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date & Status */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="flex items-center gap-2 text-sm text-gray-400">
                      <FiCalendar />
                      {booking.date_of_journey}
                    </span>
                    <p className="text-lg font-bold text-green-400 mt-1">
                      ₹{booking.total_fare}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      booking.pnr_status === 'CONFIRMED'
                        ? 'bg-green-500/20 text-green-400'
                        : booking.pnr_status === 'CANCELLED'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {booking.pnr_status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
          <p className="text-gray-400 mb-6">
            You haven't made any bookings yet. Start by booking your first ticket!
          </p>
          <Link to="/dashboard/book-ticket" className="btn-primary">
            Book Your First Ticket 🎫
          </Link>
        </div>
      )}
    </div>
  );
}
