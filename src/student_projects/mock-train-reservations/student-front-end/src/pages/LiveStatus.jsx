import React, { useState, useEffect, useRef } from 'react';
import { trainApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  Train,
  Search,
  MapPin,
  Clock,
  Loader2,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  History,
  X,
} from 'lucide-react';

const LiveStatus = () => {
  const [trainInput, setTrainInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentTrainSearches');
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
    localStorage.setItem('recentTrainSearches', JSON.stringify(updated));
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
      const response = await trainApi.getLiveStatus(searchValue);
      const result = response.data || response;
      console.log('Live Status API Response:', result);
      setLiveData(result);
      if (!result?.live_status || result.live_status.length === 0) {
        toast.error('Train not found or no live status available');
      } else {
        const trainName = result.live_status[0]?.station_name || searchValue;
        saveToRecentSearches(searchValue, trainName);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch live status');
      setLiveData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (train) => {
    setTrainInput(train.number || train.input);
    setShowSuggestions(false);
    handleSearch(null, train.number || train.input);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const currentList = trainInput.length >= 2 && suggestions.length > 0 
      ? suggestions.map(s => ({ number: s.train_number, name: s.train_name, input: s.train_number }))
      : recentSearches;

    if (currentList.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % currentList.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + currentList.length) % currentList.length);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        const selected = currentList[selectedIndex];
        if (selected) {
          handleSuggestionClick(selected);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentTrainSearches');
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

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions, recentSearches]);

  const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s?.includes('on time') || s?.includes('arrived')) {
      return 'text-green-600 bg-green-50';
    } else if (s?.includes('delay') || s?.includes('late')) {
      return 'text-yellow-600 bg-yellow-50';
    } else if (s?.includes('cancel')) {
      return 'text-red-600 bg-red-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase();
    if (s?.includes('on time') || s?.includes('arrived')) {
      return <CheckCircle className="w-4 h-4" />;
    } else if (s?.includes('delay') || s?.includes('late')) {
      return <AlertCircle className="w-4 h-4" />;
    } else if (s?.includes('cancel')) {
      return <XCircle className="w-4 h-4" />;
    }
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-xl">
          <Activity className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Live Train Status</h1>
          <p className="text-sm text-gray-500">Track your train in real-time</p>
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
              onKeyDown={handleKeyDown}
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
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${
                          idx === selectedIndex ? 'bg-primary-100' : 'hover:bg-primary-50'
                        }`}
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
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${
                          idx === selectedIndex ? 'bg-primary-100' : 'hover:bg-gray-50'
                        }`}
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
                Tracking...
              </>
            ) : (
              'Track Train'
            )}
          </button>
        </form>
      </div>

      {/* Live Status Result */}
      {liveData?.live_status && liveData.live_status.length > 0 && (
        <div className="card animate-slide-up">
          {/* Train Info Header */}
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl mb-6">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Train className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                Train {liveData.train_input}
              </h2>
              <p className="text-gray-600">
                Live Running Status
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="font-medium text-gray-900">
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Live Status Timeline */}
          <div className="space-y-4">
            {liveData.live_status.map((stop, index) => {
              const isCurrentStation = stop.is_current_station === true;
              const hasPassed = stop.live_status === 'DEPARTED';
              const isHalted = stop.live_status === 'HALTED';
              const isUpcoming = stop.live_status === 'UPCOMING';
              
              return (
                <div
                  key={index}
                  className={`relative pl-8 pb-4 ${
                    index < liveData.live_status.length - 1
                      ? 'border-l-2 border-gray-200 ml-3'
                      : 'ml-3'
                  } ${isCurrentStation ? 'border-l-green-400' : ''}`}
                >
                  {/* Timeline Dot */}
                  <div
                    className={`absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center ${
                      isCurrentStation
                        ? 'bg-green-500 ring-4 ring-green-100 animate-pulse'
                        : hasPassed
                        ? 'bg-blue-500'
                        : isUpcoming
                        ? 'bg-gray-300'
                        : 'bg-yellow-500'
                    }`}
                  >
                    {isCurrentStation && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>

                  {/* Station Info */}
                  <div
                    className={`p-4 rounded-xl ${
                      isCurrentStation ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin
                          className={`w-4 h-4 ${
                            isCurrentStation ? 'text-green-600' : 'text-gray-400'
                          }`}
                        />
                        <div>
                          <p
                            className={`font-semibold ${
                              isCurrentStation ? 'text-green-700' : 'text-gray-900'
                            }`}
                          >
                            {stop.station_name}
                          </p>
                          <p className="text-xs text-gray-500">{stop.station_code} • Seq: {stop.station_sequence}</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          isCurrentStation 
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : hasPassed
                            ? 'bg-blue-100 text-blue-700'
                            : isHalted
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isCurrentStation && <CheckCircle className="w-3 h-3" />}
                        {stop.live_status}
                      </span>
                    </div>

                    {/* Time Info */}
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Scheduled Arrival</p>
                          <p className="font-mono font-bold text-sm text-gray-900">
                            {stop.arrival || '--:--'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Actual Arrival</p>
                          <p className="font-mono font-bold text-sm text-blue-600">
                            {stop.arrival_ts ? new Date(stop.arrival_ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Scheduled Departure</p>
                          <p className="font-mono font-bold text-sm text-gray-900">
                            {stop.departure || '--:--'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Actual Departure</p>
                          <p className="font-mono font-bold text-sm text-blue-600">
                            {stop.departure_ts ? new Date(stop.departure_ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Delay Info */}
                    <div className="mt-3 p-2 bg-white rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Delay Status:</span>
                        <span
                          className={`font-mono font-bold text-sm ${
                            stop.delay_minutes > 0 ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {stop.delay_minutes > 0 
                            ? `+${stop.delay_minutes} min (Late)` 
                            : 'On Time ✓'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-600">Day of Journey:</span>
                        <span className="font-semibold text-xs text-gray-800">Day {stop.running_day}</span>
                      </div>
                    </div>

                    {/* Current Station Indicator */}
                    {isCurrentStation && (
                      <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm font-bold">🚂 Train is currently at this station</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!liveData && !isLoading && (
        <div className="card text-center py-12">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Track Your Train
          </h3>
          <p className="text-gray-500">
            Enter train number or name to see real-time running status
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveStatus;
