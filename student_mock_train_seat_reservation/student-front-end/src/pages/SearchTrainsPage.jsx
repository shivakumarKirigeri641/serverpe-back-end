/**
 * ============================================================================
 * SEARCH TRAINS PAGE
 * ============================================================================
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStations, searchTrains } from '../services/api';
import { PageLoader, ButtonLoader } from '../components/Loader';
import AutoSuggest from '../components/AutoSuggest';
import TrainScheduleModal from '../components/TrainScheduleModal';
import { FiSearch, FiMapPin, FiCalendar, FiArrowRight, FiClock, FiUsers, FiNavigation } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SearchTrainsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [trains, setTrains] = useState([]);
  const [error, setError] = useState(null);

  // Form state
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [doj, setDoj] = useState('');
  const [sourceSearch, setSourceSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Accordion state
  const [expandedIndex, setExpandedIndex] = useState(0);

  // Schedule modal state
  const [scheduleModalTrain, setScheduleModalTrain] = useState(null);

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Refs for focus flow
  const destRef = useRef(null);
  const dateRef = useRef(null);
  const searchButtonRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const result = await loadStations();
      if (result) {
        // Check for query params
        const params = new URLSearchParams(location.search);
        const qSource = params.get('source');
        const qDest = params.get('destination');
        const qDoj = params.get('doj');

        if (qSource && qDest && qDoj) {
          setSource(qSource);
          setDestination(qDest);
          setDoj(qDoj);
          
          // Set display names if found
          const sStation = result.find(s => s.code === qSource);
          const dStation = result.find(s => s.code === qDest);
          if (sStation) setSourceSearch(`${sStation.station_name} (${sStation.code})`);
          if (dStation) setDestSearch(`${dStation.station_name} (${dStation.code})`);
          
          // Trigger search after state updates
          performSearch(qSource, qDest, qDoj);
        }
      }
    };
    init();
  }, [location]);

  const loadStations = async () => {
    try {
      const result = await getStations();
      const stationList = result.stations || [];
      setStations(stationList);
      return stationList;
    } catch (err) {
      setError(err);
      toast.error(err.userMessage || 'Failed to load stations');
    } finally {
      setLoading(false);
    }
    return null;
  };

  const performSearch = async (s, d, date) => {
    setSearching(true);
    setExpandedIndex(0); // Reset accordion to first item
    try {
      const result = await searchTrains(s, d, date);
      setTrains(result.trainslist || []);
      
      if ((result.trainslist || []).length === 0) {
        toast('No trains found for this route', { icon: '🔍' });
      } else {
        toast.success(`Found ${result.trainslist.length} trains`);
      }
    } catch (err) {
      setError(err);
      toast.error(err.userMessage || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!source || !destination || !doj) {
      toast.error('Please fill all fields');
      return;
    }
    if (source === destination) {
      toast.error('Source and destination cannot be same');
      return;
    }
    performSearch(source, destination, doj);
  };

  // Filter stations based on search
  const filteredSourceStations = stations.filter(
    (s) =>
      s.code.toLowerCase().includes(sourceSearch.toLowerCase()) ||
      s.station_name.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  const filteredDestStations = stations.filter(
    (s) =>
      s.code.toLowerCase().includes(destSearch.toLowerCase()) ||
      s.station_name.toLowerCase().includes(destSearch.toLowerCase())
  );

  const handleBook = (trainNumber) => {
    if (!isAuthenticated) {
      toast.error('Please login to book tickets');
      navigate('/login');
      return;
    }
    // Navigate to booking page with context
    navigate(`/dashboard/book-ticket?train=${trainNumber}&source=${source}&destination=${destination}&doj=${doj}`);
  };

  if (loading) return <PageLoader text="Loading stations..." />;

  return (
    <div className="min-h-screen pt-20 px-4 pb-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2 text-white">Search Trains</h1>
          <p className="text-gray-400">Find the best trains for your journey</p>
        </div>

        {/* Search Form */}
        <div className="glass-card p-6 mb-8 border-white/10">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Source */}
              <AutoSuggest
                label="From"
                placeholder="Source station"
                data={stations}
                value={sourceSearch}
                onSelect={(code, display) => {
                  setSource(code);
                  setSourceSearch(display);
                }}
                iconColor="text-green-400"
                nextFieldRef={destRef}
              />

              <AutoSuggest
                  ref={destRef}
                  label="To"
                  placeholder="Destination station"
                  data={stations}
                  value={destSearch}
                  onSelect={(code, display) => {
                    setDestination(code);
                    setDestSearch(display);
                  }}
                  iconColor="text-red-400"
                  nextFieldRef={dateRef}
                />

              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Date</label>
                <div className="relative">
                  <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={dateRef}
                    type="date"
                    value={doj}
                    onChange={(e) => {
                      setDoj(e.target.value);
                      // Auto-focus search button after date selection
                      setTimeout(() => searchButtonRef.current?.focus(), 100);
                    }}
                    min={today}
                    max={maxDateString}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  ref={searchButtonRef}
                  type="submit"
                  disabled={searching}
                  className="btn-primary w-full flex items-center justify-center gap-2 h-[42px]"
                >
                  {searching ? <ButtonLoader /> : <><FiSearch /> Search</>}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass-card p-4 mb-6 border-l-4 border-l-red-500">
            <p className="text-red-400">{error.userMessage}</p>
            {error.technicalMessage && (
              <p className="text-red-400/60 text-sm mt-1">{error.technicalMessage}</p>
            )}
          </div>
        )}

        {/* Results */}
        {trains.length > 0 && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-white">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">
                {trains.length}
              </span>
              Train{trains.length > 1 ? 's' : ''} Found
            </h2>

            {trains.map((train, idx) => (
              <div key={idx} className={`glass-card overflow-hidden border-white/5 transition-all duration-300 ${expandedIndex === idx ? 'ring-1 ring-blue-500/50' : 'hover:border-white/20'}`}>
                {/* Accordion Header */}
                <div 
                  onClick={() => setExpandedIndex(expandedIndex === idx ? -1 : idx)}
                  className={`p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors ${expandedIndex === idx ? 'bg-blue-500/10' : 'hover:bg-white/5'}`}
                >
                  {/* Train Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg">
                      🚂
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white uppercase tracking-tight">
                        {train.train_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                          #{train.train_number}
                        </span>
                        <span className="text-xs text-gray-400 font-medium tracking-wide">• {train.train_type || 'EXPRESS'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Time & Duration */}
                  <div className="flex items-center gap-8 px-6 py-3 bg-slate-900/60 rounded-2xl border border-white/10 shadow-inner">
                    <div className="text-center">
                      <p className="font-black text-xl text-white tracking-tight">{train.departure || '06:00'}</p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">{source || 'SRC'}</p>
                    </div>
                    <div className="flex flex-col items-center min-w-[90px]">
                      <span className="text-[10px] font-black text-gray-400 mb-1">{train.duration || '08:30'}</span>
                      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent relative">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">Daily Runs</span>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-xl text-white tracking-tight">{train.arrival || '14:30'}</p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">{destination || 'DST'}</p>
                    </div>
                  </div>

                  {/* Toggle Indicator & Actions */}
                  <div className="flex items-center gap-3">
                    {/* Route/Schedule Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setScheduleModalTrain({ number: train.train_number, name: train.train_name });
                      }}
                      className="w-10 h-10 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 flex items-center justify-center text-orange-400 hover:text-orange-300 transition-all group"
                      title="View Route & Schedule"
                    >
                      <FiNavigation className="group-hover:scale-110 transition-transform" />
                    </button>

                    <div className="hidden lg:block text-right">
                       <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Availability</p>
                       <p className="text-xs text-blue-400 font-bold">{train.availability?.length || 0} Coach Types</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${expandedIndex === idx ? 'bg-blue-500 text-white rotate-180 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                      <FiArrowRight className="rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Accordion Content */}
                <div className={`transition-all duration-500 ease-in-out ${expandedIndex === idx ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                  <div className="p-6 bg-slate-950/40 border-t border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
                           <FiUsers className="text-blue-400" /> Availability Matrix
                        </h4>
                        <div className="flex gap-2">
                           <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">Available</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">Waitlist</span>
                           </div>
                        </div>
                    </div>
                    
                    {train.availability && train.availability.length > 0 ? (
                      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/20 backdrop-blur-md">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="bg-white/5">
                              <th className="p-4 border-b border-white/10 text-[11px] uppercase text-gray-400 font-black tracking-widest">Coach</th>
                              <th className="p-4 border-b border-white/10 text-[11px] uppercase text-blue-400 font-black tracking-widest text-center">Gen</th>
                              <th className="p-4 border-b border-white/10 text-[11px] uppercase text-orange-400 font-black tracking-widest text-center">TTL</th>
                              <th className="p-4 border-b border-white/10 text-[11px] uppercase text-red-400 font-black tracking-widest text-center">PTL</th>
                              <th className="p-4 border-b border-white/10 text-[11px] uppercase text-pink-400 font-black tracking-widest text-center">Ladies</th>
                              <th className="p-4 border-b border-white/10 text-[11px] uppercase text-purple-400 font-black tracking-widest text-center">PWD</th>
                              <th className="p-4 border-b border-white/10 text-[11px] uppercase text-green-400 font-black tracking-widest text-center">Senior</th>
                            </tr>
                          </thead>
                          <tbody>
                            {['SL', '3A', '2A', '1A', '2S', 'CC', 'EA', 'E3', 'EC', 'FC'].map(coach => {
                              const hasAnyAvailability = train.availability?.some(a => a.coach_code === coach);
                              if (!hasAnyAvailability) return null;

                              return (
                                <tr key={coach} className="group hover:bg-white/5 transition-colors">
                                  <td className="p-4 border-b border-white/10 font-black text-xs bg-white/5 text-blue-100">{coach}</td>
                                  {['GEN', 'TTL', 'PTL', 'LADIES', 'PWD', 'SENIOR'].map(quota => {
                                    const found = train.availability?.find(a => 
                                      a.coach_code === coach && 
                                      (a.seat_type === quota || (!a.seat_type && quota === 'GEN'))
                                    );

                                    if (!found) return <td key={quota} className="p-4 border-b border-white/10 text-center text-gray-700 font-bold">-</td>;

                                    const isAvailable = found.seats && !String(found.seats).startsWith('WTL');
                                    
                                    return (
                                      <td key={quota} className="p-4 border-b border-white/10 text-center">
                                        <div className="flex flex-col items-center">
                                          <span className={`text-[13px] font-black tracking-tighter ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                                            {found.seats}
                                          </span>
                                          <span className="text-[10px] text-gray-500 font-bold">₹{found.fare}</span>
                                        </div>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl text-center">
                        <p className="text-yellow-500 text-sm font-bold flex items-center justify-center gap-2 uppercase tracking-widest">
                           ⚠️ Seat availability data temporarily unavailable
                        </p>
                      </div>
                    )}

                    <div className="mt-8 flex justify-end">
                       <button 
                         onClick={() => handleBook(train.train_number)}
                         className="btn-primary px-10 py-3 text-sm font-black uppercase tracking-widest flex items-center gap-2 group"
                       >
                          Select & Proceed <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !searching && trains.length === 0 && source && destination && doj && (
          <div className="text-center py-12 glass-card">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400">No trains found for this route</p>
            <p className="text-gray-500 text-sm mt-2">Try different dates or stations</p>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {scheduleModalTrain && (
        <TrainScheduleModal
          trainNumber={scheduleModalTrain.number}
          trainName={scheduleModalTrain.name}
          onClose={() => setScheduleModalTrain(null)}
        />
      )}
    </div>
  );
}
