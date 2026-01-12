/**
 * Search Trains Page
 * Enhanced with proper auto-focus flow: Source → Destination → Date → Search
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchTrains, getStations } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import AutoSuggestInput from '../components/AutoSuggestInput';

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

    // Refs for auto-focus flow: Source → Destination → Date → Search
    const destinationRef = useRef(null);
    const dateRef = useRef(null);
    const searchBtnRef = useRef(null);

    // Calculate date constraints
    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    const maxDateStr = maxDate.toISOString().split('T')[0];

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

    // Station display function for AutoSuggestInput
    const stationDisplayFn = (station) => ({
        primary: station.code,
        secondary: station.station_name
    });

    // Station value function for AutoSuggestInput
    const stationValueFn = (station) => station.code;

    // Full display function
    const stationFullDisplayFn = (station) => `${station.code} - ${station.station_name}`;

    // Handle date focus - auto-open picker
    const handleDateFocus = (e) => {
        try {
            e.target.showPicker?.();
        } catch (err) {
            // showPicker might not be supported
        }
    };

    // Handle date change and auto-focus to search button
    const handleDateChange = (e) => {
        setDoj(e.target.value);
        setTimeout(() => {
            searchBtnRef.current?.focus();
        }, 100);
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
                        {/* Source with AutoSuggest → focuses Destination */}
                        <AutoSuggestInput
                            label="From"
                            placeholder="Source station"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            items={stations}
                            displayFn={stationDisplayFn}
                            valueFn={stationValueFn}
                            fullDisplayFn={stationFullDisplayFn}
                            nextRef={destinationRef}
                        />

                        {/* Destination with AutoSuggest → focuses Date */}
                        <AutoSuggestInput
                            ref={destinationRef}
                            label="To"
                            placeholder="Destination"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            items={stations}
                            displayFn={stationDisplayFn}
                            valueFn={stationValueFn}
                            fullDisplayFn={stationFullDisplayFn}
                            nextRef={dateRef}
                        />

                        {/* Date */}
                        <div>
                            <label className="input-label">Date</label>
                            <input
                                ref={dateRef}
                                type="date"
                                className="input"
                                value={doj}
                                min={today}
                                max={maxDateStr}
                                onChange={handleDateChange}
                                onFocus={handleDateFocus}
                            />
                        </div>

                        <div className="flex items-end">
                            <button ref={searchBtnRef} type="submit" className="btn-primary w-full" disabled={loading}>
                                {loading ? 'Searching...' : '🔍 Search'}
                            </button>
                        </div>
                    </form>
                    <p className="text-xs text-slate-500 mt-3 text-center">
                        💡 Type to search stations • Tab/Enter to select and continue
                    </p>
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
