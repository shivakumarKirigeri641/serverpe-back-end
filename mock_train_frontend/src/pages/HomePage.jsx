import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getStations, searchTrains } from '../api/trainApi';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [doj, setDoj] = useState('');
  
  const [sourceResults, setSourceResults] = useState([]);
  const [destResults, setDestResults] = useState([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  
  // Highlighting state
  const [sourceHighlightIdx, setSourceHighlightIdx] = useState(0);
  const [destHighlightIdx, setDestHighlightIdx] = useState(0);
  
  const sourceRef = useRef(null);
  const destRef = useRef(null);
  const dateRef = useRef(null);
  const searchButtonRef = useRef(null);

  useEffect(() => {
    fetchStations();
    setDoj(getTodayDate());
  }, []);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 60);
    return maxDate.toISOString().split('T')[0];
  };

  const fetchStations = async () => {
    try {
      const response = await getStations();
      setStations(response.data.data.stations || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const filterStations = (query) => {
    if (!query || query.length < 2) return [];
    const q = query.toUpperCase();
    return stations.filter(s => 
      s.code.includes(q) || s.station_name.toUpperCase().includes(q)
    ).slice(0, 8);
  };

  const selectSource = (station) => {
    setSource(`${station.station_name} (${station.code})`);
    setShowSourceDropdown(false);
    setSourceHighlightIdx(0);
    // Auto-focus next control
    setTimeout(() => destRef.current?.focus(), 10);
  };

  const selectDest = (station) => {
    setDestination(`${station.station_name} (${station.code})`);
    setShowDestDropdown(false);
    setDestHighlightIdx(0);
    // Auto-focus next control
    setTimeout(() => dateRef.current?.focus(), 10);
  };

  const extractCode = (value) => {
    const match = value.match(/\(([A-Z]+)\)/);
    return match ? match[1] : value;
  };

  // Keyboard navigation for Source
  const handleSourceKeyDown = (e) => {
    if (!showSourceDropdown || sourceResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSourceHighlightIdx(prev => (prev + 1) % sourceResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSourceHighlightIdx(prev => (prev - 1 + sourceResults.length) % sourceResults.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      // If a result is highlighted, select it
      if (sourceResults[sourceHighlightIdx]) {
        e.preventDefault();
        selectSource(sourceResults[sourceHighlightIdx]);
      }
    } else if (e.key === 'Escape') {
      setShowSourceDropdown(false);
    }
  };

  // Keyboard navigation for Destination
  const handleDestKeyDown = (e) => {
    if (!showDestDropdown || destResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDestHighlightIdx(prev => (prev + 1) % destResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDestHighlightIdx(prev => (prev - 1 + destResults.length) % destResults.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (destResults[destHighlightIdx]) {
        e.preventDefault();
        selectDest(destResults[destHighlightIdx]);
      }
    } else if (e.key === 'Escape') {
      setShowDestDropdown(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    const srcCode = extractCode(source);
    const destCode = extractCode(destination);
    
    if (!srcCode || !destCode || !doj) {
      setError('Please provide all journey details');
      return;
    }
    setLoading(true);
    try {
      const response = await searchTrains(srcCode, destCode, doj);
      navigate('/search', { 
        state: { 
          trains: response.data.data.trains,
          query: { source: srcCode, destination: destCode, doj }
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Hero Background Elements */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>

      {/* Hero Section */}
      <div className="flex flex-col items-center py-12 md:py-20 animate-fade-in text-center">
        <div className="mb-6 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold tracking-[0.2em] text-orange-400 uppercase">
          🚀 Next-Gen Train Reservation
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          Journey Beyond <br />
          <span className="gradient-text">Boundaries.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12">
          Experience the most professional and seamless train booking system. 
          Real-time availability, instant PNR status, and secure payments.
        </p>

        {/* Hero Search Card */}
        <div className="w-full max-w-5xl glass rounded-3xl p-2 md:p-3 shadow-2xl relative">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-stretch md:items-center bg-slate-900/60 rounded-2xl p-4 md:p-6 gap-4">
            {/* From */}
            <div className="flex-1 relative">
              <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-4">
                <span className="mr-2">⏺</span> From Station
              </label>
              <input
                ref={sourceRef}
                type="text"
                value={source}
                autoComplete="off"
                onChange={(e) => {
                  setSource(e.target.value);
                  const filtered = filterStations(e.target.value);
                  setSourceResults(filtered);
                  setShowSourceDropdown(true);
                  setSourceHighlightIdx(0); // Reset highlight to first item
                }}
                onKeyDown={handleSourceKeyDown}
                onFocus={() => {
                  setShowSourceDropdown(true);
                  if (source) setSourceResults(filterStations(source));
                }}
                onBlur={() => setTimeout(() => setShowSourceDropdown(false), 200)}
                placeholder="Where from?"
                className="w-full bg-transparent px-4 py-2 text-xl font-bold placeholder:text-slate-700 focus:outline-none"
              />
              {showSourceDropdown && sourceResults.length > 0 && (
                <div className="absolute z-50 w-full left-0 mt-4 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-slide-up">
                  {sourceResults.map((s, idx) => (
                    <div 
                      key={s.code} 
                      onClick={() => selectSource(s)} 
                      onMouseEnter={() => setSourceHighlightIdx(idx)}
                      className={`px-6 py-4 cursor-pointer flex justify-between items-center group transition-colors
                        ${idx === sourceHighlightIdx ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}
                    >
                      <div>
                        <div className={`font-bold transition-all ${idx === sourceHighlightIdx ? 'text-blue-400' : 'group-hover:text-blue-400'}`}>
                          {s.station_name}
                        </div>
                        <div className="text-xs text-slate-500">{s.zone}</div>
                      </div>
                      <div className={`text-sm font-black transition-colors ${idx === sourceHighlightIdx ? 'text-blue-500' : 'text-slate-600 group-hover:text-blue-500'}`}>
                        {s.code}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center justify-center h-12 w-12 rounded-full border border-slate-700 text-slate-500 shrink-0">
              ⇄
            </div>

            {/* To */}
            <div className="flex-1 relative">
              <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-4">
                <span className="mr-2">📍</span> To Station
              </label>
              <input
                ref={destRef}
                type="text"
                value={destination}
                autoComplete="off"
                onChange={(e) => {
                  setDestination(e.target.value);
                  const filtered = filterStations(e.target.value);
                  setDestResults(filtered);
                  setShowDestDropdown(true);
                  setDestHighlightIdx(0); // Reset highlight to first item
                }}
                onKeyDown={handleDestKeyDown}
                onFocus={() => {
                  setShowDestDropdown(true);
                  if (destination) setDestResults(filterStations(destination));
                }}
                onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
                placeholder="Where to?"
                className="w-full bg-transparent px-4 py-2 text-xl font-bold placeholder:text-slate-700 focus:outline-none"
              />
              {showDestDropdown && destResults.length > 0 && (
                <div className="absolute z-50 w-full left-0 mt-4 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-slide-up">
                  {destResults.map((s, idx) => (
                    <div 
                      key={s.code} 
                      onClick={() => selectDest(s)} 
                      onMouseEnter={() => setDestHighlightIdx(idx)}
                      className={`px-6 py-4 cursor-pointer flex justify-between items-center group transition-colors
                        ${idx === destHighlightIdx ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}
                    >
                      <div>
                        <div className={`font-bold transition-all ${idx === destHighlightIdx ? 'text-orange-400' : 'group-hover:text-orange-400'}`}>
                          {s.station_name}
                        </div>
                        <div className="text-xs text-slate-500">{s.zone}</div>
                      </div>
                      <div className={`text-sm font-black transition-colors ${idx === destHighlightIdx ? 'text-orange-500' : 'text-slate-600 group-hover:text-orange-500'}`}>
                        {s.code}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date */}
            <div className="md:w-48">
              <label className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-4">
                <span className="mr-2">📅</span> Date
              </label>
              <input
                ref={dateRef}
                type="date"
                value={doj}
                onChange={(e) => setDoj(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Tab') {
                    // Selection made via Tab/Enter auto-focuses search button
                    // But for native date picker, we might just let it be
                  }
                }}
                min={getTodayDate()}
                max={getMaxDate()}
                className="w-full bg-transparent px-4 py-2 text-xl font-bold focus:outline-none [color-scheme:dark]"
              />
            </div>

            <button 
              ref={searchButtonRef}
              type="submit" 
              disabled={loading} 
              className="md:w-16 h-16 md:rounded-xl bg-orange-500 flex items-center justify-center text-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30"
            >
              {loading ? <div className="loader w-6 h-6 border-white/20 border-t-white"></div> : '🔍'}
            </button>
          </form>
          {error && <p className="absolute -bottom-10 left-0 w-full text-center text-red-400 text-sm font-bold">{error}</p>}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20 max-w-6xl mx-auto px-4">
        {[
          { icon: '🎫', title: 'Smart Booking', desc: 'Secure and verified ticket reservations with real-time fare management.' },
          { icon: '📡', title: 'Live Tracking', desc: 'Monitor your train journey with ultra-precise live running status and station maps.' },
          { icon: '🔍', title: 'Deep PNR Analytics', desc: 'Get detailed insights into your seat confirmation chances and passenger status.' },
        ].map((f, i) => (
          <div key={i} className="glass rounded-3xl p-8 hover-card border-none bg-gradient-to-b from-white/5 to-transparent">
            <span className="text-5xl mb-6 block">{f.icon}</span>
            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick Access CTA */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="glass rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-blue-900/40 via-transparent to-orange-900/40 border-none">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold mb-2">Check PNR Status on the go.</h2>
            <p className="text-slate-400">Track your confirmation status instantly.</p>
          </div>
          <div className="flex gap-4">
            <Link to="/pnr-status" className="btn-secondary px-8 py-4 rounded-2xl font-bold">PNR Status</Link>
            {!isLoggedIn && <Link to="/login" className="btn-primary px-8 py-4 rounded-2xl font-bold">Join Now</Link>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
