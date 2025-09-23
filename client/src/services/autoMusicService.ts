import { apiRequest } from "@/lib/queryClient";

export interface AutoPlayConfig {
  enabled: boolean;
  volume: number;
  autoAnalyzeInterval?: number; // in minutes
}

export class AutoMusicService {
  private config: AutoPlayConfig = {
    enabled: true,
    volume: 0.7,
    autoAnalyzeInterval: 30 // Auto-analyze every 30 minutes
  };

  private currentTrack: any = null;
  private isPlaying: boolean = false;
  private audio: HTMLAudioElement | null = null;
  private autoAnalyzeTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadConfig();
    this.startAutoAnalyze();
  }

  private loadConfig() {
    const stored = localStorage.getItem('autoMusicConfig');
    if (stored) {
      this.config = { ...this.config, ...JSON.parse(stored) };
    }
  }

  private saveConfig() {
    localStorage.setItem('autoMusicConfig', JSON.stringify(this.config));
  }

  updateConfig(newConfig: Partial<AutoPlayConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    
    if (newConfig.enabled === false) {
      this.stopPlayback();
      this.stopAutoAnalyze();
    } else if (newConfig.enabled === true) {
      this.startAutoAnalyze();
    }
  }

  getConfig(): AutoPlayConfig {
    return { ...this.config };
  }

  async analyzeAndPlay(): Promise<void> {
    try {
      console.log('Starting automatic mood analysis and music playback...');
      
      // Step 1: Analyze current mood
      const moodAnalysisResponse = await apiRequest('POST', '/api/mood/analyze');
      const moodAnalysis = await moodAnalysisResponse.json();
      console.log('Mood analysis complete:', moodAnalysis.analysis.mood);

      // Step 2: Generate music recommendations based on mood
      const recommendationsResponse = await apiRequest('POST', '/api/music/recommendations');
      const recommendations = await recommendationsResponse.json();
      console.log('Generated', recommendations.length, 'music recommendations');

      // Step 3: Auto-play the best matching track
      if (recommendations.length > 0 && this.config.enabled) {
        const bestMatch = recommendations.reduce((best: any, current: any) => 
          current.moodMatch > best.moodMatch ? current : best
        );
        
        await this.playTrack(bestMatch);
        
        // Notify about the auto-playback
        this.notifyAutoPlay(moodAnalysis.analysis, bestMatch);
      }

      return moodAnalysis;
    } catch (error) {
      console.error('Auto music service error:', error);
      throw error;
    }
  }

  async playTrack(track: any): Promise<void> {
    try {
      // Stop current playback
      this.stopPlayback();

      this.currentTrack = track;
      
      console.log(`Now playing: ${track.trackName} by ${track.artistName}`);
      console.log(`Mood match: ${track.moodMatch}%`);
      
      // Check if track has a preview URL for actual audio playback
      if (track.previewUrl) {
        this.audio = new Audio(track.previewUrl);
        this.audio.volume = this.config.volume;
        
        // Set up audio event listeners
        this.audio.onended = () => {
          console.log('Track ended, auto-analyzing for next recommendation...');
          this.isPlaying = false;
          this.currentTrack = null;
          if (this.config.enabled) {
            this.analyzeAndPlay();
          }
        };
        
        this.audio.onerror = (error) => {
          console.error('Audio playback error:', error);
          this.isPlaying = false;
        };
        
        // Start playback
        await this.audio.play();
        this.isPlaying = true;
      } else {
        // Fallback for tracks without preview URLs
        console.warn('No preview URL available for this track');
        this.isPlaying = true;
        
        // Simulate track duration for tracks without preview
        setTimeout(() => {
          if (this.isPlaying && this.currentTrack?.id === track.id) {
            console.log('Simulated track ended, auto-analyzing for next recommendation...');
            this.isPlaying = false;
            this.currentTrack = null;
            if (this.config.enabled) {
              this.analyzeAndPlay();
            }
          }
        }, 30000); // 30 seconds for demo
      }

    } catch (error) {
      console.error('Error playing track:', error);
      this.isPlaying = false;
    }
  }

  stopPlayback(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    this.isPlaying = false;
    this.currentTrack = null;
  }

  pauseResume(): void {
    if (this.audio) {
      if (this.isPlaying) {
        this.audio.pause();
        this.isPlaying = false;
      } else {
        this.audio.play();
        this.isPlaying = true;
      }
    }
  }

  getCurrentTrack() {
    return this.currentTrack;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private startAutoAnalyze(): void {
    if (!this.config.enabled || !this.config.autoAnalyzeInterval) return;
    
    this.stopAutoAnalyze();
    
    const intervalMs = this.config.autoAnalyzeInterval * 60 * 1000;
    this.autoAnalyzeTimer = setInterval(() => {
      console.log('Auto-analyzing mood for music recommendations...');
      this.analyzeAndPlay().catch(console.error);
    }, intervalMs);
    
    console.log(`Auto-analyze started: every ${this.config.autoAnalyzeInterval} minutes`);
  }

  private stopAutoAnalyze(): void {
    if (this.autoAnalyzeTimer) {
      clearInterval(this.autoAnalyzeTimer);
      this.autoAnalyzeTimer = null;
    }
  }

  private notifyAutoPlay(moodAnalysis: any, track: any): void {
    // This would typically show a toast notification
    console.log(`🎵 Auto-playing based on ${moodAnalysis.mood} mood (${moodAnalysis.confidence}% confidence)`);
    console.log(`🎵 Playing: ${track.trackName} - ${track.moodMatch}% mood match`);
    
    // Dispatch custom event for UI components to listen to
    window.dispatchEvent(new CustomEvent('autoMusicPlay', {
      detail: { moodAnalysis, track }
    }));
  }

  destroy(): void {
    this.stopPlayback();
    this.stopAutoAnalyze();
  }
}

// Singleton instance
export const autoMusicService = new AutoMusicService();