import { MusicRecommendationCard } from "@/components/MusicRecommendationCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { autoMusicService } from "@/services/autoMusicService";

export function MusicPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sync with autoMusicService state
  useEffect(() => {
    const updateState = () => {
      setIsPlaying(autoMusicService.getIsPlaying());
      setCurrentTrack(autoMusicService.getCurrentTrack());
    };
    
    // Initial sync
    updateState();
    
    // Listen for auto-play events
    const handleAutoPlay = () => updateState();
    window.addEventListener('autoMusicPlay', handleAutoPlay);
    
    // Periodic sync to catch any state changes
    const interval = setInterval(updateState, 1000);
    
    return () => {
      window.removeEventListener('autoMusicPlay', handleAutoPlay);
      clearInterval(interval);
    };
  }, []);

  // Fetch music recommendations
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/music/recommendations'],
  });

  // Fetch latest mood analysis for context
  const { data: latestMoodAnalysis } = useQuery({
    queryKey: ['/api/mood/analysis/latest'],
  });

  // Mutation for generating new recommendations
  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/music/recommendations');
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/music/recommendations'] });
      toast({
        title: "New Recommendations Ready",
        description: `Generated ${data.length} personalized tracks based on your current mood.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Recommendation Failed",
        description: "Unable to generate recommendations. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerateRecommendations = () => {
    generateRecommendationsMutation.mutate();
  };

  const handlePlayTrack = async (track: any) => {
    try {
      if (!track.previewUrl) {
        toast({
          title: "Preview Not Available",
          description: "This track doesn't have a preview available for playback.",
          variant: "destructive",
        });
        return;
      }
      
      await autoMusicService.playTrack(track);
      toast({
        title: "Now Playing",
        description: `${track.trackName} by ${track.artistName}`,
      });
    } catch (error) {
      toast({
        title: "Playback Failed",
        description: "Unable to start playback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePauseResume = () => {
    autoMusicService.pauseResume();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
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
          <h1 className="text-3xl font-bold text-foreground">Music Therapy</h1>
          <p className="text-muted-foreground">Personalized music recommendations based on your mood</p>
        </div>
        <Button 
          onClick={handleGenerateRecommendations}
          disabled={generateRecommendationsMutation.isPending}
          data-testid="button-generate-music"
        >
          <Music className={`h-4 w-4 mr-2 ${generateRecommendationsMutation.isPending ? 'animate-pulse' : ''}`} />
          {generateRecommendationsMutation.isPending ? 'Generating...' : 'Get New Recommendations'}
        </Button>
      </div>

      {/* Current Mood Context */}
      {latestMoodAnalysis && latestMoodAnalysis.analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-chart-3/10">
                <Heart className="h-5 w-5 text-chart-3" />
              </div>
              Mood-Based Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                latestMoodAnalysis.analysis.mood === 'energetic' || latestMoodAnalysis.analysis.mood === 'happy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                latestMoodAnalysis.analysis.mood === 'calm' || latestMoodAnalysis.analysis.mood === 'focused' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                latestMoodAnalysis.analysis.mood === 'stressed' || latestMoodAnalysis.analysis.mood === 'anxious' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
              }`}>
                Current Mood: {latestMoodAnalysis.analysis.mood}
              </div>
              <div className="text-sm text-muted-foreground">
                {latestMoodAnalysis.analysis.confidence}% confidence
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {latestMoodAnalysis.analysis.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Music Player */}
      {currentTrack && (
        <Card>
          <CardHeader>
            <CardTitle>Now Playing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{currentTrack.trackName}</h3>
                  <p className="text-sm text-muted-foreground">{currentTrack.artistName}</p>
                  <p className="text-xs text-muted-foreground">{currentTrack.albumName}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Mood Match: {currentTrack.moodMatch}%
                </div>
              </div>
              
              {/* Player Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button size="icon" onClick={handlePauseResume}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon">
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1:23</span>
                  <span>3:45</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-chart-1/10">
              <Music className="h-5 w-5 text-chart-1" />
            </div>
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations && Array.isArray(recommendations) && recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((recommendation: any, index: number) => (
                <div key={recommendation.id} className="flex items-center gap-4 p-4 rounded-lg border hover-elevate">
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={() => handlePlayTrack(recommendation)}
                    data-testid={`button-play-${recommendation.id}`}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{recommendation.trackName}</h3>
                    <p className="text-sm text-muted-foreground truncate">{recommendation.artistName}</p>
                    <p className="text-xs text-muted-foreground truncate">{recommendation.albumName}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-chart-1">
                      {recommendation.moodMatch}% match
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {recommendation.reason?.substring(0, 30)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recommendations available</p>
              <p className="text-sm text-muted-foreground mb-4">
                Generate personalized music recommendations based on your current mood
              </p>
              <Button onClick={handleGenerateRecommendations}>
                <Music className="h-4 w-4 mr-2" />
                Get Recommendations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Music Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Your Music Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Preferred Genres</h4>
              <div className="flex flex-wrap gap-2">
                {['Pop', 'Electronic', 'Indie', 'Classical', 'Ambient'].map(genre => (
                  <span key={genre} className="px-2 py-1 bg-muted rounded text-xs">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Energy Preferences</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Energetic</span>
                  <span className="text-muted-foreground">High tempo, upbeat</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Calm</span>
                  <span className="text-muted-foreground">Ambient, soothing</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Recent Listening</h4>
              <div className="space-y-1 text-sm">
                <div className="text-muted-foreground">Last session: 45 mins</div>
                <div className="text-muted-foreground">Avg daily: 2.5 hours</div>
                <div className="text-muted-foreground">Top mood: Energetic</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}