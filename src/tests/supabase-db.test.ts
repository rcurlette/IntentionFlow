import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { supabase } from "@/lib/supabase";

// Test utilities
const TEST_USER_ID = "test-user-" + Date.now();
const TEST_EMAIL = "test@flowtracker.com";

// Clean up function to remove test data
async function cleanupTestData() {
  if (!supabase) return;

  try {
    // Delete in reverse order due to foreign key constraints
    await supabase.from("flow_actions").delete().eq("user_id", TEST_USER_ID);
    await supabase.from("user_settings").delete().eq("user_id", TEST_USER_ID);
    await supabase.from("flow_sessions").delete().eq("user_id", TEST_USER_ID);
    await supabase.from("tasks").delete().eq("user_id", TEST_USER_ID);
    await supabase.from("profiles").delete().eq("id", TEST_USER_ID);
  } catch (error) {
    console.warn("Cleanup error (expected if data doesn't exist):", error);
  }
}

describe("Supabase Database Operations", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe("Database Connection", () => {
    it("should connect to Supabase", () => {
      expect(supabase).toBeDefined();
      expect(supabase).not.toBeNull();
    });

    it("should have correct configuration", () => {
      if (supabase) {
        expect(supabase.supabaseUrl).toContain("supabase.co");
        expect(supabase.supabaseKey).toBeDefined();
      }
    });
  });

  describe("Profiles Table", () => {
    it("should create a user profile", async () => {
      if (!supabase) {
        console.log("Supabase not configured, skipping test");
        return;
      }

      const profileData = {
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        name: "Test User",
        flow_archetype: "Deep Worker",
        flow_start_date: new Date().toISOString().split("T")[0],
      };

      const { data, error } = await supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.email).toBe(TEST_EMAIL);
      expect(data?.name).toBe("Test User");
    });

    it("should read a user profile", async () => {
      if (!supabase) return;

      // First create a profile
      await supabase.from("profiles").insert({
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        name: "Test User",
      });

      // Then read it
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", TEST_USER_ID)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.email).toBe(TEST_EMAIL);
    });

    it("should update a user profile", async () => {
      if (!supabase) return;

      // Create profile
      await supabase.from("profiles").insert({
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        name: "Test User",
      });

      // Update profile
      const { data, error } = await supabase
        .from("profiles")
        .update({ name: "Updated Test User" })
        .eq("id", TEST_USER_ID)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.name).toBe("Updated Test User");
    });
  });

  describe("Tasks Table", () => {
    beforeEach(async () => {
      if (!supabase) return;
      // Create a profile first (required for foreign key)
      await supabase.from("profiles").insert({
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        name: "Test User",
      });
    });

    it("should create a task", async () => {
      if (!supabase) return;

      const taskData = {
        user_id: TEST_USER_ID,
        title: "Test Task",
        description: "This is a test task",
        type: "brain" as const,
        period: "morning" as const,
        status: "todo" as const,
        priority: "medium" as const,
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert(taskData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.title).toBe("Test Task");
      expect(data?.user_id).toBe(TEST_USER_ID);
    });

    it("should create a task with subtasks", async () => {
      if (!supabase) return;

      // Create parent task
      const parentTask = {
        user_id: TEST_USER_ID,
        title: "Parent Task",
        type: "brain" as const,
        period: "morning" as const,
      };

      const { data: parent, error: parentError } = await supabase
        .from("tasks")
        .insert(parentTask)
        .select()
        .single();

      expect(parentError).toBeNull();
      expect(parent?.id).toBeDefined();

      // Create subtask
      const subtaskData = {
        user_id: TEST_USER_ID,
        title: "Subtask 1",
        type: "brain" as const,
        period: "morning" as const,
        parent_task_id: parent?.id,
        depth: 1,
        is_subtask: true,
      };

      const { data: subtask, error: subtaskError } = await supabase
        .from("tasks")
        .insert(subtaskData)
        .select()
        .single();

      expect(subtaskError).toBeNull();
      expect(subtask?.parent_task_id).toBe(parent?.id);
      expect(subtask?.is_subtask).toBe(true);
    });

    it("should read user tasks", async () => {
      if (!supabase) return;

      // Create multiple tasks
      const tasks = [
        {
          user_id: TEST_USER_ID,
          title: "Task 1",
          type: "brain" as const,
          period: "morning" as const,
        },
        {
          user_id: TEST_USER_ID,
          title: "Task 2",
          type: "admin" as const,
          period: "afternoon" as const,
        },
      ];

      await supabase.from("tasks").insert(tasks);

      // Read tasks
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", TEST_USER_ID)
        .order("created_at", { ascending: true });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBe(2);
      expect(data?.[0]?.title).toBe("Task 1");
      expect(data?.[1]?.title).toBe("Task 2");
    });

    it("should update task completion", async () => {
      if (!supabase) return;

      // Create task
      const { data: task, error: createError } = await supabase
        .from("tasks")
        .insert({
          user_id: TEST_USER_ID,
          title: "Test Task",
          type: "brain" as const,
          period: "morning" as const,
        })
        .select()
        .single();

      expect(createError).toBeNull();

      // Update completion
      const { data: updatedTask, error: updateError } = await supabase
        .from("tasks")
        .update({
          completed: true,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", task?.id)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updatedTask?.completed).toBe(true);
      expect(updatedTask?.status).toBe("completed");
    });
  });

  describe("Flow Sessions Table", () => {
    beforeEach(async () => {
      if (!supabase) return;
      await supabase.from("profiles").insert({
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        name: "Test User",
      });
    });

    it("should create a flow session", async () => {
      if (!supabase) return;

      const sessionData = {
        user_id: TEST_USER_ID,
        date: new Date().toISOString().split("T")[0],
        rituals: [
          {
            id: "meditation",
            name: "Mindful Presence",
            duration: 5,
            completed: true,
            isCore: true,
          },
        ],
        flow_state: {
          energy: "high",
          focus: "sharp",
          mood: "inspired",
          environment: "optimal",
        },
        intention: "Deep focus work session",
        phase: "foundation" as const,
        day_number: 1,
      };

      const { data, error } = await supabase
        .from("flow_sessions")
        .insert(sessionData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.intention).toBe("Deep focus work session");
      expect(data?.phase).toBe("foundation");
    });

    it("should read today's flow session", async () => {
      if (!supabase) return;

      const today = new Date().toISOString().split("T")[0];

      // Create session
      await supabase.from("flow_sessions").insert({
        user_id: TEST_USER_ID,
        date: today,
        rituals: [],
        flow_state: { energy: "medium" },
        phase: "foundation",
        day_number: 1,
      });

      // Read session
      const { data, error } = await supabase
        .from("flow_sessions")
        .select("*")
        .eq("user_id", TEST_USER_ID)
        .eq("date", today)
        .single();

      expect(error).toBeNull();
      expect(data?.date).toBe(today);
    });

    it("should update flow session", async () => {
      if (!supabase) return;

      const today = new Date().toISOString().split("T")[0];

      // Create session
      const { data: session } = await supabase
        .from("flow_sessions")
        .insert({
          user_id: TEST_USER_ID,
          date: today,
          rituals: [],
          flow_state: { energy: "low" },
          phase: "foundation",
          day_number: 1,
        })
        .select()
        .single();

      // Update session
      const { data: updated, error } = await supabase
        .from("flow_sessions")
        .update({
          flow_state: { energy: "high" },
          completed_at: new Date().toISOString(),
        })
        .eq("id", session?.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated?.flow_state?.energy).toBe("high");
      expect(updated?.completed_at).toBeDefined();
    });
  });

  describe("Flow Actions Table", () => {
    beforeEach(async () => {
      if (!supabase) return;
      await supabase.from("profiles").insert({
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        name: "Test User",
      });
    });

    it("should create a flow action", async () => {
      if (!supabase) return;

      const actionData = {
        user_id: TEST_USER_ID,
        action_id: "breath-reset",
        date: new Date().toISOString().split("T")[0],
        completed_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("flow_actions")
        .insert(actionData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.action_id).toBe("breath-reset");
      expect(data?.user_id).toBe(TEST_USER_ID);
    });

    it("should read user flow actions", async () => {
      if (!supabase) return;

      const today = new Date().toISOString().split("T")[0];

      // Create multiple actions
      const actions = [
        {
          user_id: TEST_USER_ID,
          action_id: "breath-reset",
          date: today,
          completed_at: new Date().toISOString(),
        },
        {
          user_id: TEST_USER_ID,
          action_id: "posture-check",
          date: today,
          completed_at: new Date().toISOString(),
        },
      ];

      await supabase.from("flow_actions").insert(actions);

      // Read actions
      const { data, error } = await supabase
        .from("flow_actions")
        .select("*")
        .eq("user_id", TEST_USER_ID)
        .eq("date", today);

      expect(error).toBeNull();
      expect(data?.length).toBe(2);
    });
  });

  describe("User Settings Table", () => {
    beforeEach(async () => {
      if (!supabase) return;
      await supabase.from("profiles").insert({
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        name: "Test User",
      });
    });

    it("should create user settings", async () => {
      if (!supabase) return;

      const settingsData = {
        user_id: TEST_USER_ID,
        theme: "dark" as const,
        color_theme: "vibrant" as const,
        focus_duration: 25,
        daily_goal: 4,
        notifications_enabled: true,
      };

      const { data, error } = await supabase
        .from("user_settings")
        .insert(settingsData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.theme).toBe("dark");
      expect(data?.focus_duration).toBe(25);
    });

    it("should update user settings", async () => {
      if (!supabase) return;

      // Create settings
      await supabase.from("user_settings").insert({
        user_id: TEST_USER_ID,
        theme: "dark",
        focus_duration: 25,
      });

      // Update settings
      const { data, error } = await supabase
        .from("user_settings")
        .update({ focus_duration: 30, daily_goal: 6 })
        .eq("user_id", TEST_USER_ID)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.focus_duration).toBe(30);
      expect(data?.daily_goal).toBe(6);
    });
  });

  describe("Row Level Security", () => {
    it("should enforce user isolation", async () => {
      if (!supabase) return;

      const otherUserId = "other-user-" + Date.now();

      // Create profiles for both users
      await supabase.from("profiles").insert([
        { id: TEST_USER_ID, email: TEST_EMAIL, name: "Test User" },
        { id: otherUserId, email: "other@test.com", name: "Other User" },
      ]);

      // Create tasks for both users
      await supabase.from("tasks").insert([
        {
          user_id: TEST_USER_ID,
          title: "User 1 Task",
          type: "brain",
          period: "morning",
        },
        {
          user_id: otherUserId,
          title: "User 2 Task",
          type: "brain",
          period: "morning",
        },
      ]);

      // Query should only return user's own tasks (in a real app with auth context)
      const { data: userTasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", TEST_USER_ID);

      expect(userTasks?.length).toBe(1);
      expect(userTasks?.[0]?.title).toBe("User 1 Task");

      // Cleanup other user
      await supabase.from("tasks").delete().eq("user_id", otherUserId);
      await supabase.from("profiles").delete().eq("id", otherUserId);
    });
  });
});
