import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { masterApi, trainApi } from "../services/api";
import toast from "react-hot-toast";
import { format, addDays } from "date-fns";
import {
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  Train,
  Clock,
  ArrowLeftRight,
  Filter,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const SearchTrains = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Form state
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [isLoading, setIsLoading] = useState(false);

  // Data state
  const [stations, setStations] = useState([]);
  const [searchResults, setSearchResults] = useState(null);

  // Input state for typing
  const [sourceInput, setSourceInput] = useState("");
  const [destInput, setDestInput] = useState("");
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [selectedDestIndex, setSelectedDestIndex] = useState(0);

  // Accordion state - track which train is expanded
  const [expandedTrain, setExpandedTrain] = useState(null);

  // Selected seat for booking (trainKey -> {coach_code, seat_type, fare, seats})
  const [selectedSeat, setSelectedSeat] = useState({});

  // Refs for click outside handling
  const sourceRef = useRef(null);
  const destRef = useRef(null);
  const destInputRef = useRef(null);
  const dateInputRef = useRef(null);

  // Clear previous search state on mount - start fresh each time
  useEffect(() => {
    sessionStorage.removeItem("trainSearchState");
  }, []);

  // Fetch stations on mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await masterApi.getStations();
        setStations(response.data?.stations || []);
      } catch (error) {
        toast.error("Failed to load stations");
      }
    };
    fetchStations();
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sourceRef.current && !sourceRef.current.contains(event.target)) {
        setShowSourceDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(event.target)) {
        setShowDestDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter stations based on search input
  const filteredSourceStations = useMemo(() => {
    if (!sourceInput) return stations.slice(0, 10);
    return stations.filter(
      (s) =>
        s.station_name?.toLowerCase().includes(sourceInput.toLowerCase()) ||
        s.code?.toLowerCase().includes(sourceInput.toLowerCase())
    );
  }, [stations, sourceInput]);

  const filteredDestStations = useMemo(() => {
    if (!destInput) return stations.slice(0, 10);
    return stations.filter(
      (s) =>
        s.station_name?.toLowerCase().includes(destInput.toLowerCase()) ||
        s.code?.toLowerCase().includes(destInput.toLowerCase())
    );
  }, [stations, destInput]);

  // Reset selected indices when filtered stations change
  useEffect(() => {
    setSelectedSourceIndex(0);
  }, [filteredSourceStations]);

  useEffect(() => {
    setSelectedDestIndex(0);
  }, [filteredDestStations]);

  const handleSourceSelect = (station) => {
    setSource(station.code);
    setSourceInput(`${station.station_name} (${station.code})`);
    setShowSourceDropdown(false);
    // Focus destination input
    setTimeout(() => destInputRef.current?.focus(), 100);
  };

  const handleDestSelect = (station) => {
    setDestination(station.code);
    setDestInput(`${station.station_name} (${station.code})`);
    setShowDestDropdown(false);
    // Focus date input
    setTimeout(() => dateInputRef.current?.focus(), 100);
  };

  const clearSource = () => {
    setSource("");
    setSourceInput("");
  };

  const clearDest = () => {
    setDestination("");
    setDestInput("");
  };

  const handleSourceKeyDown = (e) => {
    if (!showSourceDropdown || filteredSourceStations.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSourceIndex(prev => (prev + 1) % filteredSourceStations.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSourceIndex(prev => (prev - 1 + filteredSourceStations.length) % filteredSourceStations.length);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        const selected = filteredSourceStations[selectedSourceIndex];
        if (selected) {
          handleSourceSelect(selected);
        }
        break;
      case 'Escape':
        setShowSourceDropdown(false);
        break;
      default:
        break;
    }
  };

  const handleDestKeyDown = (e) => {
    if (!showDestDropdown || filteredDestStations.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedDestIndex(prev => (prev + 1) % filteredDestStations.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedDestIndex(prev => (prev - 1 + filteredDestStations.length) % filteredDestStations.length);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        const selected = filteredDestStations[selectedDestIndex];
        if (selected) {
          handleDestSelect(selected);
        }
        break;
      case 'Escape':
        setShowDestDropdown(false);
        break;
      default:
        break;
    }
  };

  const handleSwapStations = () => {
    const tempCode = source;
    const tempInput = sourceInput;
    setSource(destination);
    setSourceInput(destInput);
    setDestination(tempCode);
    setDestInput(tempInput);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!source || !destination) {
      toast.error('Please select both source and destination stations');
      return;
    }

    if (source === destination) {
      toast.error('Source and destination cannot be the same');
      return;
    }

    setIsLoading(true);
    try {
      const response = await trainApi.searchTrains(source, destination, date);
      setSearchResults(response.data);
      if (response.data?.trains?.length === 0) {
        toast('No trains found for this route', { icon: '🚂' });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to search trains');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTrain = (train, trainKey) => {
    // Check if user is authenticated before allowing booking
    if (!isAuthenticated) {
      toast.error('Please login to book tickets');
      navigate('/login', { state: { from: '/search' } });
      return;
    }

    const selection = selectedSeat[trainKey];
    navigate("/dashboard/book", {
      state: {
        train,
        source,
        destination,
        date,
        sourceName: stations.find((s) => s.code === source)?.station_name,
        destinationName: stations.find((s) => s.code === destination)?.station_name,
        selectedCoach: selection?.coach_code || null,
        selectedReservationType: selection?.seat_type || null,
        selectedFare: selection?.fare || null,
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Form */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-100 rounded-xl">
            <Search className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Search Trains</h1>
            <p className="text-sm text-gray-500">Find trains between stations</p>
          </div>
        </div>

        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
            {/* Source Station */}
            <div className="relative" ref={sourceRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Station
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  type="text"
                  value={sourceInput}
                  onChange={(e) => {
                    setSourceInput(e.target.value);
                    setSource("");
                    setShowSourceDropdown(true);
                  }}
                  onFocus={() => setShowSourceDropdown(true)}
                  onKeyDown={handleSourceKeyDown}
                  placeholder="Type to search..."
                  className="input-field pl-12 pr-10"
                />
                {sourceInput && (
                  <button
                    type="button"
                    onClick={clearSource}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full z-10"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Source Dropdown */}
              {showSourceDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                  {filteredSourceStations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No stations found
                    </div>
                  ) : (
                    filteredSourceStations.map((station) => (
                      <button
                        key={station.code}
                        type="button"
                        onClick={() => handleSourceSelect(station)}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors ${
                          source === station.code 
                            ? "bg-primary-50" 
                            : filteredSourceStations.indexOf(station) === selectedSourceIndex
                            ? "bg-primary-100"
                            : "hover:bg-primary-50"
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

            {/* Swap Button */}
            <div className="hidden lg:flex items-center justify-center">
              <button
                type="button"
                onClick={handleSwapStations}
                className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors hover:rotate-180 duration-300"
              >
                <ArrowLeftRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Destination Station */}
            <div className="relative" ref={destRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Station
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  ref={destInputRef}
                  type="text"
                  value={destInput}
                  onChange={(e) => {
                    setDestInput(e.target.value);
                    setDestination("");
                    setShowDestDropdown(true);
                  }}
                  onFocus={() => setShowDestDropdown(true)}
                  onKeyDown={handleDestKeyDown}
                  placeholder="Type to search..."
                  className="input-field pl-12 pr-10"
                />
                {destInput && (
                  <button
                    type="button"
                    onClick={clearDest}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full z-10"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Destination Dropdown */}
              {showDestDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                  {filteredDestStations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No stations found
                    </div>
                  ) : (
                    filteredDestStations.map((station) => (
                      <button
                        key={station.code}
                        type="button"
                        onClick={() => handleDestSelect(station)}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors ${
                          destination === station.code 
                            ? "bg-primary-50" 
                            : filteredDestStations.indexOf(station) === selectedDestIndex
                            ? "bg-primary-100"
                            : "hover:bg-primary-50"
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

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Journey Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={dateInputRef}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="input-field pl-12"
                />
              </div>
            </div>
          </div>

          {/* Mobile Swap Button */}
          <div className="lg:hidden flex justify-center my-4">
            <button
              type="button"
              onClick={handleSwapStations}
              className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ArrowLeftRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search Trains
              </>
            )}
          </button>
        </form>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-4 animate-slide-up">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {searchResults.trains_count || 0} Trains Found
              </h2>
              <p className="text-sm text-gray-500">
                {searchResults.query?.source} → {searchResults.query?.destination} on{" "}
                {format(new Date(searchResults.query?.doj), "dd MMM yyyy")}
              </p>
            </div>
            <button className="btn-ghost flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Train Accordion List */}
          {searchResults.trains?.length > 0 ? (
            <div className="space-y-3">
              {searchResults.trains.map((train, index) => {
                const trainKey = `${train.train_number}-${index}`;
                const isExpanded = expandedTrain === trainKey;

                // Filter only available seats (not waitlist, not zero, and has fare)
                const availableSeats = train.availability?.filter((item) => {
                  const seats = item?.seats;
                  if (!seats) return false;
                  if (item.fare == null || item.fare === '' || item.fare === 0) return false;
                  const isWaitlist = seats.toString().startsWith("WTL");
                  const seatCount = parseInt(seats);
                  return !isWaitlist && seatCount > 0;
                }) || [];

                // Get unique coach codes and reservation types for table
                const coachCodes = [...new Set(availableSeats.map((item) => item.coach_code))];
                const reservationTypes = [...new Set(availableSeats.map((item) => item.seat_type))];

                // Create a lookup map for quick access: {coach_code: {seat_type: item}}
                const availabilityMap = {};
                availableSeats.forEach((item) => {
                  if (!availabilityMap[item.coach_code]) {
                    availabilityMap[item.coach_code] = {};
                  }
                  availabilityMap[item.coach_code][item.seat_type] = item;
                });

                const hasAvailableSeats = availableSeats.length > 0;
                const currentSelection = selectedSeat[trainKey];

                return (
                  <div
                    key={trainKey}
                    className="card overflow-hidden transition-all duration-300"
                  >
                    {/* Accordion Header - Click to expand/collapse */}
                    <div
                      className="flex flex-col lg:flex-row lg:items-center gap-4 cursor-pointer"
                      onClick={() => setExpandedTrain(isExpanded ? null : trainKey)}
                    >
                      {/* Train Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary-100 rounded-lg">
                            <Train className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {train.train_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              #{train.train_number} • {train.train_type || "Express"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Timing */}
                      <div className="flex items-center gap-4 lg:gap-8">
                        <div className="text-center">
                          <p className="text-xl font-bold text-gray-900">
                            {train.departure}
                          </p>
                          <p className="text-xs text-gray-500">{train.source || source}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <p className="text-xs text-gray-400 mb-1">
                            {train.duration || `${train.km} km`}
                          </p>
                          <div className="w-20 lg:w-32 h-0.5 bg-gray-200 relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-600 rounded-full" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-600 rounded-full" />
                          </div>
                          <Clock className="w-3 h-3 text-gray-400 mt-1" />
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-gray-900">
                            {train.arrival}
                          </p>
                          <p className="text-xs text-gray-500">{train.destination || destination}</p>
                        </div>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <div className="flex items-center gap-2">
                        {hasAvailableSeats && (
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            {availableSeats.length} Available
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Accordion Content - Expanded Section */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 mt-4 pt-4 animate-fade-in">
                        {/* Available Seats Table */}
                        {hasAvailableSeats ? (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-gray-500 mb-3">
                              SELECT SEAT - CLICK TO CHOOSE (Available Seats Only)
                            </p>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr>
                                    <th className="p-3 bg-gray-100 text-left text-xs font-semibold text-gray-600 border border-gray-200 rounded-tl-lg">
                                      Reservation Type
                                    </th>
                                    {coachCodes.map((coachCode) => (
                                      <th
                                        key={coachCode}
                                        className="p-3 bg-gray-100 text-center text-xs font-semibold text-gray-600 border border-gray-200"
                                      >
                                        {coachCode}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {reservationTypes.map((resType) => (
                                    <tr key={resType}>
                                      <td className="p-3 bg-gray-50 text-sm font-medium text-gray-700 border border-gray-200">
                                        {resType}
                                      </td>
                                      {coachCodes.map((coachCode) => {
                                        const item = availabilityMap[coachCode]?.[resType];
                                        const isSelected =
                                          currentSelection?.coach_code === coachCode &&
                                          currentSelection?.seat_type === resType;

                                        if (!item) {
                                          return (
                                            <td
                                              key={`${coachCode}-${resType}`}
                                              className="p-3 text-center text-sm text-gray-300 border border-gray-200 bg-gray-50"
                                            >
                                              —
                                            </td>
                                          );
                                        }

                                        return (
                                          <td
                                            key={`${coachCode}-${resType}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedSeat((prev) => ({
                                                ...prev,
                                                [trainKey]: {
                                                  coach_code: coachCode,
                                                  seat_type: resType,
                                                  fare: item.fare || 0,
                                                  seats: item.seats,
                                                },
                                              }));
                                            }}
                                            className={`p-3 text-center border border-gray-200 cursor-pointer transition-all ${
                                              isSelected
                                                ? "bg-primary-600 text-white ring-2 ring-primary-400 ring-offset-1"
                                                : "bg-green-50 hover:bg-green-100"
                                            }`}
                                          >
                                            <p className={`text-sm font-bold ${isSelected ? "text-white" : "text-green-600"}`}>
                                              {item.seats} Avl
                                            </p>
                                            <p className={`text-xs mt-1 ${isSelected ? "text-green-100" : "text-gray-500"}`}>
                                              {item.fare != null && item.fare !== '' ? `₹${item.fare}` : 'Price N/A'}
                                            </p>
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Selection Summary */}
                            {currentSelection && (
                              <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">Selected:</span>
                                  <span className="font-semibold text-primary-700">
                                    {currentSelection.coach_code} - {currentSelection.seat_type}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    ({currentSelection.seats} seats{currentSelection.fare ? ` @ ₹${currentSelection.fare}` : ''})
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSeat((prev) => {
                                      const newState = { ...prev };
                                      delete newState[trainKey];
                                      return newState;
                                    });
                                  }}
                                  className="text-xs text-gray-500 hover:text-red-500 underline"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-sm text-gray-500">
                              No seats available for this train
                            </p>
                          </div>
                        )}

                        {/* Book Now Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTrain(train, trainKey);
                          }}
                          disabled={!hasAvailableSeats || !currentSelection}
                          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                            hasAvailableSeats && currentSelection
                              ? "bg-primary-600 text-white hover:bg-primary-700"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {!hasAvailableSeats ? (
                            "No Seats Available"
                          ) : !currentSelection ? (
                            "Select a Seat to Continue"
                          ) : (
                            <>
                              Book {currentSelection.coach_code} - {currentSelection.seat_type}
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Legacy available_classes display as fallback */}
                    {!train.availability && train.available_classes && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {train.available_classes.map((cls) => (
                          <span
                            key={cls}
                            className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card text-center py-12">
              <Train className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No trains found
              </h3>
              <p className="text-gray-500">
                Try different stations or dates for your journey
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchTrains;
