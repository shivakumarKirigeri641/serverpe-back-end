/**
 * PNR Status Page
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPnrStatus } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

const PnrStatusPage = () => {
    const [searchParams] = useSearchParams();
    const [pnr, setPnr] = useState(searchParams.get('pnr') || '');
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        if (searchParams.get('pnr')) {
            handleCheck();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCheck = async (e) => {
        if (e) e.preventDefault();
        
        if (!pnr) {
            setError('Please enter PNR number');
            return;
        }

        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const response = await getPnrStatus(pnr);
            if (response.success) {
                setStatus(response.data.pnr_status);
            }
        } catch (err) {
            setError(err.message || 'PNR not found');
            setStatus(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">PNR Status</h1>
                    <p className="text-slate-400">Check your booking status</p>
                </div>

                {/* Search Form */}
                <div className="glass rounded-xl p-6 mb-8 animate-fadeIn">
                    <form onSubmit={handleCheck} className="flex gap-4">
                        <input
                            type="text"
                            className="input flex-1"
                            placeholder="Enter 10-digit PNR number"
                            value={pnr}
                            onChange={(e) => setPnr(e.target.value)}
                            maxLength={10}
                        />
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Checking...' : 'Check Status'}
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
                        <LoadingSpinner text="Checking PNR..." />
                    </div>
                )}

                {!loading && searched && !status && !error && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-white mb-2">PNR Not Found</h3>
                        <p className="text-slate-400">Please check the PNR number</p>
                    </div>
                )}

                {status && (
                    <div className="card animate-slideUp">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                            <div>
                                <div className="text-sm text-slate-400">PNR Number</div>
                                <div className="text-2xl font-bold text-white">{status.pnr}</div>
                            </div>
                            <span className={`badge ${
                                status.status === 'BOOKED' ? 'badge-success' :
                                status.status === 'CANCELLED' ? 'badge-error' : 'badge-warning'
                            }`}>
                                {status.status}
                            </span>
                        </div>

                        {/* Train Details */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Train Details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs text-slate-400">Train</div>
                                    <div className="text-white font-medium">
                                        {status.train_number} - {status.train_name}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">From</div>
                                    <div className="text-white font-medium">{status.source}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">To</div>
                                    <div className="text-white font-medium">{status.destination}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Date</div>
                                    <div className="text-white font-medium">{status.date_of_journey}</div>
                                </div>
                            </div>
                        </div>

                        {/* Passengers */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3">
                                Passengers ({status.passengers?.length || 0})
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Age</th>
                                            <th>Gender</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {status.passengers?.map((p, i) => (
                                            <tr key={i}>
                                                <td className="font-medium text-white">{p.name}</td>
                                                <td>{p.age}</td>
                                                <td>{p.gender}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        p.status?.includes('CANCELLED') ? 'badge-error' :
                                                        p.status?.includes('WL') ? 'badge-warning' : 'badge-success'
                                                    }`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Fare */}
                        <div className="mt-6 pt-4 border-t border-slate-700 text-right">
                            <div className="text-sm text-slate-400">Total Fare</div>
                            <div className="text-2xl font-bold text-green-400">₹{status.total_fare}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PnrStatusPage;
