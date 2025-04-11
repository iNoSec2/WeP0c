'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PocDisplay } from '@/components/PocDisplay';
import vulnerabilitiesAPI from '@/lib/api/vulnerabilities';

export default function FixedVulnerabilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const vulnerabilityId = params.id as string;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: vulnerability, isLoading, error: vulnerabilityError } = useQuery({
    queryKey: ['vulnerability', vulnerabilityId],
    queryFn: async () => {
      console.log(`Fetching vulnerability with ID: ${vulnerabilityId}`);
      try {
        // Use the vulnerabilitiesAPI to get the vulnerability by ID
        return await vulnerabilitiesAPI.getById(vulnerabilityId);
      } catch (error: any) {
        console.error('Error fetching vulnerability:', error.response?.data || error.message);
        toast({
          title: 'Error fetching vulnerability',
          description: error.response?.data?.error || 'Could not load vulnerability details',
          variant: 'destructive',
        });
        throw error;
      }
    },
    retry: 2, // Retry failed requests up to 2 times
  });

  const deleteVulnerabilityMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/vulnerabilities/${vulnerabilityId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vulnerabilities'] });
      toast({
        title: 'Vulnerability deleted',
        description: 'The vulnerability has been successfully deleted.',
      });
      router.push('/vulnerabilities');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete vulnerability',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteVulnerabilityMutation.mutate();
    setIsDeleteDialogOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container p-6 mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (vulnerabilityError || !vulnerability) {
    return (
      <DashboardLayout>
        <div className="container p-6 mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-4 rounded-md">
            <h2 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h2>
            <p className="text-red-700 dark:text-red-300">
              {vulnerabilityError
                ? `Error: ${typeof vulnerabilityError === 'string' ? vulnerabilityError :
                  ((vulnerabilityError as any)?.response?.data?.error || 'Failed to load vulnerability')}`
                : 'The requested vulnerability could not be found.'
              }
            </p>
            <Button
              onClick={() => router.push('/vulnerabilities')}
              className="mt-4"
              variant="outline"
            >
              Return to Vulnerabilities
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container p-6 mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.push(`/vulnerabilities/${vulnerabilityId}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <PocDisplay vulnerability={vulnerability} />
        </div>
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Vulnerability"
        description="Are you sure you want to delete this vulnerability? This action cannot be undone."
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  );
}
