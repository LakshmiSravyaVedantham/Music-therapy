import OpenAI from "openai";
import { type HealthMetric } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MoodAnalysisResult {
  mood: string;
  confidence: number;
  factors: string[];
  description: string;
  recommendations: {
    energyLevel: "low" | "medium" | "high";
    musicGenres: string[];
    tempo: "slow" | "medium" | "fast";
    valence: "low" | "medium" | "high"; // positivity/happiness
  };
}

export async function analyzeMoodFromHealthData(
  healthMetrics: Record<string, HealthMetric>,
  userPreferences?: {
    musicGenres: string[];
    healthGoals: string[];
    moodPreferences: Record<string, string[]>;
  }
): Promise<MoodAnalysisResult> {
  // Prepare health data summary
  const healthSummary = Object.entries(healthMetrics).map(([type, metric]) => {
    return `${type}: ${metric.value} ${metric.unit} (recorded ${formatTimeAgo(metric.timestamp)})`;
  }).join('\n');

  // Build context about user preferences
  const preferenceContext = userPreferences ? `
User music preferences: ${userPreferences.musicGenres.join(', ')}
Health goals: ${userPreferences.healthGoals.join(', ')}
Previous mood preferences: ${Object.entries(userPreferences.moodPreferences).map(([mood, genres]) => 
    `${mood}: ${genres.join(', ')}`).join('; ')}
  ` : '';

  const prompt = `You are an expert health and mood analysis AI specializing in music therapy with focus on spirituality, meditation, and healing through sound. Analyze the following health data to determine the person's current mood and provide therapeutic music recommendations emphasizing Indian classical music, meditation, and spiritual wellness.

Current Health Metrics:
${healthSummary}

${preferenceContext}

Based on this health data, provide a JSON response with the following structure:
{
  "mood": "energetic|calm|focused|melancholy|stressed|relaxed",
  "confidence": 85,
  "factors": ["factor1", "factor2", "factor3"],
  "description": "Detailed explanation of mood analysis",
  "recommendations": {
    "energyLevel": "low|medium|high",
    "musicGenres": ["genre1", "genre2"],
    "tempo": "slow|medium|fast", 
    "valence": "low|medium|high"
  }
}

Guidelines for Health Analysis:
- Heart rate patterns: 60-100 bpm normal, >100 may indicate stress/energy, <60 may indicate calm/rest
- Sleep quality affects mood significantly
- Steps/activity level correlates with energy
- Consider time of day and patterns
- Confidence should reflect how clearly the data indicates the mood (60-95%)
- Factors should be specific health metrics that influenced the analysis
- Description should be empathetic and actionable (2-3 sentences)

CRITICAL: Music Therapy Guidelines - Prioritize Spirituality & Meditation:
- ALWAYS prioritize spiritual and meditative music genres in recommendations
- For ALL moods, include Indian classical music elements: Carnatic, Hindustani, ragas
- Emphasize therapeutic instruments: flute (bansuri), veena, sitar, tabla, tanpura
- Prioritize meditation-oriented genres: ambient meditation, new-age spiritual, mantra chanting
- For stressed/anxious moods: Focus heavily on Carnatic ragas known for healing (Raga Darbari, Raga Bageshri)
- For calm/relaxed moods: Emphasize flute meditation, veena compositions, ambient spiritual
- For focused moods: Traditional instrumental ragas, bamboo flute, meditation bowls
- For energetic moods: Still include spiritual uplifting music like devotional bhajans or kirtan
- Always consider music as medicine for the soul and chakra balancing
- Prefer traditional over contemporary when possible
- Include world music with spiritual elements from various traditions

Respond only with valid JSON, no additional text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Parse and validate the response
    let result: MoodAnalysisResult;
    try {
      // Remove any potential non-JSON preamble
      const cleanResponse = response.trim().replace(/^[^{]*/, '');
      result = JSON.parse(cleanResponse) as MoodAnalysisResult;
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", response);
      throw new Error("Invalid JSON response from OpenAI");
    }
    
    // Basic validation
    if (!result.mood || !result.confidence || !result.factors || !result.description || !result.recommendations) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Ensure confidence is in valid range
    result.confidence = Math.max(60, Math.min(95, result.confidence));

    return result;
  } catch (error) {
    console.error("Error analyzing mood with OpenAI:", error);
    
    // Fallback analysis based on basic heuristics
    return createFallbackMoodAnalysis(healthMetrics);
  }
}

function createFallbackMoodAnalysis(healthMetrics: Record<string, HealthMetric>): MoodAnalysisResult {
  const heartRate = healthMetrics.heart_rate?.value;
  const steps = healthMetrics.steps?.value;
  const sleepScore = healthMetrics.sleep_score?.value;

  let mood = "calm";
  let energyLevel: "low" | "medium" | "high" = "medium";
  let confidence = 65;
  const factors: string[] = [];

  // Simple heuristic analysis
  if (heartRate && heartRate > 90) {
    mood = "energetic";
    energyLevel = "high";
    factors.push("Elevated heart rate");
  } else if (heartRate && heartRate < 65) {
    mood = "relaxed";
    energyLevel = "low";
    factors.push("Low resting heart rate");
  }

  if (steps && steps > 8000) {
    mood = "energetic";
    energyLevel = "high";
    factors.push("High activity level");
    confidence += 10;
  } else if (steps && steps < 3000) {
    energyLevel = "low";
    factors.push("Low activity level");
  }

  if (sleepScore && sleepScore < 70) {
    mood = "stressed";
    factors.push("Poor sleep quality");
    confidence += 5;
  } else if (sleepScore && sleepScore > 85) {
    factors.push("Good sleep quality");
    confidence += 10;
  }

  if (factors.length === 0) {
    factors.push("Limited health data available");
  }

  return {
    mood,
    confidence: Math.min(confidence, 85),
    factors,
    description: `Based on available health metrics, you appear to be in a ${mood} state. ${factors.length > 1 ? 'Multiple factors' : 'Key indicators'} suggest this mood pattern.`,
    recommendations: {
      energyLevel,
      musicGenres: getMusicGenresForMood(mood),
      tempo: energyLevel === "high" ? "fast" : energyLevel === "low" ? "slow" : "medium",
      valence: mood === "stressed" || mood === "melancholy" ? "low" : "medium"
    }
  };
}

function getMusicGenresForMood(mood: string): string[] {
  const genreMap: Record<string, string[]> = {
    energetic: ["world-music", "indian", "new-age", "spiritual", "devotional", "pop", "electronic"],
    calm: ["meditation", "ambient", "new-age", "indian", "world-music", "classical", "spiritual", "flute"],
    focused: ["meditation", "indian", "new-age", "instrumental", "ambient", "world-music", "classical", "spiritual"],
    melancholy: ["meditation", "new-age", "indian", "world-music", "ambient", "acoustic", "spiritual"],
    stressed: ["meditation", "indian", "new-age", "ambient", "world-music", "classical", "spiritual", "healing"],
    relaxed: ["meditation", "new-age", "indian", "world-music", "ambient", "jazz", "spiritual", "classical"]
  };
  
  return genreMap[mood] || ["meditation", "new-age", "indian", "world-music"];
}

function formatTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (minutes < 1440) {
    return `${Math.floor(minutes / 60)} hours ago`;
  } else {
    return `${Math.floor(minutes / 1440)} days ago`;
  }
}

export { openai };