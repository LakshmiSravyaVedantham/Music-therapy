import { MoodAnalysisCard } from "@/components/MoodAnalysisCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Sparkles, RefreshCw, Music, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { autoMusicService } from "@/services/autoMusicService";

export function MoodPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [currentAutoTrack, setCurrentAutoTrack] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch latest mood analysis
  const { data: latestMoodAnalysis, isLoading } = useQuery({
    queryKey: ['/api/mood/analysis/latest'],
  });

  // Fetch mood analysis history
  const { data: moodHistory } = useQuery({
    queryKey: ['/api/mood/analysis'],
  });

  // Mutation for analyzing mood with auto-play
  const analyzeMoodMutation = useMutation({
    mutationFn: async () => {
      if (autoPlayEnabled) {
        return autoMusicService.analyzeAndPlay();
      } else {
        const response = await apiRequest('POST', '/api/mood/analyze');
        return await response.json();
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/mood/analysis'] });
      queryClient.invalidateQueries({ queryKey: ['/api/music/recommendations'] });
      
      const analysis = (data as any).analysis || data;
      toast({
        title: "Mood Analysis Complete",
        description: autoPlayEnabled ? 
          `Detected ${analysis.mood} mood - Auto-playing music!` :
          `Detected mood: ${analysis.mood} (${analysis.confidence}% confidence)`,
      });
      setIsAnalyzing(false);
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze mood. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  });

  // Listen for auto-play events
  useEffect(() => {
    const handleAutoPlay = (event: any) => {
      setCurrentAutoTrack(event.detail.track);
      toast({
        title: "Auto-Playing Music",
        description: `${event.detail.track.trackName} - ${event.detail.track.moodMatch}% mood match`,
      });
    };

    window.addEventListener('autoMusicPlay', handleAutoPlay);
    
    // Get current auto-play config
    setAutoPlayEnabled(autoMusicService.getConfig().enabled);
    setCurrentAutoTrack(autoMusicService.getCurrentTrack());

    return () => {
      window.removeEventListener('autoMusicPlay', handleAutoPlay);
    };
  }, []);

  const toggleAutoPlay = () => {
    const newEnabled = !autoPlayEnabled;
    setAutoPlayEnabled(newEnabled);
    autoMusicService.updateConfig({ enabled: newEnabled });
    
    if (newEnabled) {
      toast({
        title: "Auto-Play Enabled",
        description: "Music will automatically play based on your mood analysis",
      });
    } else {
      toast({
        title: "Auto-Play Disabled", 
        description: "You can manually control music playback",
      });
      autoMusicService.stopPlayback();
      setCurrentAutoTrack(null);
    }
  };

  const handleAnalyzeMood = () => {
    setIsAnalyzing(true);
    analyzeMoodMutation.mutate();
  };

  // Convert API data to display format
  const moodData = latestMoodAnalysis ? {
    mood: latestMoodAnalysis.mood,
    confidence: latestMoodAnalysis.confidence,
    factors: latestMoodAnalysis.factors,
    color: latestMoodAnalysis.mood.toLowerCase(),
    description: latestMoodAnalysis.description
  } : null;

  // Mood trend analysis
  const moodTrend = moodHistory?.slice(-7).map(analysis => ({
    date: new Date(analysis.timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    mood: analysis.mood,
    confidence: analysis.confidence
  })) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mood Analysis</h1>
          <p className="text-muted-foreground">AI-powered insights with automatic music therapy</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={toggleAutoPlay}
            className={autoPlayEnabled ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : ""}
            data-testid="button-toggle-autoplay"
          >
            <Music className="h-4 w-4 mr-2" />
            Auto-Play {autoPlayEnabled ? 'ON' : 'OFF'}
          </Button>
          <Button 
            onClick={handleAnalyzeMood}
            disabled={isAnalyzing}
            data-testid="button-analyze-mood"
          >
            <Brain className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : autoPlayEnabled ? 'Analyze & Play Music' : 'Analyze Mood'}
          </Button>
        </div>
      </div>

      {/* Auto-Playing Track */}
      {currentAutoTrack && autoPlayEnabled && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Auto-Playing Based on Your Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  {currentAutoTrack.trackName}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  by {currentAutoTrack.artistName}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  {currentAutoTrack.moodMatch}% mood match
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-700 dark:text-green-300">Playing</span>
                </div>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                {currentAutoTrack.reason}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Mood Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {moodData ? (
            <MoodAnalysisCard moodData={moodData} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Recent Mood Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Click "Analyze Current Mood" to get AI-powered insights based on your latest health data.
                </p>
                <Button onClick={handleAnalyzeMood} disabled={isAnalyzing}>
                  <Brain className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mood Factors */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-chart-3/10">
                  <Sparkles className="h-5 w-5 text-chart-3" />
                </div>
                Key Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {moodData?.factors && moodData.factors.length > 0 ? (
                <div className="space-y-3">
                  {moodData.factors.map((factor, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted">
                      <p className="text-sm">{factor}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Analyze your mood to see contributing factors
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mood Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-chart-2/10">
              <TrendingUp className="h-5 w-5 text-chart-2" />
            </div>
            Mood Trend (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {moodTrend.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                {moodTrend.map((entry, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">{entry.date}</div>
                    <div className={`p-2 rounded-lg text-xs font-medium ${
                      entry.mood === 'energetic' || entry.mood === 'happy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      entry.mood === 'calm' || entry.mood === 'focused' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      entry.mood === 'stressed' || entry.mood === 'anxious' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                    }`}>
                      <div className="capitalize">{entry.mood}</div>
                      <div className="text-xs opacity-75">{entry.confidence}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No mood history available yet</p>
              <p className="text-sm text-muted-foreground">Analyze your mood regularly to track trends</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mood Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moodData?.mood === 'stressed' && (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">Stress Management</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your analysis shows stress patterns. Consider relaxation music, deep breathing, or a short walk.
                </p>
              </div>
            )}
            
            {moodData?.mood === 'energetic' && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200">High Energy</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You're feeling energetic! This is a great time for upbeat music and physical activities.
                </p>
              </div>
            )}
            
            {moodData?.confidence && moodData.confidence < 60 && (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200">Mixed Signals</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Your mood indicators are mixed. Try to identify what's affecting your state and adjust accordingly.
                </p>
              </div>
            )}
            
            {!moodData && (
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Get Started</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Regular mood analysis helps you understand patterns and make informed decisions about your wellbeing.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}