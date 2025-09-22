import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and preferences
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  spotifyId: text("spotify_id"),
  preferences: jsonb("preferences").$type<{
    musicGenres: string[];
    healthGoals: string[];
    moodPreferences: Record<string, string[]>;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Health metrics from various devices
export const healthMetrics = pgTable("health_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  deviceType: text("device_type").notNull(), // apple_watch, whoop, iphone, etc
  metricType: text("metric_type").notNull(), // heart_rate, steps, sleep_score, etc
  value: real("value").notNull(),
  unit: text("unit").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
});

// AI-powered mood analysis results
export const moodAnalysis = pgTable("mood_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  mood: text("mood").notNull(), // energetic, calm, focused, sad, etc
  confidence: real("confidence").notNull(), // 0-100
  factors: text("factors").array().notNull(), // contributing health factors
  description: text("description").notNull(),
  healthDataSnapshot: jsonb("health_data_snapshot").$type<Record<string, any>>(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Music recommendations based on mood
export const musicRecommendations = pgTable("music_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  moodAnalysisId: varchar("mood_analysis_id").notNull().references(() => moodAnalysis.id),
  spotifyTrackId: text("spotify_track_id").notNull(),
  trackName: text("track_name").notNull(),
  artistName: text("artist_name").notNull(),
  albumName: text("album_name").notNull(),
  moodMatch: real("mood_match").notNull(), // 0-100
  reason: text("reason").notNull(),
  audioFeatures: jsonb("audio_features").$type<{
    energy: number;
    valence: number;
    danceability: number;
    tempo: number;
  }>(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// User interactions with recommendations
export const userInteractions = pgTable("user_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  recommendationId: varchar("recommendation_id").notNull().references(() => musicRecommendations.id),
  action: text("action").notNull(), // liked, disliked, played, skipped
  timestamp: timestamp("timestamp").defaultNow(),
});

// Connected devices
export const connectedDevices = pgTable("connected_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  deviceName: text("device_name").notNull(),
  deviceType: text("device_type").notNull(),
  status: text("status").notNull().default("disconnected"), // connected, disconnected, syncing
  lastSync: timestamp("last_sync"),
  batteryLevel: integer("battery_level"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({
  id: true,
});

export const insertMoodAnalysisSchema = createInsertSchema(moodAnalysis).omit({
  id: true,
  timestamp: true,
});

export const insertMusicRecommendationSchema = createInsertSchema(musicRecommendations).omit({
  id: true,
  timestamp: true,
});

export const insertUserInteractionSchema = createInsertSchema(userInteractions).omit({
  id: true,
  timestamp: true,
});

export const insertConnectedDeviceSchema = createInsertSchema(connectedDevices).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;

export type MoodAnalysis = typeof moodAnalysis.$inferSelect;
export type InsertMoodAnalysis = z.infer<typeof insertMoodAnalysisSchema>;

export type MusicRecommendation = typeof musicRecommendations.$inferSelect;
export type InsertMusicRecommendation = z.infer<typeof insertMusicRecommendationSchema>;

export type UserInteraction = typeof userInteractions.$inferSelect;
export type InsertUserInteraction = z.infer<typeof insertUserInteractionSchema>;

export type ConnectedDevice = typeof connectedDevices.$inferSelect;
export type InsertConnectedDevice = z.infer<typeof insertConnectedDeviceSchema>;
