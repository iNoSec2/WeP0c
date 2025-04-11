'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Edit, Trash2, FileText, Code, Info } from 'lucide-react';
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function SimpleVulnerabilityDetailPage() {
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
        const response = await axios.get(`/api/vulnerabilities/${vulnerabilityId}`);
        console.log('Vulnerability data received:', response.data);
        return response.data;
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

  // Helper functions for styling
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'high':
        return 'bg-orange-500 text-white hover:bg-orange-600';
      case 'medium':
        return 'bg-yellow-500 text-black hover:bg-yellow-600';
      case 'low':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'info':
        return 'bg-green-500 text-white hover:bg-green-600';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'in_progress':
        return 'bg-yellow-500 text-black hover:bg-yellow-600';
      case 'fixed':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'false_positive':
        return 'bg-gray-500 text-white hover:bg-gray-600';
      case 'wont_fix':
        return 'bg-purple-500 text-white hover:bg-purple-600';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
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
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Loading vulnerability details...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Error</CardTitle>
              <CardDescription>
                Could not load vulnerability details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                {vulnerabilityError
                  ? `Error: ${typeof vulnerabilityError === 'string' ? vulnerabilityError :
                      ((vulnerabilityError as any)?.response?.data?.error || 'Failed to load vulnerability')}`
                  : 'The requested vulnerability could not be found.'
                }
              </p>
              <Button
                onClick={() => router.push('/vulnerabilities')}
              >
                Return to Vulnerabilities
              </Button>
            </CardContent>
          </Card>
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

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{vulnerability.title}</CardTitle>
                  <CardDescription>
                    Created on {formatDate(vulnerability.created_at)}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Badge className={getSeverityColor(vulnerability.severity)}>
                    {vulnerability.severity}
                  </Badge>
                  <Badge className={getStatusColor(vulnerability.status)}>
                    {vulnerability.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description" className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Description
                  </TabsTrigger>
                  <TabsTrigger value="poc" className="flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    Proof of Concept
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Details
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert rounded-lg border border-input bg-background p-4">
                    <pre>{vulnerability.description}</pre>
                  </div>
                </TabsContent>
                <TabsContent value="poc" className="mt-4">
                  {vulnerability.poc_code ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">{vulnerability.poc_type}</Badge>
                          <h3 className="text-lg font-medium">Proof of Concept</h3>
                        </div>
                      </div>
                      <div className="rounded-lg border border-input bg-background overflow-auto">
                        <pre className="p-4">{vulnerability.poc_code}</pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground italic border rounded-md p-4 min-h-[150px] flex items-center justify-center">
                      No PoC code available
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="details" className="mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">Project</h3>
                        <p>{vulnerability.project_name || 'Unknown Project'}</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">Discovered By</h3>
                        <p>{vulnerability.discoverer_name || 'Unknown'}</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">Created At</h3>
                        <p>{formatDate(vulnerability.created_at)}</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">Updated At</h3>
                        <p>{vulnerability.updated_at ? formatDate(vulnerability.updated_at) : 'Never'}</p>
                      </div>
                      {vulnerability.fixed_at && (
                        <div className="space-y-2">
                          <h3 className="font-medium">Fixed At</h3>
                          <p>{formatDate(vulnerability.fixed_at)}</p>
                        </div>
                      )}
                      {vulnerability.fixed_by && (
                        <div className="space-y-2">
                          <h3 className="font-medium">Fixed By</h3>
                          <p>{vulnerability.fixer_name || 'Unknown'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
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
