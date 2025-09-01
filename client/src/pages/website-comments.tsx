import { useParams, useLocation } from "wouter";
import type { Website, CommentsStats, RecentComment } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MessageSquare, 
  RefreshCw, 
  Search, 
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Trash2,
  ArrowLeft,
  ExternalLink,
  Info,
  MoreVertical,
  Calendar,
  Clock,
  Eye,
  Zap,
  Ban,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from "@/components/layout/app-layout";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MaintenanceSidebar } from "@/components/maintenance/maintenance-sidebar";
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { useState } from "react";

export default function WebsiteComments() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const websiteId = params.id;

  // Debug logging
  console.log('WebsiteComments - Raw websiteId from URL params:', websiteId);
  
  // Check if websiteId is valid
  if (!websiteId || websiteId === 'undefined' || websiteId === 'null' || isNaN(Number(websiteId))) {
    return (
      <AppLayout title="Invalid Website" defaultOpen={false}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Invalid Website ID</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The website ID "{websiteId}" is not valid.
          </p>
          <Button onClick={() => setLocation('/websites')}>
            Back to Websites
          </Button>
        </div>
      </AppLayout>
    );
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComments, setSelectedComments] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);
  
  const { toast } = useToast();

  const { data: website, isLoading } = useQuery<Website>({
    queryKey: ['/api/websites', websiteId],
    enabled: !!websiteId,
  });

  // Fetch comments data with pagination
  const { data: commentsData, isLoading: commentsLoading, error: commentsError, refetch: refetchComments } = useQuery<CommentsStats>({
    queryKey: ['/api/websites', websiteId, 'comments', currentPage, perPage, statusFilter],
    enabled: !!websiteId && !!website && website.connectionStatus === 'connected',
    staleTime: 1 * 60 * 1000, // 1 minute for frequent updates
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
      });
      
      if (statusFilter !== 'all') {
        // Map frontend status names to backend expected values
        const statusMapping: { [key: string]: string } = {
          'pending': 'pending',
          'approved': 'approved', 
          'spam': 'spam',
          'trash': 'trash'
        };
        const backendStatus = statusMapping[statusFilter] || statusFilter;
        params.append('status', backendStatus);
      }
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/websites/${websiteId}/comments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
  });

  // Debug log
  console.log('Website data for comments:', website);
  console.log('Comments data:', commentsData);

  // Individual comment deletion mutation
  const deleteCommentsMutation = useMutation({
    mutationFn: async (commentIds: string[]) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/websites/${websiteId}/comments/delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment_ids: commentIds })
      });
      if (!response.ok) throw new Error('Failed to delete comments');
      return response.json();
    },
    onSuccess: (data) => {
      refetchComments();
      toast({
        title: "Comments Deleted",
        description: data.message || `${data.deleted_count || 0} comment(s) deleted successfully`
      });
      setSelectedComments([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete comments",
        variant: "destructive"
      });
    }
  });

  // WordPress-style bulk cleanup mutations
  const removeUnapprovedMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/websites/${websiteId}/comments/remove-unapproved`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to remove unapproved comments');
      return response.json();
    },
    onSuccess: (data) => {
      refetchComments();
      toast({ 
        title: 'Unapproved comments removed', 
        description: `${data.deleted_count} unapproved comment(s) removed`
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to remove unapproved comments', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const removeSpamTrashMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/websites/${websiteId}/comments/remove-spam-trash`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to remove spam and trashed comments');
      return response.json();
    },
    onSuccess: (data) => {
      refetchComments();
      toast({ 
        title: 'Spam and trashed comments removed', 
        description: `${data.deleted_count} spam/trash comment(s) removed`
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to remove spam and trashed comments', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Handle WordPress-style bulk cleanup
  const handleRemoveUnapproved = () => {
    removeUnapprovedMutation.mutate();
  };

  const handleRemoveSpamTrash = () => {
    removeSpamTrashMutation.mutate();
  };

  // Filter comments based on status and search (frontend fallback)
  const filteredComments = commentsData?.recent_comments?.filter((comment: RecentComment) => {
    const authorName = comment.comment_author || comment.author_name || '';
    const contentText = comment.content?.rendered || comment.comment_content || '';
    const postTitle = comment.post_title || '';
    
    const matchesSearch = searchTerm === "" || 
      authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contentText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      postTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Normalize comment status - handle both uppercase and lowercase
    let commentStatus = comment.status || '';
    if (!commentStatus) {
      // Fallback to comment_approved field
      if (comment.comment_approved === '1') {
        commentStatus = 'approved';
      } else if (comment.comment_approved === 'spam') {
        commentStatus = 'spam';
      } else if (comment.comment_approved === 'trash') {
        commentStatus = 'trash';
      } else {
        commentStatus = 'pending';
      }
    }
    
    // Convert to lowercase for comparison
    commentStatus = commentStatus.toLowerCase();
    
    const matchesStatus = statusFilter === "all" || commentStatus === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (comment: RecentComment) => {
    // Determine the actual status from comment data
    let status = comment.status || '';
    if (!status) {
      // Fallback to comment_approved field
      if (comment.comment_approved === '1') {
        status = 'approved';
      } else if (comment.comment_approved === 'spam') {
        status = 'spam';
      } else if (comment.comment_approved === 'trash') {
        status = 'trash';
      } else {
        status = 'pending';
      }
    }
    
    // Normalize to lowercase
    status = status.toLowerCase();
    
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'spam':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"><Ban className="w-3 h-3 mr-1" />Spam</Badge>;
      case 'trash':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"><Trash2 className="w-3 h-3 mr-1" />Trash</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Comments" defaultOpen={false}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!website) {
    return (
      <AppLayout title="Website Not Found" defaultOpen={false}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Website Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The website you're looking for doesn't exist.
          </p>
          <Button onClick={() => setLocation('/websites')}>
            Back to Websites
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`Comments - ${website.name}`} defaultOpen={false}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <MaintenanceSidebar websiteId={parseInt(websiteId!)} activeSection="comments" />
        
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/websites')}
                  className="p-1 h-auto text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  data-testid="button-back-to-websites"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span>Websites</span>
                <span>/</span>
                <span className="text-gray-900 dark:text-gray-100">{website.name}</span>
                <span>/</span>
                <span className="text-gray-900 dark:text-gray-100">Comments</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    Comments Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage WordPress comments for {website.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => refetchComments()}
                    disabled={commentsLoading}
                    data-testid="button-refresh-comments"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${commentsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments Stats Cards */}
            {commentsData && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Card>
                  <CardContent className="flex items-center p-4">
                    <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {commentsData.total_comments}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center p-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {commentsData.approved_comments}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Approved</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center p-4">
                    <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {commentsData.pending_comments}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center p-4">
                    <Ban className="h-8 w-8 text-red-600 dark:text-red-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {commentsData.spam_comments}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Spam</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center p-4">
                    <Trash2 className="h-8 w-8 text-gray-600 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {commentsData.trash_comments}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Trash</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search comments by author, content, or post..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-comments"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1); // Reset pagination when filter changes
              }}>
                <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Comments</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="trash">Trash</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveUnapproved}
                  disabled={removeUnapprovedMutation.isPending}
                  data-testid="button-remove-unapproved"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Remove Unapproved Comments
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveSpamTrash}
                  disabled={removeSpamTrashMutation.isPending}
                  data-testid="button-remove-spam-trash"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Spam & Trashed Comments
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Comments ({filteredComments.length})</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">WordPress-style Bulk Cleanup</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {commentsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : commentsError ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Failed to Load Comments
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {commentsError.message || 'Unable to fetch comments data'}
                    </p>
                    <Button onClick={() => refetchComments()} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : filteredComments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Comments Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No comments match your current filters.' 
                        : 'This website has no recent comments to display.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        data-testid={`comment-${comment.id}`}
                      >
                        <div className="w-5 h-5 mt-1 flex items-center justify-center">
                          {getStatusBadge(comment).props.children[1]}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                {comment.comment_author || comment.author_name || 'Anonymous'}
                              </h4>
                              {getStatusBadge(comment)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(comment.comment_date || comment.date)}</span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {(comment.comment_author_email || comment.author_email) && (
                              <span className="mr-4">Email: {comment.comment_author_email || comment.author_email}</span>
                            )}
                            {comment.post_title && (
                              <span>On: <strong>{comment.post_title}</strong></span>
                            )}
                          </div>
                          
                          <div className="text-gray-900 dark:text-white">
                            <div 
                              dangerouslySetInnerHTML={{ 
                                __html: (comment.content?.rendered || comment.comment_content || '').length > 200 
                                  ? (comment.content?.rendered || comment.comment_content || '').substring(0, 200) + '...' 
                                  : (comment.content?.rendered || comment.comment_content || '') 
                              }}
                              className="prose prose-sm dark:prose-invert max-w-none"
                            />
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`menu-comment-${comment.id}`}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {comment.link && (
                              <>
                                <DropdownMenuItem asChild>
                                  <a href={comment.link} target="_blank" rel="noopener noreferrer">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Comment
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem 
                              onClick={() => deleteCommentsMutation.mutate([String(comment.comment_ID || comment.id)])}
                              className="text-red-600 dark:text-red-400"
                              data-testid={`delete-comment-${comment.comment_ID || comment.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              
              {/* Pagination Controls */}
              {commentsData && commentsData.total_comments > perPage && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      data-testid="button-prev-mobile"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(page => page + 1)}
                      disabled={currentPage * perPage >= commentsData.total_comments}
                      variant="outline"
                      size="sm"
                      data-testid="button-next-mobile"
                    >
                      Next
                    </Button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Showing{' '}
                        <span className="font-medium">{(currentPage - 1) * perPage + 1}</span>
                        {' '}to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * perPage, commentsData.total_comments)}
                        </span>
                        {' '}of{' '}
                        <span className="font-medium">{commentsData.total_comments}</span>
                        {' '}comments
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <Button
                          onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                          disabled={currentPage === 1}
                          variant="outline"
                          size="sm"
                          className="rounded-r-none"
                          data-testid="button-prev-desktop"
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        {/* Page numbers */}
                        {(() => {
                          const totalPages = Math.ceil(commentsData.total_comments / perPage);
                          const pages = [];
                          const maxVisiblePages = 5;
                          
                          let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                          let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                          
                          if (endPage - startPage + 1 < maxVisiblePages) {
                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                          }
                          
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <Button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                variant={i === currentPage ? "default" : "outline"}
                                size="sm"
                                className="rounded-none"
                                data-testid={`button-page-${i}`}
                              >
                                {i}
                              </Button>
                            );
                          }
                          
                          return pages;
                        })()}
                        
                        <Button
                          onClick={() => setCurrentPage(page => page + 1)}
                          disabled={currentPage * perPage >= commentsData.total_comments}
                          variant="outline"
                          size="sm"
                          className="rounded-l-none"
                          data-testid="button-next-desktop"
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}