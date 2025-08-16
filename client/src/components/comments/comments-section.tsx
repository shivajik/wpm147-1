import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Trash2, 
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Reply,
  ExternalLink,
  Calendar,
  User,
  Mail,
  Globe,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiCall } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';

interface CommentsSectionProps {
  websiteId: number;
}

interface Comment {
  id: number;
  author: string;
  author_email: string;
  author_url: string;
  author_ip: string;
  date: string;
  content: string;
  status: 'approved' | 'pending' | 'spam' | 'trash';
  post_id: number;
  post_title: string;
  avatar_url?: string;
  reply_count?: number;
}

interface CommentsData {
  approved: Comment[];
  pending: Comment[];
  spam: Comment[];
  total_approved: number;
  total_pending: number;
  total_spam: number;
}

export function CommentsSection({ websiteId }: CommentsSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('approved');

  // Fetch comments data
  const { data: commentsData, isLoading } = useQuery<CommentsData>({
    queryKey: [`/api/websites/${websiteId}/comments-data`],
    enabled: !!websiteId,
  });

  // Approve comment mutation
  const approveCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      return await apiCall(`/api/websites/${websiteId}/comments/${commentId}/approve`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/comments-data`] });
      toast({ title: 'Comment approved successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to approve comment', variant: 'destructive' });
    }
  });

  // Mark as spam mutation
  const markSpamMutation = useMutation({
    mutationFn: async (commentId: number) => {
      return await apiCall(`/api/websites/${websiteId}/comments/${commentId}/spam`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/comments-data`] });
      toast({ title: 'Comment marked as spam' });
    },
    onError: () => {
      toast({ title: 'Failed to mark comment as spam', variant: 'destructive' });
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      return await apiCall(`/api/websites/${websiteId}/comments/${commentId}/delete`, {
        method: 'DELETE',
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/comments-data`] });
      toast({ title: 'Comment deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete comment', variant: 'destructive' });
    }
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">Loading comments...</p>
      </div>
    );
  }

  if (!commentsData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load comments data. Please check your WordPress connection.
        </AlertDescription>
      </Alert>
    );
  }

  const renderComment = (comment: Comment, showActions: boolean = true) => (
    <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 p-4">
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.avatar_url} alt={comment.author} />
          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
            {comment.author ? comment.author.charAt(0).toUpperCase() : 'A'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.author}</span>
            {comment.author_email && (
              <Tooltip>
                <TooltipTrigger>
                  <Mail className="w-3 h-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{comment.author_email}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {comment.author_url && (
              <Tooltip>
                <TooltipTrigger>
                  <Globe className="w-3 h-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{comment.author_url}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.date), { addSuffix: true })}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground mb-2">
            on <span className="font-medium">{comment.post_title}</span>
          </div>
          
          <div className="text-sm text-gray-900 dark:text-gray-100 mb-3">
            <div dangerouslySetInnerHTML={{ __html: comment.content }} />
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2">
              {comment.status === 'pending' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => approveCommentMutation.mutate(comment.id)}
                  disabled={approveCommentMutation.isPending}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approve
                </Button>
              )}
              
              {comment.status !== 'spam' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => markSpamMutation.mutate(comment.id)}
                  disabled={markSpamMutation.isPending}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Spam
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => deleteCommentMutation.mutate(comment.id)}
                disabled={deleteCommentMutation.isPending}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
              
              <Button size="sm" variant="ghost" className="text-gray-500">
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </Button>
              
              <Button size="sm" variant="ghost" className="text-gray-500">
                <ExternalLink className="w-3 h-3 mr-1" />
                View
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {commentsData.total_approved}
            </div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {commentsData.total_pending}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {commentsData.total_spam}
            </div>
            <div className="text-xs text-muted-foreground">Spam</div>
          </div>
          <div className="text-center">
            <Button 
              size="sm" 
              className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700"
              onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}/comments-data`] })}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Comments Tabs */}
        <Tabs defaultValue="approved" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="approved" className="relative">
              Approved
              {commentsData.total_approved > 0 && (
                <Badge className="ml-2 bg-green-100 text-green-700 text-xs px-1 py-0">
                  {commentsData.total_approved}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending
              {commentsData.total_pending > 0 && (
                <Badge className="ml-2 bg-orange-100 text-orange-700 text-xs px-1 py-0">
                  {commentsData.total_pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="spam" className="relative">
              Spam
              {commentsData.total_spam > 0 && (
                <Badge className="ml-2 bg-red-100 text-red-700 text-xs px-1 py-0">
                  {commentsData.total_spam}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approved" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {Array.isArray(commentsData.approved) && commentsData.approved.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {Array.isArray(commentsData.approved) && commentsData.approved.map(comment => renderComment(comment, false))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-3 text-green-500" />
                    <p>No approved comments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {Array.isArray(commentsData.pending) && commentsData.pending.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {Array.isArray(commentsData.pending) && commentsData.pending.map(comment => renderComment(comment, true))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-3 text-orange-500" />
                    <p>No pending comments</p>
                    <p className="text-sm">Your inbox looks nice and clean!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spam" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {Array.isArray(commentsData.spam) && commentsData.spam.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {Array.isArray(commentsData.spam) && commentsData.spam.map(comment => renderComment(comment, true))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-red-500" />
                    <p>No spam comments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}