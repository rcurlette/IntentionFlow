import { Context } from "https://edge.netlify.com/";

// Types
interface Task {
  id: string;
  title: string;
  description?: string;
  type: "brain" | "admin";
  period: "morning" | "afternoon";
  status: "todo" | "in-progress" | "completed";
  completed: boolean;
  timeBlock?: number;
  timeEstimate?: number;
  timeSpent?: number;
  pomodoroCount?: number;
  priority: "low" | "medium" | "high";
  tags?: string[];
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface DayPlan {
  date: string;
  morningTasks: Task[];
  afternoonTasks: Task[];
  completedTasks: number;
  totalTasks: number;
  pomodoroCompleted: number;
  totalFocusTime: number;
  averageFlowScore: number;
  currentStreak: number;
  achievements: any[];
}

interface PomodoroSession {
  id: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  completed: boolean;
  type: "focus" | "shortBreak" | "longBreak";
  duration: number;
  flowScore?: number;
  distractions?: number;
}

interface FlowEntry {
  id: string;
  userId?: string;
  timestamp: string;
  activity: string;
  activityType: "brain" | "admin" | "break" | "other";
  flowRating: number; // 1-5 scale
  mood: number; // 1-5 scale
  energyLevel: number; // 1-5 scale
  location?: string;
  notes?: string;
  tags?: string[];
  duration?: number; // in minutes
  createdAt: string;
}

interface FlowAnalytics {
  peakFlowHours: number[];
  lowFlowHours: number[];
  bestActivitiesForMorning: string[];
  bestActivitiesForAfternoon: string[];
  activitiesToAvoid: string[];
  weeklyTrends: {
    [key: string]: { day: string; avgFlow: number; bestActivity: string };
  };
  improvementSuggestions: string[];
}

interface FlowTrackingSettings {
  isEnabled: boolean;
  interval: number; // minutes between prompts
  quietHours: { start: string; end: string };
  trackingDays: number[]; // 0-6, days of week
  autoDetectActivity: boolean;
  showFlowInsights: boolean;
  minimumEntriesForInsights: number;
  promptStyle: "gentle" | "persistent" | "minimal";
}

interface UserSettings {
  theme: "light" | "dark";
  colorTheme: "vibrant" | "accessible";
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  dailyGoal: number;
}

interface Achievement {
  id: string;
  type: "streak" | "completion" | "focus" | "milestone";
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  metadata?: any;
}

interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
}

interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgTasksPerDay: number;
  productivityScore: number;
  typeBreakdown: { brain: number; admin: number };
  periodBreakdown: { morning: number; afternoon: number };
  tagAnalytics: { tag: string; count: number; completionRate: number }[];
  timeSpentByType: { brain: number; admin: number };
  pomodoroEfficiency: number;
}

// Helper functions
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Route handlers
async function handleTasks(request: Request, context: Context) {
  const url = new URL(request.url);
  const method = request.method;
  const pathParts = url.pathname.split("/").filter(Boolean);

  // Remove 'api' and 'tasks' from path
  const remainingPath = pathParts.slice(2);
  const taskId = remainingPath[0];

  switch (method) {
    case "OPTIONS":
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });

    case "GET":
      if (taskId) {
        // GET /api/tasks/:id
        return await getTask(taskId, context);
      } else {
        // GET /api/tasks or GET /api/tasks?date=2024-01-01&period=morning
        const date = url.searchParams.get("date");
        const period = url.searchParams.get("period") as
          | "morning"
          | "afternoon"
          | null;
        return await getTasks(date, period, context);
      }

    case "POST":
      // POST /api/tasks
      const taskData = await request.json();
      return await createTask(taskData, context);

    case "PUT":
      if (!taskId) {
        return errorResponse("Task ID is required for updates");
      }
      // PUT /api/tasks/:id
      const updates = await request.json();
      return await updateTask(taskId, updates, context);

    case "DELETE":
      if (!taskId) {
        return errorResponse("Task ID is required for deletion");
      }
      // DELETE /api/tasks/:id
      return await deleteTask(taskId, context);

    default:
      return errorResponse("Method not allowed", 405);
  }
}

async function handleDayPlans(request: Request, context: Context) {
  const url = new URL(request.url);
  const method = request.method;

  switch (method) {
    case "OPTIONS":
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });

    case "GET":
      // GET /api/day-plans/today or GET /api/day-plans?date=2024-01-01
      const date =
        url.searchParams.get("date") || new Date().toISOString().split("T")[0];
      return await getDayPlan(date, context);

    default:
      return errorResponse("Method not allowed", 405);
  }
}

async function handlePomodoro(request: Request, context: Context) {
  const url = new URL(request.url);
  const method = request.method;

  switch (method) {
    case "OPTIONS":
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });

    case "POST":
      // POST /api/pomodoro/sessions
      const sessionData = await request.json();
      return await createPomodoroSession(sessionData, context);

    case "GET":
      // GET /api/pomodoro/stats?date=2024-01-01
      const date =
        url.searchParams.get("date") || new Date().toISOString().split("T")[0];
      return await getPomodoroStats(date, context);

    default:
      return errorResponse("Method not allowed", 405);
  }
}

