interface FlowRitual {
  id: string;
  name: string;
  duration: number;
  description: string;
  completed: boolean;
  completedAt?: Date;
  isCore: boolean;
}

interface FlowState {
  energy: "low" | "medium" | "high";
  focus: "scattered" | "calm" | "sharp";
  mood: "challenged" | "neutral" | "inspired";
  environment: "chaotic" | "okay" | "optimal";
  assessedAt: Date;
}

interface FlowSession {
  id: string;
  date: string; // YYYY-MM-DD
  rituals: FlowRitual[];
  flowState: FlowState;
  intention: string;
  completedAt?: Date;
  phase: "foundation" | "building" | "mastery";
  dayNumber: number;
}

interface FlowIdentity {
  archetype: string;
  startDate: Date;
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  currentPhase: "foundation" | "building" | "mastery";
}

interface FlowProgress {
  dailySessions: FlowSession[];
  identity: FlowIdentity;
  achievements: FlowAchievement[];
  patterns: FlowPattern[];
}

interface FlowAchievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: Date;
  type: "streak" | "ritual" | "phase" | "mastery";
}

interface FlowPattern {
  type: "energy" | "focus" | "ritual" | "timing";
  pattern: string;
  confidence: number;
  lastUpdated: Date;
}

const FLOW_STORAGE_KEY = "flow-tracker-flow-data";

// Initialize flow journey
export function initializeFlowJourney(archetype: string): FlowIdentity {
  const identity: FlowIdentity = {
    archetype,
    startDate: new Date(),
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    currentPhase: "foundation",
  };

  const flowData: FlowProgress = {
    dailySessions: [],
    identity,
    achievements: [],
    patterns: [],
  };

  localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(flowData));
  return identity;
}

// Get current flow data
export function getFlowProgress(): FlowProgress | null {
  try {
    const data = localStorage.getItem(FLOW_STORAGE_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data);

    // Convert date strings back to Date objects
    if (parsed.identity?.startDate) {
      parsed.identity.startDate = new Date(parsed.identity.startDate);
    }

    parsed.dailySessions =
      parsed.dailySessions?.map((session: any) => ({
        ...session,
        flowState: {
          ...session.flowState,
          assessedAt: session.flowState.assessedAt
            ? new Date(session.flowState.assessedAt)
            : new Date(),
        },
        rituals: session.rituals?.map((ritual: any) => ({
          ...ritual,
          completedAt: ritual.completedAt
            ? new Date(ritual.completedAt)
            : undefined,
        })),
        completedAt: session.completedAt
          ? new Date(session.completedAt)
          : undefined,
      })) || [];

    parsed.achievements =
      parsed.achievements?.map((achievement: any) => ({
        ...achievement,
        unlockedAt: new Date(achievement.unlockedAt),
      })) || [];

    return parsed;
  } catch (error) {
    console.error("Error loading flow progress:", error);
    return null;
  }
}

// Save today's flow session
export function saveFlowSession(
  session: Omit<FlowSession, "id" | "dayNumber" | "phase">,
): void {
  try {
    const flowData = getFlowProgress() || {
      dailySessions: [],
      identity: initializeFlowJourney("Deep Worker"),
      achievements: [],
      patterns: [],
    };

    const today = new Date().toISOString().split("T")[0];
    const existingIndex = flowData.dailySessions.findIndex(
      (s) => s.date === today,
    );

    const dayNumber = calculateDayNumber(flowData.identity.startDate);
    const phase = getPhaseForDay(dayNumber);

    const fullSession: FlowSession = {
      ...session,
      id: `flow-${today}`,
      dayNumber,
      phase,
    };

    if (existingIndex >= 0) {
      flowData.dailySessions[existingIndex] = fullSession;
    } else {
      flowData.dailySessions.push(fullSession);
    }

    // Update identity stats
    updateFlowIdentity(flowData);

    // Check for new achievements
    checkFlowAchievements(flowData);

    // Update patterns
    updateFlowPatterns(flowData);

    localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(flowData));
  } catch (error) {
    console.error("Error saving flow session:", error);
  }
}

// Get today's flow session
export function getTodayFlowSession(): FlowSession | null {
  const flowData = getFlowProgress();
  if (!flowData) return null;

  const today = new Date().toISOString().split("T")[0];
  return flowData.dailySessions.find((s) => s.date === today) || null;
}

// Update flow identity stats
function updateFlowIdentity(flowData: FlowProgress): void {
  const today = new Date().toISOString().split("T")[0];
  const todaySession = flowData.dailySessions.find((s) => s.date === today);

  if (todaySession?.completedAt) {
    flowData.identity.totalDays = flowData.dailySessions.filter(
      (s) => s.completedAt,
    ).length;

    // Calculate current streak
    let streak = 0;
    const sortedSessions = flowData.dailySessions
      .filter((s) => s.completedAt)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const session of sortedSessions) {
      if (session.completedAt) {
        streak++;
      } else {
        break;
      }
    }

    flowData.identity.currentStreak = streak;
    flowData.identity.longestStreak = Math.max(
      flowData.identity.longestStreak,
      streak,
    );

    // Update phase
    const dayNumber = calculateDayNumber(flowData.identity.startDate);
    flowData.identity.currentPhase = getPhaseForDay(dayNumber);
  }
}

