'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  message?: string;
}

const loadingMessages = [
  "Loading your secure environment...",
  "Initializing security protocols...",
  "Scanning for vulnerabilities...",
  "Setting up pentesting workspace...",
  "Establishing secure connections...",
  "Preparing reporting tools...",
  "Syncing project data...",
  "Almost ready..."
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message || loadingMessages[0]);
  const [messageIndex, setMessageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Simulate loading progress
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        // Slow down progress as it gets closer to 100%
        const increment = Math.max(0.3, (100 - prev) / 30);
        const newProgress = Math.min(99, prev + increment);

        // Complete loading at 99% with a final timeout
        if (newProgress >= 99 && !timeoutRef.current) {
          timeoutRef.current = setTimeout(() => {
            setProgress(100);
          }, 1200);
        }

        return newProgress;
      });
    }, 180);

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      clearInterval(messageInterval);
    };
  }, []);

  // Update the current message when the index changes
  useEffect(() => {
    setCurrentMessage(message || loadingMessages[messageIndex]);
  }, [message, messageIndex]);

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center justify-center">
            <Shield
              size={56}
              className={cn(
                "text-primary",
                "pulse-animation"
              )}
            />
          </div>
          <h1 className="text-2xl font-bold mt-3 text-center">P0cit</h1>
        </motion.div>

        <div className="loading-progress">
          <motion.div
            className="loading-progress-bar"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="loading-message"
          >
            {currentMessage}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
