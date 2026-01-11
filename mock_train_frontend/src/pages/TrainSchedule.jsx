import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTrainSchedule } from '../api/trainApi';

const TrainSchedule = () => {
  const { trainInput } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTrainSchedule(trainInput);
      setSchedule(response.data.data.schedule);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  }, [trainInput]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  if (loading) return <div className="flex justify-center py-20"><div className="loader"></div></div>;
  if (!schedule) return <div className="p-10 text-center glass rounded-2xl">Train not found.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
      {/* Header Card */}
      <div className="glass rounded-[3rem] p-8 md:p-12 mb-10 border-none bg-gradient-to-br from-blue-600/20 via-transparent to-orange-600/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <Link to="/" className="text-sm font-bold text-slate-500 hover:text-white mb-6 inline-block transition-colors">← Back to Search</Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2">{schedule.train_name}</h1>
              <div className="flex items-center gap-4">
                 <span className="text-xl font-bold text-orange-500 tracking-widest">#{schedule.train_number}</span>
                 <span className="h-4 w-px bg-slate-700"></span>
                 <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{schedule.train_type}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {schedule.running_days?.map((day, i) => (
                <div key={i} className={`flex flex-col items-center w-12 py-3 rounded-2xl border ${day ? 'border-blue-500/20 bg-blue-500/10 text-blue-400' : 'border-slate-800 text-slate-700'}`}>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Day</span>
                  <span className="text-sm font-black">{day || '--'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="glass rounded-3xl overflow-hidden border-slate-800/50">
        <div className="grid grid-cols-12 bg-slate-900/60 p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-4 md:col-span-5">Station</div>
          <div className="col-span-3 md:col-span-2 text-center">Arrival</div>
          <div className="col-span-3 md:col-span-2 text-center">Departure</div>
          <div className="hidden md:block col-span-2 text-center">Distance</div>
        </div>
        
        <div className="divide-y divide-slate-800/30">
          {schedule.stops?.map((stop, idx) => (
            <div key={idx} className="grid grid-cols-12 p-6 hover:bg-white/5 transition-colors items-center group">
              <div className="col-span-1 text-center font-bold text-slate-600 group-hover:text-blue-500">{idx + 1}</div>
              <div className="col-span-4 md:col-span-5">
                <p className="font-bold text-lg leading-none mb-1">{stop.station_name}</p>
                <p className="text-xs text-slate-500 font-black tracking-widest">{stop.station_code}</p>
              </div>
              <div className="col-span-3 md:col-span-2 text-center font-bold font-mono text-slate-400">{stop.arrival_time || 'START'}</div>
              <div className="col-span-3 md:col-span-2 text-center font-bold font-mono text-slate-400">{stop.departure_time || 'END'}</div>
              <div className="hidden md:block col-span-2 text-center font-black text-xs text-slate-600">{stop.distance_km} KM</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rake Information */}
      <div className="mt-12">
        <h3 className="text-xl font-black mb-6 px-4">Coach Configuration</h3>
        <div className="flex gap-2 overflow-x-auto pb-6 px-4 no-scrollbar">
          {['DL1', 'D1', 'D2', 'C1', 'C2', 'C3', 'PC', 'E1', 'D3', 'D4', 'DL2'].map((c, i) => (
            <div key={i} className="min-w-[80px] h-20 glass rounded-xl flex flex-col items-center justify-center border-slate-800 hover:border-orange-500/50 transition-all cursor-default shrink-0">
               <span className="text-[10px] font-black text-slate-500 uppercase mb-1">Coach</span>
               <span className="font-black text-lg">{c}</span>
               {c === 'PC' && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainSchedule;
