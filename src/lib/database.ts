import {
  supabase,
  isSupabaseConfigured,
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

// Admin user ID in proper UUID format for database compatibility
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001";

// Helper function to get current user ID
const getCurrentUserId = async (): Promise<string> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  return user.id;
};

// Helper function to check if Supabase is configured
const requireSupabase = () => {
  try {
    return !!supabase;
  } catch {
    throw new Error("Supabase not configured, falling back to localStorage");
  }
};

// Helper function to convert database task to app task
const dbTaskToTask = (dbTask: DatabaseTask): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description || "",
  type: dbTask.type,
  period: dbTask.period,
  priority: dbTask.priority,
  status: dbTask.status,
  completed: dbTask.status === "completed",
  tags: dbTask.tags || [],
  timeEstimate: dbTask.time_estimate,
  timeSpent: dbTask.time_spent || 0,
  pomodoroCount: dbTask.pomodoro_count || 0,
  timeBlock: dbTask.time_estimate, // Map time_estimate to timeBlock for compatibility
  scheduledFor: dbTask.scheduled_for,
  completedAt: dbTask.completed_at ? new Date(dbTask.completed_at) : undefined,
  createdAt: new Date(dbTask.created_at),
  updatedAt: new Date(dbTask.updated_at),
});

// Helper function to convert app task to database task
const taskToDbTask = (
  task: Partial<Task>,
  userId: string = ADMIN_USER_ID,
): Partial<DatabaseTask> => {
  // Determine status from either status or completed field
  let status = task.status;
  if (!status && task.completed !== undefined) {
    status = task.completed ? "completed" : "todo";
  }

  return {
    user_id: userId,
    title: task.title,
    description: task.description,
    type: task.type,
    period: task.period,
    priority: task.priority,
    status: status || "todo",
    tags: task.tags || [],
    time_estimate: task.timeEstimate || task.timeBlock,
    time_spent: task.timeSpent || 0,
    pomodoro_count: task.pomodoroCount || 0,
    scheduled_for: task.scheduledFor || new Date().toISOString().split("T")[0],
    completed_at: task.completedAt?.toISOString(),
  };
};

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
      return null; // Return null instead of throwing error to allow fallback
    }

    try {
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
    } catch (error) {
      console.error("Database error in getById:", error);
      return null; // Return null to allow fallback
    }
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
      return; // Gracefully return to allow localStorage fallback
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("user_id", TEMP_USER_ID);

      if (error) {
        console.error("Error deleting task:", error);
        throw error;
      }
    } catch (error) {
      console.error("Database error in delete:", error);
      throw error; // Re-throw database errors to trigger localStorage fallback
    }
  },

  async getByDate(date: string): Promise<Task[]> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase not configured, falling back to localStorage");
    }

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
    if (!isSupabaseConfigured) {
      return; // Gracefully return to allow localStorage fallback
    }

    try {
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
    } catch (error) {
      console.error("Database error in bulkUpdate:", error);
      throw error; // Re-throw database errors to trigger localStorage fallback
    }
  },

  async bulkDelete(ids: string[]): Promise<void> {
    if (!isSupabaseConfigured) {
      return; // Gracefully return to allow localStorage fallback
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .in("id", ids)
        .eq("user_id", TEMP_USER_ID);

      if (error) {
        console.error("Error bulk deleting tasks:", error);
        throw error;
      }
    } catch (error) {
      console.error("Database error in bulkDelete:", error);
      throw error; // Re-throw database errors to trigger localStorage fallback
    }
  },
};

