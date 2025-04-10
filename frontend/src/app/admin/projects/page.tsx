'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Search, Edit, Trash2, FolderPlus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ProjectStatus } from '@/types/project';
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Project {
  id: string;
  name: string;
  client_id: string;
  client: {
    id: string;
    username: string;
    email?: string;
  };
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

export default function AdminProjectsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    status: ProjectStatus.PLANNING,
  });
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/projects');
      return response.data;
    },
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery<User[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await axios.get('/api/users/clients');
      return response.data;
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axios.post('/api/projects', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        client_id: '',
        status: ProjectStatus.PLANNING,
      });
      toast({
        title: 'Project created',
        description: 'The project has been successfully created.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create project',
        variant: 'destructive',
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await axios.delete(`/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast({
        title: 'Project deleted',
        description: 'The project has been successfully deleted.',
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

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client?.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return <Badge className="bg-blue-100 text-blue-800">Planning</Badge>;
      case ProjectStatus.IN_PROGRESS:
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case ProjectStatus.COMPLETED:
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case ProjectStatus.CANCELLED:
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.client_id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    createProjectMutation.mutate(formData);
  };

  const handleDeleteClick = (project: any) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProject) {
      deleteProjectMutation.mutate(selectedProject.id);
    }
  };

  return (
    <DashboardLayout>
      <div className="container p-6 mx-auto">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Project Management</h1>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new project.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name">Project Name</label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="client_id">Client</label>
                    <Select
                      value={formData.client_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, client_id: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.username} ({client.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status">Status</label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value as ProjectStatus }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ProjectStatus.PLANNING}>Planning</SelectItem>
                        <SelectItem value={ProjectStatus.IN_PROGRESS}>In Progress</SelectItem>
                        <SelectItem value={ProjectStatus.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={ProjectStatus.CANCELLED}>Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createProjectMutation.isPending}>
                      {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by name or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="text-sm text-muted-foreground mb-2">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
            </div>
          </div>

          {projectsLoading ? (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
                  <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
              <div className="p-0">
                <div className="border-b">
                  <div className="grid grid-cols-6 p-3">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-muted rounded animate-pulse ml-auto"></div>
                  </div>
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border-b last:border-0">
                    <div className="grid grid-cols-6 p-3">
                      <div className="h-5 w-40 bg-muted rounded animate-pulse"></div>
                      <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
                      <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
                      <div className="h-5 w-28 bg-muted rounded animate-pulse"></div>
                      <div className="h-5 w-28 bg-muted rounded animate-pulse"></div>
                      <div className="flex justify-end space-x-2">
                        <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                        <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{project.client?.username}</TableCell>
                        <TableCell>{getStatusBadge(project.status)}</TableCell>
                        <TableCell>{formatDate(project.created_at)}</TableCell>
                        <TableCell>{formatDate(project.updated_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                // Navigate to edit project page
                                window.location.href = `/admin/projects/${project.id}/edit`;
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(project)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-lg text-center mb-4">No projects found matching your search</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Project"
        description={`Are you sure you want to delete ${selectedProject?.name || "this project"}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </DashboardLayout>
  );
}
