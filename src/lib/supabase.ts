import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create a mock client for when Supabase isn't configured
const createMockClient = () => ({
  from: () => ({
    select: () => Promise.reject(new Error("Supabase not configured")),
    insert: () => Promise.reject(new Error("Supabase not configured")),
    update: () => Promise.reject(new Error("Supabase not configured")),
    delete: () => Promise.reject(new Error("Supabase not configured")),
  }),
});

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createMockClient();

// For now, we'll use a temporary user ID until auth is implemented
export const TEMP_USER_ID = "00000000-0000-0000-0000-000000000000";

// Database types based on our schema
export interface DatabaseTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: "brain" | "admin";
  period: "morning" | "afternoon";
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "completed";
  tags: string[];
  time_estimate?: number;
  time_spent: number;
  pomodoro_count: number;
  scheduled_for?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabasePomodoroSession {
  id: string;
  user_id: string;
  task_id?: string;
  duration: number;
  session_type: "focus" | "short_break" | "long_break";
  flow_score: number;
  distractions: number;
  completed: boolean;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface DatabaseUserSettings {
  id: string;
  user_id: string;
  theme: "light" | "dark";
  color_theme: "vibrant" | "accessible";
  focus_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  sessions_before_long_break: number;
  auto_start_breaks: boolean;
  auto_start_pomodoros: boolean;
  notifications_enabled: boolean;
  sound_enabled: boolean;
  daily_goal: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAchievement {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description?: string;
  icon?: string;
  earned_at: string;
  metadata: Record<string, any>;
}

export interface DatabaseUserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  streak_type: "daily" | "weekly";
  updated_at: string;
}

// Database table definitions
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: DatabaseTask;
        Insert: Omit<DatabaseTask, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DatabaseTask, "id" | "created_at">> & {
          updated_at?: string;
        };
      };
      pomodoro_sessions: {
        Row: DatabasePomodoroSession;
        Insert: Omit<DatabasePomodoroSession, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DatabasePomodoroSession, "id" | "created_at">>;
      };
      user_settings: {
        Row: DatabaseUserSettings;
        Insert: Omit<
          DatabaseUserSettings,
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DatabaseUserSettings, "id" | "created_at">> & {
          updated_at?: string;
        };
      };
      achievements: {
        Row: DatabaseAchievement;
        Insert: Omit<DatabaseAchievement, "id" | "earned_at"> & {
          id?: string;
          earned_at?: string;
        };
        Update: Partial<Omit<DatabaseAchievement, "id">>;
      };
      user_streaks: {
        Row: DatabaseUserStreak;
        Insert: Omit<DatabaseUserStreak, "id" | "updated_at"> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DatabaseUserStreak, "id">> & {
          updated_at?: string;
        };
      };
    };
  };
}
