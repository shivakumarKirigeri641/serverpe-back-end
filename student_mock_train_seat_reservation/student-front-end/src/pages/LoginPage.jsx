/**
 * ============================================================================
 * LOGIN PAGE - Email + OTP Authentication
 * ============================================================================
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ButtonLoader } from '../components/Loader';
import { FiMail, FiLock, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

export default function LoginPage() {
  const navigate = useNavigate();
  const { requestOtp, login, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1); // 1 = email, 2 = OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError({ userMessage: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      const result = await requestOtp(email);
      if (result.success) {
        setStep(2);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 4) {
      setError({ userMessage: 'Please enter a valid 4-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, otp);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎫</div>
            <h1 className="text-2xl font-bold gradient-text">
              {step === 1 ? 'Welcome Back!' : 'Enter OTP'}
            </h1>
            <p className="text-gray-400 mt-2">
              {step === 1
                ? 'Login with your email to continue'
                : `OTP sent to ${email}`}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error.userMessage}</p>
              {error.technicalMessage && (
                <p className="text-red-400/60 text-xs mt-1">
                  {error.technicalMessage}
                </p>
              )}
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field pl-12"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <ButtonLoader />
                ) : (
                  <>
                    Send OTP <FiArrowRight />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Input */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Enter 4-digit OTP
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="0000"
                    className="input-field pl-12 text-center text-2xl tracking-widest"
                    maxLength={4}
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Check console log for OTP (mock system)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
              >
                {loading ? <ButtonLoader /> : 'Verify & Login'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setError(null);
                }}
                className="w-full text-gray-400 text-sm flex items-center justify-center gap-2 hover:text-white"
              >
                <FiArrowLeft /> Change Email
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <Link to="/" className="text-blue-400 text-sm hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>🎓 This is a mock system for educational purposes</p>
          <p className="mt-1">OTP will be logged in the backend console</p>
        </div>
      </div>
    </div>
  );
}
