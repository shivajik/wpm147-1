import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Task } from "@shared/schema";

export default function RecentTasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Task> }) => {
      return await apiCall(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success text-white">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-primary text-white">In Progress</Badge>;
      case "overdue":
        return <Badge className="bg-error text-white">Overdue</Badge>;
      case "pending":
      default:
        return <Badge className="bg-warning text-white">Pending</Badge>;
    }
  };

  const handleMarkComplete = (taskId: number) => {
    updateTaskMutation.mutate({
      id: taskId,
      data: { status: "completed", completedAt: new Date() },
    });
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.isArray([1, 2, 3, 4]) && [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentTasks = tasks?.slice(0, 4) || [];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">Recent Tasks</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Track your latest maintenance activities</p>
          </div>
          <Button variant="outline" className="gradient-primary text-white border-0 hover:shadow-lg">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {Array.isArray(recentTasks) && recentTasks.length > 0 ? (
          <div className="space-y-4">
            {Array.isArray(recentTasks) && recentTasks.map((task, index) => (
              <div key={task.id} className="group relative">
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-xl hover:shadow-md transition-all duration-300 hover:border-blue-200">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-sm font-bold text-blue-700">
                        {index + 1}
                      </div>
                      <div className="absolute -top-1 -right-1">
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{task.title}</p>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>Task #{task.id}</span>
                        {task.type && (
                          <span className="px-2 py-1 bg-slate-100 rounded-full text-xs font-medium capitalize">
                            {task.type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    {task.dueDate && (
                      <p className="text-sm text-slate-600 font-medium">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    {task.status === "completed" ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">
                          {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Completed'}
                        </span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleMarkComplete(task.id)}
                        disabled={updateTaskMutation.isPending}
                        className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        {updateTaskMutation.isPending ? "Updating..." : "Complete"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <div className="text-2xl">📋</div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No tasks yet</h3>
            <p className="text-slate-500 mb-4">Start by adding your first maintenance task</p>
            <Button className="gradient-primary">
              Create Task
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
