/**
 * Connection Status Component
 * Shows backend connection status with visual indicator
 */

import React, { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '../api/apiClient';

const ConnectionStatus = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [checking, setChecking] = useState(true);

    const checkConnection = useCallback(async () => {
        try {
            await checkHealth();
            setIsConnected(true);
        } catch (error) {
            setIsConnected(false);
        } finally {
            setChecking(false);
        }
    }, []);

    useEffect(() => {
        checkConnection();
        
        // Check connection every 30 seconds
        const interval = setInterval(checkConnection, 30000);
        
        return () => clearInterval(interval);
    }, [checkConnection]);

    if (checking) {
        return (
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-xs text-slate-400">Checking...</span>
            </div>
        );
    }

    return (
        <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={checkConnection}
            title={isConnected ? 'Backend connected' : 'Backend disconnected - Click to retry'}
        >
            <div className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
            <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
            </span>
        </div>
    );
};

export default ConnectionStatus;
