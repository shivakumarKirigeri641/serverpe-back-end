/**
 * Loading Spinner Component
 * Reusable loading indicator
 */

import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
    const sizes = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-4'
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-3">
            <div className={`${sizes[size]} border-slate-600 border-t-blue-500 rounded-full animate-spin`}></div>
            {text && <p className="text-slate-400 text-sm">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
