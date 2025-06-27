import { supabase } from "../supabase";

export interface FlowRitual {
  id: string;
  name: string;
  duration: number;
  description: string;
  completed: boolean;
  completedAt?: Date;
  isCore: boolean;
}

export interface FlowState {
  energy: "low" | "medium" | "high";
  focus: "scattered" | "calm" | "sharp";
  mood: "challenged" | "neutral" | "inspired";
  environment: "chaotic" | "okay" | "optimal";
  assessedAt: Date;
}

export interface FlowSession {
  id: string;
  userId: string;
  date: string;
  rituals: FlowRitual[];
  flowState: FlowState;
  intention: string;
  completedAt?: Date;
  phase: "foundation" | "building" | "mastery";
  dayNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function createFlowSession(
  sessionData: Omit<FlowSession, "id" | "userId" | "createdAt" | "updatedAt">,
): Promise<FlowSession> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("flow_sessions")
    .insert({
      user_id: user.id,
      date: sessionData.date,
      rituals: sessionData.rituals,
      flow_state: sessionData.flowState,
      intention: sessionData.intention,
      completed_at: sessionData.completedAt?.toISOString(),
      phase: sessionData.phase,
      day_number: sessionData.dayNumber,
    })
    .select()
    .single();

  if (error) throw error;
  return mapFlowSessionFromDatabase(data);
}

export async function getTodayFlowSession(): Promise<FlowSession | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("flow_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }
  return mapFlowSessionFromDatabase(data);
}

export async function updateFlowSession(
  id: string,
  updates: Partial<FlowSession>,
): Promise<FlowSession> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("flow_sessions")
    .update({
      rituals: updates.rituals,
      flow_state: updates.flowState,
      intention: updates.intention,
      completed_at: updates.completedAt?.toISOString(),
      phase: updates.phase,
      day_number: updates.dayNumber,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return mapFlowSessionFromDatabase(data);
}

export async function upsertTodayFlowSession(
  sessionData: Omit<FlowSession, "id" | "userId" | "createdAt" | "updatedAt">,
): Promise<FlowSession> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("flow_sessions")
    .upsert(
      {
        user_id: user.id,
        date: sessionData.date,
        rituals: sessionData.rituals,
        flow_state: sessionData.flowState,
        intention: sessionData.intention,
        completed_at: sessionData.completedAt?.toISOString(),
        phase: sessionData.phase,
        day_number: sessionData.dayNumber,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,date",
      },
    )
    .select()
    .single();

  if (error) throw error;
  return mapFlowSessionFromDatabase(data);
}

export async function getFlowSessionsByDateRange(
  startDate: string,
  endDate: string,
): Promise<FlowSession[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("flow_sessions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) throw error;
  return data.map(mapFlowSessionFromDatabase);
}

export async function getUserFlowStats(): Promise<{
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  currentPhase: string;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("flow_sessions")
    .select("*")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("date", { ascending: false });

  if (error) throw error;

  const totalDays = data.length;
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate streaks
  if (data.length > 0) {
    const today = new Date();
    const sessions = data.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Current streak
    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].date);
      const daysDiff = Math.floor(
        (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === i) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Longest streak
    tempStreak = 1;
    for (let i = 1; i < sessions.length; i++) {
      const prevDate = new Date(sessions[i - 1].date);
      const currDate = new Date(sessions[i].date);
      const daysDiff = Math.floor(
        (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Determine phase based on total days
  let currentPhase = "foundation";
  if (totalDays > 66) {
    currentPhase = "mastery";
  } else if (totalDays > 21) {
    currentPhase = "building";
  }

  return {
    totalDays,
    currentStreak,
    longestStreak,
    currentPhase,
  };
}

function mapFlowSessionFromDatabase(data: any): FlowSession {
  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    rituals: data.rituals,
    flowState: {
      ...data.flow_state,
      assessedAt: new Date(data.flow_state.assessedAt),
    },
    intention: data.intention,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    phase: data.phase,
    dayNumber: data.day_number,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
