/**
 * ============================================================================
 * BOOK TICKET PAGE - Complete Booking Flow
 * ============================================================================
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStations, getCoachTypes, getReservationTypes, searchTrains, calculateFare, confirmTicket } from '../services/api';
import { PageLoader, ButtonLoader } from '../components/Loader';
import AutoSuggest from '../components/AutoSuggest';
import TrainScheduleModal from '../components/TrainScheduleModal';
import { FiSearch, FiMapPin, FiCalendar, FiUser, FiPlus, FiMinus, FiCheck, FiArrowRight, FiClock, FiNavigation } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function BookTicketPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Reference data
  const [stations, setStations] = useState([]);
  const [coachTypes, setCoachTypes] = useState([]);
  const [reservationTypes, setReservationTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [step, setStep] = useState(1); // 1:Search, 2:Select Train, 3:Passengers, 4:Confirm
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [doj, setDoj] = useState('');
  const [sourceSearch, setSourceSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  // Selected data
  const [trains, setTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState('SL');
  const [selectedReservationType, setSelectedReservationType] = useState('GEN');
  const [passengers, setPassengers] = useState([
    { passenger_name: '', passenger_age: '', passenger_gender: 'Male', passenger_ischild: false, passenger_issenior: false, passenger_ispwd: false }
  ]);
  const [mobileNumber, setMobileNumber] = useState('');
  const [fareDetails, setFareDetails] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);

  // Loading states
  const [searching, setSearching] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [booking, setBooking] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Refs for focus flow
  const destRef = useRef(null);
  const dateRef = useRef(null);
  const searchButtonRef = useRef(null);

  // Accordion state
  const [expandedIndex, setExpandedIndex] = useState(0);

  // Schedule modal state
  const [scheduleModalTrain, setScheduleModalTrain] = useState(null);

  useEffect(() => {
    const init = async () => {
      const result = await loadReferenceData();
      if (result) {
        // Check for query params
        const params = new URLSearchParams(location.search);
        const qSource = params.get('source');
        const qDest = params.get('destination');
        const qDoj = params.get('doj');
        const qTrain = params.get('train');

        if (qSource && qDest && qDoj) {
          setSource(qSource);
          setDestination(qDest);
          setDoj(qDoj);
          
          // Set display names
          const sStation = result.stations.find(s => s.code === qSource);
          const dStation = result.stations.find(s => s.code === qDest);
          if (sStation) setSourceSearch(`${sStation.station_name} (${sStation.code})`);
          if (dStation) setDestSearch(`${dStation.station_name} (${dStation.code})`);
          
          // Trigger search
          performSearch(qSource, qDest, qDoj, qTrain);
        }
      }
    };
    init();
  }, [location]);

  const loadReferenceData = async () => {
    try {
      const [stationsRes, coachRes, resTypesRes] = await Promise.all([
        getStations(),
        getCoachTypes(),
        getReservationTypes()
      ]);
      const data = {
        stations: stationsRes.stations || [],
        coachTypes: coachRes.coachTypes || [],
        reservationtypes: resTypesRes.reservationtypes || []
      };
      setStations(data.stations);
      setCoachTypes(data.coachTypes);
      setReservationTypes(data.reservationtypes);
      return data;
    } catch (err) {
      toast.error('Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
    return null;
  };

  const performSearch = async (s, d, date, trainNum = null) => {
    setSearching(true);
    try {
      const result = await searchTrains(s, d, date);
      const list = result.trainslist || [];
      setTrains(list);
      if (list.length > 0) {
        setStep(2);
        // Find and expand the specific train if passed
        if (trainNum) {
          const tIdx = list.findIndex(t => t.train_number === trainNum);
          if (tIdx !== -1) setExpandedIndex(tIdx);
        }
        toast.success(`Found ${list.length} trains`);
      } else {
        toast.error('No trains found for this route');
      }
    } catch (err) {
      toast.error(err.userMessage || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  // Search trains
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!source || !destination || !doj) {
      toast.error('Please fill all fields');
      return;
    }
    if (source === destination) {
      toast.error('Source and destination cannot be same');
      return;
    }

    setSearching(true);
    try {
      const result = await searchTrains(source, destination, doj);
      setTrains(result.trainslist || []);
      if ((result.trainslist || []).length > 0) {
        setStep(2);
        toast.success(`Found ${result.trainslist.length} trains`);
      } else {
        toast.error('No trains found for this route');
      }
    } catch (err) {
      toast.error(err.userMessage || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  // Select train
  const handleSelectTrain = (train) => {
    setSelectedTrain(train);
    setStep(3);
  };

  // Add passenger
  const addPassenger = () => {
    if (passengers.length < 6) {
      setPassengers([...passengers, {
        passenger_name: '',
        passenger_age: '',
        passenger_gender: 'Male',
        passenger_ischild: false,
        passenger_issenior: false,
        passenger_ispwd: false
      }]);
    }
  };

  // Remove passenger
  const removePassenger = (idx) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== idx));
    }
  };

  // Update passenger
  const updatePassenger = (idx, field, value) => {
    const updated = [...passengers];
    updated[idx][field] = value;
    
    // Auto-set child/senior based on age
    if (field === 'passenger_age') {
      const age = parseInt(value);
      updated[idx].passenger_ischild = age < 5;
      updated[idx].passenger_issenior = age >= 60;
    }
    
    setPassengers(updated);
  };

  // Calculate fare
  const handleCalculateFare = async () => {
    // Validate passengers
    for (const p of passengers) {
      if (!p.passenger_name || !p.passenger_age) {
        toast.error('Please fill all passenger details');
        return;
      }
    }
    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error('Please enter valid mobile number');
      return;
    }

    setCalculating(true);
    try {
      const result = await calculateFare({
        trainNumber: selectedTrain.train_number,
        sourceCode: source,
        destinationCode: destination,
        doj,
        coachCode: selectedCoach,
        reservationType: selectedReservationType,
        passengers
      });
      setFareDetails(result.fare_calculation_details);
      setStep(4);
    } catch (err) {
      toast.error(err.userMessage || 'Fare calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  // Confirm booking
  const handleConfirmBooking = async () => {
    setBooking(true);
    try {
      const result = await confirmTicket({
        trainNumber: selectedTrain.train_number,
        sourceCode: source,
        destinationCode: destination,
        doj,
        coachCode: selectedCoach,
        reservationType: selectedReservationType,
        passengers,
        mobileNumber,
        totalFare: fareDetails?.fare?.total_fare || 0,
        email: user.email
      });
      setBookingResult(result);
      toast.success('🎉 Ticket booked successfully!');
    } catch (err) {
      toast.error(err.userMessage || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setStep(1);
    setTrains([]);
    setSelectedTrain(null);
    setPassengers([{ passenger_name: '', passenger_age: '', passenger_gender: 'Male', passenger_ischild: false, passenger_issenior: false, passenger_ispwd: false }]);
    setFareDetails(null);
    setBookingResult(null);
  };

  if (loading) return <PageLoader text="Loading booking form..." />;

  // Booking Success
  if (bookingResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Booking Confirmed!</h1>
          <p className="text-gray-400 mb-6">Your ticket has been booked successfully</p>

          <div className="bg-white/5 rounded-xl p-6 mb-6 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">PNR Number</p>
                <p className="text-2xl font-bold text-blue-400">{bookingResult.pnr}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-xl font-bold text-green-400">{bookingResult.pnr_status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Train</p>
                <p className="font-semibold">{bookingResult.train_details?.train_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="font-semibold">{bookingResult.train_details?.doj}</p>
              </div>
            </div>
          </div>

          <button onClick={resetForm} className="btn-primary">
            Book Another Ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {['Search', 'Select Train', 'Passengers', 'Confirm'].map((label, idx) => (
          <div key={idx} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step > idx + 1
                  ? 'bg-green-500'
                  : step === idx + 1
                  ? 'bg-blue-500'
                  : 'bg-gray-600'
              }`}
            >
              {step > idx + 1 ? <FiCheck /> : idx + 1}
            </div>
            <span className={`ml-2 text-sm ${step === idx + 1 ? 'text-white' : 'text-gray-400'}`}>
              {label}
            </span>
            {idx < 3 && <div className="w-12 h-0.5 bg-gray-600 mx-2 hidden md:block" />}
          </div>
        ))}
      </div>

      {/* Step 1: Search */}
      {step === 1 && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6">Search Trains</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AutoSuggest
                label="From"
                placeholder="Select Source"
                data={stations}
                value={sourceSearch}
                onSelect={(code, display) => {
                  setSource(code);
                  setSourceSearch(display);
                }}
                nextFieldRef={destRef}
              />
              <AutoSuggest
                  ref={destRef}
                  label="To"
                  placeholder="Select Destination"
                  data={stations}
                  value={destSearch}
                  onSelect={(code, display) => {
                    setDestination(code);
                    setDestSearch(display);
                  }}
                  nextFieldRef={dateRef}
                />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Date of Journey</label>
              <div className="relative">
                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={dateRef}
                  type="date"
                  value={doj}
                  onChange={(e) => {
                    setDoj(e.target.value);
                    setTimeout(() => searchButtonRef.current?.focus(), 100);
                  }}
                  min={today}
                  max={maxDateString}
                  className="input-field pl-12"
                />
              </div>
            </div>
            <button
              ref={searchButtonRef}
              type="submit"
              disabled={searching}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {searching ? <ButtonLoader /> : <><FiSearch /> Search Trains</>}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Select Train */}
      {step === 2 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Select Your Train</h2>
              <p className="text-gray-400 text-sm font-medium">Click on a seat availability cell to proceed</p>
            </div>
            <button onClick={() => setStep(1)} className="text-blue-400 text-sm font-bold border-b border-blue-400/20 hover:text-blue-300 transition-colors uppercase tracking-widest px-1">
              ← Change Search
            </button>
          </div>
          
          <div className="space-y-4 animate-slide-up">
            {trains.map((train, idx) => (
              <div key={idx} className={`glass-card overflow-hidden border-white/5 transition-all duration-300 ${expandedIndex === idx ? 'ring-1 ring-blue-500/50' : 'hover:border-white/20'}`}>
                {/* Accordion Header */}
                <div 
                  onClick={() => setExpandedIndex(expandedIndex === idx ? -1 : idx)}
                  className={`p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors ${expandedIndex === idx ? 'bg-blue-500/10' : 'hover:bg-white/5'}`}
                >
                  {/* Train Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg">
                      🚂
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white uppercase tracking-tight">
                        {train.train_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                          #{train.train_number}
                        </span>
                        <span className="text-xs text-gray-400 font-medium tracking-wide">• {train.train_type || 'EXPRESS'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Time & Duration */}
                  <div className="flex items-center gap-8 px-6 py-3 bg-slate-900/60 rounded-2xl border border-white/10 shadow-inner">
                    <div className="text-center">
                      <p className="font-black text-xl text-white tracking-tight">{train.departure || '06:00'}</p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">{source || 'SRC'}</p>
                    </div>
                    <div className="flex flex-col items-center min-w-[90px]">
                      <span className="text-[10px] font-black text-gray-400 mb-1">{train.duration || '08:30'}</span>
                      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent relative">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">Daily Runs</span>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-xl text-white tracking-tight">{train.arrival || '14:30'}</p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">{destination || 'DST'}</p>
                    </div>
                  </div>

                  {/* Toggle Indicator & Actions */}
                  <div className="flex items-center gap-3">
                    {/* Route/Schedule Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setScheduleModalTrain({ number: train.train_number, name: train.train_name });
                      }}
                      className="w-10 h-10 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 flex items-center justify-center text-orange-400 hover:text-orange-300 transition-all group"
                      title="View Route & Schedule"
                    >
                      <FiNavigation className="group-hover:scale-110 transition-transform" />
                    </button>

                    <div className="hidden lg:block text-right">
                       <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Select Coach</p>
                       <p className="text-xs text-blue-400 font-bold">{train.availability?.length || 0} Options</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${expandedIndex === idx ? 'bg-blue-500 text-white rotate-180 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      <FiArrowRight className="rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Accordion Content */}
                <div className={`transition-all duration-500 ease-in-out ${expandedIndex === idx ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                  <div className="p-6 bg-slate-950/40 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest italic">
                           ⚡ Tap on available seat to select
                        </h4>
                    </div>
                    
                    {train.availability && train.availability.length > 0 ? (
                      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-md">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="bg-white/5">
                              <th className="p-4 border-b border-white/10 text-[11px] uppercase text-gray-400 font-black tracking-widest">Coach</th>
                              <th className="p-4 border-b border-white/10 text-[11px] uppercase text-blue-400 font-black tracking-widest text-center">Gen</th>
                              <th className="p-4 border-b border-white/10 text-[11px] uppercase text-orange-400 font-black tracking-widest text-center">TTL</th>
                              <th className="p-4 border-b border-white/10 text-[11px] uppercase text-red-400 font-black tracking-widest text-center">PTL</th>
                              <th className="p-4 border-b border-white/10 text-[11px] uppercase text-pink-400 font-black tracking-widest text-center">Ladies</th>
                              <th className="p-4 border-b border-white/10 text-[11px] uppercase text-purple-400 font-black tracking-widest text-center">PWD</th>
                              <th className="p-4 border-b border-white/10 text-[11px] uppercase text-green-400 font-black tracking-widest text-center">Senior</th>
                            </tr>
                          </thead>
                          <tbody>
                            {['SL', '3A', '2A', '1A', '2S', 'CC', 'EA', 'E3', 'EC', 'FC'].map(coach => {
                              const hasCoach = train.availability?.some(a => a.coach_code === coach);
                              if (!hasCoach) return null;

                              return (
                                <tr key={coach} className="group hover:bg-white/5 transition-colors">
                                  <td className="p-4 border-b border-white/10 font-black text-xs bg-white/5 text-blue-100">{coach}</td>
                                  {['GEN', 'TTL', 'PTL', 'LADIES', 'PWD', 'SENIOR'].map(quota => {
                                    const found = train.availability?.find(a => 
                                      a.coach_code === coach && 
                                      (a.seat_type === quota || (!a.seat_type && quota === 'GEN'))
                                    );

                                    if (!found) return <td key={quota} className="p-4 border-b border-white/10 text-center text-gray-700 font-bold">-</td>;

                                    const isAvailable = found.seats && !String(found.seats).startsWith('WTL');
                                    
                                    return (
                                      <td 
                                        key={quota} 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedTrain(train);
                                          setSelectedCoach(found.coach_code);
                                          setSelectedReservationType(found.seat_type || 'GEN');
                                          setStep(3);
                                        }}
                                        className={`p-4 border-b border-white/10 cursor-pointer transition-all duration-200 hover:scale-[1.02] text-center ${
                                          isAvailable ? 'hover:bg-green-500/20' : 'hover:bg-red-500/20'
                                        }`}
                                      >
                                        <div className="flex flex-col items-center">
                                          <span className={`text-[13px] font-black tracking-tighter ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                                            {found.seats}
                                          </span>
                                          <span className="text-[10px] text-gray-500 font-bold">₹{found.fare}</span>
                                        </div>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl text-center">
                        <p className="text-yellow-500 text-sm font-bold flex items-center justify-center gap-2 uppercase tracking-widest">
                           ⚠️ Seat availability data temporarily unavailable
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Passengers */}
      {step === 3 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Passenger Details</h2>
            <button onClick={() => setStep(2)} className="text-blue-400 text-sm">← Change Train</button>
          </div>

          {/* Selected Train Info */}
          <div className="bg-blue-500/10 rounded-xl p-4 mb-6">
            <p className="font-semibold">{selectedTrain?.train_name} ({selectedTrain?.train_number})</p>
            <p className="text-sm text-gray-400">{source} → {destination} on {doj}</p>
          </div>

          {/* Coach & Reservation Type */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Coach Type</label>
              <select value={selectedCoach} onChange={(e) => setSelectedCoach(e.target.value)} className="input-field">
                {coachTypes.map((c) => (
                  <option key={c.coach_code} value={c.coach_code}>{c.coach_code} - {c.description}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Reservation Type</label>
              <select value={selectedReservationType} onChange={(e) => setSelectedReservationType(e.target.value)} className="input-field">
                {reservationTypes.map((r) => (
                  <option key={r.type_code} value={r.type_code}>{r.type_code} - {r.description}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Passengers */}
          <div className="space-y-4 mb-6">
            {passengers.map((p, idx) => (
              <div key={idx} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Passenger {idx + 1}</span>
                  {passengers.length > 1 && (
                    <button onClick={() => removePassenger(idx)} className="text-red-400 text-sm flex items-center gap-1">
                      <FiMinus /> Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={p.passenger_name}
                    onChange={(e) => updatePassenger(idx, 'passenger_name', e.target.value)}
                    placeholder="Full Name"
                    className="input-field"
                  />
                  <input
                    type="number"
                    value={p.passenger_age}
                    onChange={(e) => updatePassenger(idx, 'passenger_age', e.target.value)}
                    placeholder="Age"
                    min="1"
                    max="120"
                    className="input-field"
                  />
                  <select
                    value={p.passenger_gender}
                    onChange={(e) => updatePassenger(idx, 'passenger_gender', e.target.value)}
                    className="input-field"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {passengers.length < 6 && (
            <button onClick={addPassenger} className="btn-secondary mb-6 flex items-center gap-2">
              <FiPlus /> Add Passenger
            </button>
          )}

          {/* Mobile Number */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Mobile Number</label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              className="input-field"
            />
          </div>

          <button onClick={handleCalculateFare} disabled={calculating} className="btn-primary w-full flex items-center justify-center gap-2">
            {calculating ? <ButtonLoader /> : 'Calculate Fare →'}
          </button>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && fareDetails && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Confirm Booking</h2>
            <button onClick={() => setStep(3)} className="text-blue-400 text-sm">← Edit Passengers</button>
          </div>

          {/* Fare Summary */}
          <div className="bg-green-500/10 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-4 text-green-400">Fare Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Base Fare (for {passengers.length} px)</span>
                <span className="font-medium">₹{fareDetails.fare?.base_fare || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">GST (18%)</span>
                <span className="font-medium text-orange-400">+₹{fareDetails.fare?.gst_18_percent || 0}</span>
              </div>
              
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">Total Amount</p>
                  <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-400">₹{fareDetails.fare?.total_fare || 0}</p>
                  <p className="text-xs text-blue-400">{fareDetails.fare?.currency}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 mb-6 text-sm text-gray-400">
            <ul className="list-disc pl-5 space-y-1">
              <li>Tickets are subject to availability at the time of confirmation.</li>
              <li>Waitlisted tickets may get confirmed during charting.</li>
              <li>Cancellation charges may apply as per rules.</li>
            </ul>
          </div>

          <button onClick={handleConfirmBooking} disabled={booking} className="btn-orange w-full flex items-center justify-center gap-2">
            {booking ? <ButtonLoader /> : '🎫 Confirm & Book Ticket'}
          </button>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModalTrain && (
        <TrainScheduleModal
          trainNumber={scheduleModalTrain.number}
          trainName={scheduleModalTrain.name}
          onClose={() => setScheduleModalTrain(null)}
        />
      )}
    </div>
  );
}
