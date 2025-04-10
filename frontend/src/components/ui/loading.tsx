'use client';

import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary';
  fullScreen?: boolean;
  text?: string;
}

export function Loading({
  className,
  size = 'md',
  variant = 'default',
  fullScreen = false,
  text,
  ...props
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const variantClasses = {
    default: 'text-gray-500',
    primary: 'text-primary',
    secondary: 'text-secondary',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullScreen && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <Loader2
            className={cn(
              sizeClasses[size],
              variantClasses[variant],
              'animate-spin'
            )}
            style={{ animationDuration: '1s' }}
          />
        </div>
        {(text || fullScreen) && (
          <p className="text-sm text-muted-foreground">
            {text || 'Loading...'}
          </p>
        )}
      </div>
    </div>
  );
}

export function LoadingScreen({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center justify-center p-8 rounded-lg shadow-lg">
        <div className="relative mb-4">
          <div className="h-16 w-16 rounded-full border-4 border-muted"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1s' }}></div>
        </div>
        <p className="text-lg font-medium mb-3">{text}</p>
        <div className="mt-2 w-48 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary/70 via-primary to-primary/70 animate-gradient-x animate-progress"></div>
        </div>
      </div>
    </div>
  );
}

export function LoadingDots() {
  return (
    <div className="flex space-x-1 items-center justify-center">
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative h-10 w-10">
        <div className="absolute top-0 left-0 h-full w-full border-4 border-muted rounded-full"></div>
        <div className="absolute top-0 left-0 h-full w-full border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

export function LoadingCard({
  title = "Loading",
  description = "Please wait while we load your content...",
  text,
  simple = false
}: {
  title?: string;
  description?: string;
  text?: string;
  simple?: boolean;
}) {
  if (simple) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <Loading size="md" variant="primary" text={text} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-center space-x-4">
        <div className="relative h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium leading-none">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse"></div>
        <div className="h-4 bg-muted rounded animate-pulse w-[80%]"></div>
        <div className="h-4 bg-muted rounded animate-pulse w-[60%]"></div>
      </div>
    </div>
  );
}

export function LoadingPage({ text }: { text?: string }) {
  return (
    <Loading
      fullScreen
      size="lg"
      variant="primary"
      text={text}
      className="bg-background/95"
    />
  );
}

export function LoadingButton() {
  return <Loading size="sm" variant="primary" />;
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
      <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
      <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
      <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
    </div>
  );
}

export function LoadingTable() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-muted rounded animate-pulse"></div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

export function LoadingForm() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
        <div className="h-10 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
        <div className="h-10 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
        <div className="h-32 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="h-10 bg-muted rounded w-1/4 animate-pulse"></div>
    </div>
  );
}

export function LoadingSuccess({ text = "Success!" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
      <p className="mt-4 text-lg font-medium text-green-600">{text}</p>
    </div>
  );
}
