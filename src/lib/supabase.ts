import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback to hardcoded values if env vars are not set
const finalSupabaseUrl =
  supabaseUrl || "https://iqxkrkzdvepjufmvjdaf.supabase.co";
const finalSupabaseAnonKey =
  supabaseAnonKey ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxeGtya3pkdmVwanVmbXZqZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzgxNjYsImV4cCI6MjA2NjUxNDE2Nn0.Z-PvKRMu1RNS3R5_DC-IkfYjbEf_27fhkcx9A4l4O7k";

export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    redirectTo:
      typeof window !== "undefined" ? `${window.location.origin}` : undefined,
  },
});

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = !!(
  finalSupabaseUrl && finalSupabaseAnonKey
);

// Admin configuration
export const adminEmail =
  import.meta.env.VITE_ADMIN_EMAIL || "robert.curlette@gmail.com";

// Helper to check if current user is admin
export const isAdminUser = (userEmail: string | undefined) => {
  return userEmail === adminEmail;
};

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          flow_archetype: string | null;
          flow_start_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          flow_archetype?: string | null;
          flow_start_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          flow_archetype?: string | null;
          flow_start_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          type: "brain" | "admin";
          period: "morning" | "afternoon";
          status: "todo" | "in-progress" | "completed";
          priority: "low" | "medium" | "high";
          completed: boolean;
          time_block: number | null;
          time_estimate: number | null;
          time_spent: number | null;
          pomodoro_count: number | null;
          tags: string[] | null;
          context_tags: string[] | null;
          scheduled_for: string | null;
          due_date: string | null;
          due_time: string | null;
          started_at: string | null;
          completed_at: string | null;
          parent_task_id: string | null;
          subtask_ids: string[] | null;
          depth: number | null;
          is_subtask: boolean | null;
          sort_order: number | null;
          project_id: string | null;
          energy: "low" | "medium" | "high" | null;
          focus: "shallow" | "deep" | null;
          delegated_to: string | null;
          waiting_for: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          type: "brain" | "admin";
          period: "morning" | "afternoon";
          status?: "todo" | "in-progress" | "completed";
          priority?: "low" | "medium" | "high";
          completed?: boolean;
          time_block?: number | null;
          time_estimate?: number | null;
          time_spent?: number | null;
          pomodoro_count?: number | null;
          tags?: string[] | null;
          context_tags?: string[] | null;
          scheduled_for?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          parent_task_id?: string | null;
          subtask_ids?: string[] | null;
          depth?: number | null;
          is_subtask?: boolean | null;
          sort_order?: number | null;
          project_id?: string | null;
          energy?: "low" | "medium" | "high" | null;
          focus?: "shallow" | "deep" | null;
          delegated_to?: string | null;
          waiting_for?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          type?: "brain" | "admin";
          period?: "morning" | "afternoon";
          status?: "todo" | "in-progress" | "completed";
          priority?: "low" | "medium" | "high";
          completed?: boolean;
          time_block?: number | null;
          time_estimate?: number | null;
          time_spent?: number | null;
          pomodoro_count?: number | null;
          tags?: string[] | null;
          context_tags?: string[] | null;
          scheduled_for?: string | null;
          due_date?: string | null;
          due_time?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          parent_task_id?: string | null;
          subtask_ids?: string[] | null;
          depth?: number | null;
          is_subtask?: boolean | null;
          sort_order?: number | null;
          project_id?: string | null;
          energy?: "low" | "medium" | "high" | null;
          focus?: "shallow" | "deep" | null;
          delegated_to?: string | null;
          waiting_for?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      flow_sessions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          rituals: any;
          flow_state: any;
          intention: string | null;
          completed_at: string | null;
          phase: "foundation" | "building" | "mastery";
          day_number: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          rituals: any;
          flow_state: any;
          intention?: string | null;
          completed_at?: string | null;
          phase: "foundation" | "building" | "mastery";
          day_number: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          rituals?: any;
          flow_state?: any;
          intention?: string | null;
          completed_at?: string | null;
          phase?: "foundation" | "building" | "mastery";
          day_number?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      flow_actions: {
        Row: {
          id: string;
          user_id: string;
          action_id: string;
          date: string;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action_id: string;
          date: string;
          completed_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action_id?: string;
          date?: string;
          completed_at?: string;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
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
          vision_board_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: "light" | "dark";
          color_theme?: "vibrant" | "accessible";
          focus_duration?: number;
          short_break_duration?: number;
          long_break_duration?: number;
          sessions_before_long_break?: number;
          auto_start_breaks?: boolean;
          auto_start_pomodoros?: boolean;
          notifications_enabled?: boolean;
          sound_enabled?: boolean;
          daily_goal?: number;
          vision_board_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: "light" | "dark";
          color_theme?: "vibrant" | "accessible";
          focus_duration?: number;
          short_break_duration?: number;
          long_break_duration?: number;
          sessions_before_long_break?: number;
          auto_start_breaks?: boolean;
          auto_start_pomodoros?: boolean;
          notifications_enabled?: boolean;
          sound_enabled?: boolean;
          daily_goal?: number;
          vision_board_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
