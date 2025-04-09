'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownDisplay } from '@/components/MarkdownEditor';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { Send, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    updated_at: string;
    author: {
        id: string;
        username: string;
        full_name: string;
        avatar_url?: string;
    };
}

interface MissionCommentListProps {
    missionId: string;
    pocId?: string;
    className?: string;
}

export const MissionCommentList: React.FC<MissionCommentListProps> = ({
    missionId,
    pocId,
    className
}) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    // Fetch comments
    const fetchComments = async () => {
        try {
            const endpoint = pocId
                ? `/api/missions/${missionId}/pocs/${pocId}/comments`
                : `/api/missions/${missionId}/comments`;

            const response = await axios.get(endpoint);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast({
                title: 'Error',
                description: 'Failed to load comments',
                variant: 'destructive',
            });
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchComments();
    }, [missionId, pocId]);

    // Add a new comment
    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setIsLoading(true);
        try {
            const endpoint = pocId
                ? `/api/missions/${missionId}/pocs/${pocId}/comments`
                : `/api/missions/${missionId}/comments`;

            await axios.post(endpoint, {
                content: newComment
            });

            setNewComment('');
            fetchComments();
            toast({
                description: 'Comment added successfully',
            });
        } catch (error) {
            console.error('Error adding comment:', error);
            toast({
                title: 'Error',
                description: 'Failed to add comment',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Edit a comment
    const handleEditComment = async (commentId: string) => {
        if (!editedContent.trim()) return;

        setIsLoading(true);
        try {
            const endpoint = pocId
                ? `/api/missions/${missionId}/pocs/${pocId}/comments/${commentId}`
                : `/api/missions/${missionId}/comments/${commentId}`;

            await axios.put(endpoint, {
                content: editedContent
            });

            setEditingCommentId(null);
            fetchComments();
            toast({
                description: 'Comment updated successfully',
            });
        } catch (error) {
            console.error('Error updating comment:', error);
            toast({
                title: 'Error',
                description: 'Failed to update comment',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Delete a comment
    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        setIsLoading(true);
        try {
            const endpoint = pocId
                ? `/api/missions/${missionId}/pocs/${pocId}/comments/${commentId}`
                : `/api/missions/${missionId}/comments/${commentId}`;

            await axios.delete(endpoint);

            fetchComments();
            toast({
                description: 'Comment deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete comment',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Start editing a comment
    const startEditing = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditedContent(comment.content);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditedContent('');
    };

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className={className}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Comment form */}
                    <div className="flex gap-4">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={user?.avatar_url || ''} />
                            <AvatarFallback>{getInitials(user?.full_name || 'User')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <Textarea
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="resize-none"
                            />
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleAddComment}
                                    disabled={isLoading || !newComment.trim()}
                                    size="sm"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Post Comment
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Comments list */}
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-center text-muted-foreground py-6">No comments yet</p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="flex gap-4">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={comment.author.avatar_url || ''} />
                                        <AvatarFallback>{getInitials(comment.author.full_name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <span className="font-medium">{comment.author.full_name}</span>
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            {user && user.id.toString() === comment.author.id && (
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => startEditing(comment)}
                                                        className="h-6 w-6"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="h-6 w-6 text-destructive"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {editingCommentId === comment.id ? (
                                            <div className="space-y-2">
                                                <Textarea
                                                    value={editedContent}
                                                    onChange={(e) => setEditedContent(e.target.value)}
                                                    className="resize-none"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={cancelEditing}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleEditComment(comment.id)}
                                                        disabled={isLoading || !editedContent.trim()}
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <MarkdownDisplay content={comment.content} />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}; 