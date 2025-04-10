import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'white';
    text?: string;
    fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'primary',
    text,
    fullScreen = false
}) => {
    // Size variants
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-4'
    };

    // Color variants
    const colorClasses = {
        primary: 'border-blue-600 border-t-transparent',
        secondary: 'border-gray-600 border-t-transparent',
        white: 'border-white border-t-transparent'
    };

    // Container classes for full screen or inline
    const containerClasses = fullScreen
        ? 'fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50'
        : 'flex flex-col items-center';

    return (
        <div className={containerClasses} role="status" aria-live="polite">
            <div
                className={`inline-block animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
                role="presentation"
            ></div>
            {text && (
                <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">{text}</span>
            )}
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default LoadingSpinner; 