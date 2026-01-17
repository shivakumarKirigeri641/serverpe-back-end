import React from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { AlertTriangle, Key, Clock, Shield, Home } from 'lucide-react';
import logo from '../images/logo.jpeg';

const APIKeyErrorPage = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  // If no error code, redirect to home
  if (!error) {
    return <Navigate to="/" replace />;
  }

  const getErrorDetails = () => {
    switch (error) {
      case 'API_KEY_MISSING':
        return {
          icon: <Key className="w-16 h-16 text-red-500 mx-auto mb-4" />,
          title: 'API Key Required',
          description: 'Your application is missing a valid API key. Please contact your administrator to obtain one.',
          color: 'red'
        };
      case 'API_KEY_INVALID':
        return {
          icon: <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />,
          title: 'Invalid API Key',
          description: 'The provided API key is invalid or does not exist. Please check your license configuration.',
          color: 'red'
        };
      case 'API_KEY_EXPIRED':
        return {
          icon: <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />,
          title: 'API Key Expired',
          description: 'Your API key has expired. Please renew your license to continue using the application.',
          color: 'orange'
        };
      case 'DOMAIN_NOT_ALLOWED':
        return {
          icon: <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />,
          title: 'Domain Not Authorized',
          description: 'Your API key is not authorized to access this application from this domain.',
          color: 'yellow'
        };
      default:
        return {
          icon: <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />,
          title: 'Authentication Error',
          description: 'An authentication error occurred. Please try again later.',
          color: 'red'
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Logo */}
        <div className="mb-6">
          <img 
            src={logo} 
            alt="QuickSmart Logo" 
            className="w-20 h-20 rounded-full mx-auto shadow-lg object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">QuickSmart</h1>
          <p className="text-gray-500 text-sm">Train Reservation System</p>
        </div>

        {/* Error Icon */}
        {errorDetails.icon}

        {/* Error Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {errorDetails.title}
        </h2>

        {/* Error Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {errorDetails.description}
        </p>

        {/* Custom Message */}
        {message && (
          <div className={`bg-${errorDetails.color}-50 border border-${errorDetails.color}-200 rounded-lg p-4 mb-6`}>
            <p className={`text-${errorDetails.color}-700 text-sm`}>
              <strong>Details:</strong> {decodeURIComponent(message)}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        {/* Contact Information */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact your system administrator or check your license configuration.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Error Code: {error}
          </p>
        </div>
      </div>
    </div>
  );
};

export default APIKeyErrorPage;