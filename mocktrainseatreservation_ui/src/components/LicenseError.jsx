/**
 * License Error Display Component
 * Shows when API key is invalid or missing
 */

import React from 'react';

const LicenseError = ({ error, onRetry }) => {
    const getErrorInfo = () => {
        const code = error?.code || error?.error_code || 'UNKNOWN';
        
        switch (code) {
            case 'NO_LICENSE_KEY':
                return {
                    icon: '🔑',
                    title: 'License Key Required',
                    message: 'Please configure your license key to use this application.',
                    steps: [
                        'Open the .env file in your project',
                        'Replace YOUR_LICENSE_KEY_HERE with your actual key',
                        'Restart the application (npm start)'
                    ]
                };
            case 'INVALID_LICENSE_KEY':
                return {
                    icon: '❌',
                    title: 'Invalid License Key',
                    message: 'The license key you provided is not valid.',
                    steps: [
                        'Check if you copied the key correctly',
                        'Verify your purchase at serverpe.in',
                        'Contact support if the issue persists'
                    ]
                };
            case 'LICENSE_EXPIRED':
                return {
                    icon: '⏰',
                    title: 'License Expired',
                    message: 'Your license has expired.',
                    steps: [
                        'Visit serverpe.in to renew your license',
                        'Update the key in your .env file',
                        'Restart the application'
                    ]
                };
            case 'LICENSE_INACTIVE':
                return {
                    icon: '🚫',
                    title: 'License Inactive',
                    message: 'Your license is not active.',
                    steps: [
                        'Contact support at serverpe.in',
                        'Provide your license key for verification'
                    ]
                };
            default:
                return {
                    icon: '⚠️',
                    title: 'License Error',
                    message: error?.message || 'An error occurred with your license.',
                    steps: ['Contact support for assistance']
                };
        }
    };

    const info = getErrorInfo();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-red-500/30 shadow-xl">
                {/* Icon */}
                <div className="text-6xl text-center mb-6">{info.icon}</div>
                
                {/* Title */}
                <h1 className="text-2xl font-bold text-white text-center mb-2">
                    {info.title}
                </h1>
                
                {/* Message */}
                <p className="text-slate-400 text-center mb-6">
                    {info.message}
                </p>

                {/* Error Details */}
                {error?.help && (
                    <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-slate-300">{error.help}</p>
                    </div>
                )}

                {/* Steps */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">How to fix:</h3>
                    <ol className="space-y-2">
                        {info.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">
                                    {i + 1}
                                </span>
                                {step}
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Demo Key Info */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-400">
                        💡 <strong>For testing:</strong> Use demo key <code className="bg-slate-700 px-2 py-0.5 rounded">DEMO_LICENSE_KEY_1234</code>
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    )}
                    <a
                        href="https://serverpe.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-lg text-center transition-colors"
                    >
                        Get License
                    </a>
                </div>

                {/* Support */}
                <p className="text-xs text-slate-500 text-center mt-6">
                    Need help? Contact support@serverpe.in
                </p>
            </div>
        </div>
    );
};

export default LicenseError;
