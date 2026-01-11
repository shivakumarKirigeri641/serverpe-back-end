/**
 * ============================================================================
 * TRAIN SCHEDULE PAGE
 * ============================================================================
 */

import { useState } from 'react';
import { getTrainSchedule } from '../services/api';
import { ButtonLoader } from '../components/Loader';
import { FiSearch, FiClock, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function TrainSchedulePage() {
  const [trainNumber, setTrainNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setSchedule(null);

    if (!trainNumber) {
      toast.error('Please enter a train number');
      return;
    }

    setLoading(true);
    try {
      const result = await getTrainSchedule(trainNumber);
      setSchedule(result.train_schedule_details);
      toast.success('Schedule fetched successfully');
    } catch (err) {
      setError(err);
      toast.error(err.userMessage || 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4 pb-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Train Schedule</h1>
          <p className="text-gray-400">View complete schedule of any train</p>
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
                placeholder="Enter train number (e.g., 12301)"
                className="input-field flex-1"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? <ButtonLoader /> : <><FiSearch /> Search</>}
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

        {/* Schedule Display */}
        {schedule && (
          <div className="glass-card p-6 animate-slide-up">
            {/* Train Info */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <span className="text-4xl">🚂</span>
                <div>
                  <h2 className="text-2xl font-bold">{schedule.train_name}</h2>
                  <p className="text-gray-400">#{schedule.train_number} • {schedule.train_type}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {schedule.running_days?.map((day, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            {/* Coaches */}
            {schedule.coaches && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Coach Configuration</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(schedule.coaches).map(([coach, count]) => (
                    count > 0 && (
                      <span
                        key={coach}
                        className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm"
                      >
                        {coach}: {count}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Route & Timings</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">#</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Station</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Arrival</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Departure</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Day</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.schedule?.map((stop, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4">{stop.seq}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FiMapPin className="text-blue-400 flex-shrink-0" />
                            <div>
                              <p className="font-medium">{stop.station_name}</p>
                              <p className="text-xs text-gray-500">{stop.station_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <FiClock className="text-gray-500 text-sm" />
                            {stop.arrival}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <FiClock className="text-gray-500 text-sm" />
                            {stop.departure}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-sm">
                            Day {stop.day}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {stop.distance} km
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
