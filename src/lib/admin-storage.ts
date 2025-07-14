// Admin storage layer that uses localStorage for Robert's personal data
// This bypasses Supabase for now while keeping the same data structure

const ADMIN_USER_ID = "admin-robert-curlette";
const STORAGE_PREFIX = "flowtracker_admin_";

// Helper to get data from localStorage
function getStorageData<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Helper to set data in localStorage
function setStorageData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

// Flow Session Management
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

// Admin Storage Functions
export const adminStorage = {
  // Flow Sessions
  getTodayFlowSession: (): FlowSession | null => {
    const today = new Date().toISOString().split("T")[0];
    const sessions = getStorageData<FlowSession[]>("flow_sessions", []);
    return (
      sessions.find((s) => s.date === today && s.userId === ADMIN_USER_ID) ||
      null
    );
  },

  upsertTodayFlowSession: (
    sessionData: Omit<FlowSession, "id" | "userId" | "createdAt" | "updatedAt">,
  ): FlowSession => {
    const sessions = getStorageData<FlowSession[]>("flow_sessions", []);
    const today = new Date().toISOString().split("T")[0];

    const existingIndex = sessions.findIndex(
      (s) => s.date === today && s.userId === ADMIN_USER_ID,
    );

    const session: FlowSession = {
      id:
        existingIndex >= 0
          ? sessions[existingIndex].id
          : `session_${Date.now()}`,
      userId: ADMIN_USER_ID,
      ...sessionData,
      createdAt:
        existingIndex >= 0 ? sessions[existingIndex].createdAt : new Date(),
      updatedAt: new Date(),
    };

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    setStorageData("flow_sessions", sessions);
    return session;
  },

  getUserFlowStats: () => {
    const sessions = getStorageData<FlowSession[]>("flow_sessions", []);
    const userSessions = sessions.filter(
      (s) => s.userId === ADMIN_USER_ID && s.completedAt,
    );

    const totalDays = userSessions.length;
    let currentStreak = 0;
    let longestStreak = 0;

    // Calculate streaks (simplified)
    if (userSessions.length > 0) {
      currentStreak = 1; // Simplified for demo
      longestStreak = Math.max(1, totalDays);
    }

    const currentPhase =
      totalDays <= 21 ? "foundation" : totalDays <= 66 ? "building" : "mastery";

    return {
      totalDays,
      currentStreak,
      longestStreak,
      currentPhase,
    };
  },

  // Flow Actions
  getFlowActions: (date: string) => {
    const actions = getStorageData<any[]>("flow_actions", []);
    return actions.filter((a) => a.date === date && a.userId === ADMIN_USER_ID);
  },

  addFlowAction: (actionId: string, date: string) => {
    const actions = getStorageData<any[]>("flow_actions", []);
    const action = {
      id: `action_${Date.now()}`,
      userId: ADMIN_USER_ID,
      actionId,
      date,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    actions.push(action);
    setStorageData("flow_actions", actions);
    return action;
  },

  // Profile Management
  getCurrentProfile: () => {
    const profile = getStorageData("profile", {
      id: ADMIN_USER_ID,
      email: "robert.curlette@gmail.com",
      name: "Robert Curlette",
      avatarUrl: null,
      flowArchetype: "Deep Worker",
      flowStartDate: new Date().toISOString().split("T")[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return profile;
  },

  updateProfile: (updates: any) => {
    const profile = adminStorage.getCurrentProfile();
    const updatedProfile = { ...profile, ...updates, updatedAt: new Date() };
    setStorageData("profile", updatedProfile);
    return updatedProfile;
  },

  initializeUserFlow: (archetype: string) => {
    const profile = adminStorage.getCurrentProfile();
    if (!profile.flowStartDate) {
      adminStorage.updateProfile({
        flowArchetype: archetype,
        flowStartDate: new Date().toISOString().split("T")[0],
      });
    }
  },

  // User Settings
  getUserSettings: () => {
    return getStorageData("user_settings", {
      id: `settings_${ADMIN_USER_ID}`,
      userId: ADMIN_USER_ID,
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
      dailyGoal: 4,
      visionBoardUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },

  updateUserSettings: (updates: any) => {
    const settings = adminStorage.getUserSettings();
    const updatedSettings = {
      ...settings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setStorageData("user_settings", updatedSettings);
    return updatedSettings;
  },

  // Data Export (for when you want to migrate to real database)
  exportAllData: () => {
    const data = {
      profile: adminStorage.getCurrentProfile(),
      flowSessions: getStorageData<FlowSession[]>("flow_sessions", []),
      flowActions: getStorageData<any[]>("flow_actions", []),
      userSettings: adminStorage.getUserSettings(),
      exportedAt: new Date().toISOString(),
      userId: ADMIN_USER_ID,
    };

    console.log("Admin data export:", data);
    return data;
  },

  // Clear all data (for testing)
  clearAllData: () => {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(STORAGE_PREFIX),
    );
    keys.forEach((key) => localStorage.removeItem(key));
    console.log("Admin data cleared");
  },
};
