// Core FlowTracker Types
export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  planType: "free" | "pro" | "enterprise";
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: "brain" | "admin";
  period: "morning" | "afternoon";
  completed: boolean;
  priority: "low" | "medium" | "high";
  estimatedTime?: number;
  actualTime?: number;
  tags?: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlowSession {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime?: string;
  type: "focus" | "break" | "deep-work";
  flowRating: number; // 1-5
  mood: number; // 1-5
  energyLevel: number; // 1-5
  notes?: string;
  completed: boolean;
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  type: "focus" | "shortBreak" | "longBreak";
  duration: number; // in seconds
  completed: boolean;
  startTime: string;
  endTime?: string;
  flowScore?: number;
  distractions?: number;
  createdAt: string;
}

export interface FlowRitual {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  category: "morning" | "evening" | "focus" | "break";
  isCore: boolean;
  completed: boolean;
  order: number;
}

export interface Analytics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgFocusTime: number;
  totalFocusTime: number;
  streakDays: number;
  productivityScore: number;
  weeklyTrend: "up" | "down" | "stable";
}

export interface UserSettings {
  // Appearance & Theme
  theme: "light" | "dark" | "system";
  colorTheme: "vibrant" | "accessible";
  reducedMotion: boolean;
  highContrast: boolean;
  animations: boolean;

  // Pomodoro & Focus Settings
  focusDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;

  // Notifications & Alerts
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  taskReminders: boolean;
  breakNotifications: boolean;
  dailySummary: boolean;
  achievementAlerts: boolean;

  // Productivity & Goals
  dailyGoal: number; // number of pomodoros
  workingHours: {
    start: string;
    end: string;
  };

  // Music & Media
  youtubeUrl?: string;
  autoPlayMusic: boolean;
  loopMusic: boolean;
  musicVolume: number; // 0-100

  // Profile & Personal
  displayName?: string;
  timezone: string;
  motivationalMessages: boolean;

  // Advanced Features
  visionBoardUrl?: string;
  flowTrackingEnabled: boolean;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Component Props Types
export interface PageProps {
  title?: string;
  description?: string;
  className?: string;
}

export interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  isExternal?: boolean;
}

// Form Types
export interface TaskFormData {
  title: string;
  description?: string;
  type: Task["type"];
  period: Task["period"];
  priority: Task["priority"];
  estimatedTime?: number;
  tags?: string[];
  dueDate?: string;
}

export interface FlowSessionFormData {
  type: FlowSession["type"];
  flowRating: number;
  mood: number;
  energyLevel: number;
  notes?: string;
}

// Event Types
export interface TaskEvent {
  type: "created" | "updated" | "completed" | "deleted";
  taskId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface FlowEvent {
  type: "session_started" | "session_completed" | "ritual_completed";
  sessionId?: string;
  ritualId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
