import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookingHistory, cancelTicket } from '../api/trainApi';

const BookingHistory = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBookingHistory(user.email);
      setBookings(response.data.data.bookings || []);
    } catch (err) {
      setError('Failed to load booking history');
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  useEffect(() => {
    if (user?.email) {
      fetchHistory();
    }
  }, [user, fetchHistory]);

  const handleCancelRequest = async (pnr, passengers) => {
    if (!window.confirm(`Are you sure you want to cancel PNR ${pnr}?`)) return;

    setProcessingId(pnr);
    try {
      const passengerIds = passengers.map(p => p.passenger_id);
      await cancelTicket(pnr, passengerIds);
      await fetchHistory();
      alert('Ticket cancelled successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="loader"></div></div>;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2">My Bookings</h1>
          <p className="text-slate-400 font-medium tracking-wide italic">Track and manage your past journeys</p>
        </div>
        <Link to="/" className="btn-secondary px-6 py-3 rounded-2xl text-sm font-black border-slate-700">Book New Journey</Link>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 mb-8 font-bold">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="glass rounded-[3rem] p-20 text-center border-none bg-gradient-to-b from-white/5 to-transparent">
          <span className="text-8xl block mb-6 drop-shadow-2xl">🏜️</span>
          <h2 className="text-3xl font-black mb-4">No Journeys Found</h2>
          <p className="text-slate-400 mb-10 max-w-md mx-auto">It looks like you haven't booked any adventures yet. Ready to start your first journey?</p>
          <Link to="/" className="btn-primary px-10 py-4 rounded-2xl font-black tracking-widest uppercase">Plan a Journey</Link>
        </div>
      ) : (
        <div className="space-y-10">
          {bookings.map((booking) => (
            <div key={booking.pnr} className="glass rounded-[2.5rem] overflow-hidden hover-card border-none bg-gradient-to-br from-white/10 to-transparent">
              {/* Header */}
              <div className="bg-slate-800/60 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/50">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🚂</span>
                  <div>
                    <h3 className="text-lg font-black">{booking.train_name}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">#{booking.train_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">PNR NUMBER</p>
                  <p className="text-2xl font-black text-orange-500 tracking-[0.2em]">{booking.pnr}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Route</label>
                    <p className="text-lg font-bold">{booking.source_code} <span className="text-slate-600">→</span> {booking.destination_code}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Journey Date</label>
                    <p className="text-lg font-bold">{new Date(booking.date_of_journey).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Class</label>
                    <p className="text-lg font-bold">{booking.coach_code}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Total Paid</label>
                    <p className="text-lg font-black text-green-400">₹{booking.total_fare}</p>
                  </div>
                </div>

                {/* Passengers List */}
                <div className="bg-slate-900/60 rounded-3xl p-6 border border-slate-800/50">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Passenger Details</p>
                  <div className="divide-y divide-slate-800/50">
                    {booking.passengers?.map((p, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-slate-700">{idx + 1}.</span>
                          <div>
                            <p className="font-bold">{p.passenger_name}</p>
                            <p className="text-[10px] text-slate-500">{p.passenger_age}Y • {p.passenger_gender === 'M' ? 'MALE' : 'FEMALE'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-600 uppercase mb-0.5">Seat</p>
                             <p className="text-sm font-bold">{p.coach_code}/{p.seat_number}</p>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                            ${p.booking_status === 'CNF' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {p.booking_status === 'CNF' ? 'Confirmed' : 'Cancelled'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => handleCancelRequest(booking.pnr, booking.passengers)}
                    disabled={processingId === booking.pnr || booking.passengers.every(p => p.booking_status === 'CAN')}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                      ${booking.passengers.every(p => p.booking_status === 'CAN')
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20'
                      }`}
                  >
                    {processingId === booking.pnr ? 'Processing...' : 
                     booking.passengers.every(p => p.booking_status === 'CAN') ? 'No active tickets' : 'Cancel Ticket'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
