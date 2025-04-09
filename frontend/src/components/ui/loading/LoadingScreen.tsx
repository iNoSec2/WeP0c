'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading your secure environment...' }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const loadingMessages = [
    'Initializing secure environment...',
    'Loading application components...',
    'Establishing secure connection...',
    'Preparing dashboard...',
    'Almost ready...'
  ];

  useEffect(() => {
    // Simulate loading progress with a more natural curve
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        // Faster at the beginning, slower towards the end
        let increment = 5;
        if (prevProgress > 70) increment = 3;
        if (prevProgress > 85) increment = 2;
        if (prevProgress > 95) increment = 1;

        const newProgress = prevProgress + increment;

        // Update loading step based on progress
        if (newProgress > 20 && loadingStep === 0) setLoadingStep(1);
        else if (newProgress > 40 && loadingStep === 1) setLoadingStep(2);
        else if (newProgress > 60 && loadingStep === 2) setLoadingStep(3);
        else if (newProgress > 80 && loadingStep === 3) setLoadingStep(4);

        // Mark as complete when we reach 100%
        if (newProgress >= 100 && !isComplete) {
          setIsComplete(true);
          clearInterval(interval);
        }

        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 40); // Slightly faster interval

    return () => clearInterval(interval);
  }, [loadingStep, isComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <div className="w-full max-w-md px-8 py-12 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
          className="mb-8 relative"
        >
          <div className="flex items-center justify-center mb-4 relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/10 w-16 h-16"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/5 w-20 h-20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: [0.9, 1.3, 0.9], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            />
            <Shield className="h-16 w-16 text-primary relative z-10 pulse-animation" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-bold text-center mb-2"
          >
            P0cit
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-sm text-muted-foreground text-center"
          >
            Penetration Testing Management Platform
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="w-full space-y-4"
        >
          {/* Custom progress bar with animated gradient */}
          <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isComplete ?
                'bg-gradient-to-r from-green-500 via-green-400 to-green-500 animate-gradient-x' :
                'bg-gradient-to-r from-primary/70 via-primary to-primary/70 animate-gradient-x'}`}
              style={{ width: `${progress}%` }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex justify-between items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-muted-foreground flex items-center"
              >
                {isComplete ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-green-500">Ready!</span>
                  </>
                ) : (
                  loadingMessages[loadingStep]
                )}
              </motion.p>
            </AnimatePresence>
            <p className="text-sm font-medium">{progress}%</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
