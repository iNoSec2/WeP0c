'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, UserPlus, FolderPlus } from 'lucide-react';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
}

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    created_at: string;
}

export default function AdminDashboard() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('users');
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' });
    const [newProject, setNewProject] = useState({ name: '', description: '' });

    const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await axios.get('/api/users/');
            return response.data;
        },
    });

    const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await axios.get('/api/projects/');
            return response.data;
        },
    });

    const createUserMutation = useMutation({
        mutationFn: async (userData: typeof newUser) => {
            const response = await axios.post('/api/users/', userData);
            return response.data;
        },
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'User created successfully',
            });
            setIsCreateUserOpen(false);
            setNewUser({ username: '', email: '', password: '', role: 'user' });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.detail || 'Failed to create user',
                variant: 'destructive',
            });
        },
    });

    const createProjectMutation = useMutation({
        mutationFn: async (projectData: typeof newProject) => {
            const response = await axios.post('/api/projects/projects/', projectData);
            return response.data;
        },
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Project created successfully',
            });
            setIsCreateProjectOpen(false);
            setNewProject({ name: '', description: '' });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.detail || 'Failed to create project',
                variant: 'destructive',
            });
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            await axios.delete(`/api/users/${userId}`);
        },
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'User deleted successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.detail || 'Failed to delete user',
                variant: 'destructive',
            });
        },
    });

    const deleteProjectMutation = useMutation({
        mutationFn: async (projectId: string) => {
            await axios.delete(`/api/projects/projects/${projectId}`);
        },
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Project deleted successfully',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.detail || 'Failed to delete project',
                variant: 'destructive',
            });
        },
    });

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="projects">Projects</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Users</CardTitle>
                                    <CardDescription>Manage system users</CardDescription>
                                </div>
                                <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Add User
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create New User</DialogTitle>
                                            <DialogDescription>
                                                Add a new user to the system
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="username">Username</Label>
                                                <Input
                                                    id="username"
                                                    value={newUser.username}
                                                    onChange={(e) =>
                                                        setNewUser((prev) => ({
                                                            ...prev,
                                                            username: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={newUser.email}
                                                    onChange={(e) =>
                                                        setNewUser((prev) => ({
                                                            ...prev,
                                                            email: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="password">Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={newUser.password}
                                                    onChange={(e) =>
                                                        setNewUser((prev) => ({
                                                            ...prev,
                                                            password: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="role">Role</Label>
                                                <Select
                                                    value={newUser.role}
                                                    onValueChange={(value) =>
                                                        setNewUser((prev) => ({
                                                            ...prev,
                                                            role: value,
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="user">User</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsCreateUserOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={() => createUserMutation.mutate(newUser)}
                                                disabled={createUserMutation.isPending}
                                            >
                                                Create User
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{user.username}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            user.role === 'admin'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            user.is_active
                                                                ? 'default'
                                                                : 'destructive'
                                                        }
                                                    >
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            deleteUserMutation.mutate(user.id)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="projects" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Projects</CardTitle>
                                    <CardDescription>Manage system projects</CardDescription>
                                </div>
                                <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <FolderPlus className="w-4 h-4 mr-2" />
                                            Add Project
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create New Project</DialogTitle>
                                            <DialogDescription>
                                                Add a new project to the system
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Project Name</Label>
                                                <Input
                                                    id="name"
                                                    value={newProject.name}
                                                    onChange={(e) =>
                                                        setNewProject((prev) => ({
                                                            ...prev,
                                                            name: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Input
                                                    id="description"
                                                    value={newProject.description}
                                                    onChange={(e) =>
                                                        setNewProject((prev) => ({
                                                            ...prev,
                                                            description: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsCreateProjectOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    createProjectMutation.mutate(newProject)
                                                }
                                                disabled={createProjectMutation.isPending}
                                            >
                                                Create Project
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created At</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {projects.map((project) => (
                                            <TableRow key={project.id}>
                                                <TableCell>{project.name}</TableCell>
                                                <TableCell>{project.description}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            project.status === 'active'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {project.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(project.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            deleteProjectMutation.mutate(
                                                                project.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
} 