import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiCall, queryClient } from "@/lib/queryClient";
import { Plus, Trash2, Upload, Download, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { SeoKeywords, InsertSeoKeywords } from "@shared/schema";

interface KeywordsManagementProps {
  websiteId: number;
}

export function KeywordsManagement({ websiteId }: KeywordsManagementProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState<Partial<InsertSeoKeywords>>({
    keyword: "",
    searchVolume: 0,
    difficulty: 0,
    currentPosition: undefined,
    searchEngine: "google",
    location: "global",
    device: "desktop"
  });

  // Fetch keywords
  const { data: keywordsData, isLoading, refetch } = useQuery<{keywords: SeoKeywords[]}>({
    queryKey: ['/api/websites', websiteId, 'seo', 'keywords'],
    enabled: !!websiteId,
  });

  // Add keyword mutation
  const addKeywordMutation = useMutation({
    mutationFn: (keywordData: Partial<InsertSeoKeywords>) =>
      apiCall(`/api/websites/${websiteId}/seo/keywords`, {
        method: 'POST',
        body: JSON.stringify(keywordData),
      }),
    onSuccess: () => {
      toast({
        title: "Keyword Added",
        description: "SEO keyword has been added successfully.",
      });
      refetch();
      setIsAddDialogOpen(false);
      setNewKeyword({
        keyword: "",
        searchVolume: 0,
        difficulty: 0,
        currentPosition: undefined,
        searchEngine: "google",
        location: "global",
        device: "desktop"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add keyword.",
        variant: "destructive",
      });
    },
  });

  // Remove keyword mutation
  const removeKeywordMutation = useMutation({
    mutationFn: (keywordId: number) =>
      apiCall(`/api/websites/${websiteId}/seo/keywords/${keywordId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      toast({
        title: "Keyword Removed",
        description: "SEO keyword has been removed successfully.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove keyword.",
        variant: "destructive",
      });
    },
  });

  const handleAddKeyword = () => {
    if (!newKeyword.keyword?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a keyword.",
        variant: "destructive",
      });
      return;
    }
    addKeywordMutation.mutate(newKeyword);
  };

  const handleRemoveKeyword = (keywordId: number, keyword: string) => {
    if (confirm(`Are you sure you want to remove the keyword "${keyword}"?`)) {
      removeKeywordMutation.mutate(keywordId);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 80) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    if (difficulty >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    if (difficulty >= 40) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  };

  const getDifficultyText = (difficulty: number) => {
    if (difficulty >= 80) return "Very Hard";
    if (difficulty >= 60) return "Hard";
    if (difficulty >= 40) return "Medium";
    return "Easy";
  };

  const getPositionTrend = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    const change = previous - current; // Positive means improvement (lower position number)
    
    if (change > 0) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-200">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{change}
        </Badge>
      );
    } else if (change < 0) {
      return (
        <Badge variant="outline" className="text-red-600 border-red-200">
          <TrendingDown className="h-3 w-3 mr-1" />
          {change}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-200">
          <Minus className="h-3 w-3 mr-1" />
          0
        </Badge>
      );
    }
  };

  const keywords = keywordsData?.keywords || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            SEO Keywords ({keywords.length})
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-keyword">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Keyword
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add SEO Keyword</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyword">Keyword *</Label>
                    <Input
                      id="keyword"
                      value={newKeyword.keyword || ""}
                      onChange={(e) => setNewKeyword(prev => ({ ...prev, keyword: e.target.value }))}
                      placeholder="Enter keyword"
                      data-testid="input-keyword"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="searchVolume">Search Volume</Label>
                      <Input
                        id="searchVolume"
                        type="number"
                        value={newKeyword.searchVolume || 0}
                        onChange={(e) => setNewKeyword(prev => ({ ...prev, searchVolume: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        data-testid="input-search-volume"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="difficulty">Difficulty (0-100)</Label>
                      <Input
                        id="difficulty"
                        type="number"
                        min="0"
                        max="100"
                        value={newKeyword.difficulty || 0}
                        onChange={(e) => setNewKeyword(prev => ({ ...prev, difficulty: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        data-testid="input-difficulty"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="currentPosition">Current Position</Label>
                    <Input
                      id="currentPosition"
                      type="number"
                      min="1"
                      value={newKeyword.currentPosition || ""}
                      onChange={(e) => setNewKeyword(prev => ({ ...prev, currentPosition: parseInt(e.target.value) || undefined }))}
                      placeholder="Not ranking"
                      data-testid="input-current-position"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="searchEngine">Search Engine</Label>
                      <Select
                        value={newKeyword.searchEngine || "google"}
                        onValueChange={(value) => setNewKeyword(prev => ({ ...prev, searchEngine: value }))}
                      >
                        <SelectTrigger data-testid="select-search-engine">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="bing">Bing</SelectItem>
                          <SelectItem value="yahoo">Yahoo</SelectItem>
                          <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="device">Device</Label>
                      <Select
                        value={newKeyword.device || "desktop"}
                        onValueChange={(value) => setNewKeyword(prev => ({ ...prev, device: value }))}
                      >
                        <SelectTrigger data-testid="select-device">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desktop">Desktop</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                          <SelectItem value="tablet">Tablet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newKeyword.location || "global"}
                      onChange={(e) => setNewKeyword(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="global"
                      data-testid="input-location"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleAddKeyword}
                      disabled={addKeywordMutation.isPending}
                      className="flex-1"
                      data-testid="button-save-keyword"
                    >
                      {addKeywordMutation.isPending ? "Adding..." : "Add Keyword"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      data-testid="button-cancel-keyword"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading keywords...</span>
          </div>
        ) : keywords.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Keywords Added
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start tracking your SEO performance by adding keywords you want to monitor.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-keyword">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Keyword
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Search Volume</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Current Position</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Search Engine</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map((keyword) => (
                  <TableRow key={keyword.id} data-testid={`row-keyword-${keyword.id}`}>
                    <TableCell className="font-medium">
                      {keyword.keyword}
                    </TableCell>
                    <TableCell>
                      {keyword.searchVolume?.toLocaleString() || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(keyword.difficulty || 0)}>
                        {keyword.difficulty || 0}% {getDifficultyText(keyword.difficulty || 0)}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-position-${keyword.id}`}>
                      {keyword.currentPosition || 'Not ranking'}
                    </TableCell>
                    <TableCell>
                      {getPositionTrend(keyword.currentPosition, keyword.previousPosition)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {keyword.searchEngine || 'google'}
                    </TableCell>
                    <TableCell className="capitalize">
                      {keyword.device || 'desktop'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveKeyword(keyword.id, keyword.keyword)}
                        disabled={removeKeywordMutation.isPending}
                        data-testid={`button-remove-keyword-${keyword.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}