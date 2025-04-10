'use client';

import React from 'react';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
            <div className="flex flex-col items-center justify-center max-w-md text-center">
                {/* Logo or title */}
                <div className="mb-8 text-blue-600 font-bold text-4xl">P0cit</div>

                {/* Loading message */}
                <p className="text-gray-600 mb-6">Loading your secure environment...</p>

                {/* Custom spinner */}
                <div className="spinner-container mb-8">
                    <div className="spinner"></div>
                </div>

                {/* Progress bar */}
                <div className="progress-container">
                    <div className="progress-bar"></div>
                </div>

                {/* CSS for animations */}
                <style jsx>{`
          .spinner-container {
            position: relative;
            width: 50px;
            height: 50px;
          }
          
          .spinner {
            position: absolute;
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 4px solid #3B82F6;
            width: 100%;
            height: 100%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .progress-container {
            width: 250px;
            height: 6px;
            background-color: rgba(0, 0, 0, 0.1);
            border-radius: 3px;
            overflow: hidden;
          }
          
          .progress-bar {
            height: 100%;
            width: 20%;
            background-color: #3B82F6;
            border-radius: 3px;
            animation: progress-animation 2s ease-in-out infinite;
          }
          
          @keyframes progress-animation {
            0% {
              width: 20%;
              transform: translateX(0);
            }
            50% {
              width: 40%;
            }
            100% {
              width: 20%;
              transform: translateX(230px);
            }
          }
        `}</style>
            </div>
        </div>
    );
} 