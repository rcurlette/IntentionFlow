import { supabase } from "../supabase";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  flowArchetype: string | null;
  flowStartDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return mapProfileFromDatabase(data);
}

export async function createProfile(
  profileData: Omit<UserProfile, "id" | "createdAt" | "updatedAt">,
): Promise<UserProfile> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: profileData.email,
      name: profileData.name,
      avatar_url: profileData.avatarUrl,
      flow_archetype: profileData.flowArchetype,
      flow_start_date: profileData.flowStartDate,
    })
    .select()
    .single();

  if (error) throw error;
  return mapProfileFromDatabase(data);
}

export async function updateProfile(
  updates: Partial<UserProfile>,
): Promise<UserProfile> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update({
      name: updates.name,
      avatar_url: updates.avatarUrl,
      flow_archetype: updates.flowArchetype,
      flow_start_date: updates.flowStartDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return mapProfileFromDatabase(data);
}

export async function initializeUserFlow(archetype: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Create or update profile with flow start date
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      flow_archetype: archetype,
      flow_start_date: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    },
  );

  if (error) throw error;

  // Create default user settings
  await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      theme: "dark",
      color_theme: "vibrant",
      focus_duration: 25,
      short_break_duration: 5,
      long_break_duration: 15,
      sessions_before_long_break: 4,
      auto_start_breaks: false,
      auto_start_pomodoros: false,
      notifications_enabled: true,
      sound_enabled: true,
      daily_goal: 4,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id",
    },
  );
}

function mapProfileFromDatabase(data: any): UserProfile {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    avatarUrl: data.avatar_url,
    flowArchetype: data.flow_archetype,
    flowStartDate: data.flow_start_date,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
