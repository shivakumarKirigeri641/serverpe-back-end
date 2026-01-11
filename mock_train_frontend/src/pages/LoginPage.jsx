import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendOtp, verifyOtp } from '../api/trainApi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await sendOtp(email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('OTP is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await verifyOtp(email, otp);
      login(email);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-md glass rounded-2xl p-8">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">🔐</span>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-slate-400 mt-2">
            {step === 1 ? 'Login with your email to continue' : `Enter OTP sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {loading ? <div className="loader w-5 h-5 border-2"></div> : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 4-digit OTP"
                className="input-field text-center text-2xl tracking-[0.5rem]"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {loading ? <div className="loader w-5 h-5 border-2"></div> : 'Verify & Login'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Use a different email
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-500 italic">
            Note: For testing purposes, any email works and OTP is 1234
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
