import { HealthMetricsCard } from "./HealthMetricsCard"
import { MoodAnalysisCard } from "./MoodAnalysisCard"
import { MusicRecommendationCard } from "./MusicRecommendationCard"
import { DeviceConnectionCard } from "./DeviceConnectionCard"
import { HealthChart } from "./HealthChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Activity, Moon, Zap, RefreshCw, Settings } from "lucide-react"
import { useState } from "react"

export function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  // todo: remove mock functionality - replace with real health data integration
  const healthMetrics = [
    {
      title: "Heart Rate",
      value: "72",
      unit: "bpm", 
      trend: "stable" as const,
      trendValue: "±2 bpm",
      status: "good" as const,
      icon: <Heart className="h-4 w-4" />
    },
    {
      title: "Steps Today",
      value: "8,420",
      unit: "steps",
      trend: "up" as const,
      trendValue: "+12%",
      status: "good" as const,
      icon: <Activity className="h-4 w-4" />
    },
    {
      title: "Sleep Score",
      value: "85",
      unit: "/100",
      trend: "down" as const,
      trendValue: "-3%",
      status: "warning" as const,
      icon: <Moon className="h-4 w-4" />
    },
    {
      title: "Energy Level",
      value: "High", 
      unit: "",
      trend: "up" as const,
      trendValue: "+15%",
      status: "good" as const,
      icon: <Zap className="h-4 w-4" />
    }
  ]

  // todo: remove mock functionality - replace with OpenAI mood analysis
  const moodData = {
    mood: "Energetic",
    confidence: 87,
    factors: ["High heart rate", "Good sleep", "Active morning", "Sunny weather"],
    color: "energetic",
    description: "Your elevated heart rate and recent physical activity suggest high energy levels. Perfect time for upbeat, motivating music to match your current state."
  }

  // todo: remove mock functionality - replace with Spotify API integration
  const recommendedTracks = [
    {
      id: "1",
      title: "Uptown Funk", 
      artist: "Mark Ronson ft. Bruno Mars",
      album: "Uptown Special",
      duration: "4:30",
      energy: 0.9,
      valence: 0.85,
      reason: "High energy track matching your current energetic mood and elevated heart rate"
    },
    {
      id: "2",
      title: "Can't Stop the Feeling!",
      artist: "Justin Timberlake", 
      album: "Trolls (Original Motion Picture Soundtrack)",
      duration: "3:56",
      energy: 0.85,
      valence: 0.9,
      reason: "Positive, uplifting vibes to complement your good mood and active day"
    }
  ]

  // todo: remove mock functionality - replace with real device API integration
  const connectedDevices = [
    {
      id: "1",
      name: "Apple Watch Series 9",
      type: "watch" as const,
      status: "connected" as const,
      lastSync: "2 minutes ago",
      batteryLevel: 85
    },
    {
      id: "2", 
      name: "iPhone 15 Pro",
      type: "phone" as const,
      status: "syncing" as const,
      lastSync: "Syncing now...",
      batteryLevel: 67
    }
  ]

  // todo: remove mock functionality - replace with real health data charts
  const heartRateData = [
    { time: "6:00", value: 65 },
    { time: "8:00", value: 78 },
    { time: "10:00", value: 85 },
    { time: "12:00", value: 72 },
    { time: "14:00", value: 88 },
    { time: "16:00", value: 95 },
    { time: "18:00", value: 82 },
    { time: "20:00", value: 68 }
  ]

  const handleRefresh = async () => {
    setIsRefreshing(true)
    console.log('Refreshing health data...')
    
    // Simulate API refresh
    setTimeout(() => {
      setIsRefreshing(false)
      console.log('Health data refreshed')
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Health Dashboard</h1>
          <p className="text-muted-foreground">Monitor your health and discover personalized music therapy</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="icon" data-testid="button-settings">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthMetrics.map((metric, index) => (
          <HealthMetricsCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <HealthChart
            title="Heart Rate Today"
            data={heartRateData}
            color="chart-1"
            unit="bpm"
            type="line"
          />
          
          {/* Music Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-chart-3/10">
                  <Activity className="h-5 w-5 text-chart-3" />
                </div>
                Music Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendedTracks.map((track, index) => (
                <MusicRecommendationCard 
                  key={track.id}
                  track={track}
                  moodMatch={95 - index * 5}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Mood & Devices */}
        <div className="space-y-6">
          <MoodAnalysisCard moodData={moodData} />
          
          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectedDevices.map(device => (
                <DeviceConnectionCard key={device.id} device={device} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}