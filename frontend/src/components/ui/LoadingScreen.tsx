'use client';

import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Loading your secure environment...');

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    // Change loading text periodically
    const textInterval = setInterval(() => {
      const texts = [
        'Loading your secure environment...',
        'Initializing security protocols...',
        'Preparing vulnerability management...',
        'Setting up secure connections...',
      ];
      setLoadingText(texts[Math.floor(Math.random() * texts.length)]);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center justify-center max-w-md text-center">
        {/* Logo or title */}
        <div className="mb-8 flex flex-col items-center">
          <Shield className="w-16 h-16 text-foreground mb-4 pulse-animation" />
          <div className="text-foreground font-bold text-4xl">P0cit</div>
        </div>

        {/* Loading message */}
        <p className="text-muted-foreground mb-6 h-6">{loadingText}</p>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-muted rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-foreground rounded-full"
            style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}
          ></div>
        </div>
      </div>
    </div>
  );
}