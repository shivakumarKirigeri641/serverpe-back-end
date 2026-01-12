/**
 * Book Ticket Page (Protected)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStations, getCoachTypes, getReservationTypes, searchTrains, calculateFare, bookTicket } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

const BookTicketPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [step, setStep] = useState(1); // 1: Journey, 2: Passengers, 3: Review
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Master data
    const [stations, setStations] = useState([]);
    const [coachTypes, setCoachTypes] = useState([]);
    const [reservationTypes, setReservationTypes] = useState([]);
    
    // Journey details
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [doj, setDoj] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTrain, setSelectedTrain] = useState(null);
    const [coachCode, setCoachCode] = useState('SL');
    const [reservationType, setReservationType] = useState('GEN');
    const [trains, setTrains] = useState([]);
    
    // Passengers
    const [passengers, setPassengers] = useState([
        { passenger_name: '', passenger_age: '', passenger_gender: 'M', passenger_ispwd: false }
    ]);
    const [mobile, setMobile] = useState('');
    
    // Fare
    const [fareDetails, setFareDetails] = useState(null);
    
    // Dropdowns
    const [filteredSource, setFilteredSource] = useState([]);
    const [filteredDest, setFilteredDest] = useState([]);
    const [showSourceDropdown, setShowSourceDropdown] = useState(false);
    const [showDestDropdown, setShowDestDropdown] = useState(false);

    useEffect(() => {
        Promise.all([
            getStations(),
            getCoachTypes(),
            getReservationTypes()
        ]).then(([stationsRes, coachRes, resTypeRes]) => {
            if (stationsRes.success) setStations(stationsRes.data.stations);
            if (coachRes.success) setCoachTypes(coachRes.data.coach_types);
            if (resTypeRes.success) setReservationTypes(resTypeRes.data.reservation_types);
        }).catch(console.error);
    }, []);

    const handleSourceChange = (e) => {
        const value = e.target.value.toUpperCase();
        setSource(value);
        if (value.length > 0) {
            const filtered = stations.filter(s =>
                s.code.toUpperCase().includes(value) ||
                s.station_name.toUpperCase().includes(value)
            ).slice(0, 5);
            setFilteredSource(filtered);
            setShowSourceDropdown(true);
        } else {
            setShowSourceDropdown(false);
        }
    };

    const handleDestChange = (e) => {
        const value = e.target.value.toUpperCase();
        setDestination(value);
        if (value.length > 0) {
            const filtered = stations.filter(s =>
                s.code.toUpperCase().includes(value) ||
                s.station_name.toUpperCase().includes(value)
            ).slice(0, 5);
            setFilteredDest(filtered);
            setShowDestDropdown(true);
        } else {
            setShowDestDropdown(false);
        }
    };

    const handleSearchTrains = async () => {
        if (!source || !destination || !doj) {
            setError('Please fill all journey details');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await searchTrains(source, destination, doj);
            if (response.success) {
                setTrains(response.data.trains);
                if (response.data.trains.length === 0) {
                    setError('No trains found for this route');
                }
            }
        } catch (err) {
            setError(err.message || 'Failed to search trains');
        } finally {
            setLoading(false);
        }
    };

    const addPassenger = () => {
        if (passengers.length < 6) {
            setPassengers([...passengers, { passenger_name: '', passenger_age: '', passenger_gender: 'M', passenger_ispwd: false }]);
        }
    };

    const removePassenger = (index) => {
        if (passengers.length > 1) {
            setPassengers(passengers.filter((_, i) => i !== index));
        }
    };

    const updatePassenger = (index, field, value) => {
        const updated = [...passengers];
        updated[index][field] = value;
        setPassengers(updated);
    };

    const validatePassengers = () => {
        for (let i = 0; i < passengers.length; i++) {
            const p = passengers[i];
            if (!p.passenger_name || p.passenger_name.trim().length < 2) {
                setError(`Passenger ${i + 1}: Name is required (min 2 chars)`);
                return false;
            }
            if (!p.passenger_age || p.passenger_age < 0 || p.passenger_age > 120) {
                setError(`Passenger ${i + 1}: Valid age required (0-120)`);
                return false;
            }
        }
        if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
            setError('Valid 10-digit mobile number is required');
            return false;
        }
        return true;
    };

    const handleCalculateFare = async () => {
        if (!validatePassengers()) return;
        
        setLoading(true);
        setError('');
        try {
            const response = await calculateFare({
                train_number: selectedTrain.train_number,
                source_code: source,
                destination_code: destination,
                doj,
                coach_code: coachCode,
                reservation_type: reservationType,
                passengers
            });
            if (response.success) {
                setFareDetails(response.data.fare);
                setStep(3);
            }
        } catch (err) {
            setError(err.message || 'Failed to calculate fare');
        } finally {
            setLoading(false);
        }
    };

    const handleBookTicket = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await bookTicket({
                train_number: selectedTrain.train_number,
                source_code: source,
                destination_code: destination,
                doj,
                coach_code: coachCode,
                reservation_type: reservationType,
                passengers,
                mobile_number: mobile,
                email: user.email,
                total_fare: fareDetails.total_fare
            });
            if (response.success) {
                setSuccess(`Ticket booked! PNR: ${response.data.booking.pnr}`);
                setTimeout(() => navigate(`/pnr-status?pnr=${response.data.booking.pnr}`), 2000);
            }
        } catch (err) {
            setError(err.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Book Ticket</h1>
                    <p className="text-slate-400">Complete your journey booking</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                step >= s ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
                            }`}>
                                {s}
                            </div>
                            {s < 3 && <div className={`w-20 h-1 ${step > s ? 'bg-blue-500' : 'bg-slate-700'}`}></div>}
                        </React.Fragment>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                        {success}
                    </div>
                )}

                {/* Step 1: Journey Details */}
                {step === 1 && (
                    <div className="card animate-fadeIn space-y-6">
                        <h2 className="text-xl font-semibold text-white">Journey Details</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <label className="input-label">From</label>
                                <input type="text" className="input" placeholder="Source" value={source}
                                    onChange={handleSourceChange}
                                    onBlur={() => setTimeout(() => setShowSourceDropdown(false), 200)} />
                                {showSourceDropdown && filteredSource.length > 0 && (
                                    <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg max-h-40 overflow-y-auto">
                                        {filteredSource.map((s) => (
                                            <div key={s.code} className="px-4 py-2 hover:bg-slate-700 cursor-pointer"
                                                onClick={() => { setSource(s.code); setShowSourceDropdown(false); }}>
                                                <span className="text-blue-400 font-medium">{s.code}</span>
                                                <span className="text-slate-400 ml-2">{s.station_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <label className="input-label">To</label>
                                <input type="text" className="input" placeholder="Destination" value={destination}
                                    onChange={handleDestChange}
                                    onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)} />
                                {showDestDropdown && filteredDest.length > 0 && (
                                    <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg max-h-40 overflow-y-auto">
                                        {filteredDest.map((s) => (
                                            <div key={s.code} className="px-4 py-2 hover:bg-slate-700 cursor-pointer"
                                                onClick={() => { setDestination(s.code); setShowDestDropdown(false); }}>
                                                <span className="text-blue-400 font-medium">{s.code}</span>
                                                <span className="text-slate-400 ml-2">{s.station_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="input-label">Date</label>
                                <input type="date" className="input" value={doj} min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setDoj(e.target.value)} />
                            </div>
                        </div>

                        <button onClick={handleSearchTrains} className="btn-primary" disabled={loading}>
                            {loading ? 'Searching...' : 'Search Trains'}
                        </button>

                        {trains.length > 0 && (
                            <div className="mt-6 space-y-3">
                                <h3 className="font-medium text-white">Select Train</h3>
                                {trains.map((train) => (
                                    <div key={train.train_number}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                            selectedTrain?.train_number === train.train_number
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-slate-600 hover:border-slate-500'
                                        }`}
                                        onClick={() => setSelectedTrain(train)}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="badge badge-info mr-2">{train.train_number}</span>
                                                <span className="font-medium text-white">{train.train_name}</span>
                                            </div>
                                            <div className="text-slate-400 text-sm">
                                                {train.departure_time || '--'} → {train.arrival_time || '--'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedTrain && (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="input-label">Coach Type</label>
                                    <select className="input" value={coachCode} onChange={(e) => setCoachCode(e.target.value)}>
                                        {coachTypes.map((c) => (
                                            <option key={c.coach_code} value={c.coach_code}>{c.coach_code} - {c.description}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Quota</label>
                                    <select className="input" value={reservationType} onChange={(e) => setReservationType(e.target.value)}>
                                        {reservationTypes.map((r) => (
                                            <option key={r.type_code} value={r.type_code}>{r.type_code} - {r.description}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {selectedTrain && (
                            <button onClick={() => setStep(2)} className="btn-primary w-full">
                                Continue to Passengers →
                            </button>
                        )}
                    </div>
                )}

                {/* Step 2: Passengers */}
                {step === 2 && (
                    <div className="card animate-fadeIn space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-white">Passenger Details</h2>
                            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white text-sm">
                                ← Back
                            </button>
                        </div>

                        {passengers.map((p, i) => (
                            <div key={i} className="p-4 bg-slate-800/50 rounded-lg space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-white">Passenger {i + 1}</span>
                                    {passengers.length > 1 && (
                                        <button onClick={() => removePassenger(i)} className="text-red-400 hover:text-red-300 text-sm">
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="input-label">Name</label>
                                        <input type="text" className="input" placeholder="Full name"
                                            value={p.passenger_name}
                                            onChange={(e) => updatePassenger(i, 'passenger_name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="input-label">Age</label>
                                        <input type="number" className="input" placeholder="Age" min="0" max="120"
                                            value={p.passenger_age}
                                            onChange={(e) => updatePassenger(i, 'passenger_age', parseInt(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className="input-label">Gender</label>
                                        <select className="input" value={p.passenger_gender}
                                            onChange={(e) => updatePassenger(i, 'passenger_gender', e.target.value)}>
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                            <option value="O">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {passengers.length < 6 && (
                            <button onClick={addPassenger} className="btn-secondary w-full">
                                + Add Passenger ({passengers.length}/6)
                            </button>
                        )}

                        <div>
                            <label className="input-label">Mobile Number</label>
                            <input type="tel" className="input" placeholder="10-digit mobile"
                                value={mobile} maxLength={10}
                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} />
                        </div>

                        <button onClick={handleCalculateFare} className="btn-primary w-full" disabled={loading}>
                            {loading ? 'Calculating...' : 'Calculate Fare & Review →'}
                        </button>
                    </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && fareDetails && (
                    <div className="card animate-fadeIn space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-white">Review & Confirm</h2>
                            <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white text-sm">
                                ← Back
                            </button>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <h3 className="font-medium text-white mb-3">Journey</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div><span className="text-slate-400">Train:</span> <span className="text-white">{selectedTrain.train_number}</span></div>
                                <div><span className="text-slate-400">From:</span> <span className="text-white">{source}</span></div>
                                <div><span className="text-slate-400">To:</span> <span className="text-white">{destination}</span></div>
                                <div><span className="text-slate-400">Date:</span> <span className="text-white">{doj}</span></div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <h3 className="font-medium text-white mb-3">Passengers</h3>
                            {passengers.map((p, i) => (
                                <div key={i} className="text-sm text-slate-300 py-1">
                                    {i + 1}. {p.passenger_name} ({p.passenger_age} yrs, {p.passenger_gender})
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-white font-medium">Total Fare</span>
                                <span className="text-2xl font-bold text-green-400">₹{fareDetails.total_fare}</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                (includes GST ₹{fareDetails.gst})
                            </div>
                        </div>

                        <button onClick={handleBookTicket} className="btn-primary w-full text-lg py-4" disabled={loading}>
                            {loading ? <LoadingSpinner size="sm" text="" /> : '🎫 Confirm Booking'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookTicketPage;
