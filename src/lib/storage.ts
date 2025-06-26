import type { Task, DayPlan, UserSettings, Achievement } from "../types";
import {
  tasksApi,
  dayPlanApi,
  settingsApi,
  achievementsApi,
  streaksApi,
  pomodoroApi,
} from "./database";

// Keep storage keys for backward compatibility and fallbacks
const STORAGE_KEYS = {
  TASKS: "flowtracker_tasks",
  DAY_PLANS: "flowtracker_day_plans",
  USER_SETTINGS: "flowtracker_user_settings",
  ACHIEVEMENTS: "flowtracker_achievements",
  CURRENT_STREAK: "flowtracker_current_streak",
  LONGEST_STREAK: "flowtracker_longest_streak",
  LAST_ACTIVITY_DATE: "flowtracker_last_activity_date",
} as const;

// Generic storage functions (kept for fallbacks)
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key ${key}:`, error);
  }
}

// Task Management - Database-backed with localStorage fallback
export async function getAllTasks(): Promise<Task[]> {
  try {
    return await tasksApi.getAll();
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const tasks = getFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);
    return tasks.map((task) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    }));
  }
}

export async function saveTask(task: Task): Promise<void> {
  try {
    if (task.id && (await tasksApi.getById(task.id))) {
      await tasksApi.update(task.id, task);
    } else {
      await tasksApi.create(task);
    }
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const tasks = await getAllTasks();
    const existingIndex = tasks.findIndex((t) => t.id === task.id);

    if (existingIndex >= 0) {
      tasks[existingIndex] = { ...task, updatedAt: new Date() };
    } else {
      tasks.push(task);
    }

    setToStorage(STORAGE_KEYS.TASKS, tasks);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    await tasksApi.delete(taskId);
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const tasks = await getAllTasks();
    const filteredTasks = tasks.filter((task) => task.id !== taskId);
    setToStorage(STORAGE_KEYS.TASKS, filteredTasks);
  }
}

export async function getTaskById(taskId: string): Promise<Task | undefined> {
  try {
    const task = await tasksApi.getById(taskId);
    return task || undefined;
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const tasks = await getAllTasks();
    return tasks.find((task) => task.id === taskId);
  }
}

export async function getTasksByPeriod(
  period: "morning" | "afternoon",
): Promise<Task[]> {
  try {
    const allTasks = await tasksApi.getAll();
    return allTasks.filter((task) => task.period === period);
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const tasks = await getAllTasks();
    return tasks.filter((task) => task.period === period);
  }
}

export async function getCompletedTasks(): Promise<Task[]> {
  try {
    const allTasks = await tasksApi.getAll();
    return allTasks.filter((task) => task.status === "completed");
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const tasks = await getAllTasks();
    return tasks.filter((task) => task.status === "completed");
  }
}

export async function markTaskCompleted(taskId: string): Promise<void> {
  try {
    await tasksApi.markCompleted(taskId);
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const task = await getTaskById(taskId);
    if (task) {
      await saveTask({
        ...task,
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
}

export async function updateTaskPomodoroCount(taskId: string): Promise<void> {
  try {
    const task = await tasksApi.getById(taskId);
    if (task) {
      await tasksApi.update(taskId, {
        pomodoroCount: (task.pomodoroCount || 0) + 1,
      });
    }
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const task = await getTaskById(taskId);
    if (task) {
      await saveTask({
        ...task,
        pomodoroCount: (task.pomodoroCount || 0) + 1,
        updatedAt: new Date(),
      });
    }
  }
}

// Day Plan Management - Database-backed
export async function getTodayPlan(): Promise<DayPlan> {
  try {
    return await dayPlanApi.getToday();
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const today = new Date().toISOString().split("T")[0];
    const dayPlans = getFromStorage<Record<string, DayPlan>>(
      STORAGE_KEYS.DAY_PLANS,
      {},
    );

    if (!dayPlans[today]) {
      dayPlans[today] = createEmptyDayPlan(today);
      setToStorage(STORAGE_KEYS.DAY_PLANS, dayPlans);
    }

    return dayPlans[today];
  }
}

export async function saveDayPlan(dayPlan: DayPlan): Promise<void> {
  // Day plans are now computed from tasks and sessions, so this is mostly for compatibility
  try {
    // In the database version, day plans are computed dynamically
    // so we don't need to save them explicitly
    console.log("Day plan computed dynamically from database");
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const dayPlans = getFromStorage<Record<string, DayPlan>>(
      STORAGE_KEYS.DAY_PLANS,
      {},
    );
    dayPlans[dayPlan.date] = dayPlan;
    setToStorage(STORAGE_KEYS.DAY_PLANS, dayPlans);
  }
}

export function createEmptyDayPlan(date: string): DayPlan {
  return {
    date,
    morningTasks: [],
    afternoonTasks: [],
    completedTasks: 0,
    totalTasks: 0,
    pomodoroCompleted: 0,
    totalFocusTime: 0,
    averageFlowScore: 0,
    currentStreak: 0, // Will be loaded from database
    achievements: [],
  };
}

export async function updateDayPlanStats(): Promise<void> {
  // In the database version, stats are computed dynamically
  // This function is kept for compatibility but doesn't need to do anything
  console.log("Day plan stats computed dynamically from database");
}

// Settings Management - Database-backed
export async function getUserSettings(): Promise<UserSettings> {
  try {
    return await settingsApi.get();
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    return getFromStorage<UserSettings>(STORAGE_KEYS.USER_SETTINGS, {
      theme: "dark",
      colorTheme: "vibrant",
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      notificationsEnabled: true,
      soundEnabled: true,
      dailyGoal: 5,
    });
  }
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  try {
    await settingsApi.update(settings);
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    setToStorage(STORAGE_KEYS.USER_SETTINGS, settings);
  }
}

// Achievement Management - Database-backed
export async function getAchievements(): Promise<Achievement[]> {
  try {
    return await achievementsApi.getAll();
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const achievements = getFromStorage<Achievement[]>(
      STORAGE_KEYS.ACHIEVEMENTS,
      [],
    );
    return achievements.map((achievement) => ({
      ...achievement,
      earnedAt: new Date(achievement.earnedAt),
    }));
  }
}

export async function saveAchievement(achievement: Achievement): Promise<void> {
  try {
    await achievementsApi.create(achievement);
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const achievements = await getAchievements();
    achievements.push(achievement);
    setToStorage(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }
}

// Streak Management - Database-backed
export async function getCurrentStreak(): Promise<number> {
  try {
    const streak = await streaksApi.get();
    return streak.currentStreak;
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    return getFromStorage<number>(STORAGE_KEYS.CURRENT_STREAK, 0);
  }
}

export async function getLongestStreak(): Promise<number> {
  try {
    const streak = await streaksApi.get();
    return streak.longestStreak;
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    return getFromStorage<number>(STORAGE_KEYS.LONGEST_STREAK, 0);
  }
}

export async function getLastActivityDate(): Promise<Date | null> {
  try {
    const streak = await streaksApi.get();
    return streak.lastActivityDate || null;
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const dateString = getFromStorage<string | null>(
      STORAGE_KEYS.LAST_ACTIVITY_DATE,
      null,
    );
    return dateString ? new Date(dateString) : null;
  }
}

export async function updateStreak(): Promise<void> {
  try {
    const today = new Date();
    const streakData = await streaksApi.get();
    const lastActivity = streakData.lastActivityDate;
    const currentStreak = streakData.currentStreak;
    const longestStreak = streakData.longestStreak;

    if (!lastActivity) {
      // First time tracking
      await streaksApi.update(1, Math.max(1, longestStreak));
      return;
    }

    const daysDiff = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === 0) {
      // Same day, no change
      return;
    } else if (daysDiff === 1) {
      // Consecutive day
      const newStreak = currentStreak + 1;
      await streaksApi.update(newStreak, Math.max(newStreak, longestStreak));
    } else {
      // Streak broken
      await streaksApi.update(1);
    }
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const today = new Date();
    const lastActivity = await getLastActivityDate();
    const currentStreak = await getCurrentStreak();
    const longestStreak = await getLongestStreak();

    if (!lastActivity) {
      setToStorage(STORAGE_KEYS.CURRENT_STREAK, 1);
      setToStorage(STORAGE_KEYS.LONGEST_STREAK, Math.max(1, longestStreak));
      setToStorage(STORAGE_KEYS.LAST_ACTIVITY_DATE, today.toISOString());
      return;
    }

    const daysDiff = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === 0) {
      return;
    } else if (daysDiff === 1) {
      const newStreak = currentStreak + 1;
      setToStorage(STORAGE_KEYS.CURRENT_STREAK, newStreak);
      setToStorage(
        STORAGE_KEYS.LONGEST_STREAK,
        Math.max(newStreak, longestStreak),
      );
    } else {
      setToStorage(STORAGE_KEYS.CURRENT_STREAK, 1);
    }

    setToStorage(STORAGE_KEYS.LAST_ACTIVITY_DATE, today.toISOString());
  }
}

// Additional database-specific functions
export async function savePomodoroSession(
  session: Omit<import("../types").PomodoroSession, "id">,
): Promise<void> {
  try {
    await pomodoroApi.create(session);
  } catch (error) {
    console.error("Error saving pomodoro session:", error);
    // Could implement localStorage fallback here if needed
  }
}

// Bulk operations for tasks
export async function bulkUpdateTasks(
  taskIds: string[],
  updates: Partial<Task>,
): Promise<void> {
  try {
    await tasksApi.bulkUpdate(taskIds, updates);
  } catch (error) {
    console.error(
      "Database error in bulk update, falling back to individual updates:",
      error,
    );
    // Fallback to individual updates
    for (const taskId of taskIds) {
      const task = await getTaskById(taskId);
      if (task) {
        await saveTask({ ...task, ...updates });
      }
    }
  }
}

export async function bulkDeleteTasks(taskIds: string[]): Promise<void> {
  try {
    await tasksApi.bulkDelete(taskIds);
  } catch (error) {
    console.error(
      "Database error in bulk delete, falling back to individual deletes:",
      error,
    );
    // Fallback to individual deletes
    for (const taskId of taskIds) {
      await deleteTask(taskId);
    }
  }
}

// Legacy function aliases for backward compatibility
export const addTask = saveTask;
export const updateTask = saveTask;

// Add missing functions
export async function addLaterBirdTask(
  task: Omit<Task, "id" | "createdAt" | "updatedAt">,
): Promise<void> {
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await saveTask(newTask);
}

export async function getDayPlans(): Promise<Record<string, DayPlan>> {
  // In the database version, we don't store day plans as a collection
  // This function is kept for compatibility but returns today's plan
  try {
    const today = await getTodayPlan();
    return { [today.date]: today };
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    return getFromStorage<Record<string, DayPlan>>(STORAGE_KEYS.DAY_PLANS, {});
  }
}
