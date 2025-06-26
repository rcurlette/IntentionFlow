import type { Task, DayPlan, PomodoroSession } from "../types";

// API Client Configuration
const API_BASE_URL = import.meta.env.PROD
  ? "" // Use relative URLs in production
  : "http://localhost:8080"; // Dev server URL

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors or other fetch failures
    console.error("API request failed:", error);
    throw new ApiError(500, "Network error or server unavailable");
  }
}

// Task API
export const taskApi = {
  // Get all tasks or filter by date/period
  async getAll(filters?: {
    date?: string;
    period?: "morning" | "afternoon";
  }): Promise<{ tasks: Task[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.date) params.append("date", filters.date);
    if (filters?.period) params.append("period", filters.period);

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{ tasks: Task[]; count: number }>(`/tasks${query}`);
  },

  // Get single task by ID
  async getById(id: string): Promise<{ task: Task }> {
    return apiRequest<{ task: Task }>(`/tasks/${id}`);
  },

  // Create new task
  async create(
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ): Promise<{ task: Task; message: string }> {
    return apiRequest<{ task: Task; message: string }>("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  },

  // Update existing task
  async update(
    id: string,
    updates: Partial<Task>,
  ): Promise<{ task: Task; message: string }> {
    return apiRequest<{ task: Task; message: string }>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  // Delete task
  async delete(id: string): Promise<{ message: string; taskId: string }> {
    return apiRequest<{ message: string; taskId: string }>(`/tasks/${id}`, {
      method: "DELETE",
    });
  },

  // Get tasks for a specific date
  async getByDate(date: string): Promise<{ tasks: Task[]; count: number }> {
    return this.getAll({ date });
  },

  // Get tasks by period (morning/afternoon)
  async getByPeriod(
    period: "morning" | "afternoon",
  ): Promise<{ tasks: Task[]; count: number }> {
    return this.getAll({ period });
  },
};

// Day Plan API
export const dayPlanApi = {
  // Get day plan for a specific date (defaults to today)
  async get(date?: string): Promise<{ dayPlan: DayPlan }> {
    const params = date ? `?date=${date}` : "";
    return apiRequest<{ dayPlan: DayPlan }>(`/day-plans${params}`);
  },

  // Get today's day plan
  async getToday(): Promise<{ dayPlan: DayPlan }> {
    return this.get();
  },
};

// Pomodoro API
export const pomodoroApi = {
  // Create new pomodoro session
  async createSession(
    sessionData: Omit<PomodoroSession, "id">,
  ): Promise<{ session: PomodoroSession; message: string }> {
    return apiRequest<{ session: PomodoroSession; message: string }>(
      "/pomodoro/sessions",
      {
        method: "POST",
        body: JSON.stringify(sessionData),
      },
    );
  },

  // Get pomodoro stats for a date
  async getStats(date?: string): Promise<{
    stats: {
      date: string;
      count: number;
      totalTime: number;
      avgFlowScore: number;
    };
  }> {
    const params = date ? `?date=${date}` : "";
    return apiRequest<{
      stats: {
        date: string;
        count: number;
        totalTime: number;
        avgFlowScore: number;
      };
    }>(`/pomodoro/stats${params}`);
  },
};

// Health check endpoint
export const healthApi = {
  async check(): Promise<{ status: string; timestamp: string }> {
    return apiRequest<{ status: string; timestamp: string }>("/health");
  },
};

// Utility function to check if API is available
export async function isApiAvailable(): Promise<boolean> {
  try {
    await healthApi.check();
    return true;
  } catch (error) {
    console.warn("API not available, falling back to localStorage");
    return false;
  }
}

// Export ApiError for error handling
export { ApiError };

// Export default client with all APIs
export default {
  tasks: taskApi,
  dayPlans: dayPlanApi,
  pomodoro: pomodoroApi,
  health: healthApi,
  isAvailable: isApiAvailable,
};
