/**
 * ============================================================================
 * CANCEL TICKET PAGE
 * ============================================================================
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPnrStatus, cancelTicket } from '../services/api';
import { ButtonLoader } from '../components/Loader';
import { FiSearch, FiUser, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CancelTicketPage() {
  const { user } = useAuth();
  const [pnr, setPnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [booking, setBooking] = useState(null);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [error, setError] = useState(null);

  const handleFetchBooking = async (e) => {
    e.preventDefault();
    setError(null);
    setBooking(null);
    setSelectedPassengers([]);

    if (!pnr) {
      toast.error('Please enter PNR number');
      return;
    }

    setLoading(true);
    try {
      const result = await getPnrStatus(pnr);
      setBooking(result);
    } catch (err) {
      setError(err);
      toast.error(err.userMessage || 'Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  const togglePassenger = (passengerId) => {
    if (selectedPassengers.includes(passengerId)) {
      setSelectedPassengers(selectedPassengers.filter(id => id !== passengerId));
    } else {
      setSelectedPassengers([...selectedPassengers, passengerId]);
    }
  };

  const handleCancel = async () => {
    if (selectedPassengers.length === 0) {
      toast.error('Please select at least one passenger');
      return;
    }

    setCancelling(true);
    try {
      await cancelTicket(pnr, selectedPassengers);
      toast.success('Ticket cancelled successfully');
      // Reset
      setPnr('');
      setBooking(null);
      setSelectedPassengers([]);
    } catch (err) {
      toast.error(err.userMessage || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold gradient-text mb-6">Cancel Ticket</h1>

      {/* PNR Search */}
      <div className="glass-card p-6 mb-6">
        <form onSubmit={handleFetchBooking}>
          <label className="block text-sm text-gray-400 mb-2">Enter PNR Number</label>
          <div className="flex gap-4">
            <input
              type="text"
              value={pnr}
              onChange={(e) => setPnr(e.target.value.toUpperCase())}
              placeholder="Enter PNR number"
              className="input-field flex-1"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? <ButtonLoader /> : <><FiSearch /> Fetch</>}
            </button>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-card p-4 mb-6 border-l-4 border-l-red-500">
          <p className="text-red-400">{error.userMessage}</p>
        </div>
      )}

      {/* Booking Details */}
      {booking && (
        <div className="glass-card p-6 animate-slide-up">
          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <FiAlertTriangle className="text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-yellow-400">Cancellation Warning</p>
              <p className="text-sm text-gray-400">
                Select passengers to cancel. This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Booking Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-400">PNR</p>
              <p className="font-bold text-blue-400">{booking.pnr}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Train</p>
              <p className="font-semibold">{booking.train_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Route</p>
              <p>{booking.source_name} → {booking.destination_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Date</p>
              <p>{booking.date_of_journey}</p>
            </div>
          </div>

          {/* Passengers Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FiUser /> Select Passengers to Cancel
            </h3>
            <div className="space-y-2">
              {booking.passengers?.map((p, idx) => (
                <label
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                    selectedPassengers.includes(p.id || idx)
                      ? 'bg-red-500/20 border border-red-500/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedPassengers.includes(p.id || idx)}
                      onChange={() => togglePassenger(p.id || idx)}
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <p className="font-medium">{p.passenger_name || p.name}</p>
                      <p className="text-sm text-gray-400">
                        {p.age} yrs, {p.gender}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{p.current_seat_status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            disabled={cancelling || selectedPassengers.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelling ? (
              <ButtonLoader />
            ) : (
              <>
                <FiXCircle /> Cancel Selected ({selectedPassengers.length})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
