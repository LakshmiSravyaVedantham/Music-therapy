import { 
  type User, 
  type InsertUser,
  type HealthMetric,
  type InsertHealthMetric,
  type MoodAnalysis,
  type InsertMoodAnalysis,
  type MusicRecommendation,
  type InsertMusicRecommendation,
  type UserInteraction,
  type InsertUserInteraction,
  type ConnectedDevice,
  type InsertConnectedDevice
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Health metrics operations
  getHealthMetrics(userId: string, limit?: number): Promise<HealthMetric[]>;
  getHealthMetricsByType(userId: string, metricType: string, limit?: number): Promise<HealthMetric[]>;
  addHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric>;
  getLatestHealthMetrics(userId: string): Promise<Record<string, HealthMetric>>;

  // Mood analysis operations
  getMoodAnalysis(userId: string, limit?: number): Promise<MoodAnalysis[]>;
  getLatestMoodAnalysis(userId: string): Promise<MoodAnalysis | undefined>;
  addMoodAnalysis(analysis: InsertMoodAnalysis): Promise<MoodAnalysis>;

  // Music recommendations operations
  getMusicRecommendations(userId: string, moodAnalysisId?: string): Promise<MusicRecommendation[]>;
  addMusicRecommendation(recommendation: InsertMusicRecommendation): Promise<MusicRecommendation>;

  // User interactions operations
  getUserInteractions(userId: string): Promise<UserInteraction[]>;
  addUserInteraction(interaction: InsertUserInteraction): Promise<UserInteraction>;

  // Connected devices operations
  getConnectedDevices(userId: string): Promise<ConnectedDevice[]>;
  addConnectedDevice(device: InsertConnectedDevice): Promise<ConnectedDevice>;
  updateDeviceStatus(deviceId: string, status: string, lastSync?: Date): Promise<ConnectedDevice | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private healthMetrics: Map<string, HealthMetric>;
  private moodAnalyses: Map<string, MoodAnalysis>;
  private musicRecommendations: Map<string, MusicRecommendation>;
  private userInteractions: Map<string, UserInteraction>;
  private connectedDevices: Map<string, ConnectedDevice>;

  constructor() {
    this.users = new Map();
    this.healthMetrics = new Map();
    this.moodAnalyses = new Map();
    this.musicRecommendations = new Map();
    this.userInteractions = new Map();
    this.connectedDevices = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      spotifyId: insertUser.spotifyId || null,
      preferences: insertUser.preferences || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates } as User;
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Health metrics operations
  async getHealthMetrics(userId: string, limit: number = 100): Promise<HealthMetric[]> {
    return Array.from(this.healthMetrics.values())
      .filter(metric => metric.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getHealthMetricsByType(userId: string, metricType: string, limit: number = 100): Promise<HealthMetric[]> {
    return Array.from(this.healthMetrics.values())
      .filter(metric => metric.userId === userId && metric.metricType === metricType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async addHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const id = randomUUID();
    const healthMetric: HealthMetric = { ...metric, id, metadata: metric.metadata || null };
    this.healthMetrics.set(id, healthMetric);
    return healthMetric;
  }

  async getLatestHealthMetrics(userId: string): Promise<Record<string, HealthMetric>> {
    const metrics = Array.from(this.healthMetrics.values())
      .filter(metric => metric.userId === userId);
    
    const latest: Record<string, HealthMetric> = {};
    metrics.forEach(metric => {
      if (!latest[metric.metricType] || 
          new Date(metric.timestamp) > new Date(latest[metric.metricType].timestamp)) {
        latest[metric.metricType] = metric;
      }
    });
    
    return latest;
  }

  // Mood analysis operations
  async getMoodAnalysis(userId: string, limit: number = 50): Promise<MoodAnalysis[]> {
    return Array.from(this.moodAnalyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, limit);
  }

  async getLatestMoodAnalysis(userId: string): Promise<MoodAnalysis | undefined> {
    return Array.from(this.moodAnalyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())[0];
  }

  async addMoodAnalysis(analysis: InsertMoodAnalysis): Promise<MoodAnalysis> {
    const id = randomUUID();
    const moodAnalysis: MoodAnalysis = { ...analysis, id, timestamp: new Date(), healthDataSnapshot: analysis.healthDataSnapshot || null };
    this.moodAnalyses.set(id, moodAnalysis);
    return moodAnalysis;
  }

  // Music recommendations operations
  async getMusicRecommendations(userId: string, moodAnalysisId?: string): Promise<MusicRecommendation[]> {
    return Array.from(this.musicRecommendations.values())
      .filter(rec => rec.userId === userId && (!moodAnalysisId || rec.moodAnalysisId === moodAnalysisId))
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  }

  async addMusicRecommendation(recommendation: InsertMusicRecommendation): Promise<MusicRecommendation> {
    const id = randomUUID();
    const musicRecommendation: MusicRecommendation = { ...recommendation, id, timestamp: new Date(), audioFeatures: recommendation.audioFeatures || null };
    this.musicRecommendations.set(id, musicRecommendation);
    return musicRecommendation;
  }

  // User interactions operations
  async getUserInteractions(userId: string): Promise<UserInteraction[]> {
    return Array.from(this.userInteractions.values())
      .filter(interaction => interaction.userId === userId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  }

  async addUserInteraction(interaction: InsertUserInteraction): Promise<UserInteraction> {
    const id = randomUUID();
    const userInteraction: UserInteraction = { ...interaction, id, timestamp: new Date() };
    this.userInteractions.set(id, userInteraction);
    return userInteraction;
  }

  // Connected devices operations
  async getConnectedDevices(userId: string): Promise<ConnectedDevice[]> {
    return Array.from(this.connectedDevices.values())
      .filter(device => device.userId === userId);
  }

  async addConnectedDevice(device: InsertConnectedDevice): Promise<ConnectedDevice> {
    const id = randomUUID();
    const connectedDevice: ConnectedDevice = { ...device, id, status: device.status || "disconnected", metadata: device.metadata || null, lastSync: device.lastSync || null, batteryLevel: device.batteryLevel || null };
    this.connectedDevices.set(id, connectedDevice);
    return connectedDevice;
  }

  async updateDeviceStatus(deviceId: string, status: string, lastSync?: Date): Promise<ConnectedDevice | undefined> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) return undefined;
    
    const updatedDevice = { ...device, status, lastSync: lastSync || device.lastSync };
    this.connectedDevices.set(deviceId, updatedDevice);
    return updatedDevice;
  }
}

export const storage = new MemStorage();
