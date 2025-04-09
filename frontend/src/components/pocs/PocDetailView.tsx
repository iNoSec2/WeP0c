'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MissionCommentList } from '@/components/comments/MissionCommentList';
import { MarkdownDisplay } from '@/components/MarkdownEditor';
import { Play, Code, FileText, AlertCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import { AdminOnly } from '@/components/auth/RoleBasedContent';

interface PocDetailViewProps {
    vulnerability: {
        id: string;
        mission_id: string;
        title: string;
        description_md?: string;
        poc_type?: string;
        poc_code?: string;
        severity?: string;
        status?: string;
    };
    onExecute?: (result: any) => void;
}

export const PocDetailView: React.FC<PocDetailViewProps> = ({ vulnerability, onExecute }) => {
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<{ success: boolean; output: string } | null>(null);
    const { toast } = useToast();

    const handleExecute = async () => {
        if (!vulnerability.poc_code) return;

        setIsExecuting(true);
        try {
            const response = await axios.post(`/api/vulnerabilities/${vulnerability.id}/execute`, {
                code: vulnerability.poc_code,
                type: vulnerability.poc_type
            });

            setExecutionResult({
                success: response.data.success,
                output: response.data.output
            });

            if (onExecute) {
                onExecute(response.data);
            }

            toast({
                title: response.data.success ? 'PoC executed successfully' : 'PoC execution failed',
                description: response.data.success ? 'Check the results tab for details' : 'See error in results tab',
                variant: response.data.success ? 'default' : 'destructive',
            });
        } catch (error) {
            console.error('Error executing PoC:', error);
            setExecutionResult({
                success: false,
                output: 'An error occurred while executing the PoC. Please check the server logs.'
            });

            toast({
                title: 'Error',
                description: 'Failed to execute PoC',
                variant: 'destructive',
            });
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">{vulnerability.title}</CardTitle>
                            <CardDescription>
                                {vulnerability.severity && (
                                    <Badge variant={vulnerability.severity === 'critical' ? 'destructive' : 'default'} className="mr-2">
                                        {vulnerability.severity}
                                    </Badge>
                                )}
                                {vulnerability.status && (
                                    <Badge variant="outline">{vulnerability.status}</Badge>
                                )}
                            </CardDescription>
                        </div>
                        <AdminOnly>
                            {vulnerability.poc_code && (
                                <Button
                                    onClick={handleExecute}
                                    disabled={isExecuting}
                                    className="ml-4"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    {isExecuting ? 'Running...' : 'Run PoC'}
                                </Button>
                            )}
                        </AdminOnly>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="description">
                                <FileText className="w-4 h-4 mr-2" />
                                Description
                            </TabsTrigger>
                            <TabsTrigger value="poc" disabled={!vulnerability.poc_code}>
                                <Code className="w-4 h-4 mr-2" />
                                PoC Code
                            </TabsTrigger>
                            <TabsTrigger value="result" disabled={!executionResult}>
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Result
                            </TabsTrigger>
                            <TabsTrigger value="comments">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Comments
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="description" className="mt-4">
                            {vulnerability.description_md ? (
                                <MarkdownDisplay content={vulnerability.description_md} />
                            ) : (
                                <p className="text-muted-foreground">No description available.</p>
                            )}
                        </TabsContent>
                        <TabsContent value="poc" className="mt-4">
                            {vulnerability.poc_code ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline">{vulnerability.poc_type}</Badge>
                                    </div>
                                    <MarkdownDisplay content={`\`\`\`${vulnerability.poc_type?.toLowerCase() || ''}
${vulnerability.poc_code}
\`\`\``} />
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No PoC code available.</p>
                            )}
                        </TabsContent>
                        <TabsContent value="result" className="mt-4">
                            {executionResult ? (
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <Badge variant={executionResult.success ? 'default' : 'destructive'}>
                                            {executionResult.success ? 'Success' : 'Failed'}
                                        </Badge>
                                    </div>
                                    <MarkdownDisplay content={`\`\`\`
${executionResult.output}
\`\`\``} />
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No execution results available.</p>
                            )}
                        </TabsContent>
                        <TabsContent value="comments" className="mt-4">
                            <MissionCommentList
                                missionId={vulnerability.mission_id}
                                pocId={vulnerability.id}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}; 