'use client';

import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { useLoading } from '@/providers/LoadingProvider';

interface UseApiOptions {
  showLoadingScreen?: boolean;
  loadingMessage?: string;
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
}

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();

  const request = useCallback(
    async <T = any>(
      config: AxiosRequestConfig,
      options: UseApiOptions = {}
    ): Promise<T | null> => {
      const {
        showLoadingScreen = false,
        loadingMessage = 'Loading...',
        showSuccessToast = false,
        successMessage = 'Operation completed successfully',
        showErrorToast = true,
        errorMessage = 'An error occurred',
      } = options;

      try {
        setIsLoading(true);
        setError(null);

        if (showLoadingScreen) {
          startLoading(loadingMessage);
        }

        // Get token from localStorage
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        
        // Add authorization header if token exists
        const headers = token
          ? { ...config.headers, Authorization: `Bearer ${token}` }
          : config.headers;

        const response: AxiosResponse<T> = await axios({
          ...config,
          headers,
        });

        if (showSuccessToast) {
          toast({
            title: 'Success',
            description: successMessage,
          });
        }

        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError;
        const errorMsg = 
          axiosError.response?.data?.message || 
          axiosError.response?.data?.detail || 
          axiosError.message || 
          errorMessage;

        setError(errorMsg);

        if (showErrorToast) {
          toast({
            title: 'Error',
            description: errorMsg,
            variant: 'destructive',
          });
        }

        console.error('API Error:', axiosError);
        return null;
      } finally {
        setIsLoading(false);
        if (showLoadingScreen) {
          stopLoading();
        }
      }
    },
    [toast, startLoading, stopLoading]
  );

  return {
    isLoading,
    error,
    request,
  };
}
