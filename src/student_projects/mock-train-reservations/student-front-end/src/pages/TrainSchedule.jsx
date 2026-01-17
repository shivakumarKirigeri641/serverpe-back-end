import React, { useState, useEffect, useRef } from 'react';
import { trainApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  Train,
  Search,
  MapPin,
  Clock,
  Loader2,
  Calendar,
  History,
  X,
} from 'lucide-react';

const TrainSchedule = () => {
  const [trainInput, setTrainInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentScheduleSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load recent searches', e);
      }
    }
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveToRecentSearches = (input, trainName) => {
    const newSearch = { input, name: trainName, timestamp: Date.now() };
    const updated = [newSearch, ...recentSearches.filter(s => s.input !== input)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentScheduleSearches', JSON.stringify(updated));
  };

  const handleSearch = async (e, searchValue = trainInput) => {
    if (e) e.preventDefault();

    if (!searchValue || searchValue.length < 2) {
      toast.error('Please enter a valid train number or name');
      return;
    }

    setShowSuggestions(false);
    setIsLoading(true);
    try {
      const response = await trainApi.getSchedule(searchValue);
      const schedule = response.data?.schedule || response.schedule;
      setScheduleData(schedule);
      if (!schedule) {
        toast.error('Train not found');
      } else {
        saveToRecentSearches(searchValue, schedule.train_name);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch train schedule');
      setScheduleData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (train) => {
    setTrainInput(train.number || train.input);
    setShowSuggestions(false);
    handleSearch(null, train.number || train.input);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentScheduleSearches');
    toast.success('Recent searches cleared');
  };

  // Fetch autocomplete suggestions from API
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await trainApi.autocomplete(query);
      const apiSuggestions = response.data?.suggestions || response.suggestions || [];
      setSuggestions(apiSuggestions);
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounce autocomplete API calls
  useEffect(() => {
    if (!showSuggestions) return;
    
    const timeoutId = setTimeout(() => {
      if (trainInput && trainInput.length >= 2) {
        fetchSuggestions(trainInput);
      } else {
        setSuggestions([]);
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [trainInput, showSuggestions]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 rounded-xl">
          <Calendar className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Train Schedule</h1>
          <p className="text-sm text-gray-500">View complete train schedule and stops</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative" ref={dropdownRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <input
              ref={inputRef}
              type="text"
              value={trainInput}
              onChange={(e) => setTrainInput(e.target.value.toUpperCase())}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Enter train number or name (e.g., 12951 or RAJDHANI)"
              className="input-field pl-12 font-mono text-lg tracking-wider"
              autoComplete="off"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50">
                {loadingSuggestions ? (
                  <div className="p-4 text-center text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    <p className="text-sm mt-2">Searching trains...</p>
                  </div>
                ) : trainInput.length >= 2 && suggestions.length > 0 ? (
                  /* API Suggestions */
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <Train className="w-3.5 h-3.5" />
                      Matching Trains
                    </div>
                    {suggestions.map((train, idx) => (
                      <button
                        key={`suggestion-${idx}`}
                        type="button"
                        onClick={() => handleSuggestionClick({ number: train.train_number, input: train.train_number, name: train.train_name })}
                        className="w-full text-left px-3 py-2.5 hover:bg-primary-50 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                            <Train className="w-4 h-4 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-mono font-bold text-sm text-gray-900">{train.train_number}</p>
                            <p className="text-xs text-gray-500 truncate">{train.train_name}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : trainInput.length >= 2 && suggestions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">No trains found</p>
                  </div>
                ) : recentSearches.length > 0 ? (
                  /* Recent Searches */
                  <div className="p-2">
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        <History className="w-3.5 h-3.5" />
                        Recent Searches
                      </div>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((train, idx) => (
                      <button
                        key={`recent-${idx}`}
                        type="button"
                        onClick={() => handleSuggestionClick(train)}
                        className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-primary-100 transition-colors">
                            <Train className="w-4 h-4 text-gray-600 group-hover:text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-mono font-bold text-sm text-gray-900">{train.input}</p>
                            {train.name && (
                              <p className="text-xs text-gray-500 truncate">{train.name}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">Start typing to search trains...</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Searching...
              </>
            ) : (
              'Get Schedule'
            )}
          </button>
        </form>
      </div>

      {/* Schedule Result */}
      {scheduleData && (
        <div className="card animate-slide-up">
          {/* Train Info Header */}
          <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl mb-6">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Train className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {scheduleData.train_name}
              </h2>
              <p className="text-gray-600">
                #{scheduleData.train_number} • {scheduleData.train_type || 'Express'}
              </p>
            </div>
          </div>

          {/* Run Days */}
          {scheduleData.run_days && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Runs on</p>
              <div className="flex gap-2 flex-wrap">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                  const isRunning = scheduleData.run_days?.[dayKeys[idx]];
                  return (
                    <span
                      key={day}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isRunning
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Schedule Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    #
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Station
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                    Arrival
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                    Departure
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                    Halt
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                    Day
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                    Distance
                  </th>
                </tr>
              </thead>
              <tbody>
                {(scheduleData.schedule || scheduleData.stops || []).map((stop, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {stop.station_sequence || index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {stop.station_name}
                          </p>
                          <p className="text-xs text-gray-500">{stop.station_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-gray-900">
                        {stop.arrival || stop.arrival_time || '--:--'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono text-gray-900">
                        {stop.departure || stop.departure_time || '--:--'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-gray-600">
                        {stop.halt || stop.halt_minutes ? `${stop.halt || stop.halt_minutes} min` : '--'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                        Day {stop.day || stop.day_number || 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm text-gray-600">
                        {stop.kilometer || stop.distance || 0} km
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* No Schedule */}
          {(!scheduleData.schedule && !scheduleData.stops) && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No schedule data available</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!scheduleData && !isLoading && (
        <div className="card text-center py-12">
          <Train className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Search for a Train
          </h3>
          <p className="text-gray-500">
            Enter train number or name to view its complete schedule
          </p>
        </div>
      )}
    </div>
  );
};

export default TrainSchedule;
