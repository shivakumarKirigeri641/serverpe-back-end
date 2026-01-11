/**
 * ============================================================================
 * TOAST COMPONENT - Error Display with Technical Details
 * ============================================================================
 */

import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export function ErrorToast({ error, onDismiss }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl shadow-lg max-w-md">
      <div className="flex items-start gap-3">
        <FiAlertCircle className="text-xl flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">{error.userMessage || 'An error occurred'}</p>
          
          {error.technicalMessage && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2 text-xs flex items-center gap-1 opacity-80 hover:opacity-100"
            >
              {showDetails ? 'Hide' : 'Show'} Technical Details
              {showDetails ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          )}

          {showDetails && error.technicalMessage && (
            <div className="mt-2 p-2 bg-black/20 rounded-lg text-xs font-mono">
              <p>
                <span className="opacity-60">Error Code:</span> {error.errorCode}
              </p>
              <p className="mt-1">
                <span className="opacity-60">Details:</span> {error.technicalMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SuccessToast({ message }) {
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg max-w-md">
      <div className="flex items-center gap-3">
        <FiCheckCircle className="text-xl" />
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
}
