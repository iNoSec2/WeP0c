import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Key, User, Shield, Building, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function WelcomeMessage() {
    const { toast } = useToast();
    const [isVisible, setIsVisible] = useState(true);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const handleInitializeDatabase = async () => {
        try {
            setIsInitializing(true);
            const response = await axios.post('/api/init-db');

            setIsInitialized(true);
            toast({
                title: 'Database initialized',
                description: 'Default users and project have been created successfully.',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to initialize database',
                variant: 'destructive',
            });
        } finally {
            setIsInitializing(false);
        }
    };

    if (!isVisible) return null;

    return (
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle>Welcome to P0cit!</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <CardDescription>
                    Get started with your Penetration Testing Management Platform
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-sm">
                    <p className="mb-4">
                        To quickly get started, you can initialize the database with default users and an example project.
                    </p>

                    <div className="grid gap-4 md:grid-cols-3 mt-4">
                        <div className="flex items-start space-x-2">
                            <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                                <h3 className="font-medium">Admin</h3>
                                <p className="text-sm text-muted-foreground">Username: admin</p>
                                <p className="text-sm text-muted-foreground">Password: adminpassword</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2">
                            <Building className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                                <h3 className="font-medium">Client</h3>
                                <p className="text-sm text-muted-foreground">Username: client</p>
                                <p className="text-sm text-muted-foreground">Password: clientpassword</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2">
                            <User className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                                <h3 className="font-medium">Pentester</h3>
                                <p className="text-sm text-muted-foreground">Username: pentester</p>
                                <p className="text-sm text-muted-foreground">Password: pentesterpassword</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleInitializeDatabase}
                    disabled={isInitializing || isInitialized}
                    className="w-full"
                >
                    <Database className="mr-2 h-4 w-4" />
                    {isInitializing ? 'Initializing...' : isInitialized ? 'Database Initialized' : 'Initialize Database with Default Users'}
                </Button>
            </CardFooter>
        </Card>
    );
} 