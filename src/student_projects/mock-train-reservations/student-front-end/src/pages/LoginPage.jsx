import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import logo from '../images/logo.jpeg';
import { Train, Mail, ArrowRight, Shield, Clock, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];
  const { sendOtp, verifyOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendOtp(email);
      toast.success(response.message || 'OTP sent to your email!');
      setStep('otp');
      setCountdown(60);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
      setOtp(newOtp);
      otpRefs[Math.min(pastedData.length, 3)].current?.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      toast.error('Please enter the complete OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyOtp(email, otpString);
      toast.success(response.message || 'Login successful!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Invalid OTP');
      setOtp(['', '', '', '']);
      otpRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      await sendOtp(email);
      toast.success('OTP resent successfully!');
      setCountdown(60);
      setOtp(['', '', '', '']);
      otpRefs[0].current?.focus();
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        {/* Animated Train */}
        <div className="absolute bottom-32 left-0 right-0 overflow-hidden">
          <div className="animate-train">
            <Train className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-2">
              <img 
                src={logo} 
                alt="QuickSmart Train Logo" 
                className="w-12 h-12 rounded-xl object-contain bg-white/10 backdrop-blur-sm p-1"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm hidden">
                <Train className="w-10 h-10" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">QuickSmart</h1>
              <p className="text-white/70 text-sm">Train Reservation</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Book Your Mock Journey<br />
            <span className="text-white/80">With Ease</span>
          </h2>

          <p className="text-white/70 text-lg mb-12 max-w-md">
            Experience realistic-seamless train ticket booking with our modern platform. 
            Search, compare, and book your tickets in minutes.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-white/90">Secure & Instant Booking</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-white/90">Realistic time Train Status</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-white/90">Best Fare Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex items-center gap-2">
              <img 
                src={logo} 
                alt="QuickSmart Train Logo" 
                className="w-10 h-10 rounded-xl object-contain bg-primary-100 p-1"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="p-3 bg-primary-100 rounded-xl hidden">
                <Train className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QuickSmart</h1>
              <p className="text-gray-500 text-sm">Train Reservation</p>
            </div>
          </div>

          {/* Login Card */}
          <div className="card">
            {step === 'email' ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <Mail className="w-8 h-8 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                  <p className="text-gray-500 mt-2">Enter your email to receive a login OTP</p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
                  <p className="text-gray-500 mt-2">
                    Enter the 4-digit code sent to<br />
                    <span className="font-medium text-gray-700">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                      Enter OTP
                    </label>
                    <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl
                                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                     transition-all duration-200"
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Login
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="text-center space-y-3">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || isLoading}
                      className="text-primary-600 font-medium hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                    </button>
                    
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('email');
                          setOtp(['', '', '', '']);
                        }}
                        className="text-gray-500 text-sm hover:text-gray-700"
                      >
                        ← Change email
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-gray-400 text-sm mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
