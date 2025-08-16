import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Website } from "@shared/schema";

export default function SiteHealth() {
  const { data: websites, isLoading } = useQuery<Website[]>({
    queryKey: ["/api/websites"],
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle>Site Health Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.isArray([1, 2, 3, 4, 5]) && [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentSites = websites?.slice(0, 5) || [];

  const getHealthColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-success";
      case "warning":
        return "bg-warning";
      case "error":
        return "bg-error";
      default:
        return "bg-slate-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "good":
        return "All systems operational";
      case "warning":
        return "Updates available";
      case "error":
        return "Issues detected";
      default:
        return "Unknown status";
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900">Site Health Monitor</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Real-time website status monitoring</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {Array.isArray(recentSites) && recentSites.length > 0 ? (
          <>
            <div className="space-y-4">
              {Array.isArray(recentSites) && recentSites.map((site) => (
                <div key={site.id} className="group relative">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-slate-50 border border-slate-100 rounded-xl hover:shadow-md transition-all duration-300 hover:border-blue-200">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className={`w-4 h-4 ${getHealthColor(site.healthStatus)} rounded-full shadow-lg`}>
                          <div className={`absolute inset-0 ${getHealthColor(site.healthStatus)} rounded-full animate-ping opacity-20`}></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{site.name}</p>
                        <p className="text-xs text-slate-500">{getStatusText(site.healthStatus)}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className={`text-sm font-bold ${
                        site.healthStatus === "good" ? "text-green-600" : 
                        site.healthStatus === "warning" ? "text-amber-600" : "text-red-600"
                      }`}>
                        {site.uptime}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-slate-500">Online</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-6 gradient-primary text-white border-0 hover:shadow-lg">
              View All Sites
            </Button>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <div className="text-2xl">🌐</div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No websites monitored</h3>
            <p className="text-slate-500 mb-4">Add your first website to start monitoring</p>
            <Button className="gradient-primary">
              Add Website
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
