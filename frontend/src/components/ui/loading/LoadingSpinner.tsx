'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'destructive';
}

export function LoadingSpinner({
  size = 'md',
  className,
  color = 'primary'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  const colorClasses = {
    primary: 'border-primary/70 border-t-primary',
    secondary: 'border-secondary/70 border-t-secondary',
    success: 'border-green-500/70 border-t-green-500',
    destructive: 'border-destructive/70 border-t-destructive',
  };

  return (
    <div className="flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0.5, rotate: 0 }}
        animate={{ opacity: 1, rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
        className={cn(
          'rounded-full border-solid',
          colorClasses[color],
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
}
