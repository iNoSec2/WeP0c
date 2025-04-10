'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'destructive';
  text?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
  color = 'primary',
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  const colorClasses = {
    primary: 'border-primary/20 border-t-primary',
    secondary: 'border-secondary/20 border-t-secondary',
    success: 'border-green-500/20 border-t-green-500',
    destructive: 'border-destructive/20 border-t-destructive',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={cn(
          'rounded-full border-solid animate-spin',
          colorClasses[color],
          sizeClasses[size],
          className
        )}
        style={{ animationDuration: '0.8s' }}
      />

      {text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

// Fallback component that doesn't require framer-motion
export function FallbackSpinner({
  size = 'md',
  className,
  color = 'primary',
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className={cn('rounded-full', sizeClasses[size], className)}>
          <div className={`absolute inset-0 rounded-full border-2 border-muted`} />
          <div
            className={`absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin`}
            style={{ animationDuration: '0.8s' }}
          />
        </div>
      </div>

      {text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}
