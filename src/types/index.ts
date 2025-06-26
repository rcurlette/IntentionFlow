export interface Task {
  id: string;
  title: string;
  description?: string;
  type: "brain" | "admin";
  period: "morning" | "afternoon";
  status: "todo" | "in-progress" | "completed";
  completed: boolean; // Computed from status for backward compatibility
  timeBlock?: number; // in minutes
  timeEstimate?: number; // in minutes
  timeSpent?: number; // in minutes
  pomodoroCount?: number;
  priority: "low" | "medium" | "high";
  tags?: string[];
  scheduledFor?: string; // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface DayPlan {
  id: string;
  date: string; // YYYY-MM-DD
  morningTasks: Task[];
  afternoonTasks: Task[];
  eveningReflection: {
    tomorrowNeeds?: string;
    preparation?: string;
    randomThoughts?: string;
    dontForget?: string;
  };
  firstHourPlan?: {
    focus: string;
    resources: Array<{
      title: string;
      url: string;
      type: "doc" | "site" | "video" | "other";
    }>;
  };
  pomodoroCompleted: number;
  streakCount: number;
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  type: "focus" | "break" | "long-break";
  duration: number; // in minutes
}

export interface UserSettings {
  pomodoroLength: number; // default 25 minutes
  shortBreakLength: number; // default 5 minutes
  longBreakLength: number; // default 15 minutes
  sessionsBeforeLongBreak: number; // default 4
  enableNotifications: boolean;
  theme: "light" | "dark" | "auto";
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  type: "streak" | "completion" | "focus" | "milestone";
}

export interface FlowState {
  isActive: boolean;
  startTime?: Date;
  currentTask?: Task;
  distractionCount: number;
  flowScore: number; // 0-100
}

// Flow Tracking System
export interface FlowEntry {
  id: string;
  userId?: string;
  timestamp: Date;
  activity: string;
  activityType: "brain" | "admin" | "break" | "other";
  flowRating: number; // 1-5 scale (1=terrible, 5=amazing)
  mood: number; // 1-5 scale (1=frustrated, 5=joyful)
  energyLevel: number; // 1-5 scale (1=drained, 5=energized)
  location?: string;
  notes?: string;
  tags?: string[];
  duration?: number; // in minutes, if activity completed
  createdAt: Date;
}

export interface FlowPattern {
  timeOfDay: string; // "09:00", "14:30", etc.
  hour: number; // 0-23
  dayOfWeek: number; // 0-6 (Sunday = 0)
  averageFlowRating: number;
  averageMood: number;
  averageEnergyLevel: number;
  activityCount: number;
  commonActivities: { activity: string; count: number; avgRating: number }[];
  bestActivities: { activity: string; avgRating: number }[];
  worstActivities: { activity: string; avgRating: number }[];
}

export interface FlowInsights {
  peakFlowHours: number[]; // Hours when flow is highest
  lowFlowHours: number[]; // Hours when flow is lowest
  bestActivitiesForMorning: string[];
  bestActivitiesForAfternoon: string[];
  activitiesToAvoid: string[];
  optimalFlowPattern: {
    morning: { time: string; activity: string; expectedFlow: number }[];
    afternoon: { time: string; activity: string; expectedFlow: number }[];
  };
  weeklyTrends: {
    [key: string]: { day: string; avgFlow: number; bestActivity: string };
  };
  improvementSuggestions: string[];
  dataQuality: {
    totalEntries: number;
    daysTracked: number;
    entriesNeededForBetterInsights: number;
  };
}

export interface FlowTrackingSettings {
  isEnabled: boolean;
  interval: number; // minutes between prompts (30, 60, 90, 120)
  quietHours: { start: string; end: string }; // "09:00" format
  trackingDays: number[]; // 0-6, days of week to track
  autoDetectActivity: boolean;
  showFlowInsights: boolean;
  minimumEntriesForInsights: number;
  promptStyle: "gentle" | "persistent" | "minimal";
}
