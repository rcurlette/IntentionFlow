import {
  supabase,
  isSupabaseConfigured,
  TEMP_USER_ID,
  type DatabaseTask,
  type DatabasePomodoroSession,
  type DatabaseUserSettings,
  type DatabaseAchievement,
  type DatabaseUserStreak,
} from "./supabase";
import type {
  Task,
  PomodoroSession,
  UserSettings,
  Achievement,
  DayPlan,
} from "../types";

// Helper function to convert database task to app task
const dbTaskToTask = (dbTask: DatabaseTask): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description || "",
  type: dbTask.type,
  period: dbTask.period,
  priority: dbTask.priority,
  status: dbTask.status,
  tags: dbTask.tags,
  timeEstimate: dbTask.time_estimate,
  timeSpent: dbTask.time_spent,
  pomodoroCount: dbTask.pomodoro_count,
  scheduledFor: dbTask.scheduled_for,
  completedAt: dbTask.completed_at ? new Date(dbTask.completed_at) : undefined,
  createdAt: new Date(dbTask.created_at),
  updatedAt: new Date(dbTask.updated_at),
});

// Helper function to convert app task to database task
const taskToDbTask = (
  task: Partial<Task>,
  userId: string = TEMP_USER_ID,
): Partial<DatabaseTask> => ({
  user_id: userId,
  title: task.title,
  description: task.description,
  type: task.type,
  period: task.period,
  priority: task.priority,
  status: task.status,
  tags: task.tags || [],
  time_estimate: task.timeEstimate,
  time_spent: task.timeSpent || 0,
  pomodoro_count: task.pomodoroCount || 0,
  scheduled_for: task.scheduledFor,
  completed_at: task.completedAt?.toISOString(),
});

// Tasks API
export const tasksApi = {
  async getAll(): Promise<Task[]> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase not configured, falling back to localStorage");
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", TEMP_USER_ID)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }

    return data?.map(dbTaskToTask) || [];
  },

  async getById(id: string): Promise<Task | null> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase not configured, falling back to localStorage");
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .eq("user_id", TEMP_USER_ID)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      console.error("Error fetching task:", error);
      throw error;
    }

    return data ? dbTaskToTask(data) : null;
  },

  async create(
    task: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ): Promise<Task> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase not configured, falling back to localStorage");
    }

    const dbTask = taskToDbTask(task);
    const { data, error } = await supabase
      .from("tasks")
      .insert(dbTask)
      .select("*")
      .single();

    if (error) {
      console.error("Error creating task:", error);
      throw error;
    }

    return dbTaskToTask(data);
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase not configured, falling back to localStorage");
    }

    const dbUpdates = taskToDbTask(updates);
    const { data, error } = await supabase
      .from("tasks")
      .update(dbUpdates)
      .eq("id", id)
      .eq("user_id", TEMP_USER_ID)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating task:", error);
      throw error;
    }

    return dbTaskToTask(data);
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase not configured, falling back to localStorage");
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", TEMP_USER_ID);

    if (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  async getByDate(date: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", TEMP_USER_ID)
      .eq("scheduled_for", date)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks by date:", error);
      throw error;
    }

    return data?.map(dbTaskToTask) || [];
  },

  async markCompleted(id: string): Promise<Task> {
    return this.update(id, {
      status: "completed",
      completedAt: new Date(),
    });
  },

  async bulkUpdate(ids: string[], updates: Partial<Task>): Promise<void> {
    const dbUpdates = taskToDbTask(updates);
    const { error } = await supabase
      .from("tasks")
      .update(dbUpdates)
      .in("id", ids)
      .eq("user_id", TEMP_USER_ID);

    if (error) {
      console.error("Error bulk updating tasks:", error);
      throw error;
    }
  },

  async bulkDelete(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .in("id", ids)
      .eq("user_id", TEMP_USER_ID);

    if (error) {
      console.error("Error bulk deleting tasks:", error);
      throw error;
    }
  },
};

