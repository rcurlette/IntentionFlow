export interface Task {
  id: string;
  title: string;
  description?: string;
  type: "brain" | "admin";
  period: "morning" | "afternoon";
  completed: boolean;
  timeBlock?: number; // in minutes
  priority: "low" | "medium" | "high";
  createdAt: Date;
  completedAt?: Date;
  pomodoroSessions?: number;
  tags?: string[];
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