// Calculate day number since start
function calculateDayNumber(startDate: Date): number {
  const today = new Date();
  const diffTime = today.getTime() - startDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Get phase based on day number
function getPhaseForDay(
  dayNumber: number,
): "foundation" | "building" | "mastery" {
  if (dayNumber <= 21) return "foundation";
  if (dayNumber <= 66) return "building";
  return "mastery";
}

// Check for new achievements
function checkFlowAchievements(flowData: FlowProgress): void {
  const achievements: Omit<FlowAchievement, "unlockedAt">[] = [];

  // Streak achievements
  if (
    flowData.identity.currentStreak >= 7 &&
    !hasAchievement(flowData, "week-streak")
  ) {
    achievements.push({
      id: "week-streak",
      name: "Week Warrior",
      description: "Completed 7 consecutive days of flow rituals",
      type: "streak",
    });
  }

  if (
    flowData.identity.currentStreak >= 21 &&
    !hasAchievement(flowData, "foundation-master")
  ) {
    achievements.push({
      id: "foundation-master",
      name: "Foundation Master",
      description: "Completed the foundation phase (21 days)",
      type: "phase",
    });
  }

  if (
    flowData.identity.currentStreak >= 66 &&
    !hasAchievement(flowData, "habit-architect")
  ) {
    achievements.push({
      id: "habit-architect",
      name: "Habit Architect",
      description: "Completed the habit formation journey (66 days)",
      type: "mastery",
    });
  }

  // Ritual achievements
  const totalRituals = flowData.dailySessions.reduce(
    (sum, session) => sum + session.rituals.filter((r) => r.completed).length,
    0,
  );

  if (totalRituals >= 100 && !hasAchievement(flowData, "ritual-devotee")) {
    achievements.push({
      id: "ritual-devotee",
      name: "Ritual Devotee",
      description: "Completed 100 flow rituals",
      type: "ritual",
    });
  }

  // Add new achievements
  achievements.forEach((achievement) => {
    flowData.achievements.push({
      ...achievement,
      unlockedAt: new Date(),
    });
  });
}

function hasAchievement(
  flowData: FlowProgress,
  achievementId: string,
): boolean {
  return flowData.achievements.some((a) => a.id === achievementId);
}

// Update flow patterns
function updateFlowPatterns(flowData: FlowProgress): void {
  const sessions = flowData.dailySessions.filter((s) => s.completedAt);

  if (sessions.length < 3) return; // Need at least 3 sessions for patterns

  // Energy patterns
  const energyLevels = sessions.map((s) => s.flowState.energy);
  const mostCommonEnergy = getMostCommon(energyLevels);

  updatePattern(flowData, {
    type: "energy",
    pattern: `You tend to have ${mostCommonEnergy} energy during morning rituals`,
    confidence: calculateConfidence(energyLevels, mostCommonEnergy),
    lastUpdated: new Date(),
  });

  // Focus patterns
  const focusLevels = sessions.map((s) => s.flowState.focus);
  const mostCommonFocus = getMostCommon(focusLevels);

  updatePattern(flowData, {
    type: "focus",
    pattern: `Your mental state is typically ${mostCommonFocus} during morning flows`,
    confidence: calculateConfidence(focusLevels, mostCommonFocus),
    lastUpdated: new Date(),
  });
}

function getMostCommon(arr: string[]): string {
  const counts = arr.reduce(
    (acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
}

function calculateConfidence(arr: string[], mostCommon: string): number {
  const occurrences = arr.filter((item) => item === mostCommon).length;
  return Math.round((occurrences / arr.length) * 100);
}

function updatePattern(flowData: FlowProgress, newPattern: FlowPattern): void {
  const existingIndex = flowData.patterns.findIndex(
    (p) => p.type === newPattern.type,
  );

  if (existingIndex >= 0) {
    flowData.patterns[existingIndex] = newPattern;
  } else {
    flowData.patterns.push(newPattern);
  }
}

// Get flow insights
export function getFlowInsights(): {
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  currentPhase: string;
  patterns: FlowPattern[];
  recentAchievements: FlowAchievement[];
} {
  const flowData = getFlowProgress();

  if (!flowData) {
    return {
      totalDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      currentPhase: "foundation",
      patterns: [],
      recentAchievements: [],
    };
  }

  const recentAchievements = flowData.achievements
    .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
    .slice(0, 3);

  return {
    totalDays: flowData.identity.totalDays,
    currentStreak: flowData.identity.currentStreak,
    longestStreak: flowData.identity.longestStreak,
    currentPhase: flowData.identity.currentPhase,
    patterns: flowData.patterns,
    recentAchievements,
  };
}
