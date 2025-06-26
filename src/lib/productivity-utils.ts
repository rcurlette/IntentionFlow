import { Task, DayPlan, PomodoroSession } from "@/types";

export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const getToday = (): string => {
  return formatDate(new Date());
};

export const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
};

export const getTimeOfDay = (): "morning" | "afternoon" => {
  const hour = new Date().getHours();
  return hour < 12 ? "morning" : "afternoon";
};

export const calculateCompletionRate = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((task) => task.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

export const getTotalPomodoroTime = (sessions: PomodoroSession[]): number => {
  return sessions.reduce((total, session) => {
    if (session.completed && session.type === "focus") {
      return total + session.duration;
    }
    return total;
  }, 0);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getStreakMessage = (count: number): string => {
  if (count === 0) return "🌱 Start your journey today!";
  if (count === 1) return "🔥 Day one complete! Keep it up!";
  if (count < 7) return `🚀 ${count} days strong! Building momentum!`;
  if (count < 30) return `⭐ ${count} days in a row! You're on fire!`;
  if (count < 100) return `🏆 ${count} days! You're a productivity champion!`;
  return `👑 ${count} days! Absolute legend status!`;
};

export const getMotivationalMessage = (): string => {
  const messages = [
    "🌟 You've got this! Time to make today amazing!",
    "💪 Every small step is progress. Let's go!",
    "🚀 Focus mode activated! Ready to crush your goals!",
    "✨ Your future self will thank you for this effort!",
    "🎯 One task at a time, one victory at a time!",
    "🌈 Today is full of possibilities. Make them real!",
    "⚡ Channel that energy into something incredible!",
    "🎪 Work hard, celebrate wins, repeat!",
    "🏅 Champions are made one day at a time!",
    "🎨 Create something amazing with your focus today!",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getPriorityColor = (priority: Task["priority"]) => {
  switch (priority) {
    case "high":
      return "text-red-600 bg-red-50 border-red-200";
    case "medium":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "low":
      return "text-green-600 bg-green-50 border-green-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

export const getTaskTypeColor = (type: Task["type"]) => {
  switch (type) {
    case "brain":
      return "bg-focus text-focus-foreground";
    case "admin":
      return "bg-admin text-admin-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const getPeriodColor = (period: Task["period"]) => {
  switch (period) {
    case "morning":
      return "bg-morning text-morning-foreground";
    case "afternoon":
      return "bg-afternoon text-afternoon-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const formatTimeRemaining = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const getFlowStateMessage = (score: number): string => {
  if (score >= 90) return "🌊 Deep Flow State! You're absolutely crushing it!";
  if (score >= 70) return "⚡ High Focus! Keep this momentum going!";
  if (score >= 50) return "🎯 Good Focus! You're in the zone!";
  if (score >= 30) return "🔄 Building Focus... Stay with it!";
  return "🌱 Starting Focus... Eliminate distractions!";
};
