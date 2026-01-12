/**
 * Connection Status Component
 * Shows backend connection and license status
 */

import React, { useState, useEffect, useCallback } from 'react';
import { checkHealth, getLicenseStatus } from '../api/apiClient';

const ConnectionStatus = ({ onLicenseError }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [checking, setChecking] = useState(true);
    const [licenseStatus, setLicenseStatus] = useState(getLicenseStatus());

    const checkConnection = useCallback(async () => {
        try {
            await checkHealth();
            setIsConnected(true);
        } catch (error) {
            setIsConnected(false);
            
            // Check for license errors
            if (error?.error_code?.includes('LICENSE') || error?.error_code?.includes('KEY')) {
                if (onLicenseError) onLicenseError(error);
            }
        } finally {
            setChecking(false);
        }
    }, [onLicenseError]);

    useEffect(() => {
        checkConnection();
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, [checkConnection]);

    // Listen for license errors from API client
    useEffect(() => {
        const handleLicenseError = (event) => {
            if (onLicenseError) onLicenseError(event.detail);
        };
        window.addEventListener('licenseError', handleLicenseError);
        return () => window.removeEventListener('licenseError', handleLicenseError);
    }, [onLicenseError]);

    if (checking) {
        return (
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-xs text-slate-400">Connecting...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-3">
            {/* Connection Status */}
            <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={checkConnection}
                title={isConnected ? 'API Connected' : 'API Disconnected - Click to retry'}
            >
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isConnected ? 'API' : 'Offline'}
                </span>
            </div>

            {/* License Status */}
            <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                    licenseStatus.valid 
                        ? (licenseStatus.isDemo ? 'bg-yellow-500' : 'bg-blue-500') 
                        : 'bg-red-500'
                }`}></div>
                <span className={`text-xs ${
                    licenseStatus.valid 
                        ? (licenseStatus.isDemo ? 'text-yellow-400' : 'text-blue-400') 
                        : 'text-red-400'
                }`}>
                    {!licenseStatus.valid ? 'No Key' : (licenseStatus.isDemo ? 'Demo' : 'Licensed')}
                </span>
            </div>
        </div>
    );
};

export default ConnectionStatus;
