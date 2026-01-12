/**
 * Book Ticket Page (Protected)
 * Complete booking flow with payment OTP verification and ticket confirmation
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStations, getCoachTypes, getReservationTypes, searchTrains, calculateFare, bookTicket } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import AutoSuggestInput from '../components/AutoSuggestInput';

const BookTicketPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [step, setStep] = useState(1); // 1: Journey, 2: Passengers, 3: Review, 4: Payment, 5: Success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
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
    
    // Fare & Booking
    const [fareDetails, setFareDetails] = useState(null);
    const [bookingResult, setBookingResult] = useState(null);
    
    // Payment Modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentOtp, setPaymentOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    
    // Success Modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Refs for auto-focus flow
    const destinationRef = useRef(null);
    const dateRef = useRef(null);
    const searchBtnRef = useRef(null);

    // Calculate date constraints
    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    // Get full station name from code
    const getStationName = (code) => {
        const station = stations.find(s => s.code === code);
        return station ? `${station.code} - ${station.station_name}` : code;
    };

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

    // Station display functions
    const stationDisplayFn = (station) => ({
        primary: station.code,
        secondary: station.station_name
    });
    const stationValueFn = (station) => station.code;
    const stationFullDisplayFn = (station) => `${station.code} - ${station.station_name}`;

    const handleDateFocus = (e) => {
        try { e.target.showPicker?.(); } catch (err) {}
    };

    const handleDateChange = (e) => {
        setDoj(e.target.value);
        setTimeout(() => searchBtnRef.current?.focus(), 100);
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

    // Open payment modal
    const handleProceedToPayment = () => {
        setShowPaymentModal(true);
        setPaymentOtp('');
        setOtpError('');
    };

    // Verify OTP and process payment
    const handleVerifyOtp = async () => {
        if (paymentOtp !== '3333') {
            setOtpError('Invalid OTP. Please enter 3333');
            return;
        }
        
        setOtpError('');
        setIsProcessingPayment(true);
        
        // Simulate payment processing animation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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
                setBookingResult(response.data.booking);
                setShowPaymentModal(false);
                setIsProcessingPayment(false);
                
                // Show success modal
                setShowSuccessModal(true);
                
                // After 3 seconds, move to ticket display
                setTimeout(() => {
                    setShowSuccessModal(false);
                    setStep(5);
                }, 3000);
            }
        } catch (err) {
            setOtpError(err.message || 'Booking failed. Please try again.');
            setIsProcessingPayment(false);
        }
    };

    // Format date for display
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {step < 5 && (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Book Ticket</h1>
                            <p className="text-slate-400">Complete your journey booking</p>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center justify-center mb-8">
                            {[
                                { num: 1, label: 'Journey' },
                                { num: 2, label: 'Passengers' },
                                { num: 3, label: 'Review' }
                            ].map((s, i) => (
                                <React.Fragment key={s.num}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                            step >= s.num 
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                                                : 'bg-slate-700 text-slate-400'
                                        }`}>
                                            {step > s.num ? '✓' : s.num}
                                        </div>
                                        <span className={`text-xs mt-1 ${step >= s.num ? 'text-blue-400' : 'text-slate-500'}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {i < 2 && <div className={`w-16 h-1 mx-2 rounded ${step > s.num ? 'bg-blue-500' : 'bg-slate-700'}`}></div>}
                                </React.Fragment>
                            ))}
                        </div>
                    </>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* Step 1: Journey Details */}
                {step === 1 && (
                    <div className="card animate-fadeIn space-y-6">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">1</span>
                            Journey Details
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <AutoSuggestInput
                                label="From"
                                placeholder="Source Station"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                items={stations}
                                displayFn={stationDisplayFn}
                                valueFn={stationValueFn}
                                fullDisplayFn={stationFullDisplayFn}
                                nextRef={destinationRef}
                            />
                            <AutoSuggestInput
                                ref={destinationRef}
                                label="To"
                                placeholder="Destination Station"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                items={stations}
                                displayFn={stationDisplayFn}
                                valueFn={stationValueFn}
                                fullDisplayFn={stationFullDisplayFn}
                                nextRef={dateRef}
                            />
                            <div>
                                <label className="input-label">Date of Journey</label>
                                <input 
                                    ref={dateRef}
                                    type="date" 
                                    className="input" 
                                    value={doj} 
                                    min={today}
                                    max={maxDateStr}
                                    onChange={handleDateChange}
                                    onFocus={handleDateFocus}
                                />
                            </div>
                        </div>

                        <button ref={searchBtnRef} onClick={handleSearchTrains} className="btn-primary" disabled={loading}>
                            {loading ? 'Searching...' : '🔍 Search Trains'}
                        </button>

                        {trains.length > 0 && (
                            <div className="mt-6 space-y-3">
                                <h3 className="font-medium text-white">Select Train ({trains.length} found)</h3>
                                {trains.map((train) => (
                                    <div key={train.train_number}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                            selectedTrain?.train_number === train.train_number
                                                ? 'border-blue-500 bg-blue-500/20 shadow-lg ring-2 ring-blue-500/50'
                                                : 'border-slate-600 hover:border-blue-400 hover:bg-slate-800/50'
                                        }`}
                                        onClick={() => setSelectedTrain(train)}>
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                            <div className="flex items-center gap-3">
                                                <span className="badge badge-info">{train.train_number}</span>
                                                <span className="font-medium text-white">{train.train_name}</span>
                                                {selectedTrain?.train_number === train.train_number && (
                                                    <span className="text-green-400 text-sm">✓ Selected</span>
                                                )}
                                            </div>
                                            <div className="text-slate-400 text-sm">
                                                {train.departure_time || '--'} → {train.arrival_time || '--'} | {train.distance_km} km
                                            </div>
                                        </div>
                                        {/* Show all available classes */}
                                        {train.classes && Object.keys(train.classes).length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {Object.entries(train.classes).map(([code, info]) => (
                                                    <div 
                                                        key={code}
                                                        className={`px-2 py-1 rounded border text-xs ${
                                                            info.status === 'AVAILABLE' 
                                                                ? 'border-green-500/30 bg-green-500/10 text-green-400' 
                                                                : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                                                        }`}
                                                    >
                                                        <span className="font-bold">{code}</span>: {info.available > 0 ? `${info.available} seats` : 'WL'} - ₹{info.fare}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedTrain && (
                            <>
                                <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
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
                                <button onClick={() => setStep(2)} className="btn-primary w-full text-lg">
                                    Continue to Passengers →
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Step 2: Passengers */}
                {step === 2 && (
                    <div className="card animate-fadeIn space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">2</span>
                                Passenger Details
                            </h2>
                            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white text-sm">
                                ← Back
                            </button>
                        </div>

                        {/* Journey Summary at top */}
                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm">
                            <div className="flex flex-wrap gap-4 text-blue-300">
                                <span>🚂 <strong>{selectedTrain?.train_number}</strong> - {selectedTrain?.train_name}</span>
                                <span>📍 <strong>{getStationName(source)}</strong> → <strong>{getStationName(destination)}</strong></span>
                                <span>📅 {formatDate(doj)}</span>
                            </div>
                        </div>

                        {passengers.map((p, i) => (
                            <div key={i} className="p-4 bg-slate-800/50 rounded-lg space-y-4 border border-slate-700">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-white flex items-center gap-2">
                                        <span className="w-6 h-6 bg-purple-500/30 text-purple-400 rounded-full flex items-center justify-center text-xs">
                                            {i + 1}
                                        </span>
                                        Passenger {i + 1}
                                    </span>
                                    {passengers.length > 1 && (
                                        <button onClick={() => removePassenger(i)} className="text-red-400 hover:text-red-300 text-sm">
                                            ✕ Remove
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="input-label">Full Name</label>
                                        <input type="text" className="input" placeholder="As per ID proof"
                                            value={p.passenger_name}
                                            onChange={(e) => updatePassenger(i, 'passenger_name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="input-label">Age</label>
                                        <input type="number" className="input" placeholder="Years" min="0" max="120"
                                            value={p.passenger_age}
                                            onChange={(e) => updatePassenger(i, 'passenger_age', parseInt(e.target.value) || '')} />
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

                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                            <label className="input-label">Mobile Number (for ticket updates)</label>
                            <input type="tel" className="input" placeholder="10-digit mobile number"
                                value={mobile} maxLength={10}
                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} />
                        </div>

                        <button onClick={handleCalculateFare} className="btn-primary w-full text-lg" disabled={loading}>
                            {loading ? 'Calculating...' : 'Calculate Fare & Review →'}
                        </button>
                    </div>
                )}

                {/* Step 3: Review & Pay */}
                {step === 3 && fareDetails && (
                    <div className="card animate-fadeIn space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">3</span>
                                Review & Pay
                            </h2>
                            <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white text-sm">
                                ← Back
                            </button>
                        </div>

                        {/* Journey Details */}
                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                                <span className="text-xl">🚂</span> Journey Summary
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <div><span className="text-slate-400">Train:</span> <span className="text-white font-medium">{selectedTrain.train_number} - {selectedTrain.train_name}</span></div>
                                    <div><span className="text-slate-400">Class:</span> <span className="text-white font-medium">{coachCode}</span></div>
                                    <div><span className="text-slate-400">Quota:</span> <span className="text-white font-medium">{reservationType}</span></div>
                                </div>
                                <div className="space-y-2">
                                    <div><span className="text-slate-400">From:</span> <span className="text-white font-medium">{getStationName(source)}</span></div>
                                    <div><span className="text-slate-400">To:</span> <span className="text-white font-medium">{getStationName(destination)}</span></div>
                                    <div><span className="text-slate-400">Date:</span> <span className="text-white font-medium">{formatDate(doj)}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Passengers */}
                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                                <span className="text-xl">👥</span> Passengers ({passengers.length})
                            </h3>
                            <div className="space-y-2">
                                {passengers.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
                                        <div className="text-slate-300">
                                            <span className="text-blue-400 font-medium">{i + 1}.</span> {p.passenger_name}
                                        </div>
                                        <div className="text-slate-500 text-sm">
                                            {p.passenger_age} yrs • {p.passenger_gender === 'M' ? 'Male' : p.passenger_gender === 'F' ? 'Female' : 'Other'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-700 text-sm text-slate-400">
                                📱 Contact: {mobile}
                            </div>
                        </div>

                        {/* Fare Breakdown */}
                        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                                <span className="text-xl">💰</span> Fare Breakdown
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Base Fare ({passengers.length} × ₹{fareDetails.per_passenger})</span>
                                    <span className="text-white">₹{fareDetails.base_fare}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">GST (5%)</span>
                                    <span className="text-white">₹{fareDetails.gst}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-green-500/30 text-lg font-bold">
                                    <span className="text-white">Total Amount</span>
                                    <span className="text-green-400">₹{fareDetails.total_fare}</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleProceedToPayment} className="btn-primary w-full text-lg py-4 font-bold">
                            💳 Proceed to Payment (₹{fareDetails.total_fare})
                        </button>
                        
                        <p className="text-xs text-slate-500 text-center">
                            By proceeding, you agree to the terms and conditions. Your booking will be saved to your account.
                        </p>
                    </div>
                )}

                {/* Step 5: Ticket Confirmed - Full Details */}
                {step === 5 && bookingResult && (
                    <div className="animate-fadeIn">
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">🎉</div>
                            <h1 className="text-3xl font-bold text-white mb-2">Ticket Confirmed!</h1>
                            <p className="text-slate-400">Your booking has been saved to your account</p>
                        </div>

                        {/* E-Ticket Card */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-center">
                                <div className="text-sm text-blue-100 uppercase tracking-wider">Electronic Reservation Slip</div>
                                <div className="text-3xl font-bold text-white mt-1">PNR: {bookingResult.pnr}</div>
                            </div>

                            {/* Train Info */}
                            <div className="p-6 border-b border-slate-700">
                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <span className="badge badge-info text-lg px-4 py-2">{selectedTrain.train_number}</span>
                                    <span className="text-xl font-bold text-white">{selectedTrain.train_name}</span>
                                </div>
                                <div className="flex items-center justify-between max-w-xl mx-auto">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">{selectedTrain.departure_time || '--:--'}</div>
                                        <div className="text-blue-400 font-medium">{source}</div>
                                        <div className="text-slate-400 text-sm">{getStationName(source).split(' - ')[1]}</div>
                                    </div>
                                    <div className="flex-1 flex items-center mx-4">
                                        <div className="flex-1 border-t-2 border-dashed border-slate-600"></div>
                                        <div className="px-3 text-slate-500 text-sm">→</div>
                                        <div className="flex-1 border-t-2 border-dashed border-slate-600"></div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">{selectedTrain.arrival_time || '--:--'}</div>
                                        <div className="text-blue-400 font-medium">{destination}</div>
                                        <div className="text-slate-400 text-sm">{getStationName(destination).split(' - ')[1]}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Journey Details */}
                            <div className="p-6 border-b border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                    <div className="text-slate-400 text-sm">Date of Journey</div>
                                    <div className="text-white font-medium">{formatDate(doj)}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400 text-sm">Class</div>
                                    <div className="text-white font-medium">{coachCode}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400 text-sm">Quota</div>
                                    <div className="text-white font-medium">{reservationType}</div>
                                </div>
                                <div>
                                    <div className="text-slate-400 text-sm">Booking Status</div>
                                    <div className="text-green-400 font-bold">CONFIRMED</div>
                                </div>
                            </div>

                            {/* Passengers */}
                            <div className="p-6 border-b border-slate-700">
                                <h3 className="font-semibold text-white mb-4">Passenger Details</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-slate-400 border-b border-slate-700">
                                                <th className="text-left py-2">S.No</th>
                                                <th className="text-left py-2">Name</th>
                                                <th className="text-left py-2">Age</th>
                                                <th className="text-left py-2">Gender</th>
                                                <th className="text-left py-2">Status</th>
                                                <th className="text-left py-2">Coach/Berth</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {passengers.map((p, i) => (
                                                <tr key={i} className="text-white border-b border-slate-700/50">
                                                    <td className="py-3">{i + 1}</td>
                                                    <td className="py-3 font-medium">{p.passenger_name}</td>
                                                    <td className="py-3">{p.passenger_age}</td>
                                                    <td className="py-3">{p.passenger_gender === 'M' ? 'Male' : p.passenger_gender === 'F' ? 'Female' : 'Other'}</td>
                                                    <td className="py-3"><span className="text-green-400">CNF</span></td>
                                                    <td className="py-3 text-blue-400">{coachCode}-{Math.floor(Math.random() * 8) + 1}/{Math.floor(Math.random() * 72) + 1}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Contact & Fare */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-slate-400 text-sm mb-2">Contact Details</h4>
                                    <div className="text-white">📱 {mobile}</div>
                                    <div className="text-white">📧 {user.email}</div>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                    <h4 className="text-slate-400 text-sm mb-2">Payment Summary</h4>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-400">Base Fare</span>
                                        <span className="text-white">₹{fareDetails.base_fare}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">GST</span>
                                        <span className="text-white">₹{fareDetails.gst}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-green-500/30 pt-2">
                                        <span className="text-white">Total Paid</span>
                                        <span className="text-green-400">₹{fareDetails.total_fare}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-900 p-4 text-center text-sm text-slate-500">
                                Booking ID: {bookingResult.id || bookingResult.pnr} | Booked on: {new Date().toLocaleDateString('en-IN')} | Transaction ID: TXN{Date.now()}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4 justify-center mt-8">
                            <button onClick={() => navigate('/dashboard/booking-history')} className="btn-primary">
                                📋 View All Bookings
                            </button>
                            <button onClick={() => navigate('/')} className="btn-secondary">
                                🏠 Back to Home
                            </button>
                            <button onClick={() => window.print()} className="btn-secondary">
                                🖨️ Print Ticket
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment OTP Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl animate-slideUp">
                        {isProcessingPayment ? (
                            // Processing Animation
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 mx-auto mb-6 relative">
                                    <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Processing Payment</h3>
                                <p className="text-slate-400">Please wait while we confirm your booking...</p>
                                <div className="mt-4 text-2xl font-bold text-green-400">₹{fareDetails?.total_fare}</div>
                            </div>
                        ) : (
                            // OTP Entry
                            <>
                                <div className="p-6 border-b border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-white">🔐 Payment Verification</h3>
                                        <button 
                                            onClick={() => setShowPaymentModal(false)}
                                            className="text-slate-400 hover:text-white text-2xl"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <p className="text-slate-400 text-sm mt-1">Enter OTP sent to your mobile</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="text-center">
                                        <div className="text-slate-400 text-sm">Amount to Pay</div>
                                        <div className="text-3xl font-bold text-green-400">₹{fareDetails?.total_fare}</div>
                                    </div>
                                    
                                    <div>
                                        <label className="input-label">Enter 4-digit OTP</label>
                                        <input
                                            type="text"
                                            className="input text-center text-2xl tracking-widest font-mono"
                                            placeholder="• • • •"
                                            maxLength={4}
                                            value={paymentOtp}
                                            onChange={(e) => setPaymentOtp(e.target.value.replace(/\D/g, ''))}
                                            autoFocus
                                        />
                                        <p className="text-xs text-slate-500 mt-2 text-center">
                                            💡 Hint: Use OTP <span className="text-blue-400 font-bold">3333</span>
                                        </p>
                                    </div>

                                    {otpError && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                                            {otpError}
                                        </div>
                                    )}

                                    <button 
                                        onClick={handleVerifyOtp} 
                                        className="btn-primary w-full text-lg py-3"
                                        disabled={paymentOtp.length !== 4}
                                    >
                                        ✓ Verify & Pay ₹{fareDetails?.total_fare}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-2xl border border-green-500/30 w-full max-w-sm shadow-2xl animate-slideUp text-center p-8">
                        <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                            <div className="text-5xl animate-bounce">✓</div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
                        <p className="text-slate-400 mb-4">Your ticket has been booked</p>
                        <div className="text-xl font-bold text-green-400 mb-2">PNR: {bookingResult?.pnr}</div>
                        <p className="text-sm text-slate-500">Preparing your ticket details...</p>
                        <div className="mt-4 flex justify-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookTicketPage;
