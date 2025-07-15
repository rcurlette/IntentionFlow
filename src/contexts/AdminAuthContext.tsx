import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";

// Mock admin user for Robert Curlette (using UUID format for database compatibility)
const ADMIN_USER: User = {
  id: "00000000-0000-0000-0000-000000000001",
  aud: "authenticated",
  role: "authenticated",
  email: "robert.curlette@gmail.com",
  email_confirmed_at: new Date().toISOString(),
  phone: "",
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {
    provider: "admin",
    providers: ["admin"],
  },
  user_metadata: {
    full_name: "Robert Curlette",
    avatar_url: "",
    email: "robert.curlette@gmail.com",
  },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const ADMIN_SESSION: Session = {
  access_token: "admin-token",
  token_type: "bearer",
  user: ADMIN_USER,
  refresh_token: "admin-refresh-token",
  expires_in: 86400,
  expires_at: Math.floor(Date.now() / 1000) + 86400,
};

interface AdminUserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  plan_type: "free" | "pro" | "enterprise";
  plan_cost: number;
  created_at: string;
  updated_at: string;
}

interface AdminAuthContextType {
  user: User;
  userProfile: AdminUserProfile;
  session: Session;
  loading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  const adminProfile: AdminUserProfile = {
    id: ADMIN_USER.id,
    email: ADMIN_USER.email!,
    full_name: "Robert Curlette",
    avatar_url: "",
    plan_type: "enterprise", // Give admin enterprise features
    plan_cost: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Simulate loading for a brief moment
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Mock functions that don't actually do anything in admin mode
  const signInWithGoogle = async () => {
    console.log("Admin mode: Google sign-in bypassed");
  };

  const signInWithEmail = async (email: string, password: string) => {
    console.log("Admin mode: Email sign-in bypassed");
  };

  const signUpWithEmail = async (email: string, password: string) => {
    console.log("Admin mode: Email sign-up bypassed");
  };

  const signOut = async () => {
    console.log("Admin mode: Sign-out bypassed");
  };

  const resetPassword = async (email: string) => {
    console.log("Admin mode: Password reset bypassed");
  };

  const updatePassword = async (password: string) => {
    console.log("Admin mode: Password update bypassed");
  };

  const refreshProfile = async () => {
    console.log("Admin mode: Profile refresh bypassed");
  };

  const value = {
    user: ADMIN_USER,
    userProfile: adminProfile,
    session: ADMIN_SESSION,
    loading,
    isConfigured: true,
    isAdmin: true,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
