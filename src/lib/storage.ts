import { DayPlan, Task, UserSettings, Achievement } from "@/types";
import { getToday, generateId } from "./productivity-utils";

const STORAGE_KEYS = {
  dayPlans: "flowTracker_dayPlans",
  settings: "flowTracker_settings",
  achievements: "flowTracker_achievements",
  streak: "flowTracker_streak",
};

// Day Plans
export const saveDayPlan = (dayPlan: DayPlan): void => {
  const existingPlans = getDayPlans();
  const updatedPlans = existingPlans.filter(
    (plan) => plan.date !== dayPlan.date,
  );
  updatedPlans.push(dayPlan);
  localStorage.setItem(STORAGE_KEYS.dayPlans, JSON.stringify(updatedPlans));
};

export const getDayPlans = (): DayPlan[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.dayPlans);
  if (!stored) return [];

  try {
    return JSON.parse(stored).map((plan: any) => ({
      ...plan,
      morningTasks: plan.morningTasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      })),
      afternoonTasks: plan.afternoonTasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      })),
      laterBird: plan.laterBird.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      })),
    }));
  } catch {
    return [];
  }
};

export const getTodayPlan = (): DayPlan => {
  const today = getToday();
  const plans = getDayPlans();
  const existingPlan = plans.find((plan) => plan.date === today);

  if (existingPlan) {
    return existingPlan;
  }

  // Create a new plan for today
  const newPlan: DayPlan = {
    id: generateId(),
    date: today,
    morningTasks: [],
    afternoonTasks: [],
    laterBird: [],
    eveningReflection: {},
    pomodoroCompleted: 0,
    streakCount: calculateCurrentStreak(),
  };

  saveDayPlan(newPlan);
  return newPlan;
};

// Settings
export const getSettings = (): UserSettings => {
  const stored = localStorage.getItem(STORAGE_KEYS.settings);
  const defaultSettings: UserSettings = {
    pomodoroLength: 25,
    shortBreakLength: 5,
    longBreakLength: 15,
    sessionsBeforeLongBreak: 4,
    enableNotifications: false,
    theme: "auto",
  };

  if (!stored) return defaultSettings;

  try {
    return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: UserSettings): void => {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
};

// Achievements
export const getAchievements = (): Achievement[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.achievements);
  if (!stored) return [];

  try {
    return JSON.parse(stored).map((achievement: any) => ({
      ...achievement,
      unlockedAt: new Date(achievement.unlockedAt),
    }));
  } catch {
    return [];
  }
};

export const addAchievement = (
  achievement: Omit<Achievement, "id" | "unlockedAt">,
): void => {
  const newAchievement: Achievement = {
    ...achievement,
    id: generateId(),
    unlockedAt: new Date(),
  };

  const existing = getAchievements();
  existing.push(newAchievement);
  localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(existing));
};

// Streak calculation
export const calculateCurrentStreak = (): number => {
  const plans = getDayPlans();
  if (plans.length === 0) return 0;

  const sortedPlans = plans
    .filter(
      (plan) => plan.morningTasks.length > 0 || plan.afternoonTasks.length > 0,
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < sortedPlans.length; i++) {
    const plan = sortedPlans[i];
    const planDate = new Date(plan.date);
    const daysDiff = Math.floor(
      (today.getTime() - planDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === i) {
      const allTasks = [...plan.morningTasks, ...plan.afternoonTasks];
      const completedTasks = allTasks.filter((task) => task.completed);

      if (completedTasks.length > 0) {
        streak++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return streak;
};

// Task operations
export const addTask = (task: Omit<Task, "id" | "createdAt">): void => {
  const todayPlan = getTodayPlan();
  const newTask: Task = {
    ...task,
    id: generateId(),
    createdAt: new Date(),
  };

  if (task.period === "morning") {
    todayPlan.morningTasks.push(newTask);
  } else {
    todayPlan.afternoonTasks.push(newTask);
  }

  saveDayPlan(todayPlan);
};

export const updateTask = (taskId: string, updates: Partial<Task>): void => {
  const todayPlan = getTodayPlan();

  const updateTaskInArray = (tasks: Task[]) => {
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      if (updates.completed && !tasks[index].completedAt) {
        tasks[index].completedAt = new Date();
      }
      return true;
    }
    return false;
  };

  const updated =
    updateTaskInArray(todayPlan.morningTasks) ||
    updateTaskInArray(todayPlan.afternoonTasks) ||
    updateTaskInArray(todayPlan.laterBird);

  if (updated) {
    saveDayPlan(todayPlan);
  }
};

export const deleteTask = (taskId: string): void => {
  const todayPlan = getTodayPlan();

  todayPlan.morningTasks = todayPlan.morningTasks.filter(
    (task) => task.id !== taskId,
  );
  todayPlan.afternoonTasks = todayPlan.afternoonTasks.filter(
    (task) => task.id !== taskId,
  );
  todayPlan.laterBird = todayPlan.laterBird.filter(
    (task) => task.id !== taskId,
  );

  saveDayPlan(todayPlan);
};

export const addLaterBirdTask = (
  task: Omit<Task, "id" | "createdAt">,
): void => {
  const todayPlan = getTodayPlan();
  const newTask: Task = {
    ...task,
    id: generateId(),
    createdAt: new Date(),
  };

  todayPlan.laterBird.push(newTask);
  saveDayPlan(todayPlan);
};
