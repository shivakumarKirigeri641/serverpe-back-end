/**
 * Login Page - OTP Authentication
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendOtp, verifyOtp } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    const [step, setStep] = useState('email'); // 'email' or 'otp'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const from = location.state?.from?.pathname || '/dashboard/book-ticket';

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const response = await sendOtp(email);
            if (response.success) {
                setSuccess('OTP sent successfully! For this demo, use OTP: 1234');
                setStep('otp');
            }
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp || otp.length !== 4) {
            setError('Please enter a valid 4-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await verifyOtp(email, otp);
            if (response.success) {
                login(email, response.data.token);
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="glass rounded-2xl p-8 animate-slideUp">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🔐</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {step === 'email' ? 'Login to Book Tickets' : 'Verify OTP'}
                        </h2>
                        <p className="text-slate-400 mt-2">
                            {step === 'email' 
                                ? 'Enter your email to receive OTP' 
                                : `OTP sent to ${email}`}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-green-400 text-sm">{success}</p>
                        </div>
                    )}

                    {/* Email Step */}
                    {step === 'email' && (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div>
                                <label className="input-label">Email Address</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner size="sm" text="" /> : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {/* OTP Step */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div>
                                <label className="input-label">Enter OTP</label>
                                <input
                                    type="text"
                                    className="input text-center text-2xl tracking-widest"
                                    placeholder="• • • •"
                                    maxLength={4}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    disabled={loading}
                                />
                                <p className="text-slate-500 text-xs mt-2 text-center">
                                    💡 Hint: Use <span className="text-blue-400 font-bold">1234</span> as OTP
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner size="sm" text="" /> : 'Verify & Login'}
                            </button>

                            <button
                                type="button"
                                className="w-full text-slate-400 hover:text-white text-sm transition-colors"
                                onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                            >
                                ← Change email
                            </button>
                        </form>
                    )}

                    {/* Info */}
                    <div className="mt-8 pt-6 border-t border-slate-700">
                        <p className="text-slate-500 text-xs text-center">
                            🎓 This is a demo project. Authentication is simulated.
                            <br />No actual emails are sent.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
