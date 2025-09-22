import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Plus, Heart, ExternalLink } from "lucide-react"
import { useState } from "react"

interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  energy: number
  valence: number
  reason: string
}

interface MusicRecommendationCardProps {
  track: Track
  moodMatch: number
}

export function MusicRecommendationCard({ track, moodMatch }: MusicRecommendationCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    console.log(`${isPlaying ? 'Pausing' : 'Playing'} ${track.title} by ${track.artist}`)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    console.log(`${isLiked ? 'Unliked' : 'Liked'} ${track.title}`)
  }

  const handleAddToPlaylist = () => {
    console.log(`Adding ${track.title} to playlist`)
  }

  const getMoodMatchColor = (match: number) => {
    if (match >= 90) return "text-chart-2 bg-chart-2/10"
    if (match >= 70) return "text-chart-3 bg-chart-3/10"
    return "text-chart-1 bg-chart-1/10"
  }

  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {track.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground truncate">
              {track.artist} • {track.album}
            </p>
          </div>
          <Badge variant="outline" className={getMoodMatchColor(moodMatch)}>
            {moodMatch}% match
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-xs text-muted-foreground">
          {track.reason}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant={isPlaying ? "default" : "outline"}
              onClick={handlePlay}
              data-testid={`button-play-${track.id}`}
            >
              <Play className="h-4 w-4" />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={handleLike}
              data-testid={`button-like-${track.id}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-destructive' : ''}`} />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={handleAddToPlaylist}
              data-testid={`button-add-${track.id}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{track.duration}</span>
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}