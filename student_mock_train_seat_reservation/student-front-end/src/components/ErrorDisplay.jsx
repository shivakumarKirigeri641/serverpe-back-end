/**
 * ============================================================================
 * ERROR DISPLAY COMPONENT
 * ============================================================================
 * 
 * A user-friendly error display that shows a short message by default,
 * with expandable technical details on click.
 */

import { useState } from 'react';
import { FiAlertCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function ErrorDisplay({ error, onDismiss }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  // Extract user-friendly message
  const userMessage = error?.userMessage || error?.message || 'Something went wrong';
  const technicalMessage = error?.technicalMessage || error?.message || '';
  const errorCode = error?.errorCode || '';
  const statusCode = error?.statusCode || '';

  // Format technical details
  const technicalDetails = [
    errorCode && `Code: ${errorCode}`,
    statusCode && `Status: ${statusCode}`,
    technicalMessage && `Details: ${technicalMessage}`,
  ].filter(Boolean).join('\n');

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <FiAlertCircle className="text-red-400 text-xl flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-red-300 font-medium">{userMessage}</p>
          
          {technicalDetails && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2 text-xs text-red-400/70 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              {showDetails ? (
                <>
                  <FiChevronUp className="text-sm" /> Hide details
                </>
              ) : (
                <>
                  <FiChevronDown className="text-sm" /> Show details...
                </>
              )}
            </button>
          )}

          {showDetails && technicalDetails && (
            <pre className="mt-2 p-3 bg-slate-900/50 rounded-lg text-[11px] text-gray-400 font-mono overflow-x-auto whitespace-pre-wrap border border-white/5">
              {technicalDetails}
            </pre>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400/50 hover:text-red-400 text-lg"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Toast-friendly error formatter
 * Returns a short message for toast notifications
 */
export function formatErrorForToast(error) {
  return error?.userMessage || error?.message || 'Something went wrong';
}
