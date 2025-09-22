import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeMoodFromHealthData } from "./services/openai";
import { getRecommendationsBasedOnMood } from "./services/spotify";
import { insertHealthMetricSchema, insertMoodAnalysisSchema, insertUserInteractionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // For demo purposes, create a demo user
  let demoUser = await storage.getUserByEmail("demo@healthtune.app");
  if (!demoUser) {
    demoUser = await storage.createUser({
      username: "demo_user",
      email: "demo@healthtune.app",
      preferences: {
        musicGenres: ["pop", "electronic", "indie"],
        healthGoals: ["improve_sleep", "increase_activity", "reduce_stress"],
        moodPreferences: {
          energetic: ["electronic", "pop", "dance"],
          calm: ["ambient", "classical", "acoustic"],
          focused: ["lo-fi", "instrumental", "classical"]
        }
      }
    });
  }

  // Health metrics endpoints
  app.get("/api/health/metrics", async (req, res) => {
    try {
      const metrics = await storage.getHealthMetrics(demoUser!.id, 50);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch health metrics" });
    }
  });

  app.get("/api/health/metrics/latest", async (req, res) => {
    try {
      const latestMetrics = await storage.getLatestHealthMetrics(demoUser!.id);
      res.json(latestMetrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest health metrics" });
    }
  });

  app.post("/api/health/metrics", async (req, res) => {
    try {
      const validatedMetric = insertHealthMetricSchema.parse({
        ...req.body,
        userId: demoUser!.id,
        timestamp: new Date(req.body.timestamp || Date.now())
      });
      
      const metric = await storage.addHealthMetric(validatedMetric);
      res.json(metric);
    } catch (error) {
      res.status(400).json({ error: "Invalid health metric data" });
    }
  });

  // Mood analysis endpoints
  app.get("/api/mood/analysis", async (req, res) => {
    try {
      const analyses = await storage.getMoodAnalysis(demoUser!.id, 20);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mood analyses" });
    }
  });

  app.get("/api/mood/analysis/latest", async (req, res) => {
    try {
      const latestAnalysis = await storage.getLatestMoodAnalysis(demoUser!.id);
      res.json(latestAnalysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest mood analysis" });
    }
  });

  app.post("/api/mood/analyze", async (req, res) => {
    try {
      // Get latest health metrics for analysis
      const healthMetrics = await storage.getLatestHealthMetrics(demoUser!.id);
      
      if (Object.keys(healthMetrics).length === 0) {
        return res.status(400).json({ error: "No health data available for mood analysis" });
      }

      // Analyze mood using OpenAI
      const moodResult = await analyzeMoodFromHealthData(
        healthMetrics,
        demoUser!.preferences || undefined
      );

      // Save the mood analysis
      const moodAnalysis = await storage.addMoodAnalysis({
        userId: demoUser!.id,
        mood: moodResult.mood,
        confidence: moodResult.confidence,
        factors: moodResult.factors,
        description: moodResult.description,
        healthDataSnapshot: healthMetrics
      });

      res.json({
        analysis: moodAnalysis,
        recommendations: moodResult.recommendations
      });
    } catch (error) {
      console.error("Mood analysis error:", error);
      res.status(500).json({ error: "Failed to analyze mood" });
    }
  });

  // Music recommendations endpoints
  app.get("/api/music/recommendations", async (req, res) => {
    try {
      const { moodAnalysisId } = req.query;
      const recommendations = await storage.getMusicRecommendations(
        demoUser!.id, 
        moodAnalysisId as string
      );
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch music recommendations" });
    }
  });

  app.post("/api/music/recommendations", async (req, res) => {
    try {
      // Get the latest mood analysis
      const latestMoodAnalysis = await storage.getLatestMoodAnalysis(demoUser!.id);
      
      if (!latestMoodAnalysis) {
        return res.status(400).json({ error: "No mood analysis available. Please analyze mood first." });
      }

      // Get recommendations from Spotify based on mood
      const spotifyRecommendations = await getRecommendationsBasedOnMood(
        {
          mood: latestMoodAnalysis.mood,
          confidence: latestMoodAnalysis.confidence,
          factors: latestMoodAnalysis.factors,
          description: latestMoodAnalysis.description,
          recommendations: {
            energyLevel: "medium", // This would come from the mood analysis
            musicGenres: demoUser!.preferences?.musicGenres || ["pop"],
            tempo: "medium",
            valence: "medium"
          }
        },
        demoUser!.preferences || undefined,
        10
      );

      // Save recommendations to storage
      const savedRecommendations = await Promise.all(
        spotifyRecommendations.map(track => 
          storage.addMusicRecommendation({
            userId: demoUser!.id,
            moodAnalysisId: latestMoodAnalysis.id,
            spotifyTrackId: track.id,
            trackName: track.name,
            artistName: track.artist,
            albumName: track.album,
            moodMatch: track.moodMatch,
            reason: track.reason,
            audioFeatures: track.audioFeatures
          })
        )
      );

      res.json(savedRecommendations);
    } catch (error) {
      console.error("Music recommendation error:", error);
      res.status(500).json({ error: "Failed to generate music recommendations" });
    }
  });

  // User interaction endpoints
  app.post("/api/music/interaction", async (req, res) => {
    try {
      const validatedInteraction = insertUserInteractionSchema.parse({
        ...req.body,
        userId: demoUser!.id
      });
      
      const interaction = await storage.addUserInteraction(validatedInteraction);
      res.json(interaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid interaction data" });
    }
  });

  // Connected devices endpoints
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getConnectedDevices(demoUser!.id);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch connected devices" });
    }
  });

  app.post("/api/devices/sync", async (req, res) => {
    try {
      const { deviceId } = req.body;
      
      if (!deviceId) {
        return res.status(400).json({ error: "Device ID required" });
      }

      const updatedDevice = await storage.updateDeviceStatus(
        deviceId, 
        "syncing", 
        new Date()
      );
      
      if (!updatedDevice) {
        return res.status(404).json({ error: "Device not found" });
      }

      // Simulate sync completion after 2 seconds
      setTimeout(async () => {
        await storage.updateDeviceStatus(deviceId, "connected", new Date());
      }, 2000);

      res.json(updatedDevice);
    } catch (error) {
      res.status(500).json({ error: "Failed to sync device" });
    }
  });

  // User preferences endpoints
  app.get("/api/user/preferences", async (req, res) => {
    try {
      const user = await storage.getUser(demoUser!.id);
      res.json(user?.preferences || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user preferences" });
    }
  });

  app.put("/api/user/preferences", async (req, res) => {
    try {
      const updatedUser = await storage.updateUser(demoUser!.id, {
        preferences: req.body
      });
      res.json(updatedUser?.preferences);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user preferences" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
