import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Smile, Heart } from "lucide-react"

interface MoodData {
  mood: string
  confidence: number
  factors: string[]
  color: string
  description: string
}

interface MoodAnalysisCardProps {
  moodData: MoodData
}

export function MoodAnalysisCard({ moodData }: MoodAnalysisCardProps) {
  const getMoodIcon = (mood: string) => {
    switch (mood.toLowerCase()) {
      case "energetic": return <Zap className="h-5 w-5" />
      case "calm": return <Heart className="h-5 w-5" />
      case "focused": return <Brain className="h-5 w-5" />
      default: return <Smile className="h-5 w-5" />
    }
  }

  const getMoodColor = (color: string) => {
    const colorMap: Record<string, string> = {
      "energetic": "text-chart-3 bg-chart-3/10 border-chart-3/20",
      "calm": "text-chart-2 bg-chart-2/10 border-chart-2/20",
      "focused": "text-chart-4 bg-chart-4/10 border-chart-4/20",
      "melancholy": "text-chart-1 bg-chart-1/10 border-chart-1/20"
    }
    return colorMap[color] || "text-muted-foreground bg-muted/10"
  }

  return (
    <Card className="hover-elevate">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${getMoodColor(moodData.color)}`}>
            {getMoodIcon(moodData.mood)}
          </div>
          <div>
            <div className="text-lg font-semibold">Current Mood</div>
            <div className="text-sm text-muted-foreground">AI Analysis</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Detected: {moodData.mood}</span>
            <span className="text-sm text-muted-foreground">{moodData.confidence}% confident</span>
          </div>
          <Progress value={moodData.confidence} className="h-2" />
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            {moodData.description}
          </p>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Contributing Factors:</div>
            <div className="flex flex-wrap gap-2">
              {moodData.factors.map((factor, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}