import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, Clock, CheckCircle, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface DashboardStats {
  totalClients: number;
  activeSites: number;
  pendingTasks: number;
  completedToday: number;
  pendingUpdates: number;
}

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Array.isArray([1, 2, 3, 4, 5]) && [1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const cards = [
    {
      title: "Total Clients",
      value: stats.totalClients,
      icon: Users,
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
      iconColor: "text-primary",
      change: "+12%",
      changeLabel: "from last month",
      isPositive: true,
    },
    {
      title: "Active Sites",
      value: stats.activeSites,
      icon: Globe,
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
      iconColor: "text-emerald-600",
      change: "+8%",
      changeLabel: "from last month",
      isPositive: true,
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: Clock,
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      iconColor: "text-amber-600",
      change: "+3",
      changeLabel: "new today",
      isPositive: false,
    },
    {
      title: "Completed Today",
      value: stats.completedToday,
      icon: CheckCircle,
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      iconColor: "text-green-600",
      change: "95%",
      changeLabel: "completion rate",
      isPositive: true,
    },
    {
      title: "Pending Updates",
      value: stats.pendingUpdates,
      icon: RefreshCw,
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
      iconColor: "text-purple-600",
      change: stats.pendingUpdates > 0 ? `${stats.pendingUpdates}` : "0",
      changeLabel: "plugins & themes",
      isPositive: stats.pendingUpdates === 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {Array.isArray(cards) && cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
            <CardContent className="p-0">
              <div className={`${card.bgColor} p-6 relative overflow-hidden`}>
                {/* Animated background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-white/20 backdrop-blur-sm`}>
                        <Icon className={`h-4 w-4 ${card.iconColor}`} />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{card.title}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-4xl font-black text-slate-900 group-hover:scale-105 transition-transform duration-300">{card.value}</p>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${card.isPositive ? 'bg-green-100' : 'bg-amber-100'}`}>
                          {card.isPositive ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-amber-600" />
                          )}
                          <span className={`text-xs font-bold ${card.isPositive ? 'text-green-700' : 'text-amber-700'}`}>
                            {card.change}
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 font-medium">{card.changeLabel}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl bg-white/70 backdrop-blur-md shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                    <Icon className={`h-8 w-8 ${card.iconColor}`} />
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className={`h-full bg-gradient-to-r ${card.isPositive ? 'from-green-400 to-green-600' : 'from-amber-400 to-amber-600'} rounded-full`} 
                       style={{ width: card.isPositive ? '85%' : '60%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
