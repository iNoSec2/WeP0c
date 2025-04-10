'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Code, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface PocDisplayProps {
    vulnerability: {
        id: string;
        title: string;
        description?: string;
        description_html?: string;
        poc_type?: string;
        poc_code?: string;
        poc_html?: string;
        severity?: string;
        status?: string;
        project_id?: string;
        project_name?: string;
        created_at?: string;
        updated_at?: string;
        discovered_by?: string;
        fixed_by?: string;
        fixed_at?: string;
    };
    onExecute?: (result: any) => void;
    isExecuting?: boolean;
    executeHandler?: () => void;
}

export const PocDisplay: React.FC<PocDisplayProps> = ({
    vulnerability,
    onExecute,
    isExecuting: externalIsExecuting,
    executeHandler
}) => {
    const { toast } = useToast();
    const [internalIsExecuting, setInternalIsExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<any>(null);

    // Use external isExecuting state if provided, otherwise use internal state
    const isExecuting = externalIsExecuting !== undefined ? externalIsExecuting : internalIsExecuting;

    const handleExecute = async () => {
        try {
            setIsExecuting(true);
            const response = await axios.post(`/api/vulnerabilities/execute/${vulnerability.id}`);
            setExecutionResult(response.data);
            onExecute?.(response.data);
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

    return (
        <Card className="w-full">
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
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
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
                    </TabsList>
                    <TabsContent value="description" className="mt-4">
                        {vulnerability.description_html ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: vulnerability.description_html }} />
                        ) : vulnerability.description ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown>{vulnerability.description}</ReactMarkdown>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No description available.</p>
                        )}
                    </TabsContent>
                    <TabsContent value="poc" className="mt-4">
                        {vulnerability.poc_html ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">{vulnerability.poc_type}</Badge>
                                </div>
                                <div className="prose prose-sm max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: vulnerability.poc_html }} />
                            </div>
                        ) : vulnerability.poc_code ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">{vulnerability.poc_type}</Badge>
                                </div>
                                <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                                    <code>{vulnerability.poc_code}</code>
                                </pre>
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
                                <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                                    <code>{executionResult.output}</code>
                                </pre>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No execution results available.</p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};