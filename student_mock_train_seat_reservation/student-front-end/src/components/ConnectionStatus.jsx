/**
 * ============================================================================
 * CONNECTION STATUS COMPONENT
 * ============================================================================
 * 
 * Shows real-time connection status to both student backend and main API.
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { checkConnectionStatus } from '../services/api';
import { FiWifi, FiWifiOff, FiServer, FiAlertCircle } from 'react-icons/fi';

export default function ConnectionStatus({ compact = false }) {
  const [status, setStatus] = useState({
    studentBackend: false,
    mainApi: false,
    licenseConfigured: false,
    error: null,
    checking: true,
  });

  useEffect(() => {
    // Initial check
    checkStatus();

    // Poll every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const result = await checkConnectionStatus();
      setStatus({
        ...result,
        checking: false,
      });
    } catch (error) {
      setStatus({
        studentBackend: false,
        mainApi: false,
        licenseConfigured: false,
        error: 'Connection check failed',
        checking: false,
      });
    }
  };

  const getOverallStatus = () => {
    if (status.checking) return 'checking';
    if (status.studentBackend && status.mainApi) return 'connected';
    if (status.studentBackend) return 'partial';
    return 'disconnected';
  };

  const overallStatus = getOverallStatus();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`status-dot ${
            overallStatus === 'connected'
              ? 'status-connected'
              : overallStatus === 'partial'
              ? 'status-partial'
              : 'status-disconnected'
          }`}
        />
        <span className="text-xs text-gray-400">
          {overallStatus === 'connected'
            ? 'Connected'
            : overallStatus === 'partial'
            ? 'Partial'
            : overallStatus === 'checking'
            ? 'Checking...'
            : 'Offline'}
        </span>
      </div>
    );
  }

  return (
    <div className="glass-card p-3 border-blue-500/20 backdrop-blur-xl bg-slate-900/60 shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5 capitalize">
          <FiServer className="text-blue-500" />
          API Status
        </h3>
        <button onClick={checkStatus} className="text-blue-500 hover:text-blue-400 rotate-on-click">
          <FiWifi className="text-xs" />
        </button>
      </div>

      <div className="space-y-1.5">
        {/* Student Backend */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Local Backend</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${status.studentBackend ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
            <span className={`text-[10px] font-medium ${status.studentBackend ? 'text-green-500' : 'text-red-500'}`}>
              {status.studentBackend ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Main API */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">ServerPE Cloud</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${status.mainApi ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
            <span className={`text-[10px] font-medium ${status.mainApi ? 'text-green-500' : 'text-red-500'}`}>
              {status.mainApi ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* License */}
        {!status.licenseConfigured && (
          <div className="pt-1 mt-1 border-t border-white/5 flex items-center justify-between gap-2">
            <span className="text-[9px] text-yellow-500/80 italic flex items-center gap-1">
              <FiAlertCircle className="text-[10px]" /> License Key Required
            </span>
          </div>
        )}
      </div>

      {status.error && (
        <div className="mt-2 text-[9px] text-red-400/80 bg-red-500/5 px-2 py-1 rounded border border-red-500/10">
          {status.error}
        </div>
      )}
    </div>
  );
}
