'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { LoadingProvider } from './LoadingProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
