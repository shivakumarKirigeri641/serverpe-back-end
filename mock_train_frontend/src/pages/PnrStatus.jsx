import React, { useState } from 'react';
import { getPnrStatus } from '../api/trainApi';

const PnrStatus = () => {
  const [pnr, setPnr] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pnr) return;

    setLoading(true);
    setError('');
    setStatus(null);
    try {
      const response = await getPnrStatus(pnr);
      setStatus(response.data.data.pnr_status);
    } catch (err) {
      setError(err.response?.data?.message || 'PNR not found or invalid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4">PNR Status</h1>
        <p className="text-slate-400">Track your booking and seat confirmation instantly</p>
      </div>

      {/* Search Bar */}
      <div className="glass rounded-[2.5rem] p-3 mb-12 shadow-2xl relative max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex bg-slate-900 rounded-[2rem] overflow-hidden">
          <input
            type="text"
            value={pnr}
            onChange={(e) => setPnr(e.target.value)}
            placeholder="Enter 10-digit PNR Number"
            className="flex-1 bg-transparent px-8 py-5 text-xl font-bold focus:outline-none placeholder:text-slate-700 tracking-widest"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 px-10 font-black uppercase text-sm tracking-widest hover:bg-orange-600 transition-all"
          >
            {loading ? <div className="loader w-5 h-5 mx-auto"></div> : 'Check Status'}
          </button>
        </form>
        {error && <p className="absolute -bottom-8 left-0 w-full text-center text-red-500 text-sm font-bold">{error}</p>}
      </div>

      {status && (
        <div className="animate-slide-up">
           <div className="glass rounded-3xl overflow-hidden border-slate-800/50">
             {/* Status Header */}
             <div className="bg-slate-800/50 p-8 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Train Details</p>
                  <h2 className="text-2xl font-black">{status.train_name} <span className="text-orange-500">#{status.train_number}</span></h2>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Journey Date</p>
                  <p className="text-xl font-bold">{new Date(status.date_of_journey).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
             </div>

             {/* Journey Route */}
             <div className="p-8 border-b border-slate-800/30">
               <div className="flex items-center justify-between max-w-2xl mx-auto mb-10">
                 <div className="text-center">
                   <p className="text-2xl font-black">{status.source_code}</p>
                   <p className="text-xs text-slate-500 font-bold">{status.source_name}</p>
                 </div>
                 <div className="flex-1 px-10 flex flex-col items-center">
                   <div className="w-full h-px bg-slate-800 relative flex items-center justify-center">
                     <span className="text-xl absolute -top-3">🚂</span>
                   </div>
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-4">CLASS: {status.coach_code}</p>
                 </div>
                 <div className="text-center">
                   <p className="text-2xl font-black">{status.destination_code}</p>
                   <p className="text-xs text-slate-500 font-bold">{status.destination_name}</p>
                 </div>
               </div>

               {/* Passengers Table */}
               <div className="space-y-4">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Passenger Status</p>
                  {status.passengers.map((p, i) => (
                    <div key={i} className="bg-slate-900/40 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-400">{i+1}</div>
                        <div>
                          <p className="font-bold text-lg">{p.passenger_name}</p>
                          <p className="text-xs text-slate-500">{p.passenger_age} Yrs • {p.passenger_gender === 'M' ? 'Male' : 'Female'}</p>
                        </div>
                      </div>
                      <div className="flex gap-8">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Booking</p>
                          <p className="font-bold text-blue-400">{p.booking_status}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Current</p>
                          <p className={`font-bold ${p.current_status === 'CNF' ? 'text-green-500' : 'text-orange-500'}`}>{p.current_status}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Coach/Seat</p>
                          <p className="font-bold">{p.coach_code || '--'} / {p.seat_number || '--'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
             </div>

             {/* Footer Info */}
             <div className="bg-slate-900/60 p-6 flex justify-between items-center">
                <p className="text-xs text-slate-500">Charts Prepared: <span className="text-slate-300 font-bold">NO</span></p>
                <div className="flex gap-3">
                  <button className="text-xs font-bold text-slate-400 hover:text-white underline underline-offset-4">Refresh Status</button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PnrStatus;
