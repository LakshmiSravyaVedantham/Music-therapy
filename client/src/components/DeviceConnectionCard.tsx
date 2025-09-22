import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Watch, Activity, Wifi, WifiOff } from "lucide-react"
import { useState } from "react"

interface Device {
  id: string
  name: string
  type: "phone" | "watch" | "tracker"
  status: "connected" | "disconnected" | "syncing"
  lastSync: string
  batteryLevel?: number
}

interface DeviceConnectionCardProps {
  device: Device
}

export function DeviceConnectionCard({ device }: DeviceConnectionCardProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "phone": return <Smartphone className="h-5 w-5" />
      case "watch": return <Watch className="h-5 w-5" />
      case "tracker": return <Activity className="h-5 w-5" />
      default: return <Activity className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "text-chart-2 bg-chart-2/10 border-chart-2/20"
      case "syncing": return "text-chart-3 bg-chart-3/10 border-chart-3/20"
      case "disconnected": return "text-muted-foreground bg-muted/10 border-muted/20"
      default: return "text-muted-foreground bg-muted/10"
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    console.log(`Connecting to ${device.name}...`)
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false)
      console.log(`${device.name} connection attempt completed`)
    }, 2000)
  }

  const getStatusIcon = () => {
    if (device.status === "connected") return <Wifi className="h-4 w-4" />
    if (device.status === "syncing") return <Activity className="h-4 w-4 animate-pulse" />
    return <WifiOff className="h-4 w-4" />
  }

  return (
    <Card className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-2 rounded-lg bg-muted/50">
            {getDeviceIcon(device.type)}
          </div>
          <div>
            <div className="font-semibold">{device.name}</div>
            <div className="text-xs text-muted-foreground capitalize">{device.type}</div>
          </div>
        </CardTitle>
        
        <Badge variant="outline" className={getStatusColor(device.status)}>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <span className="capitalize">{device.status}</span>
          </div>
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-xs text-muted-foreground">
          Last sync: {device.lastSync}
        </div>
        
        {device.batteryLevel && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Battery</span>
            <span className={`font-medium ${
              device.batteryLevel > 20 ? 'text-chart-2' : 'text-chart-5'
            }`}>
              {device.batteryLevel}%
            </span>
          </div>
        )}
        
        <Button 
          variant={device.status === "connected" ? "outline" : "default"}
          size="sm" 
          className="w-full"
          onClick={handleConnect}
          disabled={isConnecting || device.status === "syncing"}
          data-testid={`button-connect-${device.id}`}
        >
          {isConnecting ? "Connecting..." : 
           device.status === "connected" ? "Reconnect" : "Connect"}
        </Button>
      </CardContent>
    </Card>
  )
}