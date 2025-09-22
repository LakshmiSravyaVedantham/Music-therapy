import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts"

interface DataPoint {
  time: string
  value: number
  label?: string
}

interface HealthChartProps {
  title: string
  data: DataPoint[]
  color: string
  unit: string
  type?: "line" | "area"
}

export function HealthChart({ title, data, color, unit, type = "line" }: HealthChartProps) {
  const colorMap: Record<string, string> = {
    "chart-1": "#3b82f6",
    "chart-2": "#10b981", 
    "chart-3": "#f59e0b",
    "chart-4": "#8b5cf6",
    "chart-5": "#ef4444"
  }

  const chartColor = colorMap[color] || "#3b82f6"

  const formatTooltipValue = (value: number) => {
    return `${value} ${unit}`
  }

  return (
    <Card className="hover-elevate">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === "area" ? (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="time" 
                  fontSize={12}
                  className="text-muted-foreground"
                />
                <YAxis 
                  fontSize={12}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  formatter={(value: number) => [formatTooltipValue(value), title]}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--card-border))',
                    borderRadius: '6px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  fill={chartColor}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="time" 
                  fontSize={12}
                  className="text-muted-foreground"
                />
                <YAxis 
                  fontSize={12}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  formatter={(value: number) => [formatTooltipValue(value), title]}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--card-border))',
                    borderRadius: '6px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={2}
                  dot={{ fill: chartColor, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: chartColor, strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}