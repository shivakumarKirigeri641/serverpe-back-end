/**
 * ============================================================================
 * LANDING PAGE - Hero Section & Feature Cards
 * ============================================================================
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConnectionStatus from '../components/ConnectionStatus';
import AutoSuggest from '../components/AutoSuggest';
import { getStations } from '../services/api';
import {
  FiSearch,
  FiFileText,
  FiClock,
  FiMapPin,
  FiNavigation,
  FiCreditCard,
  FiXCircle,
  FiList,
  FiCalendar,
  FiArrowRight,
} from 'react-icons/fi';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [doj, setDoj] = useState('');
  const [sourceSearch, setSourceSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  // Refs for focus flow
  const destRef = useRef(null);
  const dateRef = useRef(null);
  const searchButtonRef = useRef(null);

  useEffect(() => {
    getStations().then(data => setStations(data?.stations || [])).catch(console.error);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!source || !destination || !doj) return;
    navigate(`/search-trains?source=${source}&destination=${destination}&doj=${doj}`);
  };

  const publicFeatures = [
    {
      icon: FiSearch,
      title: 'Search Trains',
      description: 'Find trains between any two stations with availability',
      path: '/search-trains',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FiFileText,
      title: 'PNR Status',
      description: 'Check your booking status with PNR number',
      path: '/pnr-status',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FiClock,
      title: 'Train Schedule',
      description: 'View complete schedule and stops of any train',
      path: '/train-schedule',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: FiMapPin,
      title: 'Live Train Status',
      description: 'Track real-time train running status',
      path: '/live-train-status',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: FiNavigation,
      title: 'Live Station',
      description: 'See trains arriving at any station',
      path: '/live-station',
      color: 'from-teal-500 to-green-500',
    },
  ];

  const protectedFeatures = [
    {
      icon: FiCreditCard,
      title: 'Book Tickets',
      description: 'Reserve seats on your preferred train',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: FiXCircle,
      title: 'Cancel Tickets',
      description: 'Cancel bookings and manage refunds',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: FiList,
      title: 'Booking History',
      description: 'View all your past bookings',
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 pb-32 px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-orange-600/10 blur-3xl opacity-50" />
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-6xl mx-auto flex flex-col items-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 animate-slide-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Live Mock System 2.0</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-center leading-tight tracking-tighter animate-slide-up">
            Book Mock Tickets with <br />
            <span className="gradient-text">Zero Real Cash</span>
          </h1>

          <p className="max-w-xl mx-auto text-gray-400 text-lg mb-12 text-center font-medium animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Experience the future of Indian Railways reservation workflow. 
            Search, book, and manage fake tickets with real-time logic.
          </p>

          {/* Hero Search Bar - The "Smart" Section */}
          <div className="w-full max-w-4xl glass-card p-2 md:p-3 rounded-3xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <form onSubmit={handleQuickSearch} className="flex flex-col md:flex-row gap-2">
               <div className="flex-1">
                 <AutoSuggest
                    placeholder="From Station"
                    data={stations}
                    value={sourceSearch}
                    onSelect={(code, display) => {
                      setSource(code);
                      setSourceSearch(display);
                    }}
                    iconColor="text-blue-400"
                    nextFieldRef={destRef}
                 />
               </div>
               
               <div className="flex items-center justify-center p-2 hidden md:flex">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                     <FiArrowRight />
                  </div>
               </div>

               <div className="flex-1">
                 <AutoSuggest
                    ref={destRef}
                    placeholder="To Station"
                    data={stations}
                    value={destSearch}
                    onSelect={(code, display) => {
                      setDestination(code);
                      setDestSearch(display);
                    }}
                    iconColor="text-red-400"
                    nextFieldRef={dateRef}
                 />
               </div>

               <div className="flex-1 relative group">
                  <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors z-20" />
                  <input
                    ref={dateRef}
                    type="date"
                    value={doj}
                    onChange={(e) => {
                      setDoj(e.target.value);
                      setTimeout(() => searchButtonRef.current?.focus(), 100);
                    }}
                    min={today}
                    max={maxDateString}
                    className="input-field pl-12 h-[52px] rounded-2xl border-white/5 focus:border-blue-500/50 bg-slate-900/40 relative z-10"
                  />
               </div>

               <button
                  ref={searchButtonRef}
                  type="submit"
                  className="btn-primary h-[52px] md:h-auto md:aspect-square md:w-[60px] flex items-center justify-center rounded-2xl md:rounded-2xl shadow-lg shadow-blue-500/20"
               >
                  <FiSearch className="text-xl" />
                  <span className="md:hidden ml-2 font-bold uppercase tracking-widest text-sm">Search Trains</span>
               </button>
            </form>
          </div>

          {/* Quick Stats/Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white">60+</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Stations</span>
             </div>
             <div className="w-px h-8 bg-white/10 self-center hidden md:block" />
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white">10</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Coach Types</span>
             </div>
             <div className="w-px h-8 bg-white/10 self-center hidden md:block" />
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white">6</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Quotas</span>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section - Public */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-2">
            Quick Actions
          </h3>
          <p className="text-gray-400 text-center mb-10">
            No login required for these features
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicFeatures.map((feature) => (
              <Link
                key={feature.path}
                to={feature.path}
                className="feature-card group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} 
                              flex items-center justify-center mb-4 
                              group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="text-white text-xl" />
                </div>
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Protected */}
      <section className="py-16 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-2">
            Booking Features
          </h3>
          <p className="text-gray-400 text-center mb-10">
            {isAuthenticated
              ? 'Access these features from your dashboard'
              : 'Login to access these features'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {protectedFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="glass-card p-6 relative overflow-hidden"
              >
                {!isAuthenticated && (
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
                    <Link to="/login" className="btn-primary text-sm">
                      Login to Access
                    </Link>
                  </div>
                )}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} 
                              flex items-center justify-center mb-4`}
                >
                  <feature.icon className="text-white text-xl" />
                </div>
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-10">
            How It Works
          </h3>

          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Search Trains',
                desc: 'Enter source, destination, and travel date',
              },
              {
                step: '2',
                title: 'Select Train & Class',
                desc: 'Choose from available trains and coach types',
              },
              {
                step: '3',
                title: 'Add Passengers',
                desc: 'Fill in passenger details for booking',
              },
              {
                step: '4',
                title: 'Confirm Booking',
                desc: 'Get instant PNR and booking confirmation',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-6 glass-card p-4"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            🎓 Student Project • Powered by{' '}
            <span className="text-blue-400">ServerPE</span>
          </p>
          <p className="text-gray-600 text-xs mt-2">
            This is a mock system for educational purposes only. No real bookings are made.
          </p>
        </div>
      </footer>
    </div>
  );
}
