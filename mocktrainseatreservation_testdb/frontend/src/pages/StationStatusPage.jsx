/**
 * Station Status Page - Trains at a station
 * Enhanced with AutoSuggestInput and proper auto-focus flow
 */

import React, { useState, useEffect, useRef } from 'react';
import { getStations, getTrainsAtStation } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import AutoSuggestInput from '../components/AutoSuggestInput';

const StationStatusPage = () => {
    const [stations, setStations] = useState([]);
    const [stationCode, setStationCode] = useState('');
    const [stationData, setStationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Ref for auto-focus to submit button
    const submitBtnRef = useRef(null);

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await getStations();
                if (response.success) setStations(response.data.stations);
            } catch (err) {
                console.error('Failed to fetch stations:', err);
            }
        };
        fetchStations();
    }, []);

    // Station display function for AutoSuggestInput
    const stationDisplayFn = (station) => ({
        primary: station.code,
        secondary: station.station_name
    });

    // Station value function for AutoSuggestInput
    const stationValueFn = (station) => station.code;

    // Full display function
    const stationFullDisplayFn = (station) => `${station.code} - ${station.station_name}`;

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!stationCode) {
            setError('Please select a station');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await getTrainsAtStation(stationCode);
            if (response.success) {
                setStationData(response.data);
            }
        } catch (err) {
            setError(err.message || 'Station not found');
            setStationData(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Station Status</h1>
                    <p className="text-slate-400">Find all trains passing through a station</p>
                </div>

                <div className="glass rounded-xl p-6 mb-8 animate-fadeIn">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <AutoSuggestInput
                                placeholder="Enter station code or name"
                                value={stationCode}
                                onChange={(e) => setStationCode(e.target.value)}
                                items={stations}
                                displayFn={stationDisplayFn}
                                valueFn={stationValueFn}
                                fullDisplayFn={stationFullDisplayFn}
                                nextRef={submitBtnRef}
                                autoFocus={true}
                            />
                        </div>
                        <button ref={submitBtnRef} type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Searching...' : '🔍 Get Trains'}
                        </button>
                    </form>
                    <p className="text-xs text-slate-500 mt-3 text-center">
                        💡 Start typing to search stations • Tab/Enter to select
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center flex items-center justify-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner text="Fetching trains..." />
                    </div>
                )}

                {stationData && (
                    <div className="card animate-slideUp">
                        <div className="mb-6 pb-4 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="text-2xl">🏢</span>
                                {stationData.station_name}
                            </h2>
                            <p className="text-slate-400 mt-1">
                                {stationData.trains_count} trains pass through this station
                            </p>
                        </div>

                        {stationData.trains?.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-3">🚫</div>
                                <p className="text-slate-400">No trains found for this station</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Train</th>
                                            <th>Name</th>
                                            <th>Arrival</th>
                                            <th>Departure</th>
                                            <th>Running Days</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stationData.trains?.map((train, i) => (
                                            <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                                                <td>
                                                    <span className="badge badge-info">{train.train_number}</span>
                                                </td>
                                                <td className="font-medium text-white">{train.train_name}</td>
                                                <td className="text-green-400">{train.arrival || '--'}</td>
                                                <td className="text-blue-400">{train.departure || '--'}</td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                                                            const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
                                                            const runs = train[`train_runs_on_${dayKeys[idx]}`] === 'Y';
                                                            return (
                                                                <span 
                                                                    key={idx} 
                                                                    className={`text-xs px-1.5 py-0.5 rounded ${
                                                                        runs 
                                                                            ? 'bg-green-500/20 text-green-400' 
                                                                            : 'bg-slate-700/50 text-slate-600'
                                                                    }`}
                                                                >
                                                                    {day}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StationStatusPage;
