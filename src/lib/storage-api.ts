import type { Task, DayPlan, PomodoroSession } from "../types";
import apiClient, { ApiError } from "./api-client";
import {
  getAllTasks as getLocalTasks,
  saveTask as saveLocalTask,
  deleteTask as deleteLocalTask,
  getTodayPlan as getLocalTodayPlan,
  savePomodoroSession as saveLocalPomodoroSession,
} from "./storage";

// Configuration
let useApiFirst = true;
let apiAvailable: boolean | null = null;

// Check API availability with caching
async function checkApiAvailability(): Promise<boolean> {
  if (apiAvailable !== null) {
    return apiAvailable;
  }

  try {
    apiAvailable = await apiClient.isAvailable();
    return apiAvailable;
  } catch (error) {
    console.warn("API availability check failed:", error);
    apiAvailable = false;
    return false;
  }
}

// Task Management with API-first approach
export async function getAllTasks(): Promise<Task[]> {
  if (!useApiFirst) {
    return getLocalTasks();
  }

  try {
    if (await checkApiAvailability()) {
      const response = await apiClient.tasks.getAll();
      return response.tasks;
    }
  } catch (error) {
    console.warn("API call failed, falling back to localStorage:", error);
    apiAvailable = false;
  }

  // Fallback to localStorage
  return getLocalTasks();
}