// Pomodoro Sessions API
export const pomodoroApi = {
  async create(session: Omit<PomodoroSession, "id">): Promise<PomodoroSession> {
    const dbSession = {
      user_id: TEMP_USER_ID,
      task_id: session.taskId || null,
      duration: session.duration,
      session_type:
        session.type === "focus"
          ? "focus"
          : session.type === "shortBreak"
            ? "short_break"
            : "long_break",
      flow_score: session.flowScore,
      distractions: session.distractions,
      completed: session.completed,
      started_at: session.startTime.toISOString(),
      ended_at: session.endTime?.toISOString(),
    };

    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .insert(dbSession)
      .select("*")
      .single();

    if (error) {
      console.error("Error creating pomodoro session:", error);
      throw error;
    }

    return {
      id: data.id,
      taskId: data.task_id,
      duration: data.duration,
      type:
        data.session_type === "focus"
          ? "focus"
          : data.session_type === "short_break"
            ? "shortBreak"
            : "longBreak",
      flowScore: data.flow_score,
      distractions: data.distractions,
      completed: data.completed,
      startTime: new Date(data.started_at),
      endTime: data.ended_at ? new Date(data.ended_at) : undefined,
    };
  },

  async getByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<PomodoroSession[]> {
    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", TEMP_USER_ID)
      .gte("started_at", startDate)
      .lte("started_at", endDate)
      .order("started_at", { ascending: false });

    if (error) {
      console.error("Error fetching pomodoro sessions:", error);
      throw error;
    }

    return (
      data?.map((session) => ({
        id: session.id,
        taskId: session.task_id,
        duration: session.duration,
        type:
          session.session_type === "focus"
            ? "focus"
            : session.session_type === "short_break"
              ? "shortBreak"
              : "longBreak",
        flowScore: session.flow_score,
        distractions: session.distractions,
        completed: session.completed,
        startTime: new Date(session.started_at),
        endTime: session.ended_at ? new Date(session.ended_at) : undefined,
      })) || []
    );
  },

  async getTodayStats(): Promise<{
    count: number;
    totalTime: number;
    avgFlowScore: number;
  }> {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];

    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .select("duration, flow_score")
      .eq("user_id", TEMP_USER_ID)
      .eq("session_type", "focus")
      .eq("completed", true)
      .gte("started_at", today)
      .lt("started_at", tomorrow);

    if (error) {
      console.error("Error fetching today stats:", error);
      throw error;
    }

    const sessions = data || [];
    return {
      count: sessions.length,
      totalTime: sessions.reduce((sum, s) => sum + s.duration, 0),
      avgFlowScore:
        sessions.length > 0
          ? sessions.reduce((sum, s) => sum + s.flow_score, 0) / sessions.length
          : 0,
    };
  },
};

// User Settings API
export const settingsApi = {
  async get(): Promise<UserSettings> {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", TEMP_USER_ID)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No settings found, create default
        return this.create({
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
      console.error("Error fetching settings:", error);
      throw error;
    }

    return {
      theme: data.theme,
      colorTheme: data.color_theme,
      focusDuration: data.focus_duration,
      shortBreakDuration: data.short_break_duration,
      longBreakDuration: data.long_break_duration,
      sessionsBeforeLongBreak: data.sessions_before_long_break,
      autoStartBreaks: data.auto_start_breaks,
      autoStartPomodoros: data.auto_start_pomodoros,
      notificationsEnabled: data.notifications_enabled,
      soundEnabled: data.sound_enabled,
      dailyGoal: data.daily_goal,
    };
  },

  async create(settings: UserSettings): Promise<UserSettings> {
    const dbSettings = {
      user_id: TEMP_USER_ID,
      theme: settings.theme,
      color_theme: settings.colorTheme,
      focus_duration: settings.focusDuration,
      short_break_duration: settings.shortBreakDuration,
      long_break_duration: settings.longBreakDuration,
      sessions_before_long_break: settings.sessionsBeforeLongBreak,
      auto_start_breaks: settings.autoStartBreaks,
      auto_start_pomodoros: settings.autoStartPomodoros,
      notifications_enabled: settings.notificationsEnabled,
      sound_enabled: settings.soundEnabled,
      daily_goal: settings.dailyGoal,
    };

    const { data, error } = await supabase
      .from("user_settings")
      .insert(dbSettings)
      .select("*")
      .single();

    if (error) {
      console.error("Error creating settings:", error);
      throw error;
    }

    return settings;
  },

  async update(updates: Partial<UserSettings>): Promise<UserSettings> {
    const dbUpdates: any = {};
    if (updates.theme) dbUpdates.theme = updates.theme;
    if (updates.colorTheme) dbUpdates.color_theme = updates.colorTheme;
    if (updates.focusDuration) dbUpdates.focus_duration = updates.focusDuration;
    if (updates.shortBreakDuration)
      dbUpdates.short_break_duration = updates.shortBreakDuration;
    if (updates.longBreakDuration)
      dbUpdates.long_break_duration = updates.longBreakDuration;
    if (updates.sessionsBeforeLongBreak)
      dbUpdates.sessions_before_long_break = updates.sessionsBeforeLongBreak;
    if (updates.autoStartBreaks !== undefined)
      dbUpdates.auto_start_breaks = updates.autoStartBreaks;
    if (updates.autoStartPomodoros !== undefined)
      dbUpdates.auto_start_pomodoros = updates.autoStartPomodoros;
    if (updates.notificationsEnabled !== undefined)
      dbUpdates.notifications_enabled = updates.notificationsEnabled;
    if (updates.soundEnabled !== undefined)
      dbUpdates.sound_enabled = updates.soundEnabled;
    if (updates.dailyGoal) dbUpdates.daily_goal = updates.dailyGoal;

    const { data, error } = await supabase
      .from("user_settings")
      .update(dbUpdates)
      .eq("user_id", TEMP_USER_ID)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating settings:", error);
      throw error;
    }

    return {
      theme: data.theme,
      colorTheme: data.color_theme,
      focusDuration: data.focus_duration,
      shortBreakDuration: data.short_break_duration,
      longBreakDuration: data.long_break_duration,
      sessionsBeforeLongBreak: data.sessions_before_long_break,
      autoStartBreaks: data.auto_start_breaks,
      autoStartPomodoros: data.auto_start_pomodoros,
      notificationsEnabled: data.notifications_enabled,
      soundEnabled: data.sound_enabled,
      dailyGoal: data.daily_goal,
    };
  },
};

