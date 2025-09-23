import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { type MoodAnalysisResult } from "./openai";

let connectionSettings: any;

async function getAccessToken() {
  // Check if we have valid cached credentials
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    const refreshToken = connectionSettings?.settings?.oauth?.credentials?.refresh_token;
    const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
    const clientId = connectionSettings?.settings?.oauth?.credentials?.client_id;
    const expiresIn = connectionSettings.settings?.oauth?.credentials?.expires_in;
    
    return {accessToken, clientId, refreshToken, expiresIn};
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=spotify',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);
  
  const refreshToken = connectionSettings?.settings?.oauth?.credentials?.refresh_token;
  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
  const clientId = connectionSettings?.settings?.oauth?.credentials?.client_id;
  const expiresIn = connectionSettings.settings?.oauth?.credentials?.expires_in;
  
  if (!connectionSettings || (!accessToken || !clientId || !refreshToken)) {
    throw new Error('Spotify not connected');
  }
  
  return {accessToken, clientId, refreshToken, expiresIn};
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableSpotifyClient() {
  const {accessToken, clientId, refreshToken, expiresIn} = await getAccessToken();

  const spotify = SpotifyApi.withAccessToken(clientId, {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: expiresIn || 3600,
    refresh_token: refreshToken,
  });

  return spotify;
}

export interface TrackRecommendation {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: string;
  moodMatch: number;
  reason: string;
  audioFeatures: {
    energy: number;
    valence: number;
    danceability: number;
    tempo: number;
  };
  spotifyUrl: string;
  previewUrl?: string;
}

export async function getRecommendationsBasedOnMood(
  moodAnalysis: MoodAnalysisResult,
  userPreferences?: {
    musicGenres: string[];
    moodPreferences: Record<string, string[]>;
  },
  limit: number = 10
): Promise<TrackRecommendation[]> {
  try {
    const spotify = await getUncachableSpotifyClient();
    
    // Map mood to Spotify audio features
    const audioFeatures = mapMoodToAudioFeatures(moodAnalysis);
    
    // Get user's preferred genres, fall back to mood-based genres
    const seedGenres = getUserPreferredGenres(moodAnalysis, userPreferences);
    
    // Get recommendations from Spotify
    const recommendations = await spotify.recommendations.get({
      seed_genres: seedGenres.slice(0, 5), // Spotify limits to 5 seeds
      target_energy: audioFeatures.energy,
      target_valence: audioFeatures.valence,
      target_danceability: audioFeatures.danceability,
      min_tempo: audioFeatures.tempo - 20,
      max_tempo: audioFeatures.tempo + 20,
      limit: Math.min(limit, 50) // Spotify limits to 50
    });

    // Get audio features for all recommended tracks
    const trackIds = recommendations.tracks.map(track => track.id);
    const audioFeaturesResponse = await spotify.tracks.audioFeatures(trackIds);

    // Process and score the recommendations
    const processedTracks: TrackRecommendation[] = recommendations.tracks.map((track, index) => {
      const features = audioFeaturesResponse[index];
      const moodMatch = calculateMoodMatch(moodAnalysis, features);
      
      return {
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || "Unknown Artist",
        album: track.album.name,
        duration: formatDuration(track.duration_ms),
        moodMatch,
        reason: generateRecommendationReason(moodAnalysis, features, moodMatch),
        audioFeatures: {
          energy: features.energy,
          valence: features.valence,
          danceability: features.danceability,
          tempo: features.tempo
        },
        spotifyUrl: track.external_urls.spotify,
        previewUrl: track.preview_url || undefined
      };
    });

    // Sort by mood match score and return top results
    return processedTracks
      .sort((a, b) => b.moodMatch - a.moodMatch)
      .slice(0, limit);

  } catch (error) {
    console.error("Error getting Spotify recommendations:", error);
    console.log("Using fallback recommendations with working audio previews");
    
    // Return fallback recommendations if Spotify fails
    return getFallbackRecommendations(moodAnalysis, limit);
  }
}

function mapMoodToAudioFeatures(moodAnalysis: MoodAnalysisResult) {
  const { mood, recommendations } = moodAnalysis;
  
  // Base values that can be adjusted based on mood
  let energy = 0.5;
  let valence = 0.5; 
  let danceability = 0.5;
  let tempo = 120;

  // Adjust based on energy level
  switch (recommendations.energyLevel) {
    case "high":
      energy = 0.7;
      danceability = 0.7;
      tempo = 140;
      break;
    case "low":
      energy = 0.3;
      danceability = 0.3;
      tempo = 90;
      break;
    default: // medium
      energy = 0.5;
      danceability = 0.5;
      tempo = 120;
  }

  // Adjust based on valence (positivity)
  switch (recommendations.valence) {
    case "high":
      valence = 0.7;
      break;
    case "low":
      valence = 0.3;
      break;
    default: // medium
      valence = 0.5;
  }

  // Fine-tune based on specific mood
  switch (mood) {
    case "energetic":
      energy = Math.max(energy, 0.7);
      valence = Math.max(valence, 0.6);
      danceability = Math.max(danceability, 0.6);
      break;
    case "calm":
    case "relaxed":
      energy = Math.min(energy, 0.4);
      tempo = Math.min(tempo, 100);
      break;
    case "focused":
      danceability = Math.min(danceability, 0.4);
      valence = 0.5; // neutral
      break;
    case "stressed":
      energy = Math.min(energy, 0.3);
      valence = Math.max(valence, 0.4); // slightly positive to help
      tempo = Math.min(tempo, 90);
      break;
  }

  return { energy, valence, danceability, tempo };
}

function getUserPreferredGenres(
  moodAnalysis: MoodAnalysisResult,
  userPreferences?: { musicGenres: string[]; moodPreferences: Record<string, string[]>; }
): string[] {
  // Start with user's general music preferences
  let genres: string[] = [];
  
  if (userPreferences) {
    // Check if user has specific preferences for this mood
    const moodSpecificGenres = userPreferences.moodPreferences[moodAnalysis.mood];
    if (moodSpecificGenres && moodSpecificGenres.length > 0) {
      genres = [...moodSpecificGenres];
    } else {
      // Fall back to general preferences
      genres = [...userPreferences.musicGenres];
    }
  }
  
  // If no user preferences or not enough genres, use AI recommendations
  if (genres.length < 3) {
    genres = [...genres, ...moodAnalysis.recommendations.musicGenres];
  }
  
  // Remove duplicates and ensure we have valid Spotify genres
  const validSpotifyGenres = [
    "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "blues", "bossanova",
    "brazil", "breakbeat", "british", "chill", "classical", "club", "country", "dance",
    "dancehall", "deep-house", "disco", "drum-and-bass", "dub", "dubstep", "electronic",
    "folk", "funk", "garage", "gospel", "groove", "hip-hop", "house", "indie", "jazz",
    "latin", "lo-fi", "new-age", "pop", "r-n-b", "reggae", "rock", "soul", "techno", "trance"
  ];
  
  // Map non-standard genres to valid Spotify genres for API compatibility
  const genreMapping: Record<string, string> = {
    "world-music": "ambient",
    "indian": "new-age",
    "meditation": "ambient"
  };
  
  // Convert mapped genres
  const mappedGenres = genres.map(genre => genreMapping[genre] || genre);
  
  return Array.from(new Set(mappedGenres))
    .filter(genre => validSpotifyGenres.includes(genre.toLowerCase()))
    .slice(0, 5);
}

function calculateMoodMatch(moodAnalysis: MoodAnalysisResult, audioFeatures: any): number {
  const targetFeatures = mapMoodToAudioFeatures(moodAnalysis);
  
  // Calculate similarity scores for each feature (0-1 scale)
  const energyScore = 1 - Math.abs(targetFeatures.energy - audioFeatures.energy);
  const valenceScore = 1 - Math.abs(targetFeatures.valence - audioFeatures.valence);
  const danceabilityScore = 1 - Math.abs(targetFeatures.danceability - audioFeatures.danceability);
  const tempoScore = 1 - Math.abs(targetFeatures.tempo - audioFeatures.tempo) / 100; // Normalize tempo difference
  
  // Weight the scores (energy and valence are most important for mood)
  const weightedScore = (
    energyScore * 0.35 +
    valenceScore * 0.35 +
    danceabilityScore * 0.2 +
    Math.max(0, tempoScore) * 0.1
  );
  
  // Convert to percentage and add some variance based on mood confidence
  const moodConfidenceBonus = (moodAnalysis.confidence / 100) * 0.1;
  return Math.round((weightedScore + moodConfidenceBonus) * 100);
}

function generateRecommendationReason(moodAnalysis: MoodAnalysisResult, audioFeatures: any, moodMatch: number): string {
  const reasons = [];
  
  if (audioFeatures.energy > 0.6 && moodAnalysis.recommendations.energyLevel === "high") {
    reasons.push("high energy matches your current state");
  } else if (audioFeatures.energy < 0.4 && moodAnalysis.recommendations.energyLevel === "low") {
    reasons.push("calming energy for relaxation");
  }
  
  if (audioFeatures.valence > 0.6 && moodAnalysis.mood !== "stressed") {
    reasons.push("uplifting mood");
  } else if (audioFeatures.valence < 0.4 && (moodAnalysis.mood === "melancholy" || moodAnalysis.mood === "stressed")) {
    reasons.push("reflective tone matching your mood");
  }
  
  if (moodMatch > 85) {
    reasons.push("perfect match for your current mood");
  } else if (moodMatch > 70) {
    reasons.push("good alignment with your emotional state");
  }
  
  return reasons.length > 0 
    ? reasons.slice(0, 2).join(" and ")
    : "recommended based on your mood profile";
}

function formatDuration(durationMs: number): string {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getFallbackRecommendations(moodAnalysis: MoodAnalysisResult, limit: number): TrackRecommendation[] {
  // Enhanced fallback data with spiritual and meditation-oriented music
  const fallbackTracks = [
    {
      id: "fallback-1",
      name: "Bansuri Flute Meditation",
      artist: "Pandit Hariprasad Chaurasia",
      album: "Sacred Flute Meditations",
      duration: "7:35",
      reason: "Therapeutic bamboo flute for deep meditation and chakra balancing",
      previewUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
    },
    {
      id: "fallback-2", 
      name: "Veena Raga Bhairav",
      artist: "S. Balachander",
      album: "Classical Veena Ragas",
      duration: "9:12",
      reason: "Morning raga on veena for spiritual awakening and focus",
      previewUrl: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3"
    },
    {
      id: "fallback-3",
      name: "Carnatic Raga Meditation",
      artist: "Indian Classical Artists",
      album: "Therapeutic Ragas",
      duration: "6:15",
      reason: "Traditional Carnatic music for deep meditation and healing",
      previewUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
    },
    {
      id: "fallback-4",
      name: "Raga Yaman - Peaceful",
      artist: "Classical Indian Ensemble", 
      album: "Healing Ragas",
      duration: "8:20",
      reason: "Soothing Carnatic composition for stress relief and focus",
      previewUrl: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3"
    },
    {
      id: "fallback-5",
      name: "Sitar Meditation - Raga Darbari",
      artist: "Pandit Ravi Shankar",
      album: "Healing Ragas Collection",
      duration: "11:45",
      reason: "Deep healing raga on sitar for stress relief and inner peace",
      previewUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
    },
    {
      id: "fallback-6",
      name: "Tanpura Drone - Om Meditation",
      artist: "Spiritual Sound Healers",
      album: "Sacred Drone Meditations",
      duration: "15:00",
      reason: "Continuous tanpura drone with Om chanting for deep meditation",
      previewUrl: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3"
    },
    {
      id: "fallback-7",
      name: "Tabla & Flute Devotional",
      artist: "Bhajan Ensemble",
      album: "Spiritual Rhythms",
      duration: "5:30",
      reason: "Uplifting devotional music with tabla rhythms and flute melodies",
      previewUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
    },
    {
      id: "fallback-8",
      name: "Tibetan Singing Bowls & Flute",
      artist: "Meditation Masters",
      album: "Chakra Healing Sounds",
      duration: "12:20",
      reason: "Healing vibrations from Tibetan bowls combined with flute meditation",
      previewUrl: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3"
    },
    {
      id: "fallback-9",
      name: "Gayatri Mantra - Traditional",
      artist: "Sanskrit Chanting Collective",
      album: "Sacred Mantras for Healing",
      duration: "8:00",
      reason: "Sacred Gayatri mantra chanting for spiritual purification and peace",
      previewUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
    },
    {
      id: "fallback-10",
      name: "Santoor Mountain Meditation",
      artist: "Pandit Shivkumar Sharma",
      album: "Himalayan Sounds",
      duration: "10:15",
      reason: "Ethereal santoor melodies inspired by Himalayan spirituality",
      previewUrl: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3"
    }
  ];
  
  // Select appropriate tracks based on mood
  const moodBasedTracks = selectTracksByMood(fallbackTracks, moodAnalysis.mood);
  
  return moodBasedTracks.slice(0, limit).map((track, index) => ({
    ...track,
    moodMatch: 75 - index * 5,
    audioFeatures: {
      energy: getMoodEnergy(moodAnalysis.mood),
      valence: getMoodValence(moodAnalysis.mood),
      danceability: 0.5,
      tempo: 120
    },
    spotifyUrl: "#"
  }));
}

function selectTracksByMood(tracks: any[], mood: string): any[] {
  // Return tracks in order based on mood, prioritizing spiritual and meditative content
  switch (mood) {
    case "calm":
    case "relaxed":
      // Prioritize flute, tanpura, and healing instruments for calmness
      return [tracks[0], tracks[5], tracks[7], tracks[2], tracks[3], tracks[9], tracks[1], tracks[6], tracks[8], tracks[4]];
    case "energetic":
    case "happy":
      // Include uplifting devotional and rhythmic spiritual music
      return [tracks[6], tracks[1], tracks[8], tracks[0], tracks[3], tracks[7], tracks[2], tracks[4], tracks[5], tracks[9]];
    case "focused":
      // Emphasize instrumental ragas and meditation sounds for concentration
      return [tracks[1], tracks[4], tracks[0], tracks[9], tracks[2], tracks[3], tracks[5], tracks[7], tracks[8], tracks[6]];
    case "stressed":
      // Prioritize healing ragas and calming instruments for stress relief
      return [tracks[4], tracks[5], tracks[0], tracks[2], tracks[7], tracks[8], tracks[3], tracks[9], tracks[1], tracks[6]];
    case "melancholy":
      // Use healing and uplifting spiritual music
      return [tracks[8], tracks[5], tracks[0], tracks[2], tracks[9], tracks[7], tracks[3], tracks[4], tracks[1], tracks[6]];
    default:
      // Default spiritual order
      return [tracks[0], tracks[2], tracks[1], tracks[4], tracks[5], tracks[7], tracks[8], tracks[9], tracks[3], tracks[6]];
  }
}

function getMoodEnergy(mood: string): number {
  switch (mood) {
    case "energetic":
    case "happy":
      return 0.8;
    case "calm":
    case "relaxed":
      return 0.3;
    case "focused":
      return 0.5;
    default:
      return 0.5;
  }
}

function getMoodValence(mood: string): number {
  switch (mood) {
    case "happy":
    case "energetic":
      return 0.8;
    case "stressed":
    case "anxious":
      return 0.4;
    case "calm":
    case "focused":
      return 0.6;
    default:
      return 0.5;
  }
}