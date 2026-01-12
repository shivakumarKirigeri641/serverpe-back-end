/**
 * Train Schedule Page
 */

import React, { useState } from 'react';
import { getTrainSchedule } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

const TrainSchedulePage = () => {
    const [trainInput, setTrainInput] = useState('');
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!trainInput) {
            setError('Please enter train number or name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await getTrainSchedule(trainInput);
            if (response.success) {
                setSchedule(response.data.schedule);
            }
        } catch (err) {
            setError(err.message || 'Train not found');
            setSchedule(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Train Schedule</h1>
                    <p className="text-slate-400">View complete schedule of any train</p>
                </div>

                <div className="glass rounded-xl p-6 mb-8 animate-fadeIn">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input
                            type="text"
                            className="input flex-1"
                            placeholder="Enter train number or name (e.g., 12951 or Rajdhani)"
                            value={trainInput}
                            onChange={(e) => setTrainInput(e.target.value)}
                        />
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Searching...' : 'Get Schedule'}
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
                        <LoadingSpinner text="Fetching schedule..." />
                    </div>
                )}

                {schedule && (
                    <div className="card animate-slideUp">
                        {/* Train Header */}
                        <div className="mb-6 pb-4 border-b border-slate-700">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="badge badge-info">{schedule.train_number}</span>
                                <h2 className="text-xl font-bold text-white">{schedule.train_name}</h2>
                                <span className="text-slate-500">{schedule.train_type}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {schedule.running_days?.map((day) => (
                                    <span key={day} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                                        {day}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Schedule Table */}
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Station</th>
                                        <th>Code</th>
                                        <th>Arrival</th>
                                        <th>Departure</th>
                                        <th>Day</th>
                                        <th>Distance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedule.schedule?.map((stop, i) => (
                                        <tr key={i}>
                                            <td>{stop.seq || i + 1}</td>
                                            <td className="font-medium text-white">{stop.station_name}</td>
                                            <td className="text-blue-400">{stop.station_code}</td>
                                            <td>{stop.arrival || '--'}</td>
                                            <td>{stop.departure || '--'}</td>
                                            <td>Day {stop.day || 1}</td>
                                            <td>{stop.distance} km</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Coach Info */}
                        {schedule.coaches && Object.keys(schedule.coaches).length > 0 && (
                            <div className="mt-6 pt-4 border-t border-slate-700">
                                <h3 className="text-lg font-semibold text-white mb-3">Coach Composition</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(schedule.coaches)
                                        .filter(([_, count]) => count > 0)
                                        .map(([coach, count]) => (
                                            <span key={coach} className="px-3 py-1 bg-slate-700 rounded text-sm">
                                                <span className="text-blue-400 font-medium">{coach}</span>
                                                <span className="text-slate-400 ml-1">×{count}</span>
                                            </span>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainSchedulePage;
