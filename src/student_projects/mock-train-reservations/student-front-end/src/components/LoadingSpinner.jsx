import React from 'react';

const LoadingSpinner = ({ size = 'md', light = false }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClass = light ? 'border-white border-t-transparent' : 'border-primary-600 border-t-transparent';

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-4 ${colorClass} rounded-full animate-spin`}
      />
      {size === 'lg' && (
        <p className={`text-sm font-medium ${light ? 'text-white/80' : 'text-gray-500'}`}>
          Loading<span className="loading-dots"></span>
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
