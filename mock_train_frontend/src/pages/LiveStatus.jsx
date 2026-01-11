import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getLiveTrainStatus } from '../api/trainApi';

const LiveStatus = () => {
  const { trainInput } = useParams();
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getLiveTrainStatus(trainInput);
      setStatus(response.data.data.live_status || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch live status');
    } finally {
      setLoading(false);
    }
  }, [trainInput]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Simulate current station (mock)
  const currentStationIdx = Math.floor(status.length / 2);

  if (loading) return <div className="flex justify-center py-20"><div className="loader"></div></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4">Live Running Status</h1>
        <p className="text-slate-400 font-medium tracking-wide">Tracking <span className="text-orange-500">#{trainInput}</span> in real-time</p>
      </div>

      <div className="glass rounded-[3rem] p-10 mb-10 border-none bg-gradient-to-br from-blue-900/10 to-transparent flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="text-center md:text-left">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Position</p>
           <h3 className="text-3xl font-black text-blue-400">{status[currentStationIdx]?.station_name || 'Calculating...'}</h3>
           <p className="text-green-400 font-bold mt-2 flex items-center justify-center md:justify-start gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span> 
             Running on Time
           </p>
         </div>
         <div className="h-20 w-px bg-slate-800 hidden md:block"></div>
         <div className="text-center md:text-right">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Next Halt</p>
           <p className="text-xl font-bold">{status[currentStationIdx + 1]?.station_name || 'Destination Reached'}</p>
           <p className="text-slate-500 text-sm">ETA: {status[currentStationIdx + 1]?.arrival || '--:--'}</p>
         </div>
      </div>

      {/* Tracking Visualization */}
      <div className="relative pl-12 md:pl-20 py-10">
        {/* Track Line */}
        <div className="absolute left-[3.25rem] md:left-[5.25rem] top-0 bottom-0 w-1 bg-gradient-to-b from-slate-800 via-blue-500 to-slate-800 rounded-full"></div>

        <div className="space-y-16">
          {status.map((stop, index) => {
            const isPassed = index < currentStationIdx;
            const isCurrent = index === currentStationIdx;

            return (
              <div key={index} className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 transition-all duration-700 
                ${isPassed ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}>
                
                {/* Status Indicator */}
                <div className={`absolute -left-[1.25rem] md:-left-[1.25rem] w-6 h-6 rounded-full border-4 border-slate-900 z-10 transition-all duration-500
                  ${isPassed ? 'bg-blue-500' : isCurrent ? 'bg-orange-500 scale-150 shadow-lg shadow-orange-500/50 outline outline-4 outline-orange-500/20' : 'bg-slate-700'}`}>
                  {isCurrent && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-orange-500 text-[10px] font-black text-white px-2 py-1 rounded whitespace-nowrap animate-bounce">
                      TRAIN HERE
                    </div>
                  )}
                </div>

                <div className="w-full md:w-32 shink-0">
                  <p className={`text-xl font-black font-mono ${isCurrent ? 'text-orange-500' : 'text-white'}`}>{stop.departure || stop.arrival}</p>
                </div>

                <div className="glass rounded-2xl p-6 flex-1 hover:bg-white/5 transition-all border-slate-800/40">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="text-lg font-black group-hover:text-blue-400 transition-colors">{stop.station_name}</h4>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stop.station_code}</p>
                    </div>
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Arr: {stop.arrival || '--'}</span>
                      <span className="h-3 w-px bg-slate-800"></span>
                      <span>Dep: {stop.departure || '--'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiveStatus;
