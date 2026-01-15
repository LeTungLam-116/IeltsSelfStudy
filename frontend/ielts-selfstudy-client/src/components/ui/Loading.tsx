import React from 'react';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
  text?: string;
}

export interface SkeletonProps {
  className?: string;
  lines?: number;
  width?: string | string[];
  height?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  className = '',
  text
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  if (variant === 'spinner') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg
          className={`animate-spin text-indigo-600 ${sizeClasses[size]}`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {text && <span className="ml-2 text-gray-600">{text}</span>}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center space-x-1 ${className}`}>
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        {text && <span className="ml-2 text-gray-600">{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
        {text && <span className="sr-only">{text}</span>}
      </div>
    );
  }

  return null;
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  lines = 1,
  width = '100%',
  height = '1rem'
}) => {
  const skeletonLines = Array.from({ length: lines }, (_, index) => {
    const lineWidth = Array.isArray(width) ? width[index] || width[0] : width;
    return (
      <div
        key={index}
        className={`animate-pulse bg-gray-200 rounded mb-2 ${className}`}
        style={{
          width: lineWidth,
          height: index === lines - 1 ? height : height, // Last line might be shorter
        }}
      />
    );
  });

  return <div className="space-y-2">{skeletonLines}</div>;
};

export default Loading;