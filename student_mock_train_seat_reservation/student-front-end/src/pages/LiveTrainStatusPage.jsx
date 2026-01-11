/**
 * ============================================================================
 * LIVE TRAIN STATUS PAGE
 * ============================================================================
 */

import { useState } from 'react';
import { getLiveTrainStatus } from '../services/api';
import { ButtonLoader } from '../components/Loader';
import { FiSearch, FiClock, FiMapPin, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LiveTrainStatusPage() {
  const [trainNumber, setTrainNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!trainNumber) {
      toast.error('Please enter a train number');
      return;
    }

    setLoading(true);
    try {
      const result = await getLiveTrainStatus(trainNumber);
      setStatus(result);
      toast.success('Live status fetched');
    } catch (err) {
      setError(err);
      toast.error(err.userMessage || 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Live Train Status</h1>
          <p className="text-gray-400">Track your train in real-time</p>
        </div>

        {/* Search Form */}
        <div className="glass-card p-6 mb-8">
          <form onSubmit={handleSearch}>
            <label className="block text-sm text-gray-400 mb-2">Train Number</label>
            <div className="flex gap-4">
              <input
                type="text"
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                placeholder="Enter train number"
                className="input-field flex-1"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? <ButtonLoader /> : <><FiSearch /> Track</>}
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

        {/* Live Status Display */}
        {status && (
          <div className="glass-card p-6 animate-slide-up">
            {/* Train Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <span className="text-4xl animate-bounce-slow">🚂</span>
                <div>
                  <h2 className="text-xl font-bold">Train #{status.train_number}</h2>
                  <p className="text-gray-400 text-sm">
                    Started: {status.start_date} | Current: {status.current_time}
                  </p>
                </div>
              </div>
              <div className="status-dot status-connected" />
            </div>

            {/* Station Timeline */}
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-gray-500" />

              <div className="space-y-4">
                {status.stations?.map((station, idx) => {
                  const isDeparted = station.live_status?.includes('Departed');
                  const isAtStation = station.live_status === 'At Station';
                  const isUpcoming = station.live_status?.includes('Arriving');

                  return (
                    <div
                      key={idx}
                      className={`relative pl-12 ${
                        isAtStation ? 'animate-pulse' : ''
                      }`}
                    >
                      {/* Station Marker */}
                      <div
                        className={`absolute left-2 w-6 h-6 rounded-full flex items-center justify-center ${
                          isDeparted
                            ? 'bg-green-500'
                            : isAtStation
                            ? 'bg-blue-500 ring-4 ring-blue-500/30'
                            : 'bg-gray-600'
                        }`}
                      >
                        {isDeparted && <FiCheckCircle className="text-white text-sm" />}
                        {isAtStation && <FiMapPin className="text-white text-sm" />}
                        {isUpcoming && <FiClock className="text-white text-sm" />}
                      </div>

                      {/* Station Card */}
                      <div
                        className={`p-4 rounded-xl ${
                          isAtStation
                            ? 'bg-blue-500/20 border border-blue-500/30'
                            : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{station.station_name}</p>
                            <p className="text-sm text-gray-400">{station.station_code}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-400">Arr:</span>
                              <span>{station.expected_arrival}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-400">Dep:</span>
                              <span>{station.expected_departure}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              isDeparted
                                ? 'bg-green-500/20 text-green-400'
                                : isAtStation
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {station.live_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
