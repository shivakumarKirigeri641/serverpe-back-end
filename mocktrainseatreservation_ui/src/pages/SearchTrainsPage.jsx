/**
 * Search Trains Page
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchTrains, getStations } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

const SearchTrainsPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [stations, setStations] = useState([]);
    const [source, setSource] = useState(searchParams.get('source') || '');
    const [destination, setDestination] = useState(searchParams.get('destination') || '');
    const [doj, setDoj] = useState(searchParams.get('doj') || new Date().toISOString().split('T')[0]);
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    
    const [filteredSource, setFilteredSource] = useState([]);
    const [filteredDest, setFilteredDest] = useState([]);
    const [showSourceDropdown, setShowSourceDropdown] = useState(false);
    const [showDestDropdown, setShowDestDropdown] = useState(false);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await getStations();
                if (response.success) {
                    setStations(response.data.stations);
                }
            } catch (err) {
                console.error('Failed to fetch stations:', err);
            }
        };
        fetchStations();
    }, []);

    useEffect(() => {
        if (searchParams.get('source') && searchParams.get('destination') && searchParams.get('doj')) {
            handleSearch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        
        if (!source || !destination || !doj) {
            setError('Please fill all fields');
            return;
        }

        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const response = await searchTrains(source, destination, doj);
            if (response.success) {
                setTrains(response.data.trains);
            }
        } catch (err) {
            setError(err.message || 'Failed to search trains');
            setTrains([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSourceChange = (e) => {
        const value = e.target.value.toUpperCase();
        setSource(value);
        if (value.length > 0) {
            const filtered = stations.filter(s =>
                s.code.toUpperCase().includes(value) ||
                s.station_name.toUpperCase().includes(value)
            ).slice(0, 5);
            setFilteredSource(filtered);
            setShowSourceDropdown(true);
        } else {
            setShowSourceDropdown(false);
        }
    };

    const handleDestChange = (e) => {
        const value = e.target.value.toUpperCase();
        setDestination(value);
        if (value.length > 0) {
            const filtered = stations.filter(s =>
                s.code.toUpperCase().includes(value) ||
                s.station_name.toUpperCase().includes(value)
            ).slice(0, 5);
            setFilteredDest(filtered);
            setShowDestDropdown(true);
        } else {
            setShowDestDropdown(false);
        }
    };

    const selectStation = (station, type) => {
        if (type === 'source') {
            setSource(station.code);
            setShowSourceDropdown(false);
        } else {
            setDestination(station.code);
            setShowDestDropdown(false);
        }
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Search Trains</h1>
                    <p className="text-slate-400">Find trains between any stations</p>
                </div>

                {/* Search Form */}
                <div className="glass rounded-xl p-6 mb-8 animate-fadeIn">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <label className="input-label">From</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Source station"
                                value={source}
                                onChange={handleSourceChange}
                                onBlur={() => setTimeout(() => setShowSourceDropdown(false), 200)}
                            />
                            {showSourceDropdown && filteredSource.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                    {filteredSource.map((s) => (
                                        <div
                                            key={s.code}
                                            className="px-4 py-2 hover:bg-slate-700 cursor-pointer"
                                            onClick={() => selectStation(s, 'source')}
                                        >
                                            <span className="font-medium text-blue-400">{s.code}</span>
                                            <span className="text-slate-400 ml-2">{s.station_name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <label className="input-label">To</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Destination"
                                value={destination}
                                onChange={handleDestChange}
                                onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
                            />
                            {showDestDropdown && filteredDest.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                    {filteredDest.map((s) => (
                                        <div
                                            key={s.code}
                                            className="px-4 py-2 hover:bg-slate-700 cursor-pointer"
                                            onClick={() => selectStation(s, 'destination')}
                                        >
                                            <span className="font-medium text-blue-400">{s.code}</span>
                                            <span className="text-slate-400 ml-2">{s.station_name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="input-label">Date</label>
                            <input
                                type="date"
                                className="input"
                                value={doj}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setDoj(e.target.value)}
                            />
                        </div>

                        <div className="flex items-end">
                            <button type="submit" className="btn-primary w-full" disabled={loading}>
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner text="Searching trains..." />
                    </div>
                )}

                {/* Results */}
                {!loading && searched && (
                    <div className="animate-slideUp">
                        {trains.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🚫</div>
                                <h3 className="text-xl font-semibold text-white mb-2">No Trains Found</h3>
                                <p className="text-slate-400">Try different stations or date</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-slate-400 text-sm">{trains.length} trains found</p>
                                
                                {trains.map((train, index) => (
                                    <div key={index} className="card card-hover">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            {/* Train Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="badge badge-info">{train.train_number}</span>
                                                    <h3 className="text-lg font-semibold text-white">{train.train_name}</h3>
                                                    <span className="text-xs text-slate-500">{train.train_type}</span>
                                                </div>
                                                <div className="flex items-center gap-6 text-sm">
                                                    <div>
                                                        <div className="text-xl font-bold text-white">{train.departure_time || '--:--'}</div>
                                                        <div className="text-slate-400">{train.source}</div>
                                                    </div>
                                                    <div className="flex-1 flex items-center">
                                                        <div className="h-px flex-1 bg-slate-600"></div>
                                                        <div className="px-3 text-xs text-slate-500">{train.distance_km} km</div>
                                                        <div className="h-px flex-1 bg-slate-600"></div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xl font-bold text-white">{train.arrival_time || '--:--'}</div>
                                                        <div className="text-slate-400">{train.destination}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Classes */}
                                            <div className="flex flex-wrap gap-2">
                                                {train.classes && Object.entries(train.classes).map(([code, info]) => (
                                                    <div 
                                                        key={code}
                                                        className={`px-3 py-2 rounded-lg border text-center min-w-[80px] ${
                                                            info.status === 'AVAILABLE' 
                                                                ? 'border-green-500/30 bg-green-500/10' 
                                                                : 'border-yellow-500/30 bg-yellow-500/10'
                                                        }`}
                                                    >
                                                        <div className="font-medium text-white">{code}</div>
                                                        <div className={`text-xs ${info.status === 'AVAILABLE' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                            {info.available > 0 ? `${info.available} Avl` : 'WL'}
                                                        </div>
                                                        <div className="text-xs text-slate-400">₹{info.fare}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Book Button */}
                                            <button
                                                onClick={() => navigate(`/login`, { 
                                                    state: { 
                                                        from: { pathname: '/dashboard/book-ticket' },
                                                        trainData: { ...train, source, destination, doj }
                                                    }
                                                })}
                                                className="btn-primary whitespace-nowrap"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchTrainsPage;
