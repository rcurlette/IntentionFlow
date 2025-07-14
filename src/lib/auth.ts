import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

// Initialize Supabase client if credentials are available
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

export { supabase };

// Auth helper functions
export const authHelpers = {
  // Check if Supabase is configured
  isConfigured: () => Boolean(supabase),

  // Sign in with Google OAuth
  signInWithGoogle: async () => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign in with email/password
  signInWithEmail: async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    console.log("Attempting sign in with:", {
      email,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase signin error:", error);
        throw error;
      }

      console.log("Sign in successful:", data);
      return data;
    } catch (fetchError) {
      console.error("Network/fetch error during signin:", fetchError);

      // Check if it's a network error
      if (
        fetchError instanceof TypeError &&
        fetchError.message.includes("fetch")
      ) {
        throw new Error(
          "Unable to connect to authentication service. Please check your internet connection and try again.",
        );
      }

      throw fetchError;
    }
  },

  // Sign up with email/password
  signUpWithEmail: async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    console.log("Attempting signup with:", {
      email,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      origin: window.location.origin,
    });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error("Supabase signup error:", error);
        throw error;
      }

      console.log("Signup successful:", data);
      return data;
    } catch (fetchError) {
      console.error("Network/fetch error during signup:", fetchError);

      // Check if it's a network error
      if (
        fetchError instanceof TypeError &&
        fetchError.message.includes("fetch")
      ) {
        throw new Error(
          "Unable to connect to authentication service. Please check your internet connection and try again.",
        );
      }

      throw fetchError;
    }
  },

  // Sign out
  signOut: async () => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear localStorage data when signing out
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (
        key.startsWith("flow-") ||
        key.startsWith("tasks-") ||
        key.startsWith("morning-") ||
        key.startsWith("evening-") ||
        key.startsWith("pomodoro-")
      ) {
        localStorage.removeItem(key);
      }
    });
  },

  // Get current user
  getCurrentUser: async () => {
    if (!supabase) return null;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  // Get current session
  getCurrentSession: async () => {
    if (!supabase) return null;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };

    return supabase.auth.onAuthStateChange(callback);
  },

  // Reset password
  resetPassword: async (email: string) => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  // Update password
  updatePassword: async (password: string) => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },
};

// Create user profile
export const createUserProfile = async (userId: string, userData: any) => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .insert({
      id: userId,
      ...userData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  if (!supabase) {
    throw new Error("Supabase not configured");
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
