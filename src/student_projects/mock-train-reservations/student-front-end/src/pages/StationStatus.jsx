import React, { useState, useEffect, useMemo, useRef } from 'react';
import { trainApi, masterApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  Train,
  MapPin,
  Clock,
  Loader2,
  Building2,
  X,
  ChevronDown,
  ChevronUp,
  Navigation,
} from 'lucide-react';

const StationStatus = () => {
  const [stationCode, setStationCode] = useState('');
  const [stationInput, setStationInput] = useState('');
  const [nextHours, setNextHours] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [trainsData, setTrainsData] = useState(null);
  const [stations, setStations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({ departing: true, arriving: true });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const inputRef = useRef(null);
  const firstTimeFilterRef = useRef(null);

  // Fetch stations on mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await masterApi.getStations();
        setStations(response.data?.stations || []);
      } catch (error) {
        console.error('Failed to load stations');
      }
    };
    fetchStations();
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter stations based on input
  const filteredStations = useMemo(() => {
    if (!stationInput) return stations.slice(0, 10);
    return stations.filter(
      (s) =>
        s.station_name?.toLowerCase().includes(stationInput.toLowerCase()) ||
        s.code?.toLowerCase().includes(stationInput.toLowerCase())
    );
  }, [stations, stationInput]);

  // Reset selected index when filtered stations change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredStations]);

  const handleStationSelect = (station) => {
    setStationCode(station.code);
    setStationInput(`${station.station_name} (${station.code})`);
    setShowDropdown(false);
    // Focus first time filter button
    setTimeout(() => firstTimeFilterRef.current?.focus(), 100);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredStations.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredStations.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredStations.length) % filteredStations.length);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        const selected = filteredStations[selectedIndex];
        if (selected) {
          handleStationSelect(selected);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
      default:
        break;
    }
  };

  const clearStation = () => {
    setStationCode('');
    setStationInput('');
    setTrainsData(null);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleShowSchedule = async (train) => {
    setSelectedTrain(train);
    setShowScheduleModal(true);
    setLoadingSchedule(true);
    setScheduleData(null);

    try {
      const response = await trainApi.getSchedule(train.train_number);
      // API interceptor already unwraps response.data, so response is the actual data
      const data = response.data || response;
      console.log('data:', data)
      console.log('Schedule data structure:', data);
      console.log('Schedule array:', data?.schedule);
      setScheduleData(data);
    } catch (error) {
      console.error('Schedule fetch error:', error);
      toast.error(error.message || 'Failed to load train schedule');
      setShowScheduleModal(false);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedTrain(null);
    setScheduleData(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!stationCode) {
      toast.error('Please select a station');
      return;
    }

    setIsLoading(true);
    try {
      const response = await trainApi.getTrainsAtStation(stationCode, nextHours);
      const result = response.data || response;
      console.log('Station trains data:', result);
      setTrainsData(result);
      if (!result?.trains || result.trains.length === 0) {
        toast('No trains found at this station in next ' + nextHours + ' hours', { icon: '🚉' });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch station trains');
      setTrainsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-xl">
          <Building2 className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Station Status</h1>
          <p className="text-sm text-gray-500">View all trains at a station</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative" ref={inputRef}>
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                type="text"
                value={stationInput}
                onChange={(e) => {
                  setStationInput(e.target.value);
                  setStationCode('');
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search station by name or code..."
                className="input-field pl-12 pr-10"
              />
              {stationInput && (
                <button
                  type="button"
                  onClick={clearStation}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full z-10"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}

            {/* Station Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                {filteredStations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No stations found
                  </div>
                ) : (
                  filteredStations.map((station, idx) => (
                    <button
                      key={station.code}
                      type="button"
                      onClick={() => handleStationSelect(station)}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors ${
                        stationCode === station.code 
                          ? 'bg-primary-50' 
                          : idx === selectedIndex
                          ? 'bg-primary-100'
                          : 'hover:bg-primary-50'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {station.station_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {station.code} • {station.zone}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !stationCode}
              className="btn-primary px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'View Trains'
              )}
            </button>
          </div>
          
          {/* Time Filter */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Show trains for next:</span>
            <div className="flex gap-2">
              {[2, 4, 8].map((hours, idx) => (
                <button
                  key={hours}
                  ref={idx === 0 ? firstTimeFilterRef : null}
                  type="button"
                  onClick={() => setNextHours(hours)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    nextHours === hours
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {hours} Hours
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Trains at Station Result */}
      {trainsData?.trains && trainsData.trains.length > 0 && (
        <div className="card animate-slide-up">
          {/* Station Info Header */}
          <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl mb-6">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {trainsData.station_code}
              </h2>
              <p className="text-gray-600">
                {trainsData.trains_count || trainsData.trains.length} trains in next {trainsData.next_hours || nextHours} hours
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Updated</p>
              <p className="font-medium text-gray-900">
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Trains List - Grouped by Section */}
          <div className="space-y-5">
            {(() => {
              const departingTrains = trainsData.trains.filter(t => t.section_type === 'DEPARTING');
              const arrivingTrains = trainsData.trains.filter(t => t.section_type === 'ARRIVING');
              
              return (
                <>
                  {/* Departing Trains Section */}
                  {departingTrains.length > 0 && (
                    <div className="border border-blue-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection('departing')}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Train className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-blue-900">
                              Departing Trains
                            </h3>
                            <p className="text-sm text-blue-600">{departingTrains.length} trains departing</p>
                          </div>
                        </div>
                        {expandedSections.departing ? (
                          <ChevronUp className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-blue-600" />
                        )}
                      </button>
                      
                      {expandedSections.departing && (
                        <div className="p-4 bg-white space-y-3">{departingTrains.map((train, index) => {
                          const hasDeparted = new Date(train.event_time) < new Date();
                          
                          return (
                            <div
                              key={`dep-${index}`}
                              className={`p-4 rounded-lg transition-all border-l-4 relative ${
                                hasDeparted 
                                  ? 'bg-blue-50 border-blue-400 hover:bg-blue-100' 
                                  : 'bg-indigo-50 border-indigo-400 hover:bg-indigo-100'
                              }`}
                            >
                              {/* Show Schedule Button */}
                              <button
                                onClick={() => handleShowSchedule(train)}
                                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:text-blue-600 transition-colors shadow-sm group"
                                title="Show Train Schedule"
                              >
                                <Navigation className="w-3.5 h-3.5 group-hover:text-blue-600" />
                                <span>Schedule</span>
                              </button>

                              <div className="flex items-start justify-between pr-24">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    hasDeparted ? 'bg-blue-100' : 'bg-indigo-100'
                                  }`}>
                                    <Train className={`w-5 h-5 ${
                                      hasDeparted ? 'text-blue-600' : 'text-indigo-600'
                                    }`} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-gray-900">
                                        {train.train_name}
                                      </h3>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                        hasDeparted 
                                          ? 'bg-blue-200 text-blue-800' 
                                          : 'bg-indigo-200 text-indigo-800'
                                      }`}>
                                        {hasDeparted ? 'DEPARTED' : 'DEPARTING'}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      #{train.train_number} • {train.train_type || 'Express'} • Day {train.running_day}
                                    </p>
                                  </div>
                                </div>

                                {/* Time Info */}
                                <div className="text-right">
                                  <div className="flex items-center gap-2 text-sm mb-1">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="font-mono font-bold text-gray-900">
                                      {train.scheduled_time || '--:--'}
                                    </span>
                                  </div>
                                  <p className={`text-xs font-semibold ${
                                    hasDeparted ? 'text-blue-700' : 'text-indigo-700'
                                  }`}>
                                    {train.relative_time || 'Unknown'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Arriving Trains Section */}
                  {arrivingTrains.length > 0 && (
                    <div className="border border-emerald-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection('arriving')}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Train className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-emerald-900">
                              Arriving Trains
                            </h3>
                            <p className="text-sm text-emerald-600">{arrivingTrains.length} trains arriving</p>
                          </div>
                        </div>
                        {expandedSections.arriving ? (
                          <ChevronUp className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-emerald-600" />
                        )}
                      </button>
                      
                      {expandedSections.arriving && (
                        <div className="p-4 bg-white space-y-3">
                        {arrivingTrains.map((train, index) => {
                          const hasArrived = new Date(train.event_time) < new Date();
                          
                          return (
                            <div
                              key={`arr-${index}`}
                              className={`p-4 rounded-lg transition-all border-l-4 relative ${
                                hasArrived 
                                  ? 'bg-amber-50 border-amber-400 hover:bg-amber-100' 
                                  : 'bg-emerald-50 border-emerald-400 hover:bg-emerald-100'
                              }`}
                            >
                              {/* Show Schedule Button */}
                              <button
                                onClick={() => handleShowSchedule(train)}
                                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:text-emerald-600 transition-colors shadow-sm group"
                                title="Show Train Schedule"
                              >
                                <Navigation className="w-3.5 h-3.5 group-hover:text-emerald-600" />
                                <span>Schedule</span>
                              </button>

                              <div className="flex items-start justify-between pr-24">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    hasArrived ? 'bg-amber-100' : 'bg-emerald-100'
                                  }`}>
                                    <Train className={`w-5 h-5 ${
                                      hasArrived ? 'text-amber-600' : 'text-emerald-600'
                                    }`} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-gray-900">
                                        {train.train_name}
                                      </h3>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                        hasArrived 
                                          ? 'bg-amber-200 text-amber-800' 
                                          : 'bg-emerald-200 text-emerald-800'
                                      }`}>
                                        {hasArrived ? 'ARRIVED' : 'ARRIVING'}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      #{train.train_number} • {train.train_type || 'Express'} • Day {train.running_day}
                                    </p>
                                  </div>
                                </div>

                                {/* Time Info */}
                                <div className="text-right">
                                  <div className="flex items-center gap-2 text-sm mb-1">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="font-mono font-bold text-gray-900">
                                      {train.scheduled_time || '--:--'}
                                    </span>
                                  </div>
                                  <p className={`text-xs font-semibold ${
                                    hasArrived ? 'text-amber-700' : 'text-emerald-700'
                                  }`}>
                                    {train.relative_time || 'Unknown'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Empty Result */}
      {trainsData && (!trainsData.trains || trainsData.trains.length === 0) && (
        <div className="card text-center py-12">
          <Train className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Trains Found
          </h3>
          <p className="text-gray-500">
            No trains are currently scheduled at this station
          </p>
        </div>
      )}

      {/* Initial Empty State */}
      {!trainsData && !isLoading && (
        <div className="card text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Search for a Station
          </h3>
          <p className="text-gray-500">
            Select a station to view all trains passing through it
          </p>
        </div>
      )}

      {/* Train Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Train className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedTrain?.train_name || 'Train Schedule'}
                  </h2>
                  <p className="text-sm text-blue-100">
                    Train #{selectedTrain?.train_number}
                  </p>
                </div>
              </div>
              <button
                onClick={closeScheduleModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {(() => {
                console.log('Modal render - loadingSchedule:', loadingSchedule);
                console.log('Modal render - scheduleData:', scheduleData);
                console.log('Modal render - scheduleData.schedule:', scheduleData?.schedule);
                console.log('Modal render - is array:', Array.isArray(scheduleData?.schedule));
                console.log('Modal render - length:', scheduleData?.schedule?.schedule.length);
                return null;
              })()}
              {loadingSchedule ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-600">Loading schedule...</p>
                </div>
              ) : scheduleData?.schedule?.schedule && Array.isArray(scheduleData?.schedule?.schedule) && scheduleData?.schedule?.schedule?.length > 0 ? (
                <div className="space-y-2">
                  {scheduleData.schedule?.schedule.map((station, index) => {
                    const isSelectedStation = station.station_code === stationCode;
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 transition-all ${
                          isSelectedStation
                            ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-200'
                            : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              isSelectedStation
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-300 text-gray-700'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className={`font-semibold ${
                                  isSelectedStation ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                  {station.station_name}
                                </h4>
                                {isSelectedStation && (
                                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                                    YOUR STATION
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-600">
                                  {station.station_code}
                                </p>
                                {station.distance !== undefined && station.distance !== null && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <p className="text-sm text-gray-600">
                                      {station.distance} km
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {station.arrival && (
                              <div className="flex items-center gap-2 text-sm mb-1">
                                <span className="text-gray-500">Arr:</span>
                                <span className="font-mono font-semibold text-gray-900">
                                  {station.arrival}
                                </span>
                              </div>
                            )}
                            {station.departure && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">Dep:</span>
                                <span className="font-mono font-semibold text-gray-900">
                                  {station.departure}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Train className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No schedule data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationStatus;
