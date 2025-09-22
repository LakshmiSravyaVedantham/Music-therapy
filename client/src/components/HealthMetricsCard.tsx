import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface HealthMetricsCardProps {
  title: string
  value: string
  unit: string
  trend: "up" | "down" | "stable"
  trendValue: string
  status: "good" | "warning" | "critical"
  icon: React.ReactNode
}

export function HealthMetricsCard({ 
  title, 
  value, 
  unit, 
  trend, 
  trendValue, 
  status, 
  icon 
}: HealthMetricsCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "bg-chart-2/10 text-chart-2 border-chart-2/20"
      case "warning": return "bg-chart-5/10 text-chart-5 border-chart-5/20"
      case "critical": return "bg-destructive/10 text-destructive border-destructive/20"
      default: return "bg-muted/50 text-muted-foreground"
    }
  }

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="h-3 w-3" />
    if (trend === "down") return <TrendingDown className="h-3 w-3" />
    return null
  }

  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-2">
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>
          <div className="text-sm text-muted-foreground">
            {unit}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          
          {trend !== "stable" && (
            <div className={`flex items-center gap-1 text-xs ${
              trend === "up" ? "text-chart-2" : "text-chart-5"
            }`}>
              {getTrendIcon()}
              {trendValue}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}