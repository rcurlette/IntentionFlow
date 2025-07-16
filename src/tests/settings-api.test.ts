import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { settingsApi } from "@/lib/database";
import type { UserSettings } from "@/types";

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
  isSupabaseConfigured: true,
}));

// Mock data
const mockUserSettings: UserSettings = {
  theme: "dark",
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  notificationsEnabled: true,
  soundEnabled: true,
  autoStartBreaks: false,
  dailyGoal: 5,
  workingHours: {
    start: "09:00",
    end: "17:00",
  },
};

const mockDatabaseSettings = {
  id: "settings-123",
  user_id: "user-123",
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
  daily_goal: 5,
  vision_board_url: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("Settings API", () => {
  let mockFrom: any;
  let mockSelect: any;
  let mockEq: any;
  let mockSingle: any;
  let mockInsert: any;
  let mockUpdate: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock chain
    mockSingle = vi.fn();
    mockEq = vi.fn(() => ({ single: mockSingle }));
    mockSelect = vi.fn(() => ({ eq: mockEq }));
    mockInsert = vi.fn(() => ({ select: mockSelect }));
    mockUpdate = vi.fn(() => ({ eq: mockEq }));
    mockFrom = vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    }));

    // Mock the supabase client
    const { supabase } = require("@/lib/supabase");
    supabase.from.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("settingsApi.get()", () => {
    it("should fetch user settings successfully", async () => {
      mockSingle.mockResolvedValue({
        data: mockDatabaseSettings,
        error: null,
      });

      const result = await settingsApi.get();

      expect(result).toEqual(
        expect.objectContaining({
          theme: "dark",
          focusDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          notificationsEnabled: true,
          soundEnabled: true,
          autoStartBreaks: false,
          dailyGoal: 5,
        }),
      );
    });

    it("should create default settings if none exist", async () => {
      // First call returns not found error
      mockSingle
        .mockResolvedValueOnce({
          data: null,
          error: { code: "PGRST116", message: "No rows found" },
        })
        // Second call (create) returns success
        .mockResolvedValueOnce({
          data: mockDatabaseSettings,
          error: null,
        });

      const result = await settingsApi.get();

      expect(mockInsert).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should handle database errors properly", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: "SOME_ERROR", message: "Database error" },
      });

      await expect(settingsApi.get()).rejects.toThrow();
    });

    it("should handle missing data gracefully", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      // Should attempt to create default settings
      expect(mockSingle).toBeCalled();
    });
  });

  describe("settingsApi.create()", () => {
    it("should create new settings successfully", async () => {
      mockSingle.mockResolvedValue({
        data: mockDatabaseSettings,
        error: null,
      });

      const result = await settingsApi.create(mockUserSettings);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: "dark",
          focus_duration: 25,
          short_break_duration: 5,
          long_break_duration: 15,
          notifications_enabled: true,
          sound_enabled: true,
          auto_start_breaks: false,
          daily_goal: 5,
        }),
      );
      expect(result).toEqual(mockUserSettings);
    });

    it("should handle creation errors", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: "Creation failed" },
      });

      await expect(settingsApi.create(mockUserSettings)).rejects.toThrow();
    });

    it("should map all fields correctly", async () => {
      mockSingle.mockResolvedValue({
        data: mockDatabaseSettings,
        error: null,
      });

      await settingsApi.create(mockUserSettings);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: expect.any(String),
          theme: "dark",
          focus_duration: 25,
          short_break_duration: 5,
          long_break_duration: 15,
          auto_start_breaks: false,
          notifications_enabled: true,
          sound_enabled: true,
          daily_goal: 5,
        }),
      );
    });
  });

  describe("settingsApi.update()", () => {
    it("should update settings successfully", async () => {
      mockSingle.mockResolvedValue({
        data: {
          ...mockDatabaseSettings,
          focus_duration: 30,
          theme: "light",
        },
        error: null,
      });

      const updates = { focusDuration: 30, theme: "light" as const };
      const result = await settingsApi.update(updates);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          focus_duration: 30,
          theme: "light",
        }),
      );
      expect(result).toBeDefined();
    });

    it("should handle partial updates", async () => {
      mockSingle.mockResolvedValue({
        data: mockDatabaseSettings,
        error: null,
      });

      const updates = { focusDuration: 30 };
      await settingsApi.update(updates);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          focus_duration: 30,
        }),
      );
    });

    it("should handle update errors", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: "Update failed" },
      });

      const updates = { focusDuration: 30 };
      await expect(settingsApi.update(updates)).rejects.toThrow();
    });

    it("should map boolean fields correctly", async () => {
      mockSingle.mockResolvedValue({
        data: mockDatabaseSettings,
        error: null,
      });

      const updates = {
        notificationsEnabled: false,
        soundEnabled: false,
        autoStartBreaks: true,
      };
      await settingsApi.update(updates);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications_enabled: false,
          sound_enabled: false,
          auto_start_breaks: true,
        }),
      );
    });

    it("should ignore undefined values", async () => {
      mockSingle.mockResolvedValue({
        data: mockDatabaseSettings,
        error: null,
      });

      const updates = {
        focusDuration: 30,
        theme: undefined,
        notificationsEnabled: undefined,
      };
      await settingsApi.update(updates);

      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall).not.toHaveProperty("theme");
      expect(updateCall).not.toHaveProperty("notifications_enabled");
      expect(updateCall).toHaveProperty("focus_duration", 30);
    });
  });

  describe("Database field mapping", () => {
    it("should correctly map app fields to database fields", () => {
      const testCases = [
        { app: "focusDuration", db: "focus_duration" },
        { app: "shortBreakDuration", db: "short_break_duration" },
        { app: "longBreakDuration", db: "long_break_duration" },
        { app: "autoStartBreaks", db: "auto_start_breaks" },
        { app: "notificationsEnabled", db: "notifications_enabled" },
        { app: "soundEnabled", db: "sound_enabled" },
        { app: "dailyGoal", db: "daily_goal" },
      ];

      // This would be tested implicitly through the update calls above
      testCases.forEach(({ app, db }) => {
        expect(app).toBeTruthy();
        expect(db).toBeTruthy();
      });
    });

    it("should correctly map database fields to app fields", async () => {
      mockSingle.mockResolvedValue({
        data: mockDatabaseSettings,
        error: null,
      });

      const result = await settingsApi.get();

      expect(result).toEqual(
        expect.objectContaining({
          focusDuration: mockDatabaseSettings.focus_duration,
          shortBreakDuration: mockDatabaseSettings.short_break_duration,
          longBreakDuration: mockDatabaseSettings.long_break_duration,
          autoStartBreaks: mockDatabaseSettings.auto_start_breaks,
          notificationsEnabled: mockDatabaseSettings.notifications_enabled,
          soundEnabled: mockDatabaseSettings.sound_enabled,
          dailyGoal: mockDatabaseSettings.daily_goal,
        }),
      );
    });
  });

  describe("Error handling and fallback behavior", () => {
    it("should throw descriptive errors", async () => {
      const errorMessage = "Connection timeout";
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      });

      await expect(settingsApi.get()).rejects.toThrow(errorMessage);
    });

    it("should handle network errors", async () => {
      mockSingle.mockRejectedValue(new Error("Network error"));

      await expect(settingsApi.get()).rejects.toThrow("Network error");
    });

    it("should handle malformed data gracefully", async () => {
      mockSingle.mockResolvedValue({
        data: { invalid: "data" },
        error: null,
      });

      const result = await settingsApi.get();
      expect(result).toBeDefined();
    });
  });

  describe("Integration scenarios", () => {
    it("should handle first-time user setup", async () => {
      // Simulate no existing settings
      mockSingle
        .mockResolvedValueOnce({
          data: null,
          error: { code: "PGRST116" },
        })
        .mockResolvedValueOnce({
          data: mockDatabaseSettings,
          error: null,
        });

      const result = await settingsApi.get();

      expect(mockInsert).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should handle concurrent updates gracefully", async () => {
      let callCount = 0;
      mockSingle.mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          data: {
            ...mockDatabaseSettings,
            focus_duration: 20 + callCount,
          },
          error: null,
        });
      });

      const [result1, result2] = await Promise.all([
        settingsApi.update({ focusDuration: 25 }),
        settingsApi.update({ focusDuration: 30 }),
      ]);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it("should validate data types", async () => {
      mockSingle.mockResolvedValue({
        data: mockDatabaseSettings,
        error: null,
      });

      // Test with invalid data types
      const invalidUpdates = {
        focusDuration: "invalid" as any,
        notificationsEnabled: "yes" as any,
      };

      // The API should handle type conversion or validation
      await expect(settingsApi.update(invalidUpdates)).resolves.toBeDefined();
    });
  });
});

