/**
 * Station Status Page - Trains at a station
 */

import React, { useState, useEffect } from 'react';
import { getStations, getTrainsAtStation } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

const StationStatusPage = () => {
    const [stations, setStations] = useState([]);
    const [stationCode, setStationCode] = useState('');
    const [stationData, setStationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filtered, setFiltered] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

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

    const handleInputChange = (e) => {
        const value = e.target.value.toUpperCase();
        setStationCode(value);
        if (value.length > 0) {
            const f = stations.filter(s =>
                s.code.toUpperCase().includes(value) ||
                s.station_name.toUpperCase().includes(value)
            ).slice(0, 5);
            setFiltered(f);
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    };

    const selectStation = (station) => {
        setStationCode(station.code);
        setShowDropdown(false);
    };

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
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                className="input w-full"
                                placeholder="Enter station code or name"
                                value={stationCode}
                                onChange={handleInputChange}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            />
                            {showDropdown && filtered.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                    {filtered.map((s) => (
                                        <div
                                            key={s.code}
                                            className="px-4 py-2 hover:bg-slate-700 cursor-pointer"
                                            onClick={() => selectStation(s)}
                                        >
                                            <span className="font-medium text-blue-400">{s.code}</span>
                                            <span className="text-slate-400 ml-2">{s.station_name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Searching...' : 'Get Trains'}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
                        {error}
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
                            <h2 className="text-xl font-bold text-white">
                                {stationData.station_name}
                            </h2>
                            <p className="text-slate-400">
                                {stationData.trains_count} trains pass through this station
                            </p>
                        </div>

                        {stationData.trains?.length === 0 ? (
                            <div className="text-center py-8">
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
                                            <tr key={i}>
                                                <td>
                                                    <span className="badge badge-info">{train.train_number}</span>
                                                </td>
                                                <td className="font-medium text-white">{train.train_name}</td>
                                                <td>{train.arrival || '--'}</td>
                                                <td>{train.departure || '--'}</td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        {train.train_runs_on_mon === 'Y' && <span className="text-xs px-1 bg-slate-700 rounded">M</span>}
                                                        {train.train_runs_on_tue === 'Y' && <span className="text-xs px-1 bg-slate-700 rounded">T</span>}
                                                        {train.train_runs_on_wed === 'Y' && <span className="text-xs px-1 bg-slate-700 rounded">W</span>}
                                                        {train.train_runs_on_thu === 'Y' && <span className="text-xs px-1 bg-slate-700 rounded">T</span>}
                                                        {train.train_runs_on_fri === 'Y' && <span className="text-xs px-1 bg-slate-700 rounded">F</span>}
                                                        {train.train_runs_on_sat === 'Y' && <span className="text-xs px-1 bg-slate-700 rounded">S</span>}
                                                        {train.train_runs_on_sun === 'Y' && <span className="text-xs px-1 bg-slate-700 rounded">S</span>}
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
