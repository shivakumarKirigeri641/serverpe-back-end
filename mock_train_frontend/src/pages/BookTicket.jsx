import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { calculateFare, bookTicket, sendOtp, verifyOtp } from '../api/trainApi';
import { useAuth } from '../context/AuthContext';

const BookTicket = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { train, query } = location.state || {};

  const [step, setStep] = useState(1); // 1: Passengers, 2: Review, 3: OTP, 4: Success
  const [passengers, setPassengers] = useState([{ passenger_name: '', passenger_age: '', passenger_gender: 'M' }]);
  const [coachCode, setCoachCode] = useState('SL');
  const [reservationType] = useState('GN');
  const [fareData, setFareData] = useState(null);
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingResponse, setBookingResponse] = useState(null);

  const addPassenger = () => {
    if (passengers.length < 6) {
      setPassengers([...passengers, { passenger_name: '', passenger_age: '', passenger_gender: 'M' }]);
    }
  };

  const removePassenger = (index) => {
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const updatePassenger = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const handleCalculateFare = async (e) => {
    e.preventDefault();
    if (!train) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await calculateFare({
        train_number: train.train_number,
        source_code: query.source,
        destination_code: query.destination,
        doj: query.doj,
        coach_code: coachCode,
        reservation_type: reservationType,
        passengers
      });
      setFareData(response.data.data.fare);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate fare');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBookingOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await sendOtp(user.email);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError('');
    try {
      // Verify OTP first
      await verifyOtp(user.email, otp);
      
      // Proceed with booking
      const response = await bookTicket({
        train_number: train.train_number,
        source_code: query.source,
        destination_code: query.destination,
        doj: query.doj,
        coach_code: coachCode,
        reservation_type: reservationType,
        passengers,
        mobile_number: '9999999999', // Default for mock
        email: user.email,
        total_fare: fareData.total_fare
      });
      setBookingResponse(response.data.data.booking);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!train) return <div className="p-10 text-center glass rounded-2xl">Train details missing. Please search again.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-12 px-4">
        {[
          { s: 1, label: 'Passengers' },
          { s: 2, label: 'Review' },
          { s: 3, label: 'Verification' },
          { s: 4, label: 'Success' }
        ].map((item) => (
          <div key={item.s} className="flex flex-col items-center relative flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 z-10 
              ${step >= item.s ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-slate-800 text-slate-500'}`}>
              {step > item.s ? '✓' : item.s}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${step >= item.s ? 'text-orange-400' : 'text-slate-600'}`}>
              {item.label}
            </span>
            {item.s < 4 && (
              <div className={`absolute top-5 left-[50%] w-full h-0.5 -z-0 ${step > item.s ? 'bg-orange-500' : 'bg-slate-800'}`}></div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-400 text-sm font-medium flex items-center gap-3">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Step 1: Passengers */}
      {step === 1 && (
        <div className="space-y-8">
          <div className="glass rounded-3xl p-8 border-none bg-gradient-to-br from-white/5 to-transparent">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
              <span className="text-3xl">🚞</span>
              Journey Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-slate-900/40 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Train</p>
                <p className="font-bold">{train.train_name}</p>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Route</p>
                <p className="font-bold">{query.source} → {query.destination}</p>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Date</p>
                <p className="font-bold">{query.doj}</p>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Coach</p>
                <select 
                  value={coachCode} 
                  onChange={(e) => setCoachCode(e.target.value)}
                  className="bg-transparent font-bold focus:outline-none w-full"
                >
                  <option value="SL">Sleeper (SL)</option>
                  <option value="3A">AC 3 Tier (3A)</option>
                  <option value="2A">AC 2 Tier (2A)</option>
                  <option value="1A">AC First Class (1A)</option>
                </select>
              </div>
            </div>
          </div>

          <form onSubmit={handleCalculateFare} className="space-y-6">
            <div className="glass rounded-3xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">Passenger Information</h2>
                <button type="button" onClick={addPassenger} className="text-orange-500 text-sm font-bold border border-orange-500/30 px-4 py-2 rounded-xl hover:bg-orange-500 hover:text-white transition-all">
                  + Add Passenger
                </button>
              </div>
              <div className="space-y-4">
                {passengers.map((p, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-800/40 rounded-2xl animate-slide-up">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Full Name as per ID"
                        value={p.passenger_name}
                        onChange={(e) => updatePassenger(index, 'passenger_name', e.target.value)}
                        className="input-field py-2"
                        required
                      />
                    </div>
                    <div className="md:w-24">
                      <input
                        type="number"
                        placeholder="Age"
                        value={p.passenger_age}
                        onChange={(e) => updatePassenger(index, 'passenger_age', e.target.value)}
                        className="input-field py-2"
                        required
                      />
                    </div>
                    <div className="md:w-32">
                      <select
                        value={p.passenger_gender}
                        onChange={(e) => updatePassenger(index, 'passenger_gender', e.target.value)}
                        className="input-field py-2"
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                    {passengers.length > 1 && (
                      <button type="button" onClick={() => removePassenger(index)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg">
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-5 text-lg font-black uppercase tracking-[0.2em]">
              {loading ? <div className="loader w-6 h-6 border-white/20 border-t-white mx-auto"></div> : 'Review Booking & Pay'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && fareData && (
        <div className="glass rounded-3xl p-8 animate-fade-in">
          <h2 className="text-2xl font-black mb-8">Booking Summary</h2>
          <div className="space-y-6">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Fare Breakdown</p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Base Fare ({passengers.length} Passengers)</span>
                  <span className="font-bold">₹{fareData.total_fare - 45}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reservation Charges</span>
                  <span className="font-bold">₹25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Service Fee</span>
                  <span className="font-bold">₹20</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xl font-bold">Total Amount</span>
                  <span className="text-3xl font-black text-orange-500">₹{fareData.total_fare}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 btn-secondary py-4 font-bold">Back</button>
              <button onClick={handleSendBookingOtp} disabled={loading} className="flex-[2] btn-primary py-4 font-black">
                {loading ? <div className="loader w-5 h-5 mx-auto"></div> : 'Proceed to Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Verification */}
      {step === 3 && (
        <div className="glass rounded-3xl p-10 max-w-md mx-auto text-center animate-fade-in">
          <span className="text-6xl block mb-6">📱</span>
          <h2 className="text-2xl font-bold mb-2">Verify OTP</h2>
          <p className="text-slate-400 mb-8">Enter the 4-digit verification code sent to <br /><span className="text-white font-bold">{user.email}</span></p>
          
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="input-field text-center text-4xl font-black tracking-[0.5em] mb-8"
            maxLength={4}
            placeholder="0000"
          />
          
          <button onClick={handleConfirmBooking} disabled={loading} className="w-full btn-primary py-4 font-black text-lg">
            {loading ? <div className="loader w-6 h-6 border-white/20 border-t-white mx-auto"></div> : 'Confirm Booking'}
          </button>
          
          <p className="mt-6 text-xs text-slate-500 italic">Demo OTP is 1234</p>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && bookingResponse && (
        <div className="glass rounded-[3rem] p-12 text-center animate-fade-in border-green-500/20 bg-green-500/5">
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-2xl shadow-green-500/30">
            ✓
          </div>
          <h2 className="text-4xl font-black mb-2">Booking Success!</h2>
          <p className="text-slate-400 mb-8">Your journey has been confirmed.</p>
          
          <div className="bg-slate-900/60 p-8 rounded-3xl inline-block text-left mb-8 min-w-[300px]">
             <div className="flex justify-between items-center mb-4">
               <span className="text-xs font-black text-slate-500 uppercase">PNR Number</span>
               <span className="text-2xl font-black text-orange-500 tracking-widest">{bookingResponse.pnr}</span>
             </div>
             <div className="space-y-2">
               {bookingResponse.passengers?.map((p, i) => (
                 <div key={i} className="flex justify-between text-sm">
                   <span className="text-slate-400">{p.passenger_name}</span>
                   <span className="text-white font-bold">{p.coach_code} / {p.seat_number}</span>
                 </div>
               ))}
             </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/history" className="btn-primary px-10 py-4">View My Bookings</Link>
            <Link to="/" className="btn-secondary px-10 py-4">Back to Home</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookTicket;
