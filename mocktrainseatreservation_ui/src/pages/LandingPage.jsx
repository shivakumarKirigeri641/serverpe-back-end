/**
 * Landing Page - Hero Section with Quick Actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStations } from '../api/apiClient';

const LandingPage = () => {
    const navigate = useNavigate();
    const [stations, setStations] = useState([]);
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [doj, setDoj] = useState('');
    const [pnr, setPnr] = useState('');
    const [filteredSource, setFilteredSource] = useState([]);
    const [filteredDest, setFilteredDest] = useState([]);
    const [showSourceDropdown, setShowSourceDropdown] = useState(false);
    const [showDestDropdown, setShowDestDropdown] = useState(false);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setDoj(today);
        
        // Fetch stations
        const fetchStations = async () => {
            try {
                const response = await getStations();
                if (response.success) {
                    setStations(response.data.stations);
                }
            } catch (error) {
                console.error('Failed to fetch stations:', error);
            }
        };
        fetchStations();
    }, []);

    const handleSourceChange = (e) => {
        const value = e.target.value;
        setSource(value);
        if (value.length > 0) {
            const filtered = stations.filter(s =>
                s.code.toLowerCase().includes(value.toLowerCase()) ||
                s.station_name.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 5);
            setFilteredSource(filtered);
            setShowSourceDropdown(true);
        } else {
            setShowSourceDropdown(false);
        }
    };

    const handleDestChange = (e) => {
        const value = e.target.value;
        setDestination(value);
        if (value.length > 0) {
            const filtered = stations.filter(s =>
                s.code.toLowerCase().includes(value.toLowerCase()) ||
                s.station_name.toLowerCase().includes(value.toLowerCase())
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

    const handleSearch = (e) => {
        e.preventDefault();
        if (source && destination && doj) {
            navigate(`/search?source=${source}&destination=${destination}&doj=${doj}`);
        }
    };

    const handlePnrCheck = (e) => {
        e.preventDefault();
        if (pnr) {
            navigate(`/pnr-status?pnr=${pnr}`);
        }
    };

    const features = [
        { icon: '🔍', title: 'Search Trains', desc: 'Find trains between any stations', link: '/search' },
        { icon: '📋', title: 'PNR Status', desc: 'Check your booking status', link: '/pnr-status' },
        { icon: '📅', title: 'Train Schedule', desc: 'View complete train schedules', link: '/train-schedule' },
        { icon: '🚂', title: 'Live Status', desc: 'Track train running status', link: '/live-train-status' },
        { icon: '🏢', title: 'Station Info', desc: 'Trains at any station', link: '/station-status' },
        { icon: '🎫', title: 'Book Tickets', desc: 'Reserve your seats now', link: '/login' },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-hero py-20 overflow-hidden">
                {/* Animated train */}
                <div className="absolute bottom-10 left-0 text-4xl train-animation opacity-30">
                    🚆🚃🚃🚃
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-12 animate-fadeIn">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Book Your Journey
                            </span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Search trains, check PNR status, view schedules, and book tickets - all in one place
                        </p>
                    </div>

                    {/* Search Form */}
                    <div className="max-w-4xl mx-auto">
                        <div className="glass rounded-2xl p-6 md:p-8 animate-slideUp">
                            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Source */}
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

                                {/* Destination */}
                                <div className="relative">
                                    <label className="input-label">To</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Destination station"
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

                                {/* Date */}
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

                                {/* Search Button */}
                                <div className="flex items-end">
                                    <button type="submit" className="btn-primary w-full">
                                        Search Trains
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* PNR Quick Check */}
                    <div className="max-w-md mx-auto mt-8">
                        <div className="glass rounded-xl p-4">
                            <form onSubmit={handlePnrCheck} className="flex space-x-3">
                                <input
                                    type="text"
                                    className="input flex-1"
                                    placeholder="Enter PNR number"
                                    value={pnr}
                                    onChange={(e) => setPnr(e.target.value)}
                                />
                                <button type="submit" className="btn-secondary whitespace-nowrap">
                                    Check PNR
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Quick Services</h2>
                        <p className="text-slate-400">Everything you need for your train journey</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(feature.link)}
                                className="card card-hover cursor-pointer group"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-400 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-400">60+</div>
                            <div className="text-slate-400 mt-2">Trains</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-purple-400">100+</div>
                            <div className="text-slate-400 mt-2">Stations</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-pink-400">10+</div>
                            <div className="text-slate-400 mt-2">Coach Types</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-green-400">24/7</div>
                            <div className="text-slate-400 mt-2">Available</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
