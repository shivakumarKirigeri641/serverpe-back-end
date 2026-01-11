/**
 * ============================================================================
 * LIVE STATION PAGE
 * ============================================================================
 */

import { useState, useEffect, useRef } from 'react';
import { getStations, getLiveStation } from '../services/api';
import { PageLoader, ButtonLoader } from '../components/Loader';
import AutoSuggest from '../components/AutoSuggest';
import { FiSearch, FiClock, FiMapPin, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LiveStationPage() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [stationCode, setStationCode] = useState('');
  const [stationSearch, setStationSearch] = useState('');
  const [trains, setTrains] = useState(null);
  const [error, setError] = useState(null);
  const searchButtonRef = useRef(null);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const result = await getStations();
      setStations(result.stations || []);
    } catch (err) {
      toast.error('Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setTrains(null);

    if (!stationCode) {
      toast.error('Please select a station');
      return;
    }

    setSearching(true);
    try {
      const result = await getLiveStation(stationCode);
      setTrains(result);
      toast.success(`Found ${result.trains?.length || 0} trains`);
    } catch (err) {
      setError(err);
      toast.error(err.userMessage || 'Failed to fetch trains');
    } finally {
      setSearching(false);
    }
  };

  const filteredStations = stations.filter(
    (s) =>
      s.code.toLowerCase().includes(stationSearch.toLowerCase()) ||
      s.station_name.toLowerCase().includes(stationSearch.toLowerCase())
  );

  if (loading) return <PageLoader text="Loading stations..." />;

  return (
    <div className="min-h-screen pt-20 px-4 pb-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Live Station</h1>
          <p className="text-gray-400">See trains arriving at any station</p>
        </div>

        {/* Search Form */}
        <div className="glass-card p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <AutoSuggest
                  label="Select Station"
                  placeholder="Search station..."
                  data={stations}
                  value={stationSearch}
                  onSelect={(code, display) => {
                    setStationCode(code);
                    setStationSearch(display);
                  }}
                  nextFieldRef={searchButtonRef}
                />
              </div>
              <button
                ref={searchButtonRef}
                type="submit"
                disabled={searching}
                className="btn-primary flex items-center justify-center gap-2 h-[42px] px-8"
              >
                {searching ? <ButtonLoader /> : <><FiSearch /> Search</>}
              </button>
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

        {/* Trains List */}
        {trains && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  Trains at {trains.station_code}
                </h2>
                <p className="text-gray-400 text-sm">
                  As of {trains.current_time}
                </p>
              </div>
              <span className="text-2xl">🚉</span>
            </div>

            <div className="space-y-4">
              {trains.trains?.length > 0 ? (
                trains.trains.map((train, idx) => (
                  <div key={idx} className="train-card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">🚂</span>
                        <div>
                          <h3 className="font-semibold">{train.train_name}</h3>
                          <p className="text-sm text-gray-400">#{train.train_number}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-400">Arrival</p>
                          <p className="font-bold text-green-400">
                            {train.expected_arrival}
                          </p>
                        </div>
                        <FiArrowRight className="text-gray-500" />
                        <div className="text-center">
                          <p className="text-sm text-gray-400">Departure</p>
                          <p className="font-bold text-blue-400">
                            {train.expected_departure}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-lg text-sm ${
                            train.status === 'On Time'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {train.status}
                        </span>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                          P: {train.platform || 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 glass-card">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-gray-400">No trains found at this station</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
