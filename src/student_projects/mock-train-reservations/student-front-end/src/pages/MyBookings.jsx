import React, { useState, useEffect } from 'react';
import { bookingApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Ticket,
  Train,
  Calendar,
  MapPin,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  XCircle,
  CheckCircle,
  AlertCircle,
  CreditCard,
  ArrowRight,
  RefreshCw,
  Users,
  IndianRupee,
  Hash,
  Armchair,
  Download,
} from 'lucide-react';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [cancellingPnr, setCancellingPnr] = useState(null);
  const [downloadingPnr, setDownloadingPnr] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState({});
  const [selectedPassengers, setSelectedPassengers] = useState({});

  useEffect(() => {
    if (user?.email) {
      fetchBookings();
    }
  }, [user?.email]);

  const fetchBookings = async () => {
    if (!user?.email) {
      setBookings([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await bookingApi.getBookingHistory(user.email);
      const bookingsData = response.data?.bookings || response.bookings || [];
      setBookings(bookingsData);
    } catch (error) {
      console.log('Bookings fetch:', error);
      toast.error(error.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTicket = async (pnr) => {
    if (!pnr) {
      toast.error('PNR not found');
      return;
    }

    setDownloadingPnr(pnr);
    try {
      await bookingApi.downloadTicket(pnr);
      toast.success('Ticket downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error.message || 'Failed to download ticket');
    } finally {
      setDownloadingPnr(null);
    }
  };

  const handleExpand = async (pnr) => {
    if (expandedBooking === pnr) {
      setExpandedBooking(null);
      return;
    }
    
    setExpandedBooking(pnr);
    
    if (!expandedDetails[pnr]) {
      try {
        const response = await bookingApi.getPnrStatus(pnr);
        const pnrData = response.data?.pnr_status || response.pnr_status;
        if (pnrData) {
          setExpandedDetails(prev => ({ ...prev, [pnr]: pnrData }));
        }
      } catch (error) {
        console.log('Failed to fetch PNR details:', error);
      }
    }
  };

  const handleCancelBooking = async (pnr, passengerIds) => {
    if (passengerIds.length === 0) {
      toast.error('Please select at least one passenger to cancel');
      return;
    }
    
    const confirmMsg = passengerIds.length === 1 
      ? 'Are you sure you want to cancel this passenger?' 
      : `Are you sure you want to cancel ${passengerIds.length} passengers?`;
    
    if (!window.confirm(confirmMsg)) {
      return;
    }

    setCancellingPnr(pnr);
    try {
      const response = await bookingApi.cancelTicket(pnr, passengerIds);
      
      let cancellation = [];
      if (response?.data?.cancellation) {
        cancellation = response.data.cancellation;
      } else if (response?.cancellation) {
        cancellation = response.cancellation;
      } else if (Array.isArray(response?.data)) {
        cancellation = response.data;
      } else if (Array.isArray(response)) {
        cancellation = response;
      }
      
      let totalRefund = 0;
      let cancelledCount = 0;
      
      if (Array.isArray(cancellation)) {
        for (const item of cancellation) {
          if (item.cancel_status) {
            cancelledCount++;
            const refundValue = Number(item.refund_amt) || Number(item.refund_amount) || 0;
            totalRefund += refundValue;
          }
        }
      }
      
      toast.success(
        <div className="font-sans">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="font-semibold text-green-800">Cancellation Successful</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Passengers Cancelled</span>
              <span className="font-semibold text-gray-900">{cancelledCount || 1}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Refund Amount</span>
              <span className="font-bold text-green-700">₹{totalRefund.toFixed(2)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Refund in 5-7 business days (Mock)
          </p>
        </div>,
        { duration: 8000 }
      );
      setSelectedPassengers(prev => ({ ...prev, [pnr]: [] }));
      fetchBookings();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel booking');
    } finally {
      setCancellingPnr(null);
    }
  };

  const togglePassengerSelection = (pnr, passengerId) => {
    setSelectedPassengers(prev => {
      const current = prev[pnr] || [];
      if (current.includes(passengerId)) {
        return { ...prev, [pnr]: current.filter(id => id !== passengerId) };
      } else {
        return { ...prev, [pnr]: [...current, passengerId] };
      }
    });
  };

  const toggleAllPassengers = (pnr, passengers) => {
    setSelectedPassengers(prev => {
      const current = prev[pnr] || [];
      const allIds = passengers
        .filter(p => {
          const pStatus = p.status || p.current_seat_status || '';
          return pStatus !== 'CAN' && pStatus?.toUpperCase() !== 'CANCELLED';
        })
        .map((p, i) => p.passenger_id || p.p_id || i + 1);
      const allSelected = allIds.every(id => current.includes(id));
      
      if (allSelected) {
        return { ...prev, [pnr]: [] };
      } else {
        return { ...prev, [pnr]: allIds };
      }
    });
  };

  const getStatusConfig = (status) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'CNF':
      case 'CONFIRMED':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Confirmed'
        };
      case 'WL':
      case 'WAITING':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          icon: <Clock className="w-4 h-4" />,
          label: 'Waitlist'
        };
      case 'RAC':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'RAC'
        };
      case 'CAN':
      case 'CANCELLED':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: <XCircle className="w-4 h-4" />,
          label: 'Cancelled'
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-700',
          icon: <Clock className="w-4 h-4" />,
          label: status || 'Pending'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-100 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-primary-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-gray-500 font-medium text-base tracking-wide">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-xl p-4 sm:p-5 text-white shadow-2xl shadow-primary-900/30 ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight">My Bookings</h1>
              <p className="text-primary-100/90 mt-0.5 text-xs font-medium tracking-wide">Manage your train reservations</p>
            </div>
          </div>
          
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-200 text-xs font-semibold tracking-wide uppercase"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 mt-4 pt-4 border-t border-white/20">
          <div className="text-center py-2 px-3 border-r border-white/20">
            <p className="text-2xl font-black tracking-tighter tabular-nums">{bookings.length}</p>
            <p className="text-primary-200/80 text-[10px] font-semibold mt-1 uppercase tracking-widest">Total Bookings</p>
          </div>
          <div className="text-center py-2 px-3 border-r border-white/20 bg-white/5">
            <p className="text-2xl font-black tracking-tighter text-emerald-300 tabular-nums">
              {bookings.filter(b => ['CNF', 'CONFIRMED'].includes(b.pnr_status?.toUpperCase())).length}
            </p>
            <p className="text-primary-200/80 text-[10px] font-semibold mt-1 uppercase tracking-widest">Confirmed</p>
          </div>
          <div className="text-center py-2 px-3">
            <p className="text-2xl font-black tracking-tighter text-red-300 tabular-nums">
              {bookings.filter(b => ['CAN', 'CANCELLED'].includes(b.pnr_status?.toUpperCase())).length}
            </p>
            <p className="text-primary-200/80 text-[10px] font-semibold mt-1 uppercase tracking-widest">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200/80 p-12 text-center ring-1 ring-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-gray-200">
            <Ticket className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">No bookings yet</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed font-medium">
            Start your journey by booking your first train ticket. All your reservations will appear here.
          </p>
          <a 
            href="/search" 
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary-600/25 text-sm tracking-wide"
          >
            <Train className="w-5 h-5" />
            Book Your First Ticket
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const pnrDetails = expandedDetails[booking.pnr];
            const trainDetails = booking.train_details || {};
            const journeyDetails = booking.journey_details || {};
            const fareDetails = booking.fare_details || {};
            const passengerDetails = booking.passenger_details || [];
            
            const passengers = pnrDetails?.passengers || passengerDetails || [];
            const trainName = trainDetails.train_name || booking.train_name || 'Train';
            const trainNumber = trainDetails.train_number || booking.train_number || '';
            const sourceName = journeyDetails.source_station || booking.source_name || booking.source || '';
            const destinationName = journeyDetails.destination_station || booking.destination_name || booking.destination || '';
            const totalFare = fareDetails.total_fare || booking.total_fare || 0;
            const passengerCount = fareDetails.passenger_count || passengers.length || booking.passenger_count || 0;
            
            const statusConfig = getStatusConfig(booking.pnr_status);
            const isExpanded = expandedBooking === booking.pnr;
            const isCancelledBooking = ['CANCELLED', 'CAN'].includes(booking.pnr_status?.toUpperCase());

            return (
              <div
                key={booking.pnr}
                className={`bg-white rounded-xl transition-all duration-300 overflow-hidden ring-1 ${
                  isExpanded 
                    ? 'shadow-2xl shadow-primary-600/15 border-2 border-primary-300 ring-primary-200' 
                    : 'shadow-lg shadow-gray-200/60 border border-gray-200/80 ring-gray-100 hover:shadow-xl hover:border-gray-300 hover:ring-gray-200'
                }`}
              >
                {/* Booking Card Header */}
                <div
                  className="p-3 sm:p-4 cursor-pointer bg-gradient-to-r from-white via-gray-50/30 to-white relative"
                  onClick={() => handleExpand(booking.pnr)}
                >
                  {/* Subtle grid pattern overlay */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                  <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    {/* Train Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${statusConfig.bg} ${statusConfig.border} border-2 shadow-md ring-1 ring-white`}>
                        <Train className={`w-5 h-5 ${statusConfig.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-gray-900 truncate tracking-tight">
                            {trainName}
                          </h3>
                          <span className="text-[10px] text-gray-400 font-mono font-semibold bg-gray-100 px-1.5 py-0.5 rounded">#{trainNumber}</span>
                        </div>
                        
                        {/* Journey Route */}
                        <div className="flex items-center gap-1.5 mt-1.5 text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="font-semibold text-xs truncate">{sourceName}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                          <span className="font-semibold text-xs truncate">{destinationName}</span>
                        </div>
                      </div>
                    </div>

                    {/* PNR & Status */}
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap lg:flex-nowrap">
                      {/* Date */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-700 tracking-wide">
                          {booking.date_of_journey
                            ? format(new Date(booking.date_of_journey), 'dd MMM yyyy')
                            : 'N/A'}
                        </span>
                      </div>

                      {/* Passengers */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-700 tabular-nums">{passengerCount}</span>
                      </div>

                      {/* PNR */}
                      <div className="px-3 py-1.5 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-lg border-2 border-primary-200 shadow-sm ring-1 ring-primary-100">
                        <p className="text-[9px] text-primary-500 font-bold uppercase tracking-[0.1em] mb-0">PNR</p>
                        <p className="font-mono font-black text-primary-700 tracking-wider text-sm">
                          {booking.pnr}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 shadow-sm ${statusConfig.bg} ${statusConfig.border}`}>
                        {statusConfig.icon}
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Expand Button */}
                      <button className={`p-2 rounded-lg transition-all duration-200 shadow-sm ${isExpanded ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 ring-1 ring-gray-200'}`}>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t-2 border-gray-200 bg-gradient-to-b from-slate-50 via-gray-50/50 to-white animate-slide-down relative">
                    {/* Grid pattern for expanded section */}
                    <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    <div className="p-3 sm:p-4 space-y-4 relative z-10">
                      
                      {/* Section: Ticket Details */}
                      <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-200 overflow-hidden ring-1 ring-gray-100">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-200">
                          <div className="p-3 bg-gradient-to-br from-white to-gray-50/50 relative group hover:bg-white transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                            <div className="flex items-center gap-1.5 text-gray-400 mb-2">
                              <div className="p-1.5 bg-primary-50 rounded-lg">
                                <Hash className="w-3.5 h-3.5 text-primary-500" />
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-[0.1em]">PNR Number</span>
                            </div>
                            <p className="font-mono text-base font-black text-gray-900 tracking-widest">{booking.pnr}</p>
                          </div>
                          
                          <div className="p-3 bg-gradient-to-br from-white to-gray-50/50 relative group hover:bg-white transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <div className="flex items-center gap-1.5 text-gray-400 mb-2">
                              <div className="p-1.5 bg-blue-50 rounded-lg">
                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Journey Date</span>
                            </div>
                            <p className="text-base font-extrabold text-gray-900 tracking-tight">
                              {booking.date_of_journey
                                ? format(new Date(booking.date_of_journey), 'dd MMM yyyy')
                                : 'N/A'}
                            </p>
                          </div>
                          
                          <div className="p-3 bg-gradient-to-br from-white to-gray-50/50 relative group hover:bg-white transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>
                            <div className="flex items-center gap-1.5 text-gray-400 mb-2">
                              <div className="p-1.5 bg-violet-50 rounded-lg">
                                <Users className="w-3.5 h-3.5 text-violet-500" />
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Passengers</span>
                            </div>
                            <p className="text-base font-extrabold text-gray-900 tabular-nums">{passengerCount}</p>
                          </div>
                          
                          <div className="p-3 bg-gradient-to-br from-emerald-50/30 to-white relative group hover:bg-emerald-50/50 transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                            <div className="flex items-center gap-1.5 text-gray-400 mb-2">
                              <div className="p-1.5 bg-emerald-100 rounded-lg">
                                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Total Fare</span>
                            </div>
                            <p className="text-base font-extrabold text-emerald-600 tabular-nums">
                              ₹{Number(pnrDetails?.total_fare || totalFare || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Section: Passenger Details */}
                      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg shadow-gray-200/50 overflow-hidden ring-1 ring-gray-100">
                        <div className="px-3 py-2.5 border-b-2 border-gray-200 bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 flex items-center justify-between relative">
                          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary-100 rounded-lg shadow-sm">
                              <Users className="w-4 h-4 text-primary-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-xs tracking-tight">Passenger Details</h4>
                              <p className="text-[10px] text-gray-500 font-medium tracking-wide">Seat allocation and status</p>
                            </div>
                          </div>
                          
                          {/* Select All for multiple passengers */}
                          {passengers.length > 1 && !isCancelledBooking && (
                            <label className="flex items-center gap-2 text-[10px] text-gray-600 cursor-pointer hover:text-gray-900 transition-colors font-semibold">
                              <input
                                type="checkbox"
                                checked={
                                  (selectedPassengers[booking.pnr]?.length || 0) > 0 &&
                                  (selectedPassengers[booking.pnr]?.length || 0) === passengers.filter(p => {
                                    const pStatus = p.status || p.current_seat_status || '';
                                    return pStatus !== 'CAN' && pStatus?.toUpperCase() !== 'CANCELLED';
                                  }).length
                                }
                                onChange={() => toggleAllPassengers(booking.pnr, passengers)}
                                className="w-3.5 h-3.5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              />
                              <span className="tracking-wide">Select all</span>
                            </label>
                          )}
                        </div>

                        {pnrDetails === null ? (
                          <div className="flex items-center justify-center p-8 text-gray-500">
                            <Loader2 className="w-5 h-5 animate-spin mr-3" />
                            <span className="text-sm font-medium tracking-wide">Loading passenger details...</span>
                          </div>
                        ) : passengers.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <User className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm font-medium">No passenger details available</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200">
                            {passengers.map((passenger, index) => {
                              const pName = passenger.name || passenger.p_name || 'Passenger';
                              const pAge = passenger.age || passenger.p_age || '';
                              const pGender = passenger.gender || passenger.p_gender || '';
                              const pStatus = passenger.status || passenger.current_seat_status || passenger.updated_seat_status || '';
                              const passengerId = passenger.passenger_id || passenger.p_id || index + 1;
                              const isCancelled = pStatus === 'CAN' || pStatus?.toUpperCase() === 'CANCELLED';
                              const isSelected = (selectedPassengers[booking.pnr] || []).includes(passengerId);
                              
                              const statusParts = pStatus?.split('/') || [];
                              const hasSeating = statusParts.length >= 2;
                              const coach = hasSeating ? statusParts[0] : null;
                              const seat = hasSeating ? statusParts[1] : null;
                              const berth = statusParts[2] || null;
                              const isConfirmed = hasSeating && coach && seat;

                              const passengerStatusConfig = isCancelled 
                                ? getStatusConfig('CANCELLED')
                                : isConfirmed 
                                  ? getStatusConfig('CONFIRMED')
                                  : getStatusConfig(pStatus);

                              return (
                                <div
                                  key={index}
                                  className={`p-3 sm:p-3.5 transition-all duration-200 relative ${
                                    isCancelled 
                                      ? 'bg-gradient-to-r from-red-50 to-red-25 border-l-4 border-l-red-400' 
                                      : isSelected 
                                        ? 'bg-gradient-to-r from-red-50 via-red-50/50 to-white border-l-4 border-l-red-500 shadow-inner' 
                                        : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-white border-l-4 border-l-transparent hover:border-l-primary-400'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {/* Checkbox for multi-passenger cancel */}
                                    {passengers.length > 1 && !isCancelledBooking && !isCancelled && (
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => togglePassengerSelection(booking.pnr, passengerId)}
                                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                                      />
                                    )}

                                    {/* Passenger Avatar */}
                                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white ${
                                      isCancelled 
                                        ? 'bg-gradient-to-br from-red-100 to-red-200' 
                                        : 'bg-gradient-to-br from-primary-100 to-primary-200'
                                    }`}>
                                      <span className={`text-lg font-black ${isCancelled ? 'text-red-600' : 'text-primary-700'}`}>
                                        {pName.charAt(0).toUpperCase()}
                                      </span>
                                    </div>

                                    {/* Passenger Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className={`font-bold text-gray-900 text-sm tracking-tight ${isCancelled ? 'line-through text-gray-400' : ''}`}>
                                          {pName}
                                        </p>
                                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm ${passengerStatusConfig.bg} ${passengerStatusConfig.text} ${passengerStatusConfig.border} border-2`}>
                                          {isCancelled ? 'Cancelled' : isConfirmed ? 'Confirmed' : pStatus || 'Pending'}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-gray-500 mt-0.5 font-medium tracking-wide">
                                        {pAge} years • {pGender === 'M' ? 'Male' : pGender === 'F' ? 'Female' : 'Other'}
                                      </p>
                                    </div>

                                    {/* Seat Info */}
                                    {hasSeating && (
                                      <div className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border-2 shadow-sm ${
                                        isCancelled 
                                          ? 'bg-gray-50 border-gray-200' 
                                          : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                                      }`}>
                                        <div className={`p-1.5 rounded-lg ${isCancelled ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                                          <Armchair className={`w-4 h-4 ${isCancelled ? 'text-gray-400' : 'text-blue-500'}`} />
                                        </div>
                                        <div className="text-right">
                                          <p className={`text-sm font-black tracking-wider ${isCancelled ? 'text-gray-400' : 'text-gray-900'}`}>
                                            {coach}-{seat}
                                          </p>
                                          {berth && (
                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${isCancelled ? 'text-gray-400' : 'text-blue-600'}`}>{berth}</p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Mobile Seat Info */}
                                  {hasSeating && (
                                    <div className="sm:hidden flex items-center gap-2 mt-3 ml-18 text-xs text-gray-600 font-semibold">
                                      <Armchair className="w-4 h-4 text-gray-400" />
                                      <span className={`tracking-wide ${isCancelled ? 'text-gray-400' : ''}`}>
                                        Coach {coach}, Seat {seat}
                                        {berth && ` (${berth})`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Section: Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                        {/* Fare Summary */}
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-xl border-2 border-emerald-200 shadow-lg shadow-emerald-100/50 ring-1 ring-emerald-100">
                          <div className="p-2 bg-white rounded-lg shadow-md ring-1 ring-emerald-100">
                            <CreditCard className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-[0.1em]">Total Amount Paid</p>
                            <p className="text-xl font-black text-emerald-700 tracking-tight tabular-nums">
                              ₹{Number(pnrDetails?.total_fare || totalFare || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Cancel Button */}
                        {!isCancelledBooking && (
                          <div className="flex flex-col sm:flex-row items-end gap-2">
                            {passengers.length > 1 && (selectedPassengers[booking.pnr]?.length || 0) > 0 && (
                              <span className="text-[10px] text-red-600 font-bold tracking-wide sm:hidden">
                                {selectedPassengers[booking.pnr].length} of {passengers.filter(p => {
                                  const pStatus = p.status || p.current_seat_status || '';
                                  return pStatus !== 'CAN' && pStatus?.toUpperCase() !== 'CANCELLED';
                                }).length} passenger(s) selected
                              </span>
                            )}
                            <div className="flex items-center gap-2">
                              {/* Download Ticket Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadTicket(booking.pnr);
                                }}
                                disabled={downloadingPnr === booking.pnr}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 text-blue-700 font-bold rounded-lg border-2 border-blue-300 hover:border-blue-400 shadow-lg shadow-blue-100/50 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ring-1 ring-blue-200"
                              >
                                {downloadingPnr === booking.pnr ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs font-bold tracking-wide">Downloading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-4 h-4" />
                                    <span className="text-xs font-bold tracking-wide">Download Ticket</span>
                                  </>
                                )}
                              </button>

                              {/* Cancel Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const passengerIds = passengers.length === 1
                                    ? [passengers[0].passenger_id || passengers[0].p_id || 1]
                                    : (selectedPassengers[booking.pnr] || []);
                                  handleCancelBooking(booking.pnr, passengerIds);
                                }}
                                disabled={cancellingPnr === booking.pnr || (passengers.length > 1 && (selectedPassengers[booking.pnr]?.length || 0) === 0)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-150 text-red-700 font-bold rounded-lg border-2 border-red-300 hover:border-red-400 shadow-lg shadow-red-100/50 hover:shadow-xl hover:shadow-red-200/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-red-50 disabled:hover:to-red-100 disabled:shadow-none ring-1 ring-red-200"
                              >
                                {cancellingPnr === booking.pnr ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs font-bold tracking-wide">Processing...</span>
                                  </>
                                ) : passengers.length === 1 ? (
                                  <>
                                    <XCircle className="w-4 h-4" />
                                    <span className="text-xs font-bold tracking-wide">Cancel Booking</span>
                                  </>
                                ) : (selectedPassengers[booking.pnr]?.length || 0) === 0 ? (
                                  <>
                                    <User className="w-4 h-4" />
                                    <span className="text-xs font-bold tracking-wide">Select to Cancel</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4" />
                                    <span className="text-xs font-bold tracking-wide">Cancel {selectedPassengers[booking.pnr]?.length}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Cancelled Notice */}
                        {isCancelledBooking && (
                          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border-2 border-red-200 shadow-md shadow-red-100/30 ring-1 ring-red-100">
                            <div className="p-1.5 bg-red-100 rounded-lg">
                              <XCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                              <span className="text-red-800 font-bold block text-xs tracking-tight">Booking Cancelled</span>
                              <span className="text-red-600 text-[10px] font-medium tracking-wide">This reservation has been cancelled</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
