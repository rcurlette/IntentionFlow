import type { Task, DayPlan, UserSettings, Achievement } from "../types";
import {
  tasksApi,
  dayPlanApi,
  settingsApi,
  achievementsApi,
  streaksApi,
  pomodoroApi,
} from "./database";
import { isSupabaseConfigured } from "./supabase";

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
  if (!isSupabaseConfigured) {
    console.log("Supabase not configured, using localStorage");
    const tasks = getFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);
    return tasks.map((task) => ({
      ...task,
      // Ensure backward compatibility with old Task format
      status: task.status || (task.completed ? "completed" : "todo"),
      completed:
        task.completed !== undefined
          ? task.completed
          : task.status === "completed",
      timeSpent: task.timeSpent || 0,
      pomodoroCount: task.pomodoroCount || 0,
      tags: task.tags || [],
      createdAt: new Date(task.createdAt),
      updatedAt: task.updatedAt
        ? new Date(task.updatedAt)
        : new Date(task.createdAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    }));
  }

  try {
    return await tasksApi.getAll();
  } catch (error) {
    console.error("Database error, falling back to localStorage:", error);
    const tasks = getFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);
    return tasks.map((task) => ({
      ...task,
      // Ensure backward compatibility with old Task format
      status: task.status || (task.completed ? "completed" : "todo"),
      completed:
        task.completed !== undefined
          ? task.completed
          : task.status === "completed",
      timeSpent: task.timeSpent || 0,
      pomodoroCount: task.pomodoroCount || 0,
      tags: task.tags || [],
      createdAt: new Date(task.createdAt),
      updatedAt: task.updatedAt
        ? new Date(task.updatedAt)
        : new Date(task.createdAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    }));
  }
}

export async function saveTask(task: Task): Promise<void> {
  if (!isSupabaseConfigured) {
    console.log("Supabase not configured, using localStorage");
    const tasks = await getAllTasks();
    const existingIndex = tasks.findIndex((t) => t.id === task.id);

    if (existingIndex >= 0) {
      tasks[existingIndex] = { ...task, updatedAt: new Date() };
    } else {
      tasks.push(task);
    }

    setToStorage(STORAGE_KEYS.TASKS, tasks);
    return;
  }

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
  if (!isSupabaseConfigured) {
    console.log("Supabase not configured, using localStorage");
    const today = new Date().toISOString().split("T")[0];

    // Always refresh from current tasks to ensure up-to-date data
    const allTasks = await getAllTasks();
    console.log("getTodayPlan localStorage: All tasks loaded", allTasks.length);

    const todayTasks = allTasks.filter((task) => {
      const taskDate = task.createdAt.toISOString().split("T")[0];
      const isToday = taskDate === today;
      console.log("Task date check:", {
        taskTitle: task.title,
        taskDate,
        today,
        isToday,
        period: task.period,
        status: task.status,
      });
      return isToday;
    });

    console.log("getTodayPlan localStorage: Today's tasks", todayTasks.length);

    const dayPlan: DayPlan = {
      date: today,
      morningTasks: todayTasks.filter((t) => t.period === "morning"),
      afternoonTasks: todayTasks.filter((t) => t.period === "afternoon"),
      completedTasks: todayTasks.filter(
        (t) => t.status === "completed" || t.completed,
      ).length,
      totalTasks: todayTasks.length,
      pomodoroCompleted: 0,
      totalFocusTime: 0,
      averageFlowScore: 0,
      currentStreak: getFromStorage(STORAGE_KEYS.CURRENT_STREAK, 0),
      achievements: [],
    };

    console.log("getTodayPlan localStorage: Final day plan", {
      morningTasks: dayPlan.morningTasks.length,
      afternoonTasks: dayPlan.afternoonTasks.length,
      totalTasks: dayPlan.totalTasks,
    });

    return dayPlan;
  }

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
  // Check if this is the very first time (no tasks in storage)
  const existingTasks = getFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);

  const plan: DayPlan = {
    date,
    morningTasks: [],
    afternoonTasks: [],
    completedTasks: 0,
    totalTasks: 0,
    pomodoroCompleted: 0,
    totalFocusTime: 0,
    averageFlowScore: 0,
    currentStreak: 0,
    achievements: [],
  };

  // Add sample tasks for demo if storage is completely empty
  if (
    existingTasks.length === 0 &&
    date === new Date().toISOString().split("T")[0]
  ) {
    const sampleTasks: Task[] = [
      {
        id: crypto.randomUUID(),
        title: "Review morning priorities",
        description: "Plan the most important tasks for today",
        type: "brain",
        period: "morning",
        priority: "high",
        status: "todo",
        completed: false,
        tags: ["planning"],
        timeSpent: 0,
        pomodoroCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: "Focus work session",
        description: "Deep work on primary project",
        type: "brain",
        period: "morning",
        priority: "high",
        status: "todo",
        completed: false,
        tags: ["focus", "deep-work"],
        timeEstimate: 50,
        timeSpent: 0,
        pomodoroCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        title: "Check and respond to emails",
        description: "Process inbox and respond to urgent messages",
        type: "admin",
        period: "afternoon",
        priority: "medium",
        status: "todo",
        completed: false,
        tags: ["email", "communication"],
        timeEstimate: 25,
        timeSpent: 0,
        pomodoroCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Save sample tasks
    setToStorage(STORAGE_KEYS.TASKS, sampleTasks);

    plan.morningTasks = sampleTasks.filter((t) => t.period === "morning");
    plan.afternoonTasks = sampleTasks.filter((t) => t.period === "afternoon");
    plan.totalTasks = sampleTasks.length;
  }

  return plan;
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

// Task creation function with proper defaults
export async function addTask(
  taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
): Promise<void> {
  const newTask: Task = {
    ...taskData,
    id: crypto.randomUUID(),
    status: taskData.status || "todo",
    completed: (taskData.status || "todo") === "completed",
    timeSpent: taskData.timeSpent || 0,
    pomodoroCount: taskData.pomodoroCount || 0,
    tags: taskData.tags || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await saveTask(newTask);
}

// Task update function that handles status/completed sync
export async function updateTask(
  taskId: string,
  updates: Partial<Task>,
): Promise<void> {
  const existingTask = await getTaskById(taskId);
  if (!existingTask) {
    console.warn(`Task with ID ${taskId} not found for update`);
    return;
  }

  const updatedTask: Task = {
    ...existingTask,
    ...updates,
    updatedAt: new Date(),
  };

  // Sync status and completed fields
  if (updates.status) {
    updatedTask.completed = updates.status === "completed";
    if (updates.status === "completed" && !updatedTask.completedAt) {
      updatedTask.completedAt = new Date();
    }
  } else if (updates.completed !== undefined) {
    updatedTask.status = updates.completed ? "completed" : "todo";
    if (updates.completed && !updatedTask.completedAt) {
      updatedTask.completedAt = new Date();
    }
  }

  await saveTask(updatedTask);
}

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
