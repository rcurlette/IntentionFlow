import { useState, useEffect, useCallback } from "react";
import { getUserSettings, saveUserSettings } from "@/lib/storage";
import type { UserSettings } from "@/types";

interface UseSettingsReturn {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => string;
  importSettings: (data: string) => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const userSettings = await getUserSettings();
        setSettings(userSettings);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load settings";
        setError(errorMessage);
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update settings
  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      if (!settings) return;

      try {
        setError(null);
        const updatedSettings = { ...settings, ...updates };

        // Optimistic update
        setSettings(updatedSettings);

        // Save to database/localStorage
        await saveUserSettings(updatedSettings);
      } catch (err) {
        // Revert optimistic update
        setSettings(settings);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update settings";
        setError(errorMessage);
        console.error("Error updating settings:", err);
        throw err; // Re-throw for component error handling
      }
    },
    [settings],
  );

  // Reset to default settings
  const resetSettings = useCallback(async () => {
    try {
      setError(null);
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

      setSettings(defaultSettings);
      await saveUserSettings(defaultSettings);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reset settings";
      setError(errorMessage);
      console.error("Error resetting settings:", err);
      throw err;
    }
  }, []);

  // Export settings as JSON
  const exportSettings = useCallback(() => {
    if (!settings) return "{}";

    try {
      return JSON.stringify(
        {
          version: "1.0",
          exportedAt: new Date().toISOString(),
          settings,
        },
        null,
        2,
      );
    } catch (err) {
      console.error("Error exporting settings:", err);
      return "{}";
    }
  }, [settings]);

  // Import settings from JSON
  const importSettings = useCallback(
    async (data: string) => {
      try {
        setError(null);
        const parsed = JSON.parse(data);

        // Validate the import data structure
        if (!parsed.settings) {
          throw new Error("Invalid settings file format");
        }

        // Validate required fields exist
        const importedSettings = parsed.settings as UserSettings;
        const requiredFields = [
          "theme",
          "focusDuration",
          "shortBreakDuration",
          "longBreakDuration",
          "dailyGoal",
          "workingHours",
        ];

        for (const field of requiredFields) {
          if (!(field in importedSettings)) {
            throw new Error(`Missing required field: ${field}`);
          }
        }

        // Merge with current settings to ensure all fields are present
        const mergedSettings = { ...settings, ...importedSettings };

        setSettings(mergedSettings);
        await saveUserSettings(mergedSettings);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to import settings";
        setError(errorMessage);
        console.error("Error importing settings:", err);
        throw err;
      }
    },
    [settings],
  );

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
  };
}

// Helper hook for specific setting categories
export function usePomodoroSettings() {
  const { settings, updateSettings } = useSettings();

  const updatePomodoro = useCallback(
    (updates: {
      focusDuration?: number;
      shortBreakDuration?: number;
      longBreakDuration?: number;
      sessionsBeforeLongBreak?: number;
      autoStartBreaks?: boolean;
      autoStartPomodoros?: boolean;
    }) => {
      return updateSettings(updates);
    },
    [updateSettings],
  );

  return {
    settings: settings
      ? {
          focusDuration: settings.focusDuration,
          shortBreakDuration: settings.shortBreakDuration,
          longBreakDuration: settings.longBreakDuration,
          sessionsBeforeLongBreak: settings.sessionsBeforeLongBreak,
          autoStartBreaks: settings.autoStartBreaks,
          autoStartPomodoros: settings.autoStartPomodoros,
        }
      : null,
    updatePomodoro,
  };
}

export function useNotificationSettings() {
  const { settings, updateSettings } = useSettings();

  const updateNotifications = useCallback(
    (updates: {
      notificationsEnabled?: boolean;
      soundEnabled?: boolean;
      taskReminders?: boolean;
      breakNotifications?: boolean;
      dailySummary?: boolean;
      achievementAlerts?: boolean;
    }) => {
      return updateSettings(updates);
    },
    [updateSettings],
  );

  return {
    settings: settings
      ? {
          notificationsEnabled: settings.notificationsEnabled,
          soundEnabled: settings.soundEnabled,
          taskReminders: settings.taskReminders,
          breakNotifications: settings.breakNotifications,
          dailySummary: settings.dailySummary,
          achievementAlerts: settings.achievementAlerts,
        }
      : null,
    updateNotifications,
  };
}

export function useThemeSettings() {
  const { settings, updateSettings } = useSettings();

  const updateTheme = useCallback(
    (updates: {
      theme?: "light" | "dark" | "system";
      colorTheme?: "vibrant" | "accessible";
      reducedMotion?: boolean;
      highContrast?: boolean;
      animations?: boolean;
    }) => {
      return updateSettings(updates);
    },
    [updateSettings],
  );

  return {
    settings: settings
      ? {
          theme: settings.theme,
          colorTheme: settings.colorTheme,
          reducedMotion: settings.reducedMotion,
          highContrast: settings.highContrast,
          animations: settings.animations,
        }
      : null,
    updateTheme,
  };
}
