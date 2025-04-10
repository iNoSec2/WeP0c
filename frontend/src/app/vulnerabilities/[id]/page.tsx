'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { MarkdownDisplay } from '@/components/MarkdownEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Play, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function VulnerabilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const vulnerabilityId = params.id as string;
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    success?: boolean;
    output?: string;
    exit_code?: number;
  }>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: vulnerability, isLoading, error: vulnerabilityError } = useQuery({
    queryKey: ['vulnerability', vulnerabilityId],
    queryFn: async () => {
      console.log(`Fetching vulnerability with ID: ${vulnerabilityId}`);
      const response = await axios.get(`/api/vulnerabilities/${vulnerabilityId}`);
      return response.data;
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

  const handleRunPoc = async () => {
    setIsExecuting(true);
    setExecutionResult({});

    try {
      const response = await axios.post(`/api/vulnerabilities/execute/${vulnerabilityId}`);
      setExecutionResult({
        success: response.data.success,
        output: response.data.output,
        exit_code: response.data.exit_code
      });

      toast({
        title: 'PoC Executed',
        description: `Result: ${response.data.success ? 'Success' : 'Failed'}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to execute PoC',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'fixed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container p-6 mx-auto space-y-6">
          <div className="flex items-center justify-between animate-pulse">
            <div className="h-10 w-24 bg-muted rounded"></div>
            <div className="h-10 w-32 bg-muted rounded"></div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 border-b space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-40 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="h-6 w-full max-w-md bg-muted rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-[90%] bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-[80%] bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-[85%] bg-muted rounded animate-pulse"></div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="h-6 w-40 bg-muted rounded animate-pulse"></div>
                <div className="h-32 w-full bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!vulnerability || vulnerabilityError) {
    return (
      <DashboardLayout>
        <div className="container p-6 mx-auto">
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-lg text-center mb-4">
              {vulnerabilityError
                ? `Error: ${(vulnerabilityError as any)?.response?.data?.error || 'Failed to load vulnerability'}`
                : 'Vulnerability not found'
              }
            </p>
            <Button asChild>
              <a href="/vulnerabilities">Back to Vulnerabilities</a>
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="poc">Proof of Concept</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <MarkdownDisplay content={vulnerability.description_md} />
                  </div>
                </TabsContent>
                <TabsContent value="poc" className="mt-4">
                  {vulnerability.poc_code ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">PoC Code ({vulnerability.poc_type})</h3>
                        </div>
                        <Button
                          onClick={handleRunPoc}
                          disabled={isExecuting}
                          className="flex items-center"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {isExecuting ? 'Running...' : 'Run PoC'}
                        </Button>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
                        <pre className="text-sm font-mono whitespace-pre-wrap">
                          {vulnerability.poc_code}
                        </pre>
                      </div>

                      {executionResult.output && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Execution Result</h4>
                          <div className={`p-4 rounded-md overflow-auto ${executionResult.success
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900'
                            }`}>
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">
                                {executionResult.success ? 'Success' : 'Failed'}
                              </span>
                              <span className="text-sm">
                                Exit code: {executionResult.exit_code}
                              </span>
                            </div>
                            <pre className="text-sm font-mono whitespace-pre-wrap">
                              {executionResult.output}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">No PoC code available for this vulnerability.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteVulnerabilityMutation.mutate()}
        title="Delete Vulnerability"
        description="Are you sure you want to delete this vulnerability? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </DashboardLayout>
  );
}
