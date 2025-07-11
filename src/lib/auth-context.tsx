import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isAdminUser } from "./supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setAuthError(null); // Clear errors on successful auth
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      const result = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (result.error) {
        setAuthError(result.error.message);
      }

      return { error: result.error };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setAuthError(errorMessage);
      return { error: { message: errorMessage } as AuthError };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setAuthError(null);
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (result.error) {
        setAuthError(result.error.message);
      }

      return { error: result.error };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setAuthError(errorMessage);
      return { error: { message: errorMessage } as AuthError };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setAuthError(null);
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}`,
        },
      });

      if (result.error) {
        setAuthError(result.error.message);
      }

      return { error: result.error };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setAuthError(errorMessage);
      return { error: { message: errorMessage } as AuthError };
    }
  };

  const signOut = async () => {
    try {
      setAuthError(null);
      const result = await supabase.auth.signOut();
      return { error: result.error };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setAuthError(errorMessage);
      return { error: { message: errorMessage } as AuthError };
    }
  };

  const clearError = () => {
    setAuthError(null);
  };

  const isAdmin = isAdminUser(user?.email);

  const value = {
    user,
    session,
    loading,
    isAdmin,
    authError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper hook to ensure user is authenticated
export function useRequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return { user: null, loading: true };
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  return { user, loading: false };
}
