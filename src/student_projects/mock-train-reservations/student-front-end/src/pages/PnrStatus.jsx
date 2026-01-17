import React, { useState } from 'react';
import { bookingApi } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  FileText,
  Search,
  Train,
  Calendar,
  MapPin,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
} from 'lucide-react';

const PnrStatus = () => {
  const [pnr, setPnr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pnrData, setPnrData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!pnr || pnr.length < 6) {
      toast.error('Please enter a valid PNR number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await bookingApi.getPnrStatus(pnr);
      const pnrStatus = response.data?.pnr_status || response.pnr_status;
      setPnrData(pnrStatus);
      if (!pnrStatus) {
        toast.error('PNR not found');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch PNR status');
      setPnrData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'WAITING':
      case 'RAC':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return <CheckCircle className="w-6 h-6" />;
      case 'WAITING':
      case 'RAC':
        return <AlertCircle className="w-6 h-6" />;
      case 'CANCELLED':
        return <XCircle className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 rounded-xl">
          <FileText className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">PNR Status</h1>
          <p className="text-sm text-gray-500">Check your ticket status</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={pnr}
              onChange={(e) => setPnr(e.target.value.toUpperCase())}
              placeholder="Enter your 10-digit PNR number"
              className="input-field pl-12 font-mono text-lg tracking-wider"
              maxLength={12}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Checking...
              </>
            ) : (
              'Check Status'
            )}
          </button>
        </form>
      </div>

      {/* PNR Result */}
      {pnrData && (
        <div className="card animate-slide-up">
          {/* Status Banner */}
          <div
            className={`flex items-center gap-4 p-4 rounded-xl mb-6 ${getStatusColor(
              pnrData.pnr_status
            )}`}
          >
            {getStatusIcon(pnrData.pnr_status)}
            <div>
              <p className="text-sm opacity-80">Booking Status</p>
              <p className="text-xl font-bold">{pnrData.pnr_status}</p>
            </div>
          </div>

          {/* PNR & Train Info */}
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">PNR Number</p>
              <p className="text-2xl font-mono font-bold text-primary-600">
                {pnrData.pnr}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-50 rounded-xl">
                <Train className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {pnrData.train_name}
                </p>
                <p className="text-sm text-gray-500">#{pnrData.train_number}</p>
              </div>
            </div>
          </div>

          {/* Journey Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-semibold text-gray-900">
                    {pnrData.source_name}
                  </p>
                </div>
              </div>
              <div className="hidden sm:block text-gray-300">→</div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">To</p>
                  <p className="font-semibold text-gray-900">
                    {pnrData.destination_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold text-gray-900">
                    {pnrData.date_of_journey
                      ? format(new Date(pnrData.date_of_journey), 'dd MMM yyyy')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Passengers */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Passengers ({pnrData.passengers?.length || 0})
            </h3>
            <div className="space-y-3">
              {pnrData.passengers?.length === 0 && (
                <p className="text-gray-500 text-sm p-4 bg-gray-50 rounded-xl">
                  No passenger details available
                </p>
              )}
              {pnrData.passengers?.map((passenger, index) => {
                // Parse status format: "D1/1/WS" -> coach: D1, seat: 1, berth: WS
                const statusParts = passenger.status?.split('/') || [];
                const hasSeating = statusParts.length >= 2;
                const coach = hasSeating ? statusParts[0] : null;
                const seat = hasSeating ? statusParts[1] : null;
                const berth = statusParts[2] || null;
                const isConfirmed = hasSeating && coach && seat;
                
                return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{passenger.name}</p>
                      <p className="text-sm text-gray-500">
                        {passenger.age} yrs,{' '}
                        {passenger.gender === 'M'
                          ? 'Male'
                          : passenger.gender === 'F'
                          ? 'Female'
                          : 'Other'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      isConfirmed ? 'text-green-600' :
                      passenger.status?.startsWith('WL') ? 'text-yellow-600' :
                      passenger.status?.startsWith('RAC') ? 'text-blue-600' :
                      passenger.status === 'CAN' ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {isConfirmed ? 'Confirmed' : passenger.status}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      {hasSeating 
                        ? `${coach}-${seat}${berth ? ` (${berth})` : ''}` 
                        : passenger.status}
                    </p>
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Fare Info */}
          {pnrData.total_fare && (
            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
              <p className="text-gray-600">Total Fare Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{pnrData.total_fare}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Card */}
      {!pnrData && (
        <div className="card bg-gradient-to-r from-gray-50 to-gray-100 border-none">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                How to find your PNR?
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check your booking confirmation email</li>
                <li>• Find it on your e-ticket PDF</li>
                <li>• Look in the "My Bookings" section</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PnrStatus;
