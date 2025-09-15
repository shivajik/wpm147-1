import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiCall, queryClient } from "@/lib/queryClient";
import { Plus, Trash2, ExternalLink, Users, TrendingUp, Link2 } from "lucide-react";
import type { SeoCompetitors, InsertSeoCompetitors } from "@shared/schema";

interface CompetitorsManagementProps {
  websiteId: number;
}

export function CompetitorsManagement({ websiteId }: CompetitorsManagementProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState<Partial<InsertSeoCompetitors>>({
    competitorName: "",
    competitorUrl: "",
    domainAuthority: 0,
    organicKeywords: 0,
    estimatedTraffic: 0,
    backlinks: 0,
    notes: ""
  });

  // Fetch competitors
  const { data: competitorsData, isLoading, refetch } = useQuery<{competitors: SeoCompetitors[]}>({
    queryKey: ['/api/websites', websiteId, 'seo', 'competitors'],
    enabled: !!websiteId,
  });

  // Add competitor mutation
  const addCompetitorMutation = useMutation({
    mutationFn: (competitorData: Partial<InsertSeoCompetitors>) =>
      apiCall(`/api/websites/${websiteId}/seo/competitors`, {
        method: 'POST',
        body: JSON.stringify(competitorData),
      }),
    onSuccess: () => {
      toast({
        title: "Competitor Added",
        description: "SEO competitor has been added successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/websites', websiteId, 'seo', 'competitors'],
      });
      setIsAddDialogOpen(false);
      setNewCompetitor({
        competitorName: "",
        competitorUrl: "",
        domainAuthority: 0,
        organicKeywords: 0,
        estimatedTraffic: 0,
        backlinks: 0,
        notes: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add competitor.",
        variant: "destructive",
      });
    },
  });

  // Remove competitor mutation
  const removeCompetitorMutation = useMutation({
    mutationFn: (competitorId: number) =>
      apiCall(`/api/websites/${websiteId}/seo/competitors/${competitorId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      toast({
        title: "Competitor Removed",
        description: "SEO competitor has been removed successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/websites', websiteId, 'seo', 'competitors'],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove competitor.",
        variant: "destructive",
      });
    },
  });

  const handleAddCompetitor = () => {
    if (!newCompetitor.competitorName?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a competitor name.",
        variant: "destructive",
      });
      return;
    }
    if (!newCompetitor.competitorUrl?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a competitor URL.",
        variant: "destructive",
      });
      return;
    }

    // Ensure URL has protocol
    let url = newCompetitor.competitorUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    addCompetitorMutation.mutate({
      ...newCompetitor,
      competitorUrl: url
    });
  };

  const handleRemoveCompetitor = (competitorId: number, competitorName: string) => {
    if (confirm(`Are you sure you want to remove the competitor "${competitorName}"?`)) {
      removeCompetitorMutation.mutate(competitorId);
    }
  };

  const getDomainAuthorityColor = (da: number) => {
    if (da >= 80) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (da >= 60) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    if (da >= 40) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const competitors = competitorsData?.competitors || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            SEO Competitors ({competitors.length})
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-competitor">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Competitor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add SEO Competitor</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="competitorName">Competitor Name *</Label>
                    <Input
                      id="competitorName"
                      value={newCompetitor.competitorName || ""}
                      onChange={(e) => setNewCompetitor(prev => ({ ...prev, competitorName: e.target.value }))}
                      placeholder="Enter competitor name"
                      data-testid="input-competitor-name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="competitorUrl">Competitor URL *</Label>
                    <Input
                      id="competitorUrl"
                      value={newCompetitor.competitorUrl || ""}
                      onChange={(e) => setNewCompetitor(prev => ({ ...prev, competitorUrl: e.target.value }))}
                      placeholder="https://competitor.com"
                      data-testid="input-competitor-url"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="domainAuthority">Domain Authority (0-100)</Label>
                      <Input
                        id="domainAuthority"
                        type="number"
                        min="0"
                        max="100"
                        value={newCompetitor.domainAuthority || 0}
                        onChange={(e) => setNewCompetitor(prev => ({ ...prev, domainAuthority: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        data-testid="input-domain-authority"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="organicKeywords">Organic Keywords</Label>
                      <Input
                        id="organicKeywords"
                        type="number"
                        min="0"
                        value={newCompetitor.organicKeywords || 0}
                        onChange={(e) => setNewCompetitor(prev => ({ ...prev, organicKeywords: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        data-testid="input-organic-keywords"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="estimatedTraffic">Estimated Traffic</Label>
                      <Input
                        id="estimatedTraffic"
                        type="number"
                        min="0"
                        value={newCompetitor.estimatedTraffic || 0}
                        onChange={(e) => setNewCompetitor(prev => ({ ...prev, estimatedTraffic: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        data-testid="input-estimated-traffic"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="backlinks">Backlinks</Label>
                      <Input
                        id="backlinks"
                        type="number"
                        min="0"
                        value={newCompetitor.backlinks || 0}
                        onChange={(e) => setNewCompetitor(prev => ({ ...prev, backlinks: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        data-testid="input-backlinks"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={newCompetitor.notes || ""}
                      onChange={(e) => setNewCompetitor(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes about this competitor..."
                      rows={3}
                      data-testid="input-notes"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleAddCompetitor}
                      disabled={addCompetitorMutation.isPending}
                      className="flex-1"
                      data-testid="button-save-competitor"
                    >
                      {addCompetitorMutation.isPending ? "Adding..." : "Add Competitor"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      data-testid="button-cancel-competitor"
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
            <span className="ml-2">Loading competitors...</span>
          </div>
        ) : competitors.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Competitors Added
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Track your competition by adding competitors you want to monitor for SEO performance.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-competitor">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Competitor
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competitor</TableHead>
                  <TableHead>Domain Authority</TableHead>
                  <TableHead>Organic Keywords</TableHead>
                  <TableHead>Est. Traffic</TableHead>
                  <TableHead>Backlinks</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.map((competitor) => (
                  <TableRow key={competitor.id} data-testid={`row-competitor-${competitor.id}`}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium">{competitor.competitorName}</div>
                        <a
                          href={competitor.competitorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          {competitor.competitorUrl}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDomainAuthorityColor(competitor.domainAuthority || 0)}>
                        DA {competitor.domainAuthority || 0}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-keywords-${competitor.id}`}>
                      {formatNumber(competitor.organicKeywords || 0)}
                    </TableCell>
                    <TableCell data-testid={`text-traffic-${competitor.id}`}>
                      {formatNumber(competitor.estimatedTraffic || 0)}
                    </TableCell>
                    <TableCell data-testid={`text-backlinks-${competitor.id}`}>
                      {formatNumber(competitor.backlinks || 0)}
                    </TableCell>
                    <TableCell>
                      {competitor.notes ? (
                        <div className="max-w-xs truncate" title={competitor.notes}>
                          {competitor.notes}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCompetitor(competitor.id, competitor.competitorName)}
                        disabled={removeCompetitorMutation.isPending}
                        data-testid={`button-remove-competitor-${competitor.id}`}
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