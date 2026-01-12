/**
 * Live Train Status Page
 * Enhanced with keyboard navigation and auto-focus
 */

import React, { useState, useRef } from 'react';
import { getLiveTrainStatus } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

const LiveTrainStatusPage = () => {
    const [trainInput, setTrainInput] = useState('');
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Ref for auto-focus to submit button
    const submitBtnRef = useRef(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!trainInput) {
            setError('Please enter train number or name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await getLiveTrainStatus(trainInput);
            if (response.success) {
                setStatus(response.data);
            }
        } catch (err) {
            setError(err.message || 'Train not found');
            setStatus(null);
        } finally {
            setLoading(false);
        }
    };

    // Handle keyboard events for quick submit
    const handleKeyDown = (e) => {
        if (e.key === 'Tab' && trainInput.trim()) {
            e.preventDefault();
            submitBtnRef.current?.focus();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(e);
        }
    };

    const getStatusColor = (stopStatus) => {
        switch (stopStatus) {
            case 'DEPARTED': return 'bg-green-500';
            case 'AT_STATION': return 'bg-blue-500 animate-pulse';
            default: return 'bg-slate-600';
        }
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Live Train Status</h1>
                    <p className="text-slate-400">Track train running status in real-time</p>
                </div>

                <div className="glass rounded-xl p-6 mb-8 animate-fadeIn">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input
                            type="text"
                            className="input flex-1"
                            placeholder="Enter train number or name"
                            value={trainInput}
                            onChange={(e) => setTrainInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                        <button ref={submitBtnRef} type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Tracking...' : 'Track Train'}
                        </button>
                    </form>
                    <p className="text-xs text-slate-500 mt-2">
                        💡 Tip: Press Tab to focus button, Enter to search directly
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner text="Tracking train..." />
                    </div>
                )}

                {status && (
                    <div className="card animate-slideUp">
                        {/* Header */}
                        <div className="mb-6 pb-4 border-b border-slate-700">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="badge badge-info">{status.train_number}</span>
                                <h2 className="text-xl font-bold text-white">{status.train_name}</h2>
                            </div>
                            <div className="flex items-center gap-2 text-green-400">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Currently at: <span className="font-semibold">{status.current_station}</span>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="space-y-4">
                            {status.live_status?.map((stop, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    {/* Timeline dot */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-4 h-4 rounded-full ${getStatusColor(stop.status)}`}></div>
                                        {i < status.live_status.length - 1 && (
                                            <div className={`w-0.5 h-12 ${
                                                stop.status === 'DEPARTED' ? 'bg-green-500' : 'bg-slate-600'
                                            }`}></div>
                                        )}
                                    </div>
                                    
                                    {/* Station info */}
                                    <div className={`flex-1 ${stop.status === 'AT_STATION' ? 'bg-blue-500/10 border border-blue-500/30 rounded-lg p-3' : ''}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-white">{stop.station_name}</div>
                                                <div className="text-sm text-slate-400">{stop.station_code}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-slate-400">
                                                    Arr: {stop.arrival || '--'} | Dep: {stop.departure || '--'}
                                                </div>
                                                {stop.delay_minutes > 0 && (
                                                    <div className="text-xs text-yellow-400">
                                                        {stop.delay_minutes} mins late
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {stop.status === 'AT_STATION' && (
                                            <div className="mt-2 text-sm text-blue-400 font-medium">
                                                🚂 Train is currently here
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                            <p className="text-yellow-400 text-sm">
                                ⚠️ This is simulated data for demonstration purposes
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveTrainStatusPage;
