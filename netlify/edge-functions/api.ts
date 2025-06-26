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

// Flow Tracking Implementation Functions
async function getFlowEntries(
  days: number,
  date: string | null,
  context: Context,
) {
  try {
    // Mock flow entries - in production, query your database
    const mockEntries: FlowEntry[] = [
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        activity: "Deep work on project",
        activityType: "brain",
        flowRating: 4,
        mood: 4,
        energyLevel: 3,
        location: "Office",
        notes: "Great focus session",
        tags: ["coding", "focused"],
        duration: 60,
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        activity: "Email processing",
        activityType: "admin",
        flowRating: 2,
        mood: 3,
        energyLevel: 2,
        location: "Office",
        notes: "Too many interruptions",
        tags: ["email", "admin"],
        duration: 30,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return jsonResponse({
      entries: mockEntries,
      count: mockEntries.length,
      dateRange: { days, date },
    });
  } catch (error) {
    return errorResponse("Failed to fetch flow entries", 500);
  }
}

async function createFlowEntry(
  entryData: Partial<FlowEntry>,
  context: Context,
) {
  try {
    if (
      !entryData.activity ||
      !entryData.flowRating ||
      !entryData.mood ||
      !entryData.energyLevel
    ) {
      return errorResponse(
        "Missing required fields: activity, flowRating, mood, energyLevel",
      );
    }

    const newEntry: FlowEntry = {
      id: crypto.randomUUID(),
      timestamp: entryData.timestamp || new Date().toISOString(),
      activity: entryData.activity,
      activityType: entryData.activityType || "other",
      flowRating: entryData.flowRating,
      mood: entryData.mood,
      energyLevel: entryData.energyLevel,
      location: entryData.location,
      notes: entryData.notes,
      tags: entryData.tags || [],
      duration: entryData.duration,
      createdAt: new Date().toISOString(),
    };

    // In production, save to your database here

    return jsonResponse(
      {
        entry: newEntry,
        message: "Flow entry created successfully",
      },
      201,
    );
  } catch (error) {
    return errorResponse("Failed to create flow entry", 500);
  }
}

async function getFlowAnalytics(days: number, context: Context) {
  try {
    // Mock analytics - in production, calculate from your database
    const analytics: FlowAnalytics = {
      peakFlowHours: [9, 10, 14, 15],
      lowFlowHours: [12, 16, 17],
      bestActivitiesForMorning: ["Deep work", "Coding", "Writing"],
      bestActivitiesForAfternoon: ["Meetings", "Planning", "Admin tasks"],
      activitiesToAvoid: ["Social media", "Unnecessary meetings"],
      weeklyTrends: {
        Monday: { day: "Monday", avgFlow: 3.8, bestActivity: "Deep work" },
        Tuesday: { day: "Tuesday", avgFlow: 4.1, bestActivity: "Coding" },
        Wednesday: { day: "Wednesday", avgFlow: 3.6, bestActivity: "Planning" },
        Thursday: { day: "Thursday", avgFlow: 3.9, bestActivity: "Writing" },
        Friday: { day: "Friday", avgFlow: 3.2, bestActivity: "Admin tasks" },
      },
      improvementSuggestions: [
        "Schedule your most important work between 9-10 AM when your flow is highest",
        "Avoid demanding tasks during 12-1 PM when energy typically dips",
        "Mornings are great for deep work and coding",
        "Consider batching admin tasks for Friday afternoons",
      ],
    };

    return jsonResponse({ analytics, dateRange: { days } });
  } catch (error) {
    return errorResponse("Failed to fetch flow analytics", 500);
  }
}

async function getFlowSettings(context: Context) {
  try {
    // Mock settings - in production, query from your database
    const settings: FlowTrackingSettings = {
      isEnabled: true,
      interval: 60,
      quietHours: { start: "22:00", end: "08:00" },
      trackingDays: [1, 2, 3, 4, 5],
      autoDetectActivity: false,
      showFlowInsights: true,
      minimumEntriesForInsights: 10,
      promptStyle: "gentle",
    };

    return jsonResponse({ settings });
  } catch (error) {
    return errorResponse("Failed to fetch flow settings", 500);
  }
}

async function updateFlowSettings(
  settingsData: Partial<FlowTrackingSettings>,
  context: Context,
) {
  try {
    // In production, update in your database
    const updatedSettings: FlowTrackingSettings = {
      isEnabled: settingsData.isEnabled ?? true,
      interval: settingsData.interval ?? 60,
      quietHours: settingsData.quietHours ?? { start: "22:00", end: "08:00" },
      trackingDays: settingsData.trackingDays ?? [1, 2, 3, 4, 5],
      autoDetectActivity: settingsData.autoDetectActivity ?? false,
      showFlowInsights: settingsData.showFlowInsights ?? true,
      minimumEntriesForInsights: settingsData.minimumEntriesForInsights ?? 10,
      promptStyle: settingsData.promptStyle ?? "gentle",
    };

    return jsonResponse({
      settings: updatedSettings,
      message: "Flow settings updated successfully",
    });
  } catch (error) {
    return errorResponse("Failed to update flow settings", 500);
  }
}

// Analytics Implementation Functions
async function getTaskAnalytics(dateRange: string, context: Context) {
  try {
    // Mock analytics - in production, calculate from your database
    const analytics: TaskAnalytics = {
      totalTasks: 45,
      completedTasks: 38,
      completionRate: 84,
      avgTasksPerDay: 3.2,
      productivityScore: 87,
      typeBreakdown: { brain: 28, admin: 17 },
      periodBreakdown: { morning: 22, afternoon: 23 },
      tagAnalytics: [
        { tag: "coding", count: 12, completionRate: 92 },
        { tag: "planning", count: 8, completionRate: 75 },
        { tag: "admin", count: 15, completionRate: 80 },
        { tag: "research", count: 6, completionRate: 67 },
      ],
      timeSpentByType: { brain: 850, admin: 420 },
      pomodoroEfficiency: 78,
    };

    return jsonResponse({ analytics, dateRange });
  } catch (error) {
    return errorResponse("Failed to fetch task analytics", 500);
  }
}

async function getProductivityInsights(dateRange: string, context: Context) {
  try {
    const insights = {
      overallScore: 85,
      trends: {
        tasksCompleted: { current: 38, previous: 32, change: 18.8 },
        focusTime: { current: 850, previous: 720, change: 18.1 },
        flowScore: { current: 4.2, previous: 3.8, change: 10.5 },
      },
      recommendations: [
        "Your productivity has increased 18% this period - great work!",
        "Consider scheduling more brain tasks in the morning when your flow is highest",
        "You're completing admin tasks efficiently - maintain this rhythm",
      ],
      bestPerformingDays: ["Tuesday", "Wednesday"],
      improvementAreas: ["Friday afternoon energy management"],
    };

    return jsonResponse({ insights, dateRange });
  } catch (error) {
    return errorResponse("Failed to fetch productivity insights", 500);
  }
}

async function getActivityPatterns(dateRange: string, context: Context) {
  try {
    const patterns = {
      hourlyFlow: [
        { hour: 8, avgFlow: 3.2, taskCount: 5 },
        { hour: 9, avgFlow: 4.5, taskCount: 8 },
        { hour: 10, avgFlow: 4.3, taskCount: 7 },
        { hour: 11, avgFlow: 3.8, taskCount: 6 },
        { hour: 14, avgFlow: 4.1, taskCount: 7 },
        { hour: 15, avgFlow: 3.9, taskCount: 5 },
        { hour: 16, avgFlow: 3.2, taskCount: 4 },
      ],
      dailyPatterns: {
        Monday: { avgProductivity: 82, bestActivity: "Planning" },
        Tuesday: { avgProductivity: 89, bestActivity: "Deep work" },
        Wednesday: { avgProductivity: 85, bestActivity: "Coding" },
        Thursday: { avgProductivity: 78, bestActivity: "Meetings" },
        Friday: { avgProductivity: 71, bestActivity: "Admin tasks" },
      },
      activityCorrelations: [
        { activity: "Deep work", bestTime: "9-11 AM", avgFlow: 4.4 },
        { activity: "Admin tasks", bestTime: "2-4 PM", avgFlow: 3.1 },
        { activity: "Planning", bestTime: "8-9 AM", avgFlow: 3.8 },
      ],
    };

    return jsonResponse({ patterns, dateRange });
  } catch (error) {
    return errorResponse("Failed to fetch activity patterns", 500);
  }
}

async function getTrendAnalysis(dateRange: string, context: Context) {
  try {
    const trends = {
      productivityTrend: "increasing", // increasing, decreasing, stable
      weeklyAverage: 87,
      monthlyGrowth: 12.5,
      streakAnalysis: {
        currentStreak: 7,
        avgStreakLength: 5.2,
        longestStreak: 14,
      },
      seasonalPatterns: [
        { period: "Morning", productivity: 89, trend: "stable" },
        { period: "Afternoon", productivity: 76, trend: "improving" },
        { period: "Evening", productivity: 45, trend: "declining" },
      ],
      forecastedProductivity: 89, // next week prediction
    };

    return jsonResponse({ trends, dateRange });
  } catch (error) {
    return errorResponse("Failed to fetch trend analysis", 500);
  }
}

// User Settings Implementation Functions
async function getUserSettings(context: Context) {
  try {
    // Mock settings - in production, query from your database
    const settings: UserSettings = {
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
    };

    return jsonResponse({ settings });
  } catch (error) {
    return errorResponse("Failed to fetch user settings", 500);
  }
}

async function updateUserSettings(
  settingsData: Partial<UserSettings>,
  context: Context,
) {
  try {
    // In production, update in your database
    const updatedSettings: UserSettings = {
      theme: settingsData.theme || "dark",
      colorTheme: settingsData.colorTheme || "vibrant",
      focusDuration: settingsData.focusDuration || 25,
      shortBreakDuration: settingsData.shortBreakDuration || 5,
      longBreakDuration: settingsData.longBreakDuration || 15,
      sessionsBeforeLongBreak: settingsData.sessionsBeforeLongBreak || 4,
      autoStartBreaks: settingsData.autoStartBreaks || false,
      autoStartPomodoros: settingsData.autoStartPomodoros || false,
      notificationsEnabled: settingsData.notificationsEnabled ?? true,
      soundEnabled: settingsData.soundEnabled ?? true,
      dailyGoal: settingsData.dailyGoal || 5,
    };

    return jsonResponse({
      settings: updatedSettings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    return errorResponse("Failed to update settings", 500);
  }
}

// Achievements Implementation Functions
async function getUserAchievements(context: Context) {
  try {
    // Mock achievements - in production, query from your database
    const achievements: Achievement[] = [
      {
        id: crypto.randomUUID(),
        type: "streak",
        title: "Week Warrior",
        description: "Completed tasks for 7 days in a row",
        icon: "🔥",
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { streakLength: 7 },
      },
      {
        id: crypto.randomUUID(),
        type: "completion",
        title: "Century Club",
        description: "Completed 100 tasks",
        icon: "💯",
        earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { taskCount: 100 },
      },
      {
        id: crypto.randomUUID(),
        type: "focus",
        title: "Flow Master",
        description: "Achieved 10 high-flow sessions",
        icon: "🌊",
        earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { flowSessions: 10 },
      },
    ];

    return jsonResponse({ achievements, count: achievements.length });
  } catch (error) {
    return errorResponse("Failed to fetch achievements", 500);
  }
}

async function createAchievement(
  achievementData: Partial<Achievement>,
  context: Context,
) {
  try {
    if (
      !achievementData.type ||
      !achievementData.title ||
      !achievementData.description
    ) {
      return errorResponse("Missing required fields: type, title, description");
    }

    const newAchievement: Achievement = {
      id: crypto.randomUUID(),
      type: achievementData.type,
      title: achievementData.title,
      description: achievementData.description,
      icon: achievementData.icon || "🏆",
      earnedAt: new Date().toISOString(),
      metadata: achievementData.metadata || {},
    };

    // In production, save to your database here

    return jsonResponse(
      {
        achievement: newAchievement,
        message: "Achievement unlocked!",
      },
      201,
    );
  } catch (error) {
    return errorResponse("Failed to create achievement", 500);
  }
}

// Streaks Implementation Functions
async function getUserStreaks(context: Context) {
  try {
    // Mock streak data - in production, query from your database
    const streaks: UserStreak = {
      currentStreak: 7,
      longestStreak: 14,
      lastActivityDate: new Date().toISOString().split("T")[0],
    };

    return jsonResponse({ streaks });
  } catch (error) {
    return errorResponse("Failed to fetch user streaks", 500);
  }
}

async function updateUserStreaks(
  streakData: Partial<UserStreak>,
  context: Context,
) {
  try {
    // In production, update in your database
    const updatedStreaks: UserStreak = {
      currentStreak: streakData.currentStreak || 0,
      longestStreak: streakData.longestStreak || 0,
      lastActivityDate:
        streakData.lastActivityDate || new Date().toISOString().split("T")[0],
    };

    return jsonResponse({
      streaks: updatedStreaks,
      message: "Streaks updated successfully",
    });
  } catch (error) {
    return errorResponse("Failed to update streaks", 500);
  }
}

async function handleFlow(request: Request, context: Context) {
  const url = new URL(request.url);
  const method = request.method;
  const pathParts = url.pathname.split("/").filter(Boolean);
  const subRoute = pathParts[2]; // entries, analytics, settings

  switch (method) {
    case "OPTIONS":
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });

    case "GET":
      if (subRoute === "entries") {
        // GET /api/flow/entries?days=7&date=2024-01-01
        const days = parseInt(url.searchParams.get("days") || "7");
        const date = url.searchParams.get("date");
        return await getFlowEntries(days, date, context);
      } else if (subRoute === "analytics") {
        // GET /api/flow/analytics?days=30
        const days = parseInt(url.searchParams.get("days") || "30");
        return await getFlowAnalytics(days, context);
      } else if (subRoute === "settings") {
        // GET /api/flow/settings
        return await getFlowSettings(context);
      }
      return errorResponse("Invalid flow endpoint", 400);

    case "POST":
      if (subRoute === "entries") {
        // POST /api/flow/entries
        const entryData = await request.json();
        return await createFlowEntry(entryData, context);
      }
      return errorResponse("Invalid flow endpoint", 400);

    case "PUT":
      if (subRoute === "settings") {
        // PUT /api/flow/settings
        const settingsData = await request.json();
        return await updateFlowSettings(settingsData, context);
      }
      return errorResponse("Invalid flow endpoint", 400);

    default:
      return errorResponse("Method not allowed", 405);
  }
}

async function handleAnalytics(request: Request, context: Context) {
  const url = new URL(request.url);
  const method = request.method;
  const pathParts = url.pathname.split("/").filter(Boolean);
  const subRoute = pathParts[2]; // tasks, productivity, patterns, trends

  switch (method) {
    case "OPTIONS":
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });

    case "GET":
      const dateRange = url.searchParams.get("range") || "30d";
      const date = url.searchParams.get("date");

      if (subRoute === "tasks") {
        // GET /api/analytics/tasks?range=30d
        return await getTaskAnalytics(dateRange, context);
      } else if (subRoute === "productivity") {
        // GET /api/analytics/productivity?range=7d
        return await getProductivityInsights(dateRange, context);
      } else if (subRoute === "patterns") {
        // GET /api/analytics/patterns?range=30d
        return await getActivityPatterns(dateRange, context);
      } else if (subRoute === "trends") {
        // GET /api/analytics/trends?range=90d
        return await getTrendAnalysis(dateRange, context);
      }
      return errorResponse("Invalid analytics endpoint", 400);

    default:
      return errorResponse("Method not allowed", 405);
  }
}

async function handleSettings(request: Request, context: Context) {
  const method = request.method;

  switch (method) {
    case "OPTIONS":
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });

    case "GET":
      // GET /api/settings
      return await getUserSettings(context);

    case "PUT":
      // PUT /api/settings
      const settingsData = await request.json();
      return await updateUserSettings(settingsData, context);

    default:
      return errorResponse("Method not allowed", 405);
  }
}

async function handleAchievements(request: Request, context: Context) {
  const method = request.method;

  switch (method) {
    case "OPTIONS":
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });

    case "GET":
      // GET /api/achievements
      return await getUserAchievements(context);

    case "POST":
      // POST /api/achievements
      const achievementData = await request.json();
      return await createAchievement(achievementData, context);

    default:
      return errorResponse("Method not allowed", 405);
  }
}

async function handleStreaks(request: Request, context: Context) {
  const method = request.method;

  switch (method) {
    case "OPTIONS":
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });

    case "GET":
      // GET /api/streaks
      return await getUserStreaks(context);

    case "PUT":
      // PUT /api/streaks
      const streakData = await request.json();
      return await updateUserStreaks(streakData, context);

    default:
      return errorResponse("Method not allowed", 405);
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
