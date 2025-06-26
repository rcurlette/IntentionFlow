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

// Flow Tracking API
export const flowApi = {
  // Get flow entries with filtering
  async getEntries(filters?: {
    days?: number;
    date?: string;
  }): Promise<{ entries: any[]; count: number; dateRange: any }> {
    const params = new URLSearchParams();
    if (filters?.days) params.append("days", filters.days.toString());
    if (filters?.date) params.append("date", filters.date);

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{ entries: any[]; count: number; dateRange: any }>(
      `/flow/entries${query}`,
    );
  },

  // Create new flow entry
  async createEntry(entryData: any): Promise<{ entry: any; message: string }> {
    return apiRequest<{ entry: any; message: string }>("/flow/entries", {
      method: "POST",
      body: JSON.stringify(entryData),
    });
  },

  // Get flow analytics
  async getAnalytics(
    days?: number,
  ): Promise<{ analytics: any; dateRange: any }> {
    const params = days ? `?days=${days}` : "";
    return apiRequest<{ analytics: any; dateRange: any }>(
      `/flow/analytics${params}`,
    );
  },

  // Get flow tracking settings
  async getSettings(): Promise<{ settings: any }> {
    return apiRequest<{ settings: any }>("/flow/settings");
  },

  // Update flow tracking settings
  async updateSettings(
    settings: any,
  ): Promise<{ settings: any; message: string }> {
    return apiRequest<{ settings: any; message: string }>("/flow/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },
};

// Analytics API
export const analyticsApi = {
  // Get task analytics
  async getTaskAnalytics(
    range?: string,
  ): Promise<{ analytics: any; dateRange: string }> {
    const params = range ? `?range=${range}` : "";
    return apiRequest<{ analytics: any; dateRange: string }>(
      `/analytics/tasks${params}`,
    );
  },

  // Get productivity insights
  async getProductivityInsights(
    range?: string,
  ): Promise<{ insights: any; dateRange: string }> {
    const params = range ? `?range=${range}` : "";
    return apiRequest<{ insights: any; dateRange: string }>(
      `/analytics/productivity${params}`,
    );
  },

  // Get activity patterns
  async getActivityPatterns(
    range?: string,
  ): Promise<{ patterns: any; dateRange: string }> {
    const params = range ? `?range=${range}` : "";
    return apiRequest<{ patterns: any; dateRange: string }>(
      `/analytics/patterns${params}`,
    );
  },

  // Get trend analysis
  async getTrendAnalysis(
    range?: string,
  ): Promise<{ trends: any; dateRange: string }> {
    const params = range ? `?range=${range}` : "";
    return apiRequest<{ trends: any; dateRange: string }>(
      `/analytics/trends${params}`,
    );
  },
};

// Settings API
export const settingsApi = {
  // Get user settings
  async get(): Promise<{ settings: any }> {
    return apiRequest<{ settings: any }>("/settings");
  },

  // Update user settings
  async update(settings: any): Promise<{ settings: any; message: string }> {
    return apiRequest<{ settings: any; message: string }>("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },
};

// Achievements API
export const achievementsApi = {
  // Get user achievements
  async getAll(): Promise<{ achievements: any[]; count: number }> {
    return apiRequest<{ achievements: any[]; count: number }>("/achievements");
  },

  // Create/unlock new achievement
  async create(
    achievementData: any,
  ): Promise<{ achievement: any; message: string }> {
    return apiRequest<{ achievement: any; message: string }>("/achievements", {
      method: "POST",
      body: JSON.stringify(achievementData),
    });
  },
};

// Streaks API
export const streaksApi = {
  // Get user streaks
  async get(): Promise<{ streaks: any }> {
    return apiRequest<{ streaks: any }>("/streaks");
  },

  // Update user streaks
  async update(streakData: any): Promise<{ streaks: any; message: string }> {
    return apiRequest<{ streaks: any; message: string }>("/streaks", {
      method: "PUT",
      body: JSON.stringify(streakData),
    });
  },
};

// Enhanced Task API with bulk operations
export const enhancedTaskApi = {
  ...taskApi,

  // Bulk create tasks
  async createBulk(
    tasks: any[],
  ): Promise<{ tasks: Task[]; count: number; message: string }> {
    return apiRequest<{ tasks: Task[]; count: number; message: string }>(
      "/tasks/bulk",
      {
        method: "POST",
        body: JSON.stringify({ tasks }),
      },
    );
  },

  // Bulk update tasks
  async updateBulk(
    taskIds: string[],
    updates: Partial<Task>,
  ): Promise<{
    updatedTaskIds: string[];
    updates: any;
    count: number;
    message: string;
  }> {
    return apiRequest<{
      updatedTaskIds: string[];
      updates: any;
      count: number;
      message: string;
    }>("/tasks/bulk", {
      method: "PUT",
      body: JSON.stringify({ taskIds, updates }),
    });
  },

  // Bulk delete tasks
  async deleteBulk(
    taskIds: string[],
  ): Promise<{ deletedTaskIds: string[]; count: number; message: string }> {
    return apiRequest<{
      deletedTaskIds: string[];
      count: number;
      message: string;
    }>("/tasks/bulk", {
      method: "DELETE",
      body: JSON.stringify({ taskIds }),
    });
  },

  // Get task templates
  async getTemplates(): Promise<{ templates: any[]; count: number }> {
    return apiRequest<{ templates: any[]; count: number }>("/tasks/templates");
  },

  // Create task template
  async createTemplate(
    templateData: any,
  ): Promise<{ template: any; message: string }> {
    return apiRequest<{ template: any; message: string }>("/tasks/templates", {
      method: "POST",
      body: JSON.stringify(templateData),
    });
  },
};

// Export default client with all APIs
export default {
  tasks: taskApi,
  enhancedTasks: enhancedTaskApi,
  dayPlans: dayPlanApi,
  pomodoro: pomodoroApi,
  flow: flowApi,
  analytics: analyticsApi,
  settings: settingsApi,
  achievements: achievementsApi,
  streaks: streaksApi,
  health: healthApi,
  isAvailable: isApiAvailable,
};