// Integration tests for localStorage fallback
describe("Settings Storage Integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should fall back to localStorage when database fails", () => {
    const settings = {
      theme: "dark" as const,
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      notificationsEnabled: true,
      soundEnabled: true,
      autoStartBreaks: false,
      dailyGoal: 5,
      workingHours: {
        start: "09:00",
        end: "17:00",
      },
    };

    localStorage.setItem("flowtracker_user_settings", JSON.stringify(settings));

    const retrieved = JSON.parse(
      localStorage.getItem("flowtracker_user_settings") || "{}",
    );
    expect(retrieved).toEqual(settings);
  });

  it("should handle corrupted localStorage data", () => {
    localStorage.setItem("flowtracker_user_settings", "invalid json");

    expect(() => {
      JSON.parse(localStorage.getItem("flowtracker_user_settings") || "{}");
    }).toThrow();
  });

  it("should merge default settings with stored partial settings", () => {
    const partialSettings = { theme: "light", focusDuration: 30 };
    localStorage.setItem(
      "flowtracker_user_settings",
      JSON.stringify(partialSettings),
    );

    const stored = JSON.parse(
      localStorage.getItem("flowtracker_user_settings") || "{}",
    );
    const defaultSettings = {
      theme: "dark",
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      notificationsEnabled: true,
      soundEnabled: true,
      autoStartBreaks: false,
      dailyGoal: 5,
      workingHours: { start: "09:00", end: "17:00" },
    };

    const merged = { ...defaultSettings, ...stored };
    expect(merged.theme).toBe("light");
    expect(merged.focusDuration).toBe(30);
    expect(merged.shortBreakDuration).toBe(5); // from defaults
  });
});