export async function getTaskById(taskId: string): Promise<Task | undefined> {
  if (!useApiFirst) {
    return getLocalTasks().then((tasks) =>
      tasks.find((task) => task.id === taskId),
    );
  }

  try {
    if (await checkApiAvailability()) {
      const response = await apiClient.tasks.getById(taskId);
      return response.task;
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    console.warn("API call failed, falling back to localStorage:", error);
    apiAvailable = false;
  }

  // Fallback to localStorage
  const tasks = await getLocalTasks();
  return tasks.find((task) => task.id === taskId);
}

export async function addTask(
  taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
): Promise<void> {
  const task: Task = {
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

  if (!useApiFirst) {
    return saveLocalTask(task);
  }

  try {
    if (await checkApiAvailability()) {
      await apiClient.tasks.create(taskData);
      return; // Success!
    }
  } catch (error) {
    console.warn("API call failed, falling back to localStorage:", error);
    apiAvailable = false;
  }

  // Fallback to localStorage
  return saveLocalTask(task);
}

export async function updateTask(
  taskId: string,
  updates: Partial<Task>,
): Promise<void> {
  if (!useApiFirst) {
    const tasks = await getLocalTasks();
    const existingTask = tasks.find((t) => t.id === taskId);
    if (existingTask) {
      const updatedTask = {
        ...existingTask,
        ...updates,
        updatedAt: new Date(),
      };
      return saveLocalTask(updatedTask);
    }
    return;
  }

  try {
    if (await checkApiAvailability()) {
      await apiClient.tasks.update(taskId, updates);
      return; // Success!
    }
  } catch (error) {
    console.warn("API call failed, falling back to localStorage:", error);
    apiAvailable = false;
  }

  // Fallback to localStorage
  const tasks = await getLocalTasks();
  const existingTask = tasks.find((t) => t.id === taskId);
  if (existingTask) {
    const updatedTask = { ...existingTask, ...updates, updatedAt: new Date() };
    return saveLocalTask(updatedTask);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  if (!useApiFirst) {
    return deleteLocalTask(taskId);
  }

  try {
    if (await checkApiAvailability()) {
      await apiClient.tasks.delete(taskId);
      return; // Success!
    }
  } catch (error) {
    console.warn("API call failed, falling back to localStorage:", error);
    apiAvailable = false;
  }

  // Fallback to localStorage
  return deleteLocalTask(taskId);
}

export async function getTasksByPeriod(
  period: "morning" | "afternoon",
): Promise<Task[]> {
  if (!useApiFirst) {
    const tasks = await getLocalTasks();
    return tasks.filter((task) => task.period === period);
  }

  try {
    if (await checkApiAvailability()) {
      const response = await apiClient.tasks.getByPeriod(period);
      return response.tasks;
    }
  } catch (error) {
    console.warn("API call failed, falling back to localStorage:", error);
    apiAvailable = false;
  }

  // Fallback to localStorage
  const tasks = await getLocalTasks();
  return tasks.filter((task) => task.period === period);
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  if (!useApiFirst) {
    const tasks = await getLocalTasks();
    return tasks.filter((task) => {
      const taskDate = task.createdAt.toISOString
        ? task.createdAt.toISOString().split("T")[0]
        : new Date(task.createdAt).toISOString().split("T")[0];
      return taskDate === date;
    });
  }

  try {
    if (await checkApiAvailability()) {
      const response = await apiClient.tasks.getByDate(date);
      return response.tasks;
    }
  } catch (error) {
    console.warn("API call failed, falling back to localStorage:", error);
    apiAvailable = false;
  }

  // Fallback to localStorage
  const tasks = await getLocalTasks();
  return tasks.filter((task) => {
    const taskDate = task.createdAt.toISOString
      ? task.createdAt.toISOString().split("T")[0]
      : new Date(task.createdAt).toISOString().split("T")[0];
    return taskDate === date;
  });
}

// Day Plan Management
export async function getTodayPlan(): Promise<DayPlan> {
  if (!useApiFirst) {
    return getLocalTodayPlan();
  }

  try {
    if (await checkApiAvailability()) {
      const response = await apiClient.dayPlans.getToday();
      return response.dayPlan;
    }
  } catch (error) {
    console.warn("API call failed, falling back to localStorage:", error);
    apiAvailable = false;
  }

  // Fallback to localStorage
  return getLocalTodayPlan();
}

export async function getDayPlan(date: string): Promise<DayPlan> {
  if (!useApiFirst) {
    return getLocalTodayPlan(); // Local storage doesn't support specific dates well
  }

  try {
    if (await checkApiAvailability()) {
      const response = await apiClient.dayPlans.get(date);
      return response.dayPlan;
    }
  } catch (error) {
    console.warn("API call failed, falling back to localStorage:", error);
    apiAvailable = false;
  }

  // Fallback to localStorage
  return getLocalTodayPlan();
}

// Pomodoro Session Management
export async function savePomodoroSession(
  session: Omit<PomodoroSession, "id">,
): Promise<void> {
  if (!useApiFirst) {
    return saveLocalPomodoroSession(session);
  }

  try {
    if (await checkApiAvailability()) {
      await apiClient.pomodoro.createSession(session);
      return; // Success!
    }
  } catch (error) {
    console.warn("API call failed, falling back to localStorage:", error);
    apiAvailable = false;
  }

  // Fallback to localStorage
  return saveLocalPomodoroSession(session);
}

export async function getPomodoroStats(date?: string): Promise<{
  count: number;
  totalTime: number;
  avgFlowScore: number;
}> {
  if (!useApiFirst) {
    // Return default stats for localStorage
    return {
      count: 0,
      totalTime: 0,
      avgFlowScore: 0,
    };
  }

  try {
    if (await checkApiAvailability()) {
      const response = await apiClient.pomodoro.getStats(date);
      return response.stats;
    }
  } catch (error) {
    console.warn("API call failed, falling back to localStorage:", error);
    apiAvailable = false;
  }

  // Fallback to default stats
  return {
    count: 0,
    totalTime: 0,
    avgFlowScore: 0,
  };
}

// Configuration functions
export function setUseApiFirst(enabled: boolean): void {
  useApiFirst = enabled;
  console.log(`API-first mode ${enabled ? "enabled" : "disabled"}`);
}

export function getUseApiFirst(): boolean {
  return useApiFirst;
}

export function resetApiAvailability(): void {
  apiAvailable = null;
}

// Status functions
export async function getStorageStatus(): Promise<{
  apiAvailable: boolean;
  useApiFirst: boolean;
  mode: "api" | "localStorage" | "hybrid";
}> {
  const isApiAvailable = await checkApiAvailability();

  let mode: "api" | "localStorage" | "hybrid";
  if (!useApiFirst) {
    mode = "localStorage";
  } else if (isApiAvailable) {
    mode = "api";
  } else {
    mode = "hybrid";
  }

  return {
    apiAvailable: isApiAvailable,
    useApiFirst,
    mode,
  };
}

// Export legacy function names for compatibility
export const saveTask = updateTask;
export const getCompletedTasks = async (): Promise<Task[]> => {
  const tasks = await getAllTasks();
  return tasks.filter((task) => task.status === "completed" || task.completed);
};

export const markTaskCompleted = async (taskId: string): Promise<void> => {
  return updateTask(taskId, {
    status: "completed",
    completed: true,
    completedAt: new Date(),
  });
};

// Export API client for advanced usage
export { apiClient };