// Achievements API
export const achievementsApi = {
  async getAll(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", TEMP_USER_ID)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("Error fetching achievements:", error);
      throw error;
    }

    return (
      data?.map((achievement) => ({
        id: achievement.id,
        type: achievement.type,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        earnedAt: new Date(achievement.earned_at),
        metadata: achievement.metadata,
      })) || []
    );
  },

  async create(
    achievement: Omit<Achievement, "id" | "earnedAt">,
  ): Promise<Achievement> {
    const dbAchievement = {
      user_id: TEMP_USER_ID,
      type: achievement.type,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      metadata: achievement.metadata || {},
    };

    const { data, error } = await supabase
      .from("achievements")
      .insert(dbAchievement)
      .select("*")
      .single();

    if (error) {
      console.error("Error creating achievement:", error);
      throw error;
    }

    return {
      id: data.id,
      type: data.type,
      title: data.title,
      description: data.description,
      icon: data.icon,
      earnedAt: new Date(data.earned_at),
      metadata: data.metadata,
    };
  },
};

// Streaks API
export const streaksApi = {
  async get(): Promise<{
    currentStreak: number;
    longestStreak: number;
    lastActivityDate?: Date;
  }> {
    const { data, error } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", TEMP_USER_ID)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No streak data found, create default
        const { data: newData, error: createError } = await supabase
          .from("user_streaks")
          .insert({
            user_id: TEMP_USER_ID,
            current_streak: 0,
            longest_streak: 0,
          })
          .select("*")
          .single();

        if (createError) {
          console.error("Error creating streak data:", createError);
          throw createError;
        }

        return {
          currentStreak: 0,
          longestStreak: 0,
        };
      }
      console.error("Error fetching streak data:", error);
      throw error;
    }

    return {
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastActivityDate: data.last_activity_date
        ? new Date(data.last_activity_date)
        : undefined,
    };
  },

  async update(currentStreak: number, longestStreak?: number): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    const updates: any = {
      current_streak: currentStreak,
      last_activity_date: today,
    };

    if (longestStreak !== undefined) {
      updates.longest_streak = longestStreak;
    }

    const { error } = await supabase
      .from("user_streaks")
      .update(updates)
      .eq("user_id", TEMP_USER_ID);

    if (error) {
      console.error("Error updating streak:", error);
      throw error;
    }
  },
};

// Day Plan API (derived from tasks)
export const dayPlanApi = {
  async getToday(): Promise<DayPlan> {
    const today = new Date().toISOString().split("T")[0];
    const [tasks, pomodoroStats, streak] = await Promise.all([
      tasksApi.getByDate(today),
      pomodoroApi.getTodayStats(),
      streaksApi.get(),
    ]);

    const morningTasks = tasks.filter((t) => t.period === "morning");
    const afternoonTasks = tasks.filter((t) => t.period === "afternoon");
    const completedTasks = tasks.filter((t) => t.status === "completed");

    return {
      date: today,
      morningTasks,
      afternoonTasks,
      completedTasks: completedTasks.length,
      totalTasks: tasks.length,
      pomodoroCompleted: pomodoroStats.count,
      totalFocusTime: pomodoroStats.totalTime,
      averageFlowScore: Math.round(pomodoroStats.avgFlowScore),
      currentStreak: streak.currentStreak,
      achievements: [], // Will be populated separately if needed
    };
  },
};
