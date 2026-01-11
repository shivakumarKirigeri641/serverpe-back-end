/**
 * ============================================================================
 * TRAIN SCHEDULE MODAL
 * ============================================================================
 * 
 * A popup dialog showing the complete schedule/route of a train.
 */

import { useState, useEffect } from 'react';
import { FiX, FiMapPin, FiClock, FiNavigation } from 'react-icons/fi';
import { getTrainSchedule } from '../services/api';
import { ButtonLoader } from './Loader';

export default function TrainScheduleModal({ trainNumber, trainName, onClose }) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (trainNumber) {
      fetchSchedule();
    }
  }, [trainNumber]);

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTrainSchedule(trainNumber);
      setSchedule(result.schedule || result);
    } catch (err) {
      setError(err?.userMessage || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl">
              🚂
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{trainName || `Train #${trainNumber}`}</h2>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <FiNavigation className="text-blue-400" /> Route & Schedule
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ButtonLoader />
              <p className="text-gray-400 mt-4">Loading schedule...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-red-400">{error}</p>
              <button 
                onClick={fetchSchedule}
                className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
              >
                Try again
              </button>
            </div>
          ) : schedule && Array.isArray(schedule) && schedule.length > 0 ? (
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500 opacity-30" />
              
              <div className="space-y-1">
                {schedule.map((stop, idx) => (
                  <div 
                    key={idx}
                    className="relative flex items-start gap-4 pl-10 py-3 hover:bg-white/5 rounded-xl transition-colors group"
                  >
                    {/* Station dot */}
                    <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 ${
                      idx === 0 
                        ? 'bg-green-500 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
                        : idx === schedule.length - 1 
                        ? 'bg-red-500 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                        : 'bg-slate-800 border-blue-400 group-hover:bg-blue-500'
                    }`} />

                    {/* Stop number */}
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-500">
                      {idx + 1}
                    </div>

                    {/* Station info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-400 text-xs bg-blue-500/10 px-2 py-0.5 rounded">
                          {stop.station_code || stop.code}
                        </span>
                        <span className="font-semibold text-white truncate">
                          {stop.station_name || stop.name}
                        </span>
                      </div>
                      {stop.halt_time && (
                        <p className="text-[10px] text-gray-500 mt-1">
                          Halt: {stop.halt_time}
                        </p>
                      )}
                    </div>

                    {/* Times */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-4">
                        {stop.arrival && (
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase">Arr</p>
                            <p className="text-sm font-bold text-white">{stop.arrival}</p>
                          </div>
                        )}
                        {stop.departure && (
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase">Dep</p>
                            <p className="text-sm font-bold text-white">{stop.departure}</p>
                          </div>
                        )}
                      </div>
                      {stop.day && (
                        <p className="text-[10px] text-orange-400 mt-1">Day {stop.day}</p>
                      )}
                    </div>

                    {/* Distance */}
                    {stop.distance != null && (
                      <div className="text-right w-16 flex-shrink-0">
                        <p className="text-[10px] text-gray-500">Distance</p>
                        <p className="text-xs text-gray-400">{stop.distance} km</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-400">No schedule data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
