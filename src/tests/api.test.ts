import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { supabase } from "../lib/supabase";
import {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  getTaskById,
  getTasksByDate,
} from "../lib/api/tasks";
import {
  createFlowSession,
  getTodayFlowSession,
  upsertTodayFlowSession,
  getUserFlowStats,
} from "../lib/api/flow-sessions";
import {
  getCurrentProfile,
  createProfile,
  updateProfile,
  initializeUserFlow,
} from "../lib/api/profiles";

// Mock user for testing
const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  user_metadata: {
    full_name: "Test User",
    avatar_url: "https://example.com/avatar.jpg",
  },
};

// Mock Supabase auth
const mockAuth = {
  getUser: () => Promise.resolve({ data: { user: mockUser } }),
};

// Replace supabase auth with mock
(supabase.auth as any) = mockAuth;

describe("Task API", () => {
  let testTaskId: string;

  afterEach(async () => {
    // Clean up test data
    if (testTaskId) {
      try {
        await deleteTask(testTaskId);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  it("should create a new task", async () => {
    const taskData = {
      title: "Test Task",
      description: "Test Description",
      type: "brain" as const,
      period: "morning" as const,
      priority: "medium" as const,
      completed: false,
      tags: ["test"],
    };

    const task = await createTask(taskData);
    testTaskId = task.id;

    expect(task).toBeDefined();
    expect(task.title).toBe(taskData.title);
    expect(task.type).toBe(taskData.type);
    expect(task.id).toBeDefined();
    expect(task.createdAt).toBeDefined();
  });

  it("should get all user tasks", async () => {
    // Create a test task first
    const taskData = {
      title: "Test Task for GetAll",
      description: "Test Description",
      type: "admin" as const,
      period: "afternoon" as const,
      priority: "high" as const,
      completed: false,
    };

    const createdTask = await createTask(taskData);
    testTaskId = createdTask.id;

    const tasks = await getAllTasks();

    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.some((task) => task.id === createdTask.id)).toBe(true);
  });

  it("should get task by ID", async () => {
    const taskData = {
      title: "Test Task for GetById",
      description: "Test Description",
      type: "brain" as const,
      period: "morning" as const,
      priority: "low" as const,
      completed: false,
    };

    const createdTask = await createTask(taskData);
    testTaskId = createdTask.id;

    const task = await getTaskById(createdTask.id);

    expect(task).toBeDefined();
    expect(task?.id).toBe(createdTask.id);
    expect(task?.title).toBe(taskData.title);
  });

  it("should update a task", async () => {
    const taskData = {
      title: "Test Task for Update",
      description: "Test Description",
      type: "brain" as const,
      period: "morning" as const,
      priority: "medium" as const,
      completed: false,
    };

    const createdTask = await createTask(taskData);
    testTaskId = createdTask.id;

    const updates = {
      title: "Updated Task Title",
      completed: true,
      priority: "high" as const,
    };

    const updatedTask = await updateTask(createdTask.id, updates);

    expect(updatedTask.title).toBe(updates.title);
    expect(updatedTask.completed).toBe(updates.completed);
    expect(updatedTask.priority).toBe(updates.priority);
    expect(updatedTask.updatedAt.getTime()).toBeGreaterThan(
      createdTask.createdAt.getTime(),
    );
  });

  it("should delete a task", async () => {
    const taskData = {
      title: "Test Task for Delete",
      description: "Test Description",
      type: "admin" as const,
      period: "afternoon" as const,
      priority: "medium" as const,
      completed: false,
    };

    const createdTask = await createTask(taskData);

    await deleteTask(createdTask.id);

    const deletedTask = await getTaskById(createdTask.id);
    expect(deletedTask).toBeNull();
  });

  it("should get tasks by date", async () => {
    const today = new Date().toISOString().split("T")[0];
    const taskData = {
      title: "Test Task for Date",
      description: "Test Description",
      type: "brain" as const,
      period: "morning" as const,
      priority: "medium" as const,
      completed: false,
      scheduledFor: today,
    };

    const createdTask = await createTask(taskData);
    testTaskId = createdTask.id;

    const tasks = await getTasksByDate(today);

    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.some((task) => task.id === createdTask.id)).toBe(true);
  });
});

describe("Flow Session API", () => {
  let testSessionId: string;

  afterEach(async () => {
    // Clean up test data
    if (testSessionId) {
      try {
        await supabase
          .from("flow_sessions")
          .delete()
          .eq("id", testSessionId)
          .eq("user_id", mockUser.id);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  it("should create a flow session", async () => {
    const sessionData = {
      date: new Date().toISOString().split("T")[0],
      rituals: [
        {
          id: "meditation",
          name: "Meditation",
          duration: 5,
          description: "Morning meditation",
          completed: true,
          isCore: true,
        },
      ],
      flowState: {
        energy: "high" as const,
        focus: "sharp" as const,
        mood: "inspired" as const,
        environment: "optimal" as const,
        assessedAt: new Date(),
      },
      intention: "Test intention",
      phase: "foundation" as const,
      dayNumber: 1,
    };

    const session = await createFlowSession(sessionData);
    testSessionId = session.id;

    expect(session).toBeDefined();
    expect(session.date).toBe(sessionData.date);
    expect(session.intention).toBe(sessionData.intention);
    expect(session.phase).toBe(sessionData.phase);
  });

  it("should upsert today's flow session", async () => {
    const today = new Date().toISOString().split("T")[0];
    const sessionData = {
      date: today,
      rituals: [
        {
          id: "meditation",
          name: "Meditation",
          duration: 5,
          description: "Morning meditation",
          completed: true,
          isCore: true,
        },
      ],
      flowState: {
        energy: "medium" as const,
        focus: "calm" as const,
        mood: "neutral" as const,
        environment: "okay" as const,
        assessedAt: new Date(),
      },
      intention: "Test upsert intention",
      phase: "foundation" as const,
      dayNumber: 1,
    };

    // First upsert
    const session1 = await upsertTodayFlowSession(sessionData);
    testSessionId = session1.id;

    // Second upsert (should update, not create new)
    const updatedSessionData = {
      ...sessionData,
      intention: "Updated intention",
    };
    const session2 = await upsertTodayFlowSession(updatedSessionData);

    expect(session1.id).toBe(session2.id);
    expect(session2.intention).toBe("Updated intention");
  });

  it("should get user flow stats", async () => {
    const stats = await getUserFlowStats();

    expect(stats).toBeDefined();
    expect(typeof stats.totalDays).toBe("number");
    expect(typeof stats.currentStreak).toBe("number");
    expect(typeof stats.longestStreak).toBe("number");
    expect(typeof stats.currentPhase).toBe("string");
  });
});

describe("Profile API", () => {
  afterEach(async () => {
    // Clean up test data
    try {
      await supabase.from("profiles").delete().eq("id", mockUser.id);
      await supabase.from("user_settings").delete().eq("user_id", mockUser.id);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it("should create a user profile", async () => {
    const profileData = {
      email: mockUser.email,
      name: "Test User",
      avatarUrl: "https://example.com/avatar.jpg",
      flowArchetype: "Deep Worker",
      flowStartDate: new Date().toISOString().split("T")[0],
    };

    const profile = await createProfile(profileData);

    expect(profile).toBeDefined();
    expect(profile.email).toBe(profileData.email);
    expect(profile.name).toBe(profileData.name);
    expect(profile.flowArchetype).toBe(profileData.flowArchetype);
  });

  it("should update a user profile", async () => {
    // Create profile first
    const profileData = {
      email: mockUser.email,
      name: "Test User",
      avatarUrl: null,
      flowArchetype: "Deep Worker",
      flowStartDate: new Date().toISOString().split("T")[0],
    };

    await createProfile(profileData);

    // Update profile
    const updates = {
      name: "Updated Test User",
      flowArchetype: "Creative Sprinter",
    };

    const updatedProfile = await updateProfile(updates);

    expect(updatedProfile.name).toBe(updates.name);
    expect(updatedProfile.flowArchetype).toBe(updates.flowArchetype);
  });

  it("should initialize user flow", async () => {
    await initializeUserFlow("Deep Worker");

    const profile = await getCurrentProfile();
    expect(profile).toBeDefined();
    expect(profile?.flowArchetype).toBe("Deep Worker");
    expect(profile?.flowStartDate).toBeDefined();
  });
});

describe("API Error Handling", () => {
  it("should handle unauthenticated requests", async () => {
    // Mock unauthenticated state
    const originalAuth = supabase.auth;
    (supabase.auth as any) = {
      getUser: () => Promise.resolve({ data: { user: null } }),
    };

    await expect(getAllTasks()).rejects.toThrow("User not authenticated");

    // Restore original auth
    (supabase.auth as any) = originalAuth;
  });

  it("should handle non-existent task", async () => {
    const nonExistentId = "non-existent-id";
    const task = await getTaskById(nonExistentId);
    expect(task).toBeNull();
  });

  it("should handle invalid task updates", async () => {
    const nonExistentId = "non-existent-id";

    await expect(
      updateTask(nonExistentId, { title: "New Title" }),
    ).rejects.toThrow();
  });
});
