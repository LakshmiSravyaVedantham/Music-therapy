import { HealthMetricsCard } from '../HealthMetricsCard'
import { Heart, Activity, Moon, Zap } from 'lucide-react'

export default function HealthMetricsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <HealthMetricsCard
        title="Heart Rate"
        value="72"
        unit="bpm"
        trend="stable"
        trendValue="±2 bpm"
        status="good"
        icon={<Heart className="h-4 w-4" />}
      />
      <HealthMetricsCard
        title="Steps Today"
        value="8,420"
        unit="steps"
        trend="up"
        trendValue="+12%"
        status="good"
        icon={<Activity className="h-4 w-4" />}
      />
      <HealthMetricsCard
        title="Sleep Score"
        value="85"
        unit="/100"
        trend="down"
        trendValue="-3%"
        status="warning"
        icon={<Moon className="h-4 w-4" />}
      />
      <HealthMetricsCard
        title="Energy Level"
        value="High"
        unit=""
        trend="up"
        trendValue="+15%"
        status="good"
        icon={<Zap className="h-4 w-4" />}
      />
    </div>
  )
}