/**
 * Booking History Page (Protected)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookingHistory } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

const BookingHistoryPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.email) return;
            
            try {
                const response = await getBookingHistory(user.email);
                if (response.success) {
                    setBookings(response.data.bookings);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch booking history');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'BOOKED': return 'badge-success';
            case 'CANCELLED': return 'badge-error';
            default: return 'badge-warning';
        }
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
                    <p className="text-slate-400">View your booking history</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner text="Loading bookings..." />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4">🎫</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Bookings Found</h3>
                        <p className="text-slate-400 mb-6">You haven't made any bookings yet</p>
                        <button onClick={() => navigate('/dashboard/book-ticket')} className="btn-primary">
                            Book Your First Ticket
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fadeIn">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="card card-hover">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-lg font-bold text-blue-400">{booking.pnr}</span>
                                            <span className={`badge ${getStatusBadge(booking.pnr_status)}`}>
                                                {booking.pnr_status}
                                            </span>
                                        </div>
                                        <div className="text-white font-medium">
                                            {booking.train_number} - {booking.train_name}
                                        </div>
                                        <div className="text-slate-400 text-sm mt-1">
                                            {booking.source_name} → {booking.destination_name}
                                        </div>
                                        <div className="text-slate-500 text-xs mt-1">
                                            Date: {booking.date_of_journey}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-green-400">
                                                ₹{booking.total_fare}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {booking.passengers_count} passenger(s)
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => navigate(`/pnr-status?pnr=${booking.pnr}`)}
                                                className="btn-secondary text-sm"
                                            >
                                                View
                                            </button>
                                            {booking.pnr_status === 'BOOKED' && (
                                                <button
                                                    onClick={() => navigate(`/dashboard/cancel-ticket?pnr=${booking.pnr}`)}
                                                    className="text-red-400 hover:text-red-300 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingHistoryPage;