// Pomodoro Sessions API
export const pomodoroApi = {
  async create(session: Omit<PomodoroSession, "id">): Promise<PomodoroSession> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase not configured, falling back to localStorage");
    }
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : error && typeof error === "object" && error.message
            ? error.message
            : JSON.stringify(error);
      console.error("Error fetching today stats:", errorMessage);
      throw new Error(`Failed to fetch today stats: ${errorMessage}`);
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
    // Let the actual database call handle connection issues
    // This allows for better error handling and fallback behavior

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", ADMIN_USER_ID)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No settings found, create default
        const defaultSettings: UserSettings = {
          // Appearance & Theme
          theme: "dark",
          colorTheme: "vibrant",
          reducedMotion: false,
          highContrast: false,
          animations: true,

          // Pomodoro & Focus Settings
          focusDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          sessionsBeforeLongBreak: 4,
          autoStartBreaks: false,
          autoStartPomodoros: false,

          // Notifications & Alerts
          notificationsEnabled: true,
          soundEnabled: true,
          taskReminders: true,
          breakNotifications: true,
          dailySummary: true,
          achievementAlerts: true,

          // Productivity & Goals
          dailyGoal: 5,
          workingHours: {
            start: "09:00",
            end: "17:00",
          },

          // Music & Media
          autoPlayMusic: false,
          loopMusic: true,
          musicVolume: 50,

          // Profile & Personal
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          motivationalMessages: true,

          // Advanced Features
          flowTrackingEnabled: true,
        };

        return this.create(defaultSettings);
      }
      const errorMessage =
        error instanceof Error
          ? error.message
          : error && typeof error === "object" && error.message
            ? error.message
            : JSON.stringify(error);
      console.error("Error fetching settings:", errorMessage);
      throw new Error(`Failed to fetch settings: ${errorMessage}`);
    }

    // Map database fields to UserSettings interface with safe defaults
    return {
      // Appearance & Theme
      theme: data.theme || "dark",
      colorTheme: data.color_theme || "vibrant",
      reducedMotion: data.reduced_motion || false,
      highContrast: data.high_contrast || false,
      animations: data.animations !== false,

      // Pomodoro & Focus Settings
      focusDuration: data.focus_duration || 25,
      shortBreakDuration: data.short_break_duration || 5,
      longBreakDuration: data.long_break_duration || 15,
      sessionsBeforeLongBreak: data.sessions_before_long_break || 4,
      autoStartBreaks: data.auto_start_breaks || false,
      autoStartPomodoros: data.auto_start_pomodoros || false,

      // Notifications & Alerts
      notificationsEnabled: data.notifications_enabled !== false,
      soundEnabled: data.sound_enabled !== false,
      taskReminders: data.task_reminders !== false,
      breakNotifications: data.break_notifications !== false,
      dailySummary: data.daily_summary !== false,
      achievementAlerts: data.achievement_alerts !== false,

      // Productivity & Goals
      dailyGoal: data.daily_goal || 5,
      workingHours: {
        start: data.working_hours_start || "09:00",
        end: data.working_hours_end || "17:00",
      },

      // Music & Media
      youtubeUrl: data.youtube_url || undefined,
      autoPlayMusic: data.auto_play_music || false,
      loopMusic: data.loop_music !== false,
      musicVolume: data.music_volume || 50,

      // Profile & Personal
      displayName: data.display_name || undefined,
      timezone:
        data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      motivationalMessages: data.motivational_messages !== false,

      // Advanced Features
      visionBoardUrl: data.vision_board_url || undefined,
      flowTrackingEnabled: data.flow_tracking_enabled !== false,
    };
  },

  async create(settings: UserSettings): Promise<UserSettings> {
    // Let the actual database call handle connection issues

    const dbSettings = {
      user_id: ADMIN_USER_ID,
      // Appearance & Theme
      theme: settings.theme,
      color_theme: settings.colorTheme,
      reduced_motion: settings.reducedMotion,
      high_contrast: settings.highContrast,
      animations: settings.animations,

      // Pomodoro & Focus Settings
      focus_duration: settings.focusDuration,
      short_break_duration: settings.shortBreakDuration,
      long_break_duration: settings.longBreakDuration,
      sessions_before_long_break: settings.sessionsBeforeLongBreak,
      auto_start_breaks: settings.autoStartBreaks,
      auto_start_pomodoros: settings.autoStartPomodoros,

      // Notifications & Alerts
      notifications_enabled: settings.notificationsEnabled,
      sound_enabled: settings.soundEnabled,
      task_reminders: settings.taskReminders,
      break_notifications: settings.breakNotifications,
      daily_summary: settings.dailySummary,
      achievement_alerts: settings.achievementAlerts,

      // Productivity & Goals
      daily_goal: settings.dailyGoal,
      working_hours_start: settings.workingHours.start,
      working_hours_end: settings.workingHours.end,

      // Music & Media
      youtube_url: settings.youtubeUrl,
      auto_play_music: settings.autoPlayMusic,
      loop_music: settings.loopMusic,
      music_volume: settings.musicVolume,

      // Profile & Personal
      display_name: settings.displayName,
      timezone: settings.timezone,
      motivational_messages: settings.motivationalMessages,

      // Advanced Features
      vision_board_url: settings.visionBoardUrl,
      flow_tracking_enabled: settings.flowTrackingEnabled,
    };

    const { data, error } = await supabase
      .from("user_settings")
      .insert(dbSettings)
      .select("*")
      .single();

    if (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : error && typeof error === "object" && error.message
            ? error.message
            : JSON.stringify(error);
      console.error("Error creating settings:", errorMessage);
      throw new Error(`Failed to create settings: ${errorMessage}`);
    }

    return settings;
  },

  async update(updates: Partial<UserSettings>): Promise<UserSettings> {
    // Let the actual database call handle connection issues

    const dbUpdates: any = {};

    // Appearance & Theme
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
    if (updates.colorTheme !== undefined)
      dbUpdates.color_theme = updates.colorTheme;
    if (updates.reducedMotion !== undefined)
      dbUpdates.reduced_motion = updates.reducedMotion;
    if (updates.highContrast !== undefined)
      dbUpdates.high_contrast = updates.highContrast;
    if (updates.animations !== undefined)
      dbUpdates.animations = updates.animations;

    // Pomodoro & Focus Settings
    if (updates.focusDuration !== undefined)
      dbUpdates.focus_duration = updates.focusDuration;
    if (updates.shortBreakDuration !== undefined)
      dbUpdates.short_break_duration = updates.shortBreakDuration;
    if (updates.longBreakDuration !== undefined)
      dbUpdates.long_break_duration = updates.longBreakDuration;
    if (updates.sessionsBeforeLongBreak !== undefined)
      dbUpdates.sessions_before_long_break = updates.sessionsBeforeLongBreak;
    if (updates.autoStartBreaks !== undefined)
      dbUpdates.auto_start_breaks = updates.autoStartBreaks;
    if (updates.autoStartPomodoros !== undefined)
      dbUpdates.auto_start_pomodoros = updates.autoStartPomodoros;

    // Notifications & Alerts
    if (updates.notificationsEnabled !== undefined)
      dbUpdates.notifications_enabled = updates.notificationsEnabled;
    if (updates.soundEnabled !== undefined)
      dbUpdates.sound_enabled = updates.soundEnabled;
    if (updates.taskReminders !== undefined)
      dbUpdates.task_reminders = updates.taskReminders;
    if (updates.breakNotifications !== undefined)
      dbUpdates.break_notifications = updates.breakNotifications;
    if (updates.dailySummary !== undefined)
      dbUpdates.daily_summary = updates.dailySummary;
    if (updates.achievementAlerts !== undefined)
      dbUpdates.achievement_alerts = updates.achievementAlerts;

    // Productivity & Goals
    if (updates.dailyGoal !== undefined)
      dbUpdates.daily_goal = updates.dailyGoal;
    if (updates.workingHours?.start !== undefined)
      dbUpdates.working_hours_start = updates.workingHours.start;
    if (updates.workingHours?.end !== undefined)
      dbUpdates.working_hours_end = updates.workingHours.end;

    // Music & Media
    if (updates.youtubeUrl !== undefined)
      dbUpdates.youtube_url = updates.youtubeUrl;
    if (updates.autoPlayMusic !== undefined)
      dbUpdates.auto_play_music = updates.autoPlayMusic;
    if (updates.loopMusic !== undefined)
      dbUpdates.loop_music = updates.loopMusic;
    if (updates.musicVolume !== undefined)
      dbUpdates.music_volume = updates.musicVolume;

    // Profile & Personal
    if (updates.displayName !== undefined)
      dbUpdates.display_name = updates.displayName;
    if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
    if (updates.motivationalMessages !== undefined)
      dbUpdates.motivational_messages = updates.motivationalMessages;

    // Advanced Features
    if (updates.visionBoardUrl !== undefined)
      dbUpdates.vision_board_url = updates.visionBoardUrl;
    if (updates.flowTrackingEnabled !== undefined)
      dbUpdates.flow_tracking_enabled = updates.flowTrackingEnabled;

    // Add updated_at timestamp
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("user_settings")
      .update(dbUpdates)
      .eq("user_id", TEMP_USER_ID)
      .select("*")
      .single();

    if (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : error && typeof error === "object" && error.message
            ? error.message
            : JSON.stringify(error);
      console.error("Error updating settings:", errorMessage);
      throw new Error(`Failed to update settings: ${errorMessage}`);
    }

    // Return the updated settings using the same mapping as the get method
    return {
      // Appearance & Theme
      theme: data.theme || "dark",
      colorTheme: data.color_theme || "vibrant",
      reducedMotion: data.reduced_motion || false,
      highContrast: data.high_contrast || false,
      animations: data.animations !== false,

      // Pomodoro & Focus Settings
      focusDuration: data.focus_duration || 25,
      shortBreakDuration: data.short_break_duration || 5,
      longBreakDuration: data.long_break_duration || 15,
      sessionsBeforeLongBreak: data.sessions_before_long_break || 4,
      autoStartBreaks: data.auto_start_breaks || false,
      autoStartPomodoros: data.auto_start_pomodoros || false,

      // Notifications & Alerts
      notificationsEnabled: data.notifications_enabled !== false,
      soundEnabled: data.sound_enabled !== false,
      taskReminders: data.task_reminders !== false,
      breakNotifications: data.break_notifications !== false,
      dailySummary: data.daily_summary !== false,
      achievementAlerts: data.achievement_alerts !== false,

      // Productivity & Goals
      dailyGoal: data.daily_goal || 5,
      workingHours: {
        start: data.working_hours_start || "09:00",
        end: data.working_hours_end || "17:00",
      },

      // Music & Media
      youtubeUrl: data.youtube_url || undefined,
      autoPlayMusic: data.auto_play_music || false,
      loopMusic: data.loop_music !== false,
      musicVolume: data.music_volume || 50,

      // Profile & Personal
      displayName: data.display_name || undefined,
      timezone:
        data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      motivationalMessages: data.motivational_messages !== false,

      // Advanced Features
      visionBoardUrl: data.vision_board_url || undefined,
      flowTrackingEnabled: data.flow_tracking_enabled !== false,
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : error && typeof error === "object" && error.message
            ? error.message
            : JSON.stringify(error);
      console.error("Error fetching streak data:", errorMessage);
      throw new Error(`Failed to fetch streak data: ${errorMessage}`);
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

    // Handle each API call separately to prevent one failure from breaking everything
    let tasks: Task[] = [];
    let pomodoroStats = { count: 0, totalTime: 0, avgFlowScore: 0 };
    let streak = { currentStreak: 0, longestStreak: 0 };

    try {
      tasks = await tasksApi.getByDate(today);
    } catch (error) {
      console.error(
        "Failed to fetch tasks for today:",
        error instanceof Error ? error.message : String(error),
      );
      tasks = [];
    }

    try {
      pomodoroStats = await pomodoroApi.getTodayStats();
    } catch (error) {
      console.error(
        "Failed to fetch pomodoro stats:",
        error instanceof Error ? error.message : String(error),
      );
    }

    try {
      streak = await streaksApi.get();
    } catch (error) {
      console.error(
        "Failed to fetch streak data:",
        error instanceof Error ? error.message : String(error),
      );
    }

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
