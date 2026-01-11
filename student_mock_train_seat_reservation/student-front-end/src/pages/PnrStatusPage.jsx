/**
 * ============================================================================
 * PNR STATUS PAGE
 * ============================================================================
 */

import { useState } from 'react';
import { getPnrStatus } from '../services/api';
import { ButtonLoader } from '../components/Loader';
import { FiSearch, FiUser, FiClock, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function PnrStatusPage() {
  const [pnr, setPnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!pnr || pnr.length < 5) {
      toast.error('Please enter a valid PNR number');
      return;
    }

    setLoading(true);
    try {
      const result = await getPnrStatus(pnr);
      setStatus(result);
      toast.success('PNR status fetched successfully');
    } catch (err) {
      setError(err);
      toast.error(err.userMessage || 'Failed to fetch PNR status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">PNR Status</h1>
          <p className="text-gray-400">Check your booking status</p>
        </div>

        {/* Search Form */}
        <div className="glass-card p-6 mb-8">
          <form onSubmit={handleCheck}>
            <label className="block text-sm text-gray-400 mb-2">PNR Number</label>
            <div className="flex gap-4">
              <input
                type="text"
                value={pnr}
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                placeholder="Enter PNR number"
                className="input-field flex-1"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? <ButtonLoader /> : <><FiSearch /> Check</>}
              </button>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass-card p-4 mb-6 border-l-4 border-l-red-500">
            <p className="text-red-400">{error.userMessage}</p>
            {error.technicalMessage && (
              <p className="text-red-400/60 text-sm mt-1">{error.technicalMessage}</p>
            )}
          </div>
        )}

        {/* PNR Status Display */}
        {status && (
          <div className="glass-card p-6 animate-slide-up">
            {/* PNR Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <p className="text-sm text-gray-400">PNR Number</p>
                <p className="text-2xl font-bold text-blue-400">{status.pnr}</p>
              </div>
              <div
                className={`px-4 py-2 rounded-xl font-semibold ${
                  status.pnr_status === 'CONFIRMED'
                    ? 'bg-green-500/20 text-green-400'
                    : status.pnr_status === 'WAITLIST'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {status.pnr_status}
              </div>
            </div>

            {/* Journey Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <span className="text-xl">🚂</span>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Train</p>
                  <p className="font-semibold">
                    {status.train_name} ({status.train_number})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <FiClock className="text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Journey Date</p>
                  <p className="font-semibold">{status.date_of_journey}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <FiMapPin className="text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">From</p>
                  <p className="font-semibold">{status.source_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <FiMapPin className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">To</p>
                  <p className="font-semibold">{status.destination_name}</p>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiUser /> Passengers
              </h3>
              <div className="space-y-3">
                {status.passengers?.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-gray-400">
                          {p.age} yrs • {p.gender}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        p.status?.includes('CNF') || p.status?.includes('CONFIRMED')
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {p.status || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Fare */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-gray-400">Total Fare</span>
              <span className="text-2xl font-bold text-green-400">
                ₹{status.total_fare || '0'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