// Implementation functions using localStorage simulation
// In production, these would connect to your Supabase database
async function getTasks(
  date?: string | null,
  period?: string | null,
  context: Context,
) {
  try {
    // Simulate getting tasks from storage
    // In production, this would query your Supabase database
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Review morning priorities",
        description: "Plan the most important tasks for today",
        type: "brain",
        period: "morning",
        status: "todo",
        completed: false,
        priority: "high",
        tags: ["planning"],
        timeSpent: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scheduledFor: date || new Date().toISOString().split("T")[0],
      },
      {
        id: "2",
        title: "Check emails",
        description: "Process inbox and respond to urgent messages",
        type: "admin",
        period: "afternoon",
        status: "todo",
        completed: false,
        priority: "medium",
        tags: ["email", "communication"],
        timeSpent: 0,
        pomodoroCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scheduledFor: date || new Date().toISOString().split("T")[0],
      },
    ];

    let filteredTasks = mockTasks;

    if (date) {
      filteredTasks = filteredTasks.filter(
        (task) => task.scheduledFor === date,
      );
    }

    if (period) {
      filteredTasks = filteredTasks.filter((task) => task.period === period);
    }

    return jsonResponse({
      tasks: filteredTasks,
      count: filteredTasks.length,
    });
  } catch (error) {
    return errorResponse("Failed to fetch tasks", 500);
  }
}

async function getTask(taskId: string, context: Context) {
  try {
    // Mock implementation - in production, query your database
    const mockTask: Task = {
      id: taskId,
      title: "Sample Task",
      description: "This is a sample task from the API",
      type: "brain",
      period: "morning",
      status: "todo",
      completed: false,
      priority: "medium",
      tags: ["api", "sample"],
      timeSpent: 0,
      pomodoroCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return jsonResponse({ task: mockTask });
  } catch (error) {
    return errorResponse("Task not found", 404);
  }
}

async function createTask(taskData: Partial<Task>, context: Context) {
  try {
    // Validate required fields
    if (!taskData.title || !taskData.type || !taskData.period) {
      return errorResponse("Missing required fields: title, type, period");
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskData.title,
      description: taskData.description || "",
      type: taskData.type,
      period: taskData.period,
      status: taskData.status || "todo",
      completed: (taskData.status || "todo") === "completed",
      priority: taskData.priority || "medium",
      tags: taskData.tags || [],
      timeSpent: taskData.timeSpent || 0,
      pomodoroCount: taskData.pomodoroCount || 0,
      timeBlock: taskData.timeBlock,
      timeEstimate: taskData.timeEstimate,
      scheduledFor:
        taskData.scheduledFor || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In production, save to your database here

    return jsonResponse(
      {
        task: newTask,
        message: "Task created successfully",
      },
      201,
    );
  } catch (error) {
    return errorResponse("Failed to create task", 500);
  }
}

async function updateTask(
  taskId: string,
  updates: Partial<Task>,
  context: Context,
) {
  try {
    // In production, update in your database
    const updatedTask: Task = {
      id: taskId,
      title: updates.title || "Updated Task",
      description: updates.description || "",
      type: updates.type || "brain",
      period: updates.period || "morning",
      status: updates.status || "todo",
      completed: updates.completed || updates.status === "completed",
      priority: updates.priority || "medium",
      tags: updates.tags || [],
      timeSpent: updates.timeSpent || 0,
      pomodoroCount: updates.pomodoroCount || 0,
      updatedAt: new Date().toISOString(),
      createdAt: updates.createdAt || new Date().toISOString(),
    };

    return jsonResponse({
      task: updatedTask,
      message: "Task updated successfully",
    });
  } catch (error) {
    return errorResponse("Failed to update task", 500);
  }
}

async function deleteTask(taskId: string, context: Context) {
  try {
    // In production, delete from your database

    return jsonResponse({
      message: "Task deleted successfully",
      taskId,
    });
  } catch (error) {
    return errorResponse("Failed to delete task", 500);
  }
}

async function getDayPlan(date: string, context: Context) {
  try {
    // Mock day plan - in production, aggregate from your database
    const dayPlan: DayPlan = {
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

    return jsonResponse({ dayPlan });
  } catch (error) {
    return errorResponse("Failed to fetch day plan", 500);
  }
}

async function createPomodoroSession(
  sessionData: Partial<PomodoroSession>,
  context: Context,
) {
  try {
    const newSession: PomodoroSession = {
      id: crypto.randomUUID(),
      taskId: sessionData.taskId,
      startTime: sessionData.startTime || new Date().toISOString(),
      endTime: sessionData.endTime,
      completed: sessionData.completed || false,
      type: sessionData.type || "focus",
      duration: sessionData.duration || 25,
      flowScore: sessionData.flowScore || 0,
      distractions: sessionData.distractions || 0,
    };

    // In production, save to your database

    return jsonResponse(
      {
        session: newSession,
        message: "Pomodoro session created successfully",
      },
      201,
    );
  } catch (error) {
    return errorResponse("Failed to create pomodoro session", 500);
  }
}

async function getPomodoroStats(date: string, context: Context) {
  try {
    const stats = {
      date,
      count: 0,
      totalTime: 0,
      avgFlowScore: 0,
    };

    return jsonResponse({ stats });
  } catch (error) {
    return errorResponse("Failed to fetch pomodoro stats", 500);
  }
}

async function handleHealth(request: Request, context: Context) {
  return jsonResponse({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: "netlify-edge",
    version: "1.0.0",
  });
}

// Main handler
export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  // Remove 'api' from path
  const route = pathParts[1];

  switch (route) {
    case "tasks":
      return await handleTasks(request, context);
    case "day-plans":
      return await handleDayPlans(request, context);
    case "pomodoro":
      return await handlePomodoro(request, context);
    case "flow":
      return await handleFlow(request, context);
    case "analytics":
      return await handleAnalytics(request, context);
    case "settings":
      return await handleSettings(request, context);
    case "achievements":
      return await handleAchievements(request, context);
    case "streaks":
      return await handleStreaks(request, context);
    case "health":
      return await handleHealth(request, context);
    default:
      return errorResponse("Route not found", 404);
  }
}

export const config = {
  path: "/api/*",
};
