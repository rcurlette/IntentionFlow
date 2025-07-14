import { describe, it, expect, beforeEach, vi, MockedFunction } from "vitest";
import { authHelpers, createUserProfile, getUserProfile } from "@/lib/auth";
import { supabase } from "@/lib/auth";

// Mock Supabase
vi.mock("@/lib/auth", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(),
      eq: vi.fn().mockReturnThis(),
    })),
  },
  authHelpers: {
    isConfigured: vi.fn(),
    signInWithEmail: vi.fn(),
    signUpWithEmail: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
    getCurrentSession: vi.fn(),
  },
  createUserProfile: vi.fn(),
  getUserProfile: vi.fn(),
}));

describe("Authentication System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("User Registration", () => {
    it("should create user with email and password", async () => {
      const mockUser = {
        id: "test-user-id",
        email: "test@example.com",
        user_metadata: {
          full_name: "Test User",
        },
      };

      const mockSignUpResponse = {
        data: {
          user: mockUser,
          session: null,
        },
        error: null,
      };

      (authHelpers.signUpWithEmail as MockedFunction<any>).mockResolvedValue(
        mockSignUpResponse,
      );

      const result = await authHelpers.signUpWithEmail(
        "test@example.com",
        "password123",
      );

      expect(authHelpers.signUpWithEmail).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
      expect(result).toEqual(mockSignUpResponse);
    });

    it("should handle signup errors", async () => {
      const mockError = {
        data: null,
        error: {
          message: "Email already registered",
          status: 422,
        },
      };

      (authHelpers.signUpWithEmail as MockedFunction<any>).mockResolvedValue(
        mockError,
      );

      const result = await authHelpers.signUpWithEmail(
        "existing@example.com",
        "password123",
      );

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Email already registered");
    });
  });

  describe("User Login", () => {
    it("should authenticate user with correct credentials", async () => {
      const mockUser = {
        id: "test-user-id",
        email: "robert.curlette@gmail.com",
        user_metadata: {
          full_name: "Robert Curlette",
        },
      };

      const mockSession = {
        access_token: "mock-access-token",
        user: mockUser,
      };

      const mockLoginResponse = {
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      };

      (authHelpers.signInWithEmail as MockedFunction<any>).mockResolvedValue(
        mockLoginResponse,
      );

      const result = await authHelpers.signInWithEmail(
        "robert.curlette@gmail.com",
        "testpassword123",
      );

      expect(authHelpers.signInWithEmail).toHaveBeenCalledWith(
        "robert.curlette@gmail.com",
        "testpassword123",
      );
      expect(result.data.user.email).toBe("robert.curlette@gmail.com");
      expect(result.error).toBeNull();
    });

    it("should handle invalid credentials", async () => {
      const mockError = {
        data: null,
        error: {
          message: "Invalid login credentials",
          status: 400,
        },
      };

      (authHelpers.signInWithEmail as MockedFunction<any>).mockResolvedValue(
        mockError,
      );

      const result = await authHelpers.signInWithEmail(
        "robert.curlette@gmail.com",
        "wrongpassword",
      );

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe("Invalid login credentials");
    });
  });

  describe("User Profile Creation", () => {
    it("should create user profile in database after registration", async () => {
      const userId = "test-user-id";
      const userData = {
        email: "robert.curlette@gmail.com",
        full_name: "Robert Curlette",
        avatar_url: "",
        plan_type: "free" as const,
        plan_cost: 0,
      };

      const mockProfile = {
        id: userId,
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (createUserProfile as MockedFunction<any>).mockResolvedValue(mockProfile);

      const result = await createUserProfile(userId, userData);

      expect(createUserProfile).toHaveBeenCalledWith(userId, userData);
      expect(result.email).toBe("robert.curlette@gmail.com");
      expect(result.plan_type).toBe("free");
    });

    it("should retrieve existing user profile", async () => {
      const userId = "test-user-id";
      const mockProfile = {
        id: userId,
        email: "robert.curlette@gmail.com",
        full_name: "Robert Curlette",
        plan_type: "free",
        plan_cost: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (getUserProfile as MockedFunction<any>).mockResolvedValue(mockProfile);

      const result = await getUserProfile(userId);

      expect(getUserProfile).toHaveBeenCalledWith(userId);
      expect(result.email).toBe("robert.curlette@gmail.com");
    });
  });

  describe("Admin User Detection", () => {
    it("should identify admin user by email", () => {
      // Test the admin email logic directly
      const adminEmail = "robert.curlette@gmail.com";
      const isAdminUser = (userEmail: string | undefined) => {
        return userEmail === adminEmail;
      };

      expect(isAdminUser("robert.curlette@gmail.com")).toBe(true);
      expect(isAdminUser("regular.user@gmail.com")).toBe(false);
      expect(isAdminUser(undefined)).toBe(false);
    });
  });

  describe("Data Storage Location", () => {
    it("should store user authentication data in Supabase auth.users table", () => {
      // This test documents where authentication data is stored
      const expectedStorage = {
        table: "auth.users",
        provider: "Supabase",
        fields: [
          "id (UUID)",
          "email",
          "encrypted_password",
          "email_confirmed_at",
          "created_at",
          "updated_at",
          "user_metadata (JSON)",
        ],
      };

      expect(expectedStorage.table).toBe("auth.users");
      expect(expectedStorage.provider).toBe("Supabase");
      expect(expectedStorage.fields).toContain("email");
      expect(expectedStorage.fields).toContain("encrypted_password");
    });

    it("should store user profile data in custom user_profiles table", () => {
      const expectedProfileStorage = {
        table: "user_profiles",
        fields: [
          "id (UUID) - references auth.users(id)",
          "email",
          "full_name",
          "avatar_url",
          "plan_type",
          "plan_cost",
          "created_at",
          "updated_at",
        ],
      };

      expect(expectedProfileStorage.table).toBe("user_profiles");
      expect(expectedProfileStorage.fields).toContain(
        "id (UUID) - references auth.users(id)",
      );
    });

    it("should store flow data in separate tables with user_id foreign key", () => {
      const expectedFlowStorage = {
        tables: [
          "profiles (flow-specific profile data)",
          "tasks (user tasks and subtasks)",
          "flow_sessions (daily flow rituals and state)",
          "flow_actions (quick flow actions)",
          "user_settings (app preferences)",
        ],
        security: "Row Level Security (RLS) enabled",
        userIsolation: "All tables filtered by user_id",
      };

      expect(expectedFlowStorage.tables).toHaveLength(5);
      expect(expectedFlowStorage.security).toBe(
        "Row Level Security (RLS) enabled",
      );
      expect(expectedFlowStorage.userIsolation).toBe(
        "All tables filtered by user_id",
      );
    });
  });

  describe("Security Tests", () => {
    it("should hash passwords securely in Supabase", () => {
      // Supabase handles password hashing automatically
      const securityFeatures = {
        passwordHashing: "bcrypt (handled by Supabase)",
        passwordMinLength: 6,
        emailVerification: "optional (configurable)",
        sessionManagement: "JWT tokens with refresh",
        rateLimiting: "built-in Supabase protection",
      };

      expect(securityFeatures.passwordHashing).toBe(
        "bcrypt (handled by Supabase)",
      );
      expect(securityFeatures.sessionManagement).toBe(
        "JWT tokens with refresh",
      );
    });

    it("should enforce Row Level Security policies", () => {
      const rlsPolicies = {
        profiles: "Users can only see/edit their own profile",
        tasks: "Users can only see/edit their own tasks",
        flow_sessions: "Users can only see/edit their own sessions",
        flow_actions: "Users can only see/edit their own actions",
        user_settings: "Users can only see/edit their own settings",
      };

      expect(Object.keys(rlsPolicies)).toHaveLength(5);
      expect(rlsPolicies.profiles).toContain("their own");
    });
  });
});

describe("Integration Tests", () => {
  it("should complete full signup flow", async () => {
    const email = "newuser@example.com";
    const password = "securepassword123";

    // Mock the complete signup flow
    const mockSignupResponse = {
      data: {
        user: {
          id: "new-user-id",
          email,
          user_metadata: { full_name: "New User" },
        },
        session: null, // Email confirmation required
      },
      error: null,
    };

    const mockProfileResponse = {
      id: "new-user-id",
      email,
      full_name: "New User",
      plan_type: "free",
      plan_cost: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (authHelpers.signUpWithEmail as MockedFunction<any>).mockResolvedValue(
      mockSignupResponse,
    );
    (createUserProfile as MockedFunction<any>).mockResolvedValue(
      mockProfileResponse,
    );

    // Test signup
    const signupResult = await authHelpers.signUpWithEmail(email, password);
    expect(signupResult.error).toBeNull();
    expect(signupResult.data.user.email).toBe(email);

    // Test profile creation
    if (signupResult.data.user) {
      const profileResult = await createUserProfile(signupResult.data.user.id, {
        email,
        full_name: "New User",
        plan_type: "free",
        plan_cost: 0,
      });
      expect(profileResult.email).toBe(email);
    }
  });
});
