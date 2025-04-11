'use client';

import React, { ReactNode } from 'react';
import { AuthProvider as AuthContextProvider } from '@/contexts/AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  );
}
