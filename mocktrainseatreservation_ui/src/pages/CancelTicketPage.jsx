/**
 * Cancel Ticket Page (Protected)
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPnrStatus, cancelTicket } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

const CancelTicketPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [pnr, setPnr] = useState(searchParams.get('pnr') || '');
    const [booking, setBooking] = useState(null);
    const [selectedPassengers, setSelectedPassengers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (searchParams.get('pnr')) {
            fetchPnrStatus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchPnrStatus = async () => {
        if (!pnr) {
            setError('Please enter PNR number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await getPnrStatus(pnr);
            if (response.success) {
                const data = response.data.pnr_status;
                if (data.status === 'CANCELLED') {
                    setError('This booking is already cancelled');
                    setBooking(null);
                } else {
                    setBooking(data);
                    // Pre-select active passengers
                    const activePassengers = data.passengers
                        .filter(p => !p.status?.includes('CANCELLED'))
                        .map(p => p.id);
                    setSelectedPassengers(activePassengers);
                }
            }
        } catch (err) {
            setError(err.message || 'PNR not found');
            setBooking(null);
        } finally {
            setLoading(false);
        }
    };

    const togglePassenger = (id) => {
        if (selectedPassengers.includes(id)) {
            setSelectedPassengers(selectedPassengers.filter(p => p !== id));
        } else {
            setSelectedPassengers([...selectedPassengers, id]);
        }
    };

    const handleCancel = async () => {
        if (selectedPassengers.length === 0) {
            setError('Please select at least one passenger');
            return;
        }

        setCancelling(true);
        setError('');

        try {
            const response = await cancelTicket(pnr, selectedPassengers);
            if (response.success) {
                setSuccess(`Cancellation successful! Refund: ₹${response.data.cancellation.total_refund}`);
                setTimeout(() => navigate('/dashboard/booking-history'), 3000);
            }
        } catch (err) {
            setError(err.message || 'Cancellation failed');
        } finally {
            setCancelling(false);
        }
    };

    const activePassengers = booking?.passengers?.filter(p => !p.status?.includes('CANCELLED')) || [];

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Cancel Ticket</h1>
                    <p className="text-slate-400">Cancel full or partial booking</p>
                </div>

                {/* Search */}
                <div className="glass rounded-xl p-6 mb-8 animate-fadeIn">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            className="input flex-1"
                            placeholder="Enter PNR number"
                            value={pnr}
                            onChange={(e) => setPnr(e.target.value)}
                        />
                        <button onClick={fetchPnrStatus} className="btn-primary" disabled={loading}>
                            {loading ? 'Loading...' : 'Fetch'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-center">
                        {success}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner text="Fetching booking..." />
                    </div>
                )}

                {booking && !success && (
                    <div className="card animate-slideUp">
                        {/* Booking Info */}
                        <div className="mb-6 pb-4 border-b border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xl font-bold text-white">{booking.pnr}</span>
                                <span className="badge badge-success">{booking.status}</span>
                            </div>
                            <div className="text-slate-400 text-sm">
                                {booking.train_number} - {booking.train_name}
                            </div>
                            <div className="text-slate-400 text-sm">
                                {booking.source} → {booking.destination} | {booking.date_of_journey}
                            </div>
                        </div>

                        {/* Passengers */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Select Passengers to Cancel
                            </h3>
                            
                            {activePassengers.length === 0 ? (
                                <p className="text-slate-400">All passengers are already cancelled</p>
                            ) : (
                                <div className="space-y-3">
                                    {activePassengers.map((p) => (
                                        <div
                                            key={p.id}
                                            onClick={() => togglePassenger(p.id)}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                                selectedPassengers.includes(p.id)
                                                    ? 'border-red-500 bg-red-500/10'
                                                    : 'border-slate-600 hover:border-slate-500'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPassengers.includes(p.id)}
                                                        onChange={() => {}}
                                                        className="w-5 h-5"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-white">{p.name}</div>
                                                        <div className="text-sm text-slate-400">
                                                            {p.age} yrs, {p.gender} | {p.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Refund Info */}
                        {selectedPassengers.length > 0 && (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-6">
                                <p className="text-yellow-400 text-sm">
                                    ⚠️ Cancellation charges apply. Refund will be processed within 7 working days.
                                </p>
                            </div>
                        )}

                        {/* Action */}
                        {activePassengers.length > 0 && (
                            <button
                                onClick={handleCancel}
                                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                disabled={cancelling || selectedPassengers.length === 0}
                            >
                                {cancelling ? (
                                    <LoadingSpinner size="sm" text="" />
                                ) : (
                                    `Cancel ${selectedPassengers.length} Passenger(s)`
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CancelTicketPage;
