import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trains, query } = location.state || { trains: [], query: {} };
  const [filter, setFilter] = useState('ALL');

  const filteredTrains = trains.filter(t => 
    filter === 'ALL' || t.train_type === filter
  );

  const handleBook = (train) => {
    navigate(`/book/${train.train_number}`, { 
      state: { train, query } 
    });
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* Header Summary */}
      <div className="glass rounded-3xl p-8 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-none bg-gradient-to-r from-blue-600/20 to-orange-600/20">
        <div>
          <h1 className="text-3xl font-black mb-1">
            {query.source} <span className="text-slate-500 mx-2">→</span> {query.destination}
          </h1>
          <p className="text-slate-400 font-medium">
            📅 {new Date(query.doj).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Available Trains</p>
            <p className="text-2xl font-black text-orange-500">{trains.length}</p>
          </div>
          <Link to="/" className="btn-secondary px-6 py-3 rounded-xl text-sm font-bold">Modify Search</Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 shrink-0 space-y-6">
          <div className="glass rounded-2xl p-6 border-slate-800">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span>⚡</span> Quick Filters
            </h3>
            <div className="space-y-2">
              {['ALL', 'EXP', 'SUPERFAST', 'RAJDHANI'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${filter === f ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                  {f === 'ALL' ? 'All Trains' : f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 space-y-6">
          {filteredTrains.length === 0 ? (
            <div className="glass rounded-3xl p-16 text-center">
              <span className="text-6xl block mb-6">🏜️</span>
              <h2 className="text-2xl font-bold mb-2">No trains found</h2>
              <p className="text-slate-400">Try adjusting your filters or search criteria.</p>
            </div>
          ) : (
            filteredTrains.map((train) => (
              <div key={train.train_number} className="glass rounded-3xl overflow-hidden hover-card border-slate-800/50">
                {/* Train Info Header */}
                <div className="bg-slate-800/40 px-8 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🚂</span>
                    <div>
                      <h3 className="text-lg font-black text-white">{train.train_name}</h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">#{train.train_number} • {train.train_type}</p>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0 flex gap-2">
                    {(Array.isArray(train.running_days) ? train.running_days : []).filter(d => d !== null).map(day => (
                      <span key={day} className={`text-[10px] font-black px-1.5 py-0.5 rounded ${day ? 'text-blue-400 bg-blue-400/10' : 'text-slate-700'}`}>
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Schedule Body */}
                <div className="p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                    <div className="text-center md:text-left flex-1">
                      <p className="text-3xl font-black">{train.departure_time}</p>
                      <p className="text-sm font-bold text-slate-400 truncate">{train.source_station_name}</p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 px-8 flex-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{train.duration}</p>
                      <div className="relative w-full h-px bg-slate-800 flex items-center justify-center">
                        <div className="absolute w-2 h-2 rounded-full bg-slate-700 left-0"></div>
                        <div className="absolute w-2 h-2 rounded-full bg-slate-700 right-0"></div>
                        <span className="text-lg absolute -top-3">✈️</span>
                      </div>
                      <p className="text-[10px] font-bold text-blue-500">{train.distance} KM</p>
                    </div>

                    <div className="text-center md:text-right flex-1">
                      <p className="text-3xl font-black">{train.arrival_time}</p>
                      <p className="text-sm font-bold text-slate-400 truncate">{train.destination_station_name}</p>
                    </div>
                  </div>

                  {/* Class Selection & Pricing */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['1A', '2A', '3A', 'SL'].map((cls) => (
                      <div key={cls} className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800/50 hover:border-blue-500/30 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-black text-slate-300">{cls}</span>
                          <span className="text-[10px] text-green-400 font-bold">AVL 42</span>
                        </div>
                        <p className="text-xl font-black text-white">₹{train.base_fare ? Math.round(train.base_fare * (cls === '1A' ? 3 : cls === '2A' ? 2 : cls === '3A' ? 1.5 : 1)) : '--'}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex flex-col md:flex-row gap-4">
                    <button onClick={() => handleBook(train)} className="btn-primary flex-1 py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-orange-500/20">
                      Book Now
                    </button>
                    <Link to={`/schedule/${train.train_number}`} className="btn-secondary flex-1 py-4 text-sm font-black uppercase tracking-widest text-center">
                      View Schedule
                    </Link>
                    <Link to={`/live-status/${train.train_number}`} className="bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white px-6 py-4 rounded-xl text-sm font-black border border-blue-500/20 transition-all uppercase tracking-widest text-center">
                      Live Status
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
