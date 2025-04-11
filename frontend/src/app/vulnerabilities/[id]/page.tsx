'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import CodeBlock from '@/components/CodeBlock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Play, ArrowLeft, Edit, Trash2, CheckCircle, XCircle, AlertTriangle, AlertCircle, FileText, Code, Info } from 'lucide-react';
import { ConfirmDialog } from "@/components/ConfirmDialog";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

// Using the fixed version that uses PocDisplay component
import FixedVulnerabilityDetailPage from './fixed-page';

export default function VulnerabilityDetailPage() {
  return <FixedVulnerabilityDetailPage />;
}

// Original implementation - keeping for reference
function OriginalVulnerabilityDetailPage() {
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
          <div className="flex items-center space-x-2 mb-6">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-red-500">Error Loading Vulnerability</CardTitle>
              <CardDescription>
                {vulnerabilityError
                  ? `There was a problem loading this vulnerability. You may not have permission to view it.`
                  : 'Vulnerability not found'
                }
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
                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw, rehypeSanitize]}
                      remarkPlugins={[remarkGfm]}
                    >
                      {vulnerability.description || ''}
                    </ReactMarkdown>
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
                        <Button
                          onClick={handleRunPoc}
                          disabled={isExecuting}
                          className="flex items-center"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {isExecuting ? 'Running...' : 'Run PoC'}
                        </Button>
                      </div>
                      <div className="rounded-lg border border-input bg-background overflow-auto">
                        <CodeBlock
                          code={vulnerability.poc_code}
                          language={vulnerability.poc_type?.toLowerCase() || 'text'}
                          showLineNumbers={true}
                        />

                        {executionResult.output && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Execution Result</h4>
                            <div className={`p-4 rounded-md overflow-auto ${executionResult.success
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900'
                              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900'
                              }`}>
                              <div className="flex justify-between mb-2">
                                <span className="font-medium flex items-center">
                                  {executionResult.success
                                    ? <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    : <XCircle className="h-4 w-4 mr-2 text-red-500" />}
                                  {executionResult.success ? 'Success' : 'Failed'}
                                </span>
                                <span className="text-sm">
                                  Exit code: {executionResult.exit_code}
                                </span>
                              </div>

                              {/* Error message for common issues */}
                              {!executionResult.success && executionResult.output && executionResult.output.includes("No such file or directory") && (
                                <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-sm">
                                  <div className="flex items-start">
                                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500 mt-0.5" />
                                    <div>
                                      <p className="font-medium">File not found error detected</p>
                                      <p>This error typically occurs when the PoC file cannot be accessed. Try the following:</p>
                                      <ul className="list-disc ml-5 mt-1">
                                        <li>Check that your code references files correctly</li>
                                        <li>If using external files, upload them as a ZIP attachment</li>
                                        <li>Make sure file paths are relative to the PoC script</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="overflow-auto max-h-96">
                                <CodeBlock
                                  code={executionResult.output || 'No output received from execution'}
                                  language="shell"
                                  showLineNumbers={false}
                                  className="mt-2"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">No PoC code available for this vulnerability.</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="details" className="mt-4">
                  <div className="space-y-4 rounded-lg border border-input bg-background p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Vulnerability Information</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Severity:</span>
                            <Badge className={getSeverityColor(vulnerability.severity)}>
                              {vulnerability.severity}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(vulnerability.status)}>
                              {vulnerability.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Created:</span>
                            <span>{formatDate(vulnerability.created_at)}</span>
                          </div>
                          {vulnerability.updated_at && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Updated:</span>
                              <span>{formatDate(vulnerability.updated_at)}</span>
                            </div>
                          )}
                          {vulnerability.fixed_at && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fixed:</span>
                              <span>{formatDate(vulnerability.fixed_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Technical Details</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">PoC Type:</span>
                            <span>{vulnerability.poc_type || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Has PoC Code:</span>
                            <span>{vulnerability.poc_code ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Has PoC File:</span>
                            <span>{vulnerability.poc_zip_path && vulnerability.poc_zip_path !== 'N/A' ? 'Yes' : 'No'}</span>
                          </div>
                          {vulnerability.cvss_score && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">CVSS Score:</span>
                              <span>{vulnerability.cvss_score}</span>
                            </div>
                          )}
                          {vulnerability.cvss_vector && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">CVSS Vector:</span>
                              <span className="font-mono text-xs">{vulnerability.cvss_vector}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
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
