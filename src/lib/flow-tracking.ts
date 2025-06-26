import {
  FlowEntry,
  FlowPattern,
  FlowInsights,
  FlowTrackingSettings,
} from "@/types";

// Storage keys for flow tracking
const FLOW_STORAGE_KEYS = {
  ENTRIES: "flowtracker_flow_entries",
  SETTINGS: "flowtracker_flow_settings",
} as const;

// Default settings
export const DEFAULT_FLOW_SETTINGS: FlowTrackingSettings = {
  isEnabled: false,
  interval: 60, // 1 hour
  quietHours: { start: "22:00", end: "08:00" },
  trackingDays: [1, 2, 3, 4, 5], // Monday to Friday
  autoDetectActivity: false,
  showFlowInsights: true,
  minimumEntriesForInsights: 10,
  promptStyle: "gentle",
};

// Storage functions
export function getFlowEntries(): FlowEntry[] {
  try {
    const stored = localStorage.getItem(FLOW_STORAGE_KEYS.ENTRIES);
    if (!stored) return [];

    const entries = JSON.parse(stored);
    return entries.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
      createdAt: new Date(entry.createdAt),
    }));
  } catch (error) {
    console.error("Error loading flow entries:", error);
    return [];
  }
}

export function saveFlowEntry(entry: FlowEntry): void {
  try {
    const entries = getFlowEntries();
    entries.push(entry);
    localStorage.setItem(FLOW_STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error("Error saving flow entry:", error);
  }
}

export function getFlowSettings(): FlowTrackingSettings {
  try {
    const stored = localStorage.getItem(FLOW_STORAGE_KEYS.SETTINGS);
    return stored
      ? { ...DEFAULT_FLOW_SETTINGS, ...JSON.parse(stored) }
      : DEFAULT_FLOW_SETTINGS;
  } catch (error) {
    console.error("Error loading flow settings:", error);
    return DEFAULT_FLOW_SETTINGS;
  }
}

export function saveFlowSettings(settings: FlowTrackingSettings): void {
  try {
    localStorage.setItem(FLOW_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving flow settings:", error);
  }
}

// Analytics functions
export function generateFlowPatterns(entries: FlowEntry[]): FlowPattern[] {
  if (entries.length === 0) return [];

  const patterns: Map<string, FlowPattern> = new Map();

  entries.forEach((entry) => {
    const hour = entry.timestamp.getHours();
    const dayOfWeek = entry.timestamp.getDay();
    const timeOfDay = `${hour.toString().padStart(2, "0")}:00`;
    const key = `${dayOfWeek}-${hour}`;

    if (!patterns.has(key)) {
      patterns.set(key, {
        timeOfDay,
        hour,
        dayOfWeek,
        averageFlowRating: 0,
        averageMood: 0,
        averageEnergyLevel: 0,
        activityCount: 0,
        commonActivities: [],
        bestActivities: [],
        worstActivities: [],
      });
    }

    const pattern = patterns.get(key)!;
    pattern.activityCount++;

    // Update averages
    pattern.averageFlowRating =
      (pattern.averageFlowRating * (pattern.activityCount - 1) +
        entry.flowRating) /
      pattern.activityCount;
    pattern.averageMood =
      (pattern.averageMood * (pattern.activityCount - 1) + entry.mood) /
      pattern.activityCount;
    pattern.averageEnergyLevel =
      (pattern.averageEnergyLevel * (pattern.activityCount - 1) +
        entry.energyLevel) /
      pattern.activityCount;
  });

  // Calculate common activities for each pattern
  patterns.forEach((pattern, key) => {
    const patternEntries = entries.filter((entry) => {
      const hour = entry.timestamp.getHours();
      const dayOfWeek = entry.timestamp.getDay();
      return `${dayOfWeek}-${hour}` === key;
    });

    const activityMap = new Map<
      string,
      { count: number; totalRating: number }
    >();

    patternEntries.forEach((entry) => {
      const existing = activityMap.get(entry.activity) || {
        count: 0,
        totalRating: 0,
      };
      activityMap.set(entry.activity, {
        count: existing.count + 1,
        totalRating: existing.totalRating + entry.flowRating,
      });
    });

    pattern.commonActivities = Array.from(activityMap.entries())
      .map(([activity, data]) => ({
        activity,
        count: data.count,
        avgRating: data.totalRating / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    pattern.bestActivities = pattern.commonActivities
      .filter((a) => a.avgRating >= 3.5)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 3);

    pattern.worstActivities = pattern.commonActivities
      .filter((a) => a.avgRating <= 2.5)
      .sort((a, b) => a.avgRating - b.avgRating)
      .slice(0, 3);
  });

  return Array.from(patterns.values());
}

export function generateFlowInsights(entries: FlowEntry[]): FlowInsights {
  if (entries.length < 5) {
    return {
      peakFlowHours: [],
      lowFlowHours: [],
      bestActivitiesForMorning: [],
      bestActivitiesForAfternoon: [],
      activitiesToAvoid: [],
      optimalFlowPattern: { morning: [], afternoon: [] },
      weeklyTrends: {},
      improvementSuggestions: [
        "Keep tracking your activities to build enough data for insights!",
        "Try to log your flow state at least twice per day.",
        "After 10+ entries, you'll start seeing personalized patterns.",
      ],
      dataQuality: {
        totalEntries: entries.length,
        daysTracked: new Set(entries.map((e) => e.timestamp.toDateString()))
          .size,
        entriesNeededForBetterInsights: Math.max(0, 10 - entries.length),
      },
    };
  }

  const patterns = generateFlowPatterns(entries);

  // Calculate peak and low flow hours
  const hourlyFlow = new Map<number, { totalFlow: number; count: number }>();

  entries.forEach((entry) => {
    const hour = entry.timestamp.getHours();
    const existing = hourlyFlow.get(hour) || { totalFlow: 0, count: 0 };
    hourlyFlow.set(hour, {
      totalFlow: existing.totalFlow + entry.flowRating,
      count: existing.count + 1,
    });
  });

  const hourlyAverages = Array.from(hourlyFlow.entries())
    .map(([hour, data]) => ({
      hour,
      avgFlow: data.totalFlow / data.count,
    }))
    .sort((a, b) => b.avgFlow - a.avgFlow);

  const peakFlowHours = hourlyAverages
    .filter((h) => h.avgFlow >= 3.5)
    .slice(0, 4)
    .map((h) => h.hour);

  const lowFlowHours = hourlyAverages
    .filter((h) => h.avgFlow <= 2.5)
    .slice(-3)
    .map((h) => h.hour);

  // Best activities by time of day
  const morningEntries = entries.filter((e) => e.timestamp.getHours() < 12);
  const afternoonEntries = entries.filter((e) => e.timestamp.getHours() >= 12);

  const getBestActivities = (entriesSubset: FlowEntry[]) => {
    const activityMap = new Map<string, { totalFlow: number; count: number }>();

    entriesSubset.forEach((entry) => {
      const existing = activityMap.get(entry.activity) || {
        totalFlow: 0,
        count: 0,
      };
      activityMap.set(entry.activity, {
        totalFlow: existing.totalFlow + entry.flowRating,
        count: existing.count + 1,
      });
    });

    return Array.from(activityMap.entries())
      .map(([activity, data]) => ({
        activity,
        avgFlow: data.totalFlow / data.count,
        count: data.count,
      }))
      .filter((a) => a.avgFlow >= 3.5 && a.count >= 2)
      .sort((a, b) => b.avgFlow - a.avgFlow)
      .slice(0, 3)
      .map((a) => a.activity);
  };

  const bestActivitiesForMorning = getBestActivities(morningEntries);
  const bestActivitiesForAfternoon = getBestActivities(afternoonEntries);

  // Activities to avoid
  const allActivities = new Map<string, { totalFlow: number; count: number }>();
  entries.forEach((entry) => {
    const existing = allActivities.get(entry.activity) || {
      totalFlow: 0,
      count: 0,
    };
    allActivities.set(entry.activity, {
      totalFlow: existing.totalFlow + entry.flowRating,
      count: existing.count + 1,
    });
  });

  const activitiesToAvoid = Array.from(allActivities.entries())
    .map(([activity, data]) => ({
      activity,
      avgFlow: data.totalFlow / data.count,
      count: data.count,
    }))
    .filter((a) => a.avgFlow <= 2.5 && a.count >= 2)
    .sort((a, b) => a.avgFlow - b.avgFlow)
    .slice(0, 3)
    .map((a) => a.activity);

  // Weekly trends
  const weeklyTrends: {
    [key: string]: { day: string; avgFlow: number; bestActivity: string };
  } = {};
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  for (let day = 0; day < 7; day++) {
    const dayEntries = entries.filter((e) => e.timestamp.getDay() === day);
    if (dayEntries.length > 0) {
      const avgFlow =
        dayEntries.reduce((sum, e) => sum + e.flowRating, 0) /
        dayEntries.length;

      const dayActivities = new Map<
        string,
        { totalFlow: number; count: number }
      >();
      dayEntries.forEach((entry) => {
        const existing = dayActivities.get(entry.activity) || {
          totalFlow: 0,
          count: 0,
        };
        dayActivities.set(entry.activity, {
          totalFlow: existing.totalFlow + entry.flowRating,
          count: existing.count + 1,
        });
      });

      const bestActivity =
        Array.from(dayActivities.entries())
          .map(([activity, data]) => ({
            activity,
            avgFlow: data.totalFlow / data.count,
          }))
          .sort((a, b) => b.avgFlow - a.avgFlow)[0]?.activity || "No data";

      weeklyTrends[dayNames[day]] = {
        day: dayNames[day],
        avgFlow: Math.round(avgFlow * 10) / 10,
        bestActivity,
      };
    }
  }

  // Generate improvement suggestions
  const suggestions: string[] = [];

  if (peakFlowHours.length > 0) {
    const peakHourStr = peakFlowHours.map((h) => `${h}:00`).join(", ");
    suggestions.push(
      `Schedule your most important work during ${peakHourStr} when your flow is highest.`,
    );
  }

  if (bestActivitiesForMorning.length > 0) {
    suggestions.push(
      `You perform best at ${bestActivitiesForMorning.slice(0, 2).join(" and ")} in the morning.`,
    );
  }

  if (bestActivitiesForAfternoon.length > 0) {
    suggestions.push(
      `Afternoons are great for ${bestActivitiesForAfternoon.slice(0, 2).join(" and ")}.`,
    );
  }

  if (activitiesToAvoid.length > 0) {
    suggestions.push(
      `Consider rescheduling ${activitiesToAvoid[0]} to a different time when possible.`,
    );
  }

  if (lowFlowHours.length > 0) {
    suggestions.push(
      `Avoid demanding tasks during ${lowFlowHours.map((h) => `${h}:00`).join(", ")} when your energy is typically lower.`,
    );
  }

  const totalDays = new Set(entries.map((e) => e.timestamp.toDateString()))
    .size;
  if (totalDays >= 7) {
    const avgDailyEntries = entries.length / totalDays;
    if (avgDailyEntries < 3) {
      suggestions.push(
        "Try tracking your flow state more frequently (3-4 times per day) for better insights.",
      );
    }
  }

  return {
    peakFlowHours,
    lowFlowHours,
    bestActivitiesForMorning,
    bestActivitiesForAfternoon,
    activitiesToAvoid,
    optimalFlowPattern: {
      morning: bestActivitiesForMorning.map((activity, index) => ({
        time: `${8 + index}:00`,
        activity,
        expectedFlow: 4.2 - index * 0.2,
      })),
      afternoon: bestActivitiesForAfternoon.map((activity, index) => ({
        time: `${13 + index}:00`,
        activity,
        expectedFlow: 3.8 - index * 0.2,
      })),
    },
    weeklyTrends,
    improvementSuggestions: suggestions,
    dataQuality: {
      totalEntries: entries.length,
      daysTracked: totalDays,
      entriesNeededForBetterInsights: Math.max(0, 20 - entries.length),
    },
  };
}

// Flow tracking session management
export class FlowTrackingSession {
  private intervalId: number | null = null;
  private settings: FlowTrackingSettings;
  private onPrompt: () => void;

  constructor(onPrompt: () => void) {
    this.onPrompt = onPrompt;
    this.settings = getFlowSettings();
  }

  start(): void {
    if (!this.settings.isEnabled || this.intervalId !== null) return;

    this.scheduleNextPrompt();
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  updateSettings(settings: FlowTrackingSettings): void {
    this.settings = settings;
    saveFlowSettings(settings);

    if (settings.isEnabled) {
      this.restart();
    } else {
      this.stop();
    }
  }

  private restart(): void {
    this.stop();
    this.start();
  }

  private scheduleNextPrompt(): void {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if tracking is enabled for today
    if (!this.settings.trackingDays.includes(currentDay)) {
      // Schedule for next tracking day
      this.scheduleForNextTrackingDay();
      return;
    }

    // Check quiet hours
    const quietStart = this.parseTime(this.settings.quietHours.start);
    const quietEnd = this.parseTime(this.settings.quietHours.end);
    const currentTime = currentHour * 60 + currentMinute;

    let isQuietTime = false;
    if (quietStart < quietEnd) {
      // Same day quiet hours (e.g., 22:00 to 08:00 next day)
      isQuietTime = currentTime >= quietStart || currentTime <= quietEnd;
    } else {
      // Quiet hours span midnight
      isQuietTime = currentTime >= quietStart && currentTime <= quietEnd;
    }

    if (isQuietTime) {
      // Schedule for when quiet hours end
      const quietEndMinutes = this.parseTime(this.settings.quietHours.end);
      const minutesUntilEnd =
        quietEndMinutes > currentTime
          ? quietEndMinutes - currentTime
          : 24 * 60 - currentTime + quietEndMinutes;

      this.intervalId = window.setTimeout(
        () => {
          this.scheduleNextPrompt();
        },
        minutesUntilEnd * 60 * 1000,
      );
      return;
    }

    // Schedule next prompt based on interval
    const intervalMs = this.settings.interval * 60 * 1000;
    this.intervalId = window.setTimeout(() => {
      this.onPrompt();
      this.scheduleNextPrompt();
    }, intervalMs);
  }

  private scheduleForNextTrackingDay(): void {
    const now = new Date();
    const currentDay = now.getDay();

    // Find next tracking day
    let nextTrackingDay = -1;
    for (let i = 1; i <= 7; i++) {
      const checkDay = (currentDay + i) % 7;
      if (this.settings.trackingDays.includes(checkDay)) {
        nextTrackingDay = checkDay;
        break;
      }
    }

    if (nextTrackingDay === -1) return; // No tracking days configured

    // Calculate milliseconds until next tracking day at quiet hours end
    const daysUntil =
      nextTrackingDay > currentDay
        ? nextTrackingDay - currentDay
        : 7 - currentDay + nextTrackingDay;

    const quietEndMinutes = this.parseTime(this.settings.quietHours.end);
    const msUntilNextDay = daysUntil * 24 * 60 * 60 * 1000;
    const msUntilQuietEnd = quietEndMinutes * 60 * 1000;

    this.intervalId = window.setTimeout(() => {
      this.scheduleNextPrompt();
    }, msUntilNextDay + msUntilQuietEnd);
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }
}

// Utility functions
export function createFlowEntry(
  data: Omit<FlowEntry, "id" | "createdAt">,
): FlowEntry {
  return {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  };
}

export function getRecentFlowEntries(days: number = 7): FlowEntry[] {
  const entries = getFlowEntries();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return entries.filter((entry) => entry.timestamp >= cutoffDate);
}

export function getFlowSummary(entries: FlowEntry[]) {
  if (entries.length === 0) {
    return {
      averageFlow: 0,
      averageMood: 0,
      averageEnergy: 0,
      totalEntries: 0,
      daysTracked: 0,
      mostCommonActivity: "No data",
      bestFlowActivity: "No data",
    };
  }

  const totalFlow = entries.reduce((sum, e) => sum + e.flowRating, 0);
  const totalMood = entries.reduce((sum, e) => sum + e.mood, 0);
  const totalEnergy = entries.reduce((sum, e) => sum + e.energyLevel, 0);

  const activityCounts = new Map<string, number>();
  const activityFlows = new Map<string, { total: number; count: number }>();

  entries.forEach((entry) => {
    // Count activities
    activityCounts.set(
      entry.activity,
      (activityCounts.get(entry.activity) || 0) + 1,
    );

    // Track flow by activity
    const existing = activityFlows.get(entry.activity) || {
      total: 0,
      count: 0,
    };
    activityFlows.set(entry.activity, {
      total: existing.total + entry.flowRating,
      count: existing.count + 1,
    });
  });

  const mostCommonActivity =
    Array.from(activityCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "No data";

  const bestFlowActivity =
    Array.from(activityFlows.entries())
      .map(([activity, data]) => ({
        activity,
        avgFlow: data.total / data.count,
      }))
      .sort((a, b) => b.avgFlow - a.avgFlow)[0]?.activity || "No data";

  return {
    averageFlow: Math.round((totalFlow / entries.length) * 10) / 10,
    averageMood: Math.round((totalMood / entries.length) * 10) / 10,
    averageEnergy: Math.round((totalEnergy / entries.length) * 10) / 10,
    totalEntries: entries.length,
    daysTracked: new Set(entries.map((e) => e.timestamp.toDateString())).size,
    mostCommonActivity,
    bestFlowActivity,
  };
}
