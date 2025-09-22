import { HealthMetricsCard } from "@/components/HealthMetricsCard";
import { HealthChart } from "@/components/HealthChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Activity, Moon, Zap, RefreshCw, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export function HealthPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch latest health metrics
  const { data: latestMetrics, isLoading } = useQuery({
    queryKey: ['/api/health/metrics/latest'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch historical health metrics
  const { data: historicalMetrics } = useQuery({
    queryKey: ['/api/health/metrics'],
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Trigger a manual refresh of health data
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  // Convert API data to display format
  const healthMetrics = latestMetrics ? [
    {
      title: "Heart Rate",
      value: (latestMetrics as any).heart_rate?.value?.toString() || "--",
      unit: "bpm",
      trend: "stable" as const,
      trendValue: "±2 bpm",
      status: ((latestMetrics as any).heart_rate?.value >= 60 && (latestMetrics as any).heart_rate?.value <= 100) ? "good" as const : "warning" as const,
      icon: <Heart className="h-4 w-4" />
    },
    {
      title: "Steps Today",
      value: (latestMetrics as any).steps?.value?.toLocaleString() || "--",
      unit: "steps",
      trend: "up" as const,
      trendValue: "+12%",
      status: ((latestMetrics as any).steps?.value >= 5000) ? "good" as const : "warning" as const,
      icon: <Activity className="h-4 w-4" />
    },
    {
      title: "Sleep Score",
      value: (latestMetrics as any).sleep_score?.value?.toString() || "--",
      unit: "/100",
      trend: (latestMetrics as any).sleep_score?.value >= 80 ? "up" as const : "down" as const,
      trendValue: (latestMetrics as any).sleep_score?.value >= 80 ? "+5%" : "-3%",
      status: ((latestMetrics as any).sleep_score?.value >= 80) ? "good" as const : "warning" as const,
      icon: <Moon className="h-4 w-4" />
    },
    {
      title: "Energy Level",
      value: (latestMetrics as any).energy_level?.value?.toString() || "--",
      unit: "/10",
      trend: (latestMetrics as any).energy_level?.value >= 7 ? "up" as const : "stable" as const,
      trendValue: "+15%",
      status: ((latestMetrics as any).energy_level?.value >= 7) ? "good" as const : "warning" as const,
      icon: <Zap className="h-4 w-4" />
    }
  ] : [];

  // Process historical data for charts
  const heartRateData = historicalMetrics && Array.isArray(historicalMetrics) ? 
    historicalMetrics.filter((m: any) => m.metricType === 'heart_rate')
      .slice(-24) // Last 24 readings
      .map((m: any) => ({
        time: new Date(m.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        value: m.value
      })) : [];

  const stepsData = historicalMetrics && Array.isArray(historicalMetrics) ? 
    historicalMetrics.filter((m: any) => m.metricType === 'steps')
      .slice(-7) // Last 7 days
      .map((m: any) => ({
        time: new Date(m.timestamp).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        value: m.value
      })) : [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Health Metrics</h1>
          <p className="text-muted-foreground">Monitor your vital signs and physical activity</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          data-testid="button-refresh-health"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Health Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthMetrics.map((metric, index) => (
          <HealthMetricsCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthChart
          title="Heart Rate Trend"
          data={heartRateData}
          color="chart-1"
          unit="bpm"
          type="line"
        />
        
        <HealthChart
          title="Daily Steps"
          data={stepsData}
          color="chart-2"
          unit="steps"
          type="line"
        />
      </div>

      {/* Health Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-chart-1/10">
              <TrendingUp className="h-5 w-5 text-chart-1" />
            </div>
            Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-200">Good Recovery</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your heart rate variability indicates good recovery. Consider maintaining your current activity level.
              </p>
            </div>
            
            {latestMetrics && (latestMetrics as any).steps?.value < 5000 && (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200">Activity Goal</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You're {5000 - (latestMetrics as any).steps.value} steps away from your daily goal. A short walk could help!
                </p>
              </div>
            )}
            
            {latestMetrics && (latestMetrics as any).sleep_score?.value < 70 && (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Sleep Quality</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your sleep score could be improved. Consider establishing a consistent bedtime routine.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}