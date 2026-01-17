import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { masterApi, trainApi, bookingApi, authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Train,
  User,
  Plus,
  Minus,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Calendar,
  MapPin,
  Clock,
  Shield,
  X,
  Download,
} from 'lucide-react';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const trainData = location.state;
  
  // If no train data, redirect to search
  useEffect(() => {
    if (!trainData?.train) {
      navigate('/search');
    }
  }, [trainData, navigate]);

  // Form state
  const [coachTypes, setCoachTypes] = useState([]);
  const [reservationTypes, setReservationTypes] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState('');
  const [selectedReservationType, setSelectedReservationType] = useState('');
  const [passengers, setPassengers] = useState([
    { 
      passenger_name: '', 
      passenger_age: '', 
      passenger_gender: 'M',
      passenger_ischild: false,
      passenger_issenior: false,
      passenger_ispwd: false,
    },
  ]);
  const [contactInfo, setContactInfo] = useState({
    mobile_number: '',
    email: user?.email || '',
  });
  
  // Booking state
  const [fareDetails, setFareDetails] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Payment OTP state
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [showPaymentOtpModal, setShowPaymentOtpModal] = useState(false);
  const [paymentOtp, setPaymentOtp] = useState('');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch coach and reservation types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coachRes, reservationRes] = await Promise.all([
          masterApi.getCoachTypes(),
          masterApi.getReservationTypes(),
        ]);
        setCoachTypes(coachRes.data?.coach_types || []);
        setReservationTypes(reservationRes.data?.reservation_types || []);
        
        // Use pre-selected values from search page, or fall back to defaults
        if (trainData?.selectedCoach) {
          setSelectedCoach(trainData.selectedCoach);
        } else if (coachRes.data?.coach_types?.length > 0) {
          setSelectedCoach(coachRes.data.coach_types[0].coach_code);
        }
        
        if (trainData?.selectedReservationType) {
          setSelectedReservationType(trainData.selectedReservationType);
        } else if (reservationRes.data?.reservation_types?.length > 0) {
          setSelectedReservationType(reservationRes.data.reservation_types[0].type_code);
        }
      } catch (error) {
        toast.error('Failed to load booking options');
      }
    };
    fetchData();
  }, [trainData?.selectedCoach, trainData?.selectedReservationType]);

  const addPassenger = () => {
    if (passengers.length >= 6) {
      toast.error('Maximum 6 passengers allowed');
      return;
    }
    setPassengers([
      ...passengers,
      { 
        passenger_name: '', 
        passenger_age: '', 
        passenger_gender: 'M',
        passenger_ischild: false,
        passenger_issenior: false,
        passenger_ispwd: false,
      },
    ]);
    setFareDetails(null);
  };

  const removePassenger = (index) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, i) => i !== index));
    setFareDetails(null);
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    
    // Auto-check child/senior based on age and gender
    if (field === 'passenger_age' || field === 'passenger_gender') {
      const age = field === 'passenger_age' ? parseInt(value) : parseInt(updated[index].passenger_age);
      const gender = field === 'passenger_gender' ? value : updated[index].passenger_gender;
      
      if (!isNaN(age)) {
        // Auto-check child if age < 6
        updated[index].passenger_ischild = age < 6;
        
        // Auto-check senior: Male > 60, Female > 50
        if (gender === 'M') {
          updated[index].passenger_issenior = age > 60;
        } else if (gender === 'F') {
          updated[index].passenger_issenior = age > 50;
        } else {
          updated[index].passenger_issenior = false;
        }
      }
    }
    
    setPassengers(updated);
    setFareDetails(null);
  };

  const validatePassengers = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.passenger_name || p.passenger_name.length < 2) {
        toast.error(`Passenger ${i + 1}: Name must be at least 2 characters`);
        return false;
      }
      if (!p.passenger_age || p.passenger_age < 0 || p.passenger_age > 120) {
        toast.error(`Passenger ${i + 1}: Please enter a valid age (0-120)`);
        return false;
      }
    }
    return true;
  };

  const calculateFare = async () => {
    if (!validatePassengers()) return;
    
    setIsCalculating(true);
    try {
      const response = await trainApi.calculateFare({
        train_number: trainData.train.train_number,
        source_code: trainData.source,
        destination_code: trainData.destination,
        doj: trainData.date,
        coach_code: selectedCoach,
        reservation_type: selectedReservationType,
        passengers: passengers.map((p) => ({
          passenger_name: p.passenger_name,
          passenger_age: parseInt(p.passenger_age),
          passenger_gender: p.passenger_gender,
          passenger_ischild: p.passenger_ischild,
          passenger_issenior: p.passenger_issenior,
          passenger_ispwd: p.passenger_ispwd,
        })),
      });
      setFareDetails(response.data?.fare);
      toast.success('Fare calculated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to calculate fare');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleConfirmAndPay = async () => {
    if (!fareDetails) {
      toast.error('Please calculate fare first');
      return;
    }

    if (!contactInfo.mobile_number || contactInfo.mobile_number.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    // Show Razorpay modal first
    setShowRazorpayModal(true);    
    
    // Send payment OTP in background
    setIsSendingOtp(true);
    try {
      await authApi.sendOtp(user?.email, true); // ispayment = true
      
      // After 3 seconds, close Razorpay modal and show OTP modal
      setTimeout(() => {
        setShowRazorpayModal(false);
        setShowPaymentOtpModal(true);
        setPaymentOtp('');
        toast.success('Payment OTP sent to your email');
        setIsSendingOtp(false);
      }, 3000);
    } catch (error) {
      setShowRazorpayModal(false);
      toast.error(error.message || 'Failed to send OTP');
      setIsSendingOtp(false);
    }
  };

  const handlePaymentOtpVerify = async () => {
    if (!paymentOtp || paymentOtp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setIsPaymentProcessing(true);
    try {
      // Verify payment OTP (without JWT token)
      await authApi.verifyPaymentOtp(user?.email, paymentOtp);
      
      // Show payment processing
      toast.loading('Processing payment...', { duration: 2000 });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.loading('Confirming booking...', { duration: 1500 });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Book ticket
      const response = await bookingApi.bookTicket({
        train_number: trainData.train.train_number,
        source_code: trainData.source,
        destination_code: trainData.destination,
        doj: trainData.date,
        coach_code: selectedCoach,
        reservation_type: selectedReservationType,
        passengers: passengers.map((p) => ({
          passenger_name: p.passenger_name,
          passenger_age: parseInt(p.passenger_age),
          passenger_gender: p.passenger_gender,
          passenger_ischild: p.passenger_ischild,
          passenger_issenior: p.passenger_issenior,
          passenger_ispwd: p.passenger_ispwd,
        })),
        mobile_number: contactInfo.mobile_number,
        email: contactInfo.email,
        total_fare: fareDetails.fare?.total_fare || fareDetails.fare?.total,
      });
      
      setBookingResult(response.data?.booking);
      setShowPaymentOtpModal(false);
      setBookingComplete(true);
      toast.success('Payment successful! Booking confirmed! 🎉');
      
      // Auto-generate and download ticket PDF
      setTimeout(() => {
        handleDownloadTicket(response.data?.booking?.pnr);
      }, 1500);
    } catch (error) {
      console.error('Booking error:', error);
      
      // Check if it's an authentication error
      if (error.message?.toLowerCase().includes('token') || 
          error.message?.toLowerCase().includes('unauthorized') ||
          error.message?.toLowerCase().includes('not authenticated')) {
        toast.error('Session expired. Please log in again.');
        setTimeout(() => {
          navigate('/login', { state: { from: location } });
        }, 2000);
      } else {
        toast.error(error.message || 'Booking failed. Please try again.');
      }
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleDownloadTicket = async (pnr) => {
    if (!pnr) {
      pnr = bookingResult?.pnr;
    }
    
    if (!pnr) {
      toast.error('PNR not found');
      return;
    }

    setIsDownloading(true);
    try {
      await bookingApi.downloadTicket(pnr);
      toast.success('Ticket downloaded successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to download ticket');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!trainData?.train) {
    return null;
  }

  // Booking Success Screen
  if (bookingComplete && bookingResult) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-gray-500 mb-6">
            Your ticket has been booked successfully
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">PNR Number</p>
                <p className="text-xl font-bold text-primary-600">
                  {bookingResult.pnr}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-flex px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
                  {bookingResult.pnr_status}
                </span>
              </div>
            </div>
            
            <hr className="my-4 border-gray-200" />
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Train className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    {bookingResult.train_details?.train_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    #{bookingResult.train_details?.train_number}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <p className="text-gray-700">
                  {bookingResult.train_details?.source} →{' '}
                  {bookingResult.train_details?.destination}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <p className="text-gray-700">
                  {format(new Date(bookingResult.train_details?.doj), 'dd MMM yyyy')}
                </p>
              </div>
            </div>

            <hr className="my-4 border-gray-200" />

            <div>
              <p className="text-sm text-gray-500 mb-2">Passengers</p>
              {bookingResult.passenger_details?.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-500">
                      {p.age} yrs, {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>

            <hr className="my-4 border-gray-200" />

            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-700">Total Fare</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{bookingResult.fare_details?.total_fare}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleDownloadTicket()}
              disabled={isDownloading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Ticket PDF
                </>
              )}
            </button>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard/bookings')}
                className="btn-secondary flex-1"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('/search')}
                className="btn-ghost flex-1"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to search
      </button>

      {/* Train Summary */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Train className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {trainData.train.train_name}
              </h2>
              <p className="text-gray-600">#{trainData.train.train_number}</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-end">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {trainData.train.departure}
                </p>
                <p className="text-sm text-gray-500">{trainData.sourceName}</p>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-500">{trainData.train.duration}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {trainData.train.arrival}
                </p>
                <p className="text-sm text-gray-500">{trainData.destinationName}</p>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <p className="text-sm text-gray-500">Journey Date</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(trainData.date), 'dd MMM yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Booking Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class & Quota Selection */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Selected Class & Quota</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coach Class
                </label>
                <div className="px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-900 font-medium">
                  {coachTypes.find(c => c.coach_code === selectedCoach)?.description || selectedCoach} ({selectedCoach})
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reservation Type
                </label>
                <div className="px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-900 font-medium">
                  {reservationTypes.find(r => r.type_code === selectedReservationType)?.description || selectedReservationType}
                </div>
              </div>
            </div>
            {trainData?.selectedFare && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Selected Fare:</span> ₹{trainData.selectedFare} per passenger
                </p>
              </div>
            )}
          </div>

          {/* Passengers */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Passengers ({passengers.length}/6)
              </h3>
              <button
                onClick={addPassenger}
                disabled={passengers.length >= 6}
                className="btn-ghost flex items-center gap-1 text-primary-600"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="space-y-4">
              {passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        Passenger {index + 1}
                      </span>
                    </div>
                    {passengers.length > 1 && (
                      <button
                        onClick={() => removePassenger(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-3 sm:col-span-1">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={passenger.passenger_name}
                          onChange={(e) =>
                            updatePassenger(index, 'passenger_name', e.target.value)
                          }
                          className="input-field text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Age"
                          min="0"
                          max="120"
                          value={passenger.passenger_age}
                          onChange={(e) =>
                            updatePassenger(index, 'passenger_age', e.target.value)
                          }
                          className="input-field text-sm"
                        />
                      </div>
                      <div>
                        <select
                          value={passenger.passenger_gender}
                          onChange={(e) =>
                            updatePassenger(index, 'passenger_gender', e.target.value)
                          }
                          className="input-field text-sm"
                        >
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Passenger Categories */}
                    <div className="flex flex-wrap gap-4 pl-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={passenger.passenger_ischild}
                          onChange={(e) =>
                            updatePassenger(index, 'passenger_ischild', e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          Child {passenger.passenger_age && parseInt(passenger.passenger_age) < 6 ? '(Auto)' : ''}
                        </span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={passenger.passenger_issenior}
                          onChange={(e) =>
                            updatePassenger(index, 'passenger_issenior', e.target.checked)
                          }
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">
                          Senior Citizen {(
                            passenger.passenger_age && 
                            ((passenger.passenger_gender === 'M' && parseInt(passenger.passenger_age) > 60) ||
                             (passenger.passenger_gender === 'F' && parseInt(passenger.passenger_age) > 50))
                          ) ? '(Auto)' : ''}
                        </span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={passenger.passenger_ispwd}
                          onChange={(e) =>
                            updatePassenger(index, 'passenger_ispwd', e.target.checked)
                          }
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">PWD</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={contactInfo.mobile_number}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, mobile_number: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, email: e.target.value })
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fare Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Fare Summary</h3>

            {!fareDetails ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-4">
                  Add passengers and calculate fare
                </p>
                <button
                  onClick={calculateFare}
                  disabled={isCalculating}
                  className="btn-secondary w-full"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Calculating...
                    </>
                  ) : (
                    'Calculate Fare'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Passenger Summary */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-900">Passengers</span>
                    <span className="text-sm font-bold text-blue-900">{passengers.length}</span>
                  </div>
                  <div className="space-y-1 text-xs text-blue-700">
                    {passengers.filter(p => p.passenger_ischild).length > 0 && (
                      <div className="flex justify-between">
                        <span>• Children (&lt;6 years)</span>
                        <span>{passengers.filter(p => p.passenger_ischild).length}</span>
                      </div>
                    )}
                    {passengers.filter(p => p.passenger_issenior).length > 0 && (
                      <div className="flex justify-between">
                        <span>• Senior Citizens</span>
                        <span>{passengers.filter(p => p.passenger_issenior).length}</span>
                      </div>
                    )}
                    {passengers.filter(p => p.passenger_ispwd).length > 0 && (
                      <div className="flex justify-between">
                        <span>• PWD</span>
                        <span>{passengers.filter(p => p.passenger_ispwd).length}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Individual Passenger Fares */}
                {fareDetails.fare?.breakdown?.length > 0 && (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Individual Fares</h4>
                      {fareDetails.fare.breakdown.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{item.passenger || `Passenger ${i + 1}`}</span>
                            {item.isChild && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Child</span>}
                            {item.isSenior && <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">Senior</span>}
                            {item.isPwd && <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">PWD</span>}
                          </div>
                          <span className="text-gray-900 font-medium">₹{item.total || item.fare}</span>
                        </div>
                      ))}
                    </div>
                    <hr className="border-gray-200" />
                  </>
                )}

                {/* Fare Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Fare</span>
                    <span className="text-gray-900">₹{fareDetails.fare?.base_fare || fareDetails.fare?.baseFare || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="text-gray-900">₹{fareDetails.fare?.gst_18_percent || fareDetails.fare?.gst || 0}</span>
                  </div>
                  {(fareDetails.fare?.discount > 0) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount</span>
                      <span className="text-green-600">-₹{fareDetails.fare?.discount}</span>
                    </div>
                  )}
                  {fareDetails.fare?.reservation_charges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reservation Charges</span>
                      <span className="text-gray-900">₹{fareDetails.fare.reservation_charges}</span>
                    </div>
                  )}
                  {fareDetails.fare?.tatkal_charges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tatkal Charges</span>
                      <span className="text-gray-900">₹{fareDetails.fare.tatkal_charges}</span>
                    </div>
                  )}
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-primary-600">
                    ₹{fareDetails.fare?.total_fare || fareDetails.fare?.total || 0}
                  </span>
                </div>

                <button
                  onClick={()=>{
                    handleConfirmAndPay()
                  }}
                  disabled={isSendingOtp}
                  className="btn-primary w-full"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Confirm & Pay
                    </>
                  )}
                </button>

                <button
                  onClick={calculateFare}
                  className="btn-ghost w-full text-sm"
                >
                  Recalculate Fare
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Razorpay Mock Modal */}
      {showRazorpayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center">
              {/* Razorpay Logo Style */}
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-4">
                  <CreditCard className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Razorpay</h2>
                <p className="text-sm text-gray-500">Secure Payment Gateway</p>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600">Merchant</span>
                  <span className="text-sm font-semibold text-gray-900">QuickSmart Trains</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{fareDetails.fare?.total_fare || fareDetails.fare?.total || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Email</span>
                  <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                </div>
              </div>

              {/* Processing Animation */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-gray-700 font-medium">Processing payment...</span>
              </div>

              <p className="text-xs text-gray-500">
                Please wait while we redirect you to OTP verification
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment OTP Modal */}
      {showPaymentOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Secure Payment</h2>
                  <p className="text-sm text-gray-500">Mock Payment OTP</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentOtpModal(false)}
                disabled={isPaymentProcessing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>OTP sent to:</strong> {user?.email}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Enter the 6-digit OTP to confirm your mock payment
              </p>
            </div>

            {/* OTP Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                maxLength="6"
                value={paymentOtp}
                onChange={(e) => setPaymentOtp(e.target.value.replace(/\D/g, ''))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && paymentOtp.length === 6) {
                    handlePaymentOtpVerify();
                  }
                }}
                placeholder="••••••"
                className="input-field text-center text-2xl tracking-widest font-bold"
                autoFocus
                disabled={isPaymentProcessing}
              />
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Development: Check your email for OTP
                </p>
              )}
            </div>

            {/* Amount Display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
              <p className="text-sm text-gray-600 mb-1">Payment Amount</p>
              <p className="text-3xl font-bold text-primary-600">
                ₹{fareDetails?.fare?.total_fare || fareDetails?.fare?.total || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This is a mock transaction - No real money will be charged
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handlePaymentOtpVerify}
                disabled={paymentOtp.length !== 6 || isPaymentProcessing}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  paymentOtp.length === 6 && !isPaymentProcessing
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isPaymentProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Verify & Complete Payment
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowPaymentOtpModal(false);
                  setPaymentOtp('');
                }}
                disabled={isPaymentProcessing}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-700 font-medium disabled:opacity-50"
              >
                Cancel & Go Back
              </button>

              <button
                onClick={async () => {
                  setIsSendingOtp(true);
                  try {
                    await authApi.sendOtp(user?.email, true);
                    toast.success('OTP resent successfully');
                  } catch (error) {
                    toast.error('Failed to resend OTP');
                  } finally {
                    setIsSendingOtp(false);
                  }
                }}
                disabled={isPaymentProcessing || isSendingOtp}
                className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {isSendingOtp ? 'Resending...' : 'Resend OTP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
