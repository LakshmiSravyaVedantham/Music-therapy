import { storage } from "../storage";
import { type InsertHealthMetric } from "@shared/schema";

// Simulate realistic health data patterns for demo purposes
export class HealthDataSimulator {
  private userId: string;
  private simulationInterval?: NodeJS.Timeout;

  constructor(userId: string) {
    this.userId = userId;
  }

  async startSimulation() {
    // Add some initial connected devices
    await this.initializeDevices();
    
    // Add initial health data
    await this.generateInitialHealthData();
    
    // Start continuous data generation
    this.simulationInterval = setInterval(() => {
      this.generateRealtimeHealthData();
    }, 30000); // Update every 30 seconds

    console.log("Health data simulation started for user:", this.userId);
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = undefined;
    }
    console.log("Health data simulation stopped for user:", this.userId);
  }

  private async initializeDevices() {
    const devices = [
      {
        userId: this.userId,
        deviceName: "Apple Watch Series 9",
        deviceType: "apple_watch",
        status: "connected",
        lastSync: new Date(),
        batteryLevel: 85,
        metadata: { model: "Series 9", version: "watchOS 10.1" }
      },
      {
        userId: this.userId,
        deviceName: "iPhone 15 Pro",
        deviceType: "iphone",
        status: "connected",
        lastSync: new Date(),
        batteryLevel: 67,
        metadata: { model: "iPhone 15 Pro", version: "iOS 17.1" }
      },
      {
        userId: this.userId,
        deviceName: "Whoop 4.0",
        deviceType: "whoop",
        status: "connected",
        lastSync: new Date(),
        batteryLevel: 45,
        metadata: { model: "4.0", firmware: "2.1.4" }
      }
    ];

    for (const device of devices) {
      await storage.addConnectedDevice(device);
    }
  }

  private async generateInitialHealthData() {
    const now = new Date();
    const metrics: InsertHealthMetric[] = [];

    // Generate historical data for the last 7 days
    for (let day = 6; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      
      // Heart rate data (multiple readings per day)
      for (let hour = 6; hour <= 22; hour += 2) {
        const timestamp = new Date(date);
        timestamp.setHours(hour, Math.random() * 60, 0, 0);
        
        metrics.push({
          userId: this.userId,
          deviceType: "apple_watch",
          metricType: "heart_rate",
          value: this.generateHeartRate(hour),
          unit: "bpm",
          timestamp
        });
      }

      // Daily step count
      const stepsTimestamp = new Date(date);
      stepsTimestamp.setHours(23, 59, 0, 0);
      metrics.push({
        userId: this.userId,
        deviceType: "iphone",
        metricType: "steps",
        value: this.generateSteps(),
        unit: "steps",
        timestamp: stepsTimestamp
      });

      // Sleep score (from previous night)
      if (day > 0) {
        const sleepTimestamp = new Date(date);
        sleepTimestamp.setHours(7, 0, 0, 0);
        metrics.push({
          userId: this.userId,
          deviceType: "whoop",
          metricType: "sleep_score",
          value: this.generateSleepScore(),
          unit: "score",
          timestamp: sleepTimestamp
        });
      }

      // Energy level (subjective, recorded in morning)
      const energyTimestamp = new Date(date);
      energyTimestamp.setHours(9, 0, 0, 0);
      metrics.push({
        userId: this.userId,
        deviceType: "whoop",
        metricType: "energy_level",
        value: this.generateEnergyLevel(),
        unit: "score",
        timestamp: energyTimestamp
      });

      // Stress level (HRV-based)
      const stressTimestamp = new Date(date);
      stressTimestamp.setHours(14, 0, 0, 0);
      metrics.push({
        userId: this.userId,
        deviceType: "apple_watch",
        metricType: "stress_level",
        value: this.generateStressLevel(),
        unit: "score",
        timestamp: stressTimestamp
      });
    }

    // Save all metrics
    for (const metric of metrics) {
      await storage.addHealthMetric(metric);
    }

    console.log(`Generated ${metrics.length} historical health data points`);
  }

  private async generateRealtimeHealthData() {
    const now = new Date();
    const currentHour = now.getHours();

    // Generate real-time heart rate
    const heartRateMetric: InsertHealthMetric = {
      userId: this.userId,
      deviceType: "apple_watch",
      metricType: "heart_rate",
      value: this.generateHeartRate(currentHour),
      unit: "bpm",
      timestamp: now
    };

    await storage.addHealthMetric(heartRateMetric);

    // Update daily step count (if it's daytime)
    if (currentHour >= 6 && currentHour <= 23) {
      const existingStepsToday = await storage.getHealthMetricsByType(
        this.userId, 
        "steps", 
        1
      );
      
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const needsStepUpdate = existingStepsToday.length === 0 || 
        new Date(existingStepsToday[0].timestamp) < todayStart;

      if (needsStepUpdate) {
        const stepsMetric: InsertHealthMetric = {
          userId: this.userId,
          deviceType: "iphone",
          metricType: "steps",
          value: this.generateCurrentSteps(currentHour),
          unit: "steps",
          timestamp: now
        };
        await storage.addHealthMetric(stepsMetric);
      }
    }

    // Periodically update stress level
    if (Math.random() < 0.3) { // 30% chance each cycle
      const stressMetric: InsertHealthMetric = {
        userId: this.userId,
        deviceType: "apple_watch",
        metricType: "stress_level",
        value: this.generateStressLevel(),
        unit: "score",
        timestamp: now
      };
      await storage.addHealthMetric(stressMetric);
    }
  }

  private generateHeartRate(hour: number): number {
    // Simulate realistic heart rate patterns throughout the day
    let baseRate = 72;
    
    if (hour >= 6 && hour <= 8) {
      baseRate = 65; // Lower in early morning
    } else if (hour >= 9 && hour <= 11) {
      baseRate = 78; // Slightly elevated in morning
    } else if (hour >= 12 && hour <= 14) {
      baseRate = 75; // Lunch time
    } else if (hour >= 15 && hour <= 17) {
      baseRate = 82; // Afternoon activity
    } else if (hour >= 18 && hour <= 20) {
      baseRate = 85; // Evening activity
    } else if (hour >= 21 && hour <= 23) {
      baseRate = 70; // Wind down
    }

    // Add realistic variation
    const variation = (Math.random() - 0.5) * 20;
    return Math.round(Math.max(50, Math.min(120, baseRate + variation)));
  }

  private generateSteps(): number {
    // Generate daily step count (realistic range)
    const baseSteps = 6000;
    const variation = (Math.random() - 0.5) * 4000;
    return Math.round(Math.max(2000, Math.min(15000, baseSteps + variation)));
  }

  private generateCurrentSteps(hour: number): number {
    // Generate progressive step count throughout the day
    const dailyTarget = this.generateSteps();
    const progressRatio = Math.max(0, (hour - 6) / 17); // Active hours 6-23
    return Math.round(dailyTarget * progressRatio * (0.8 + Math.random() * 0.4));
  }

  private generateSleepScore(): number {
    // Generate sleep quality score (0-100)
    const baseSleep = 80;
    const variation = (Math.random() - 0.5) * 30;
    return Math.round(Math.max(40, Math.min(100, baseSleep + variation)));
  }

  private generateEnergyLevel(): number {
    // Generate energy level (1-10 scale)
    const baseEnergy = 7;
    const variation = (Math.random() - 0.5) * 4;
    return Math.round(Math.max(1, Math.min(10, baseEnergy + variation)));
  }

  private generateStressLevel(): number {
    // Generate stress level (0-100, lower is better)
    const baseStress = 30;
    const variation = (Math.random() - 0.5) * 40;
    return Math.round(Math.max(0, Math.min(100, baseStress + variation)));
  }
}

// Export singleton instance for the demo user
export const healthSimulator = new HealthDataSimulator("demo_user_id");