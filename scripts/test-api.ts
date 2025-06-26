#!/usr/bin/env node

/**
 * API Integration Test Runner
 *
 * This script tests all API endpoints to ensure they're working correctly.
 * Run with: npm run test:api
 */

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  error?: string;
  responseTime: number;
}

class APITester {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor(baseUrl = "http://localhost:8080") {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(
    endpoint: string,
    method = "GET",
    body?: any,
  ): Promise<TestResult> {
    const url = `${this.baseUrl}/api${endpoint}`;
    const startTime = Date.now();

    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (body && method !== "GET") {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const responseTime = Date.now() - startTime;

      const result: TestResult = {
        endpoint,
        method,
        status: response.status,
        success: response.ok,
        responseTime,
      };

      if (!response.ok) {
        const errorText = await response.text();
        result.error = errorText;
      }

      return result;
    } catch (error) {
      return {
        endpoint,
        method,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
      };
    }
  }

  private log(message: string, color?: string) {
    const colors = {
      green: "\x1b[32m",
      red: "\x1b[31m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      reset: "\x1b[0m",
    };

    const colorCode = color ? colors[color as keyof typeof colors] : "";
    console.log(`${colorCode}${message}${colors.reset}`);
  }

  async testHealthCheck() {
    this.log("\n🔍 Testing Health Check...", "blue");
    const result = await this.makeRequest("/health");
    this.results.push(result);

    if (result.success) {
      this.log(`✅ Health check passed (${result.responseTime}ms)`, "green");
    } else {
      this.log(`❌ Health check failed: ${result.error}`, "red");
    }
  }

  async testTaskEndpoints() {
    this.log("\n📋 Testing Task Endpoints...", "blue");

    // Test GET /api/tasks
    const getTasks = await this.makeRequest("/tasks");
    this.results.push(getTasks);

    if (getTasks.success) {
      this.log(`✅ GET /tasks passed (${getTasks.responseTime}ms)`, "green");
    } else {
      this.log(`❌ GET /tasks failed: ${getTasks.error}`, "red");
    }

    // Test GET /api/tasks with filters
    const getTasksWithDate = await this.makeRequest("/tasks?date=2024-01-01");
    this.results.push(getTasksWithDate);

    if (getTasksWithDate.success) {
      this.log(
        `✅ GET /tasks?date=2024-01-01 passed (${getTasksWithDate.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(
        `❌ GET /tasks with date filter failed: ${getTasksWithDate.error}`,
        "red",
      );
    }

    // Test POST /api/tasks
    const createTask = await this.makeRequest("/tasks", "POST", {
      title: "Test Task",
      description: "This is a test task",
      type: "brain",
      period: "morning",
      priority: "medium",
    });
    this.results.push(createTask);

    if (createTask.success) {
      this.log(`✅ POST /tasks passed (${createTask.responseTime}ms)`, "green");
    } else {
      this.log(`❌ POST /tasks failed: ${createTask.error}`, "red");
    }

    // Test GET /api/tasks/templates
    const getTemplates = await this.makeRequest("/tasks/templates");
    this.results.push(getTemplates);

    if (getTemplates.success) {
      this.log(
        `✅ GET /tasks/templates passed (${getTemplates.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(`❌ GET /tasks/templates failed: ${getTemplates.error}`, "red");
    }

    // Test bulk operations
    const bulkCreate = await this.makeRequest("/tasks/bulk", "POST", {
      tasks: [
        {
          title: "Bulk Task 1",
          type: "brain",
          period: "morning",
          priority: "medium",
        },
        {
          title: "Bulk Task 2",
          type: "admin",
          period: "afternoon",
          priority: "low",
        },
      ],
    });
    this.results.push(bulkCreate);

    if (bulkCreate.success) {
      this.log(
        `✅ POST /tasks/bulk passed (${bulkCreate.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(`❌ POST /tasks/bulk failed: ${bulkCreate.error}`, "red");
    }
  }

  async testDayPlanEndpoints() {
    this.log("\n📅 Testing Day Plan Endpoints...", "blue");

    const getDayPlan = await this.makeRequest("/day-plans");
    this.results.push(getDayPlan);

    if (getDayPlan.success) {
      this.log(
        `✅ GET /day-plans passed (${getDayPlan.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(`❌ GET /day-plans failed: ${getDayPlan.error}`, "red");
    }

    const getDayPlanWithDate = await this.makeRequest(
      "/day-plans?date=2024-01-01",
    );
    this.results.push(getDayPlanWithDate);

    if (getDayPlanWithDate.success) {
      this.log(
        `✅ GET /day-plans?date=2024-01-01 passed (${getDayPlanWithDate.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(
        `❌ GET /day-plans with date failed: ${getDayPlanWithDate.error}`,
        "red",
      );
    }
  }

  async testPomodoroEndpoints() {
    this.log("\n🍅 Testing Pomodoro Endpoints...", "blue");

    const createSession = await this.makeRequest("/pomodoro/sessions", "POST", {
      taskId: "test-task-id",
      duration: 25,
      type: "focus",
      completed: true,
      flowScore: 85,
      distractions: 2,
    });
    this.results.push(createSession);

    if (createSession.success) {
      this.log(
        `✅ POST /pomodoro/sessions passed (${createSession.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(
        `❌ POST /pomodoro/sessions failed: ${createSession.error}`,
        "red",
      );
    }

    const getStats = await this.makeRequest("/pomodoro/stats");
    this.results.push(getStats);

    if (getStats.success) {
      this.log(
        `✅ GET /pomodoro/stats passed (${getStats.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(`❌ GET /pomodoro/stats failed: ${getStats.error}`, "red");
    }
  }

  async testFlowTrackingEndpoints() {
    this.log("\n🌊 Testing Flow Tracking Endpoints...", "blue");

    const getEntries = await this.makeRequest("/flow/entries");
    this.results.push(getEntries);

    if (getEntries.success) {
      this.log(
        `✅ GET /flow/entries passed (${getEntries.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(`❌ GET /flow/entries failed: ${getEntries.error}`, "red");
    }

    const createEntry = await this.makeRequest("/flow/entries", "POST", {
      activity: "Deep work on project",
      activityType: "brain",
      flowRating: 4,
      mood: 4,
      energyLevel: 3,
      location: "Office",
      notes: "Great focus session",
    });
    this.results.push(createEntry);

    if (createEntry.success) {
      this.log(
        `✅ POST /flow/entries passed (${createEntry.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(`❌ POST /flow/entries failed: ${createEntry.error}`, "red");
    }

    const getAnalytics = await this.makeRequest("/flow/analytics");
    this.results.push(getAnalytics);

    if (getAnalytics.success) {
      this.log(
        `✅ GET /flow/analytics passed (${getAnalytics.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(`❌ GET /flow/analytics failed: ${getAnalytics.error}`, "red");
    }

    const getSettings = await this.makeRequest("/flow/settings");
    this.results.push(getSettings);

    if (getSettings.success) {
      this.log(
        `✅ GET /flow/settings passed (${getSettings.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(`❌ GET /flow/settings failed: ${getSettings.error}`, "red");
    }
  }

  async testAnalyticsEndpoints() {
    this.log("\n📊 Testing Analytics Endpoints...", "blue");

    const endpoints = [
      "/analytics/tasks",
      "/analytics/productivity",
      "/analytics/patterns",
      "/analytics/trends",
    ];

    for (const endpoint of endpoints) {
      const result = await this.makeRequest(endpoint);
      this.results.push(result);

      if (result.success) {
        this.log(
          `✅ GET ${endpoint} passed (${result.responseTime}ms)`,
          "green",
        );
      } else {
        this.log(`❌ GET ${endpoint} failed: ${result.error}`, "red");
      }
    }
  }

  async testSettingsEndpoints() {
    this.log("\n⚙️ Testing Settings Endpoints...", "blue");

    const getSettings = await this.makeRequest("/settings");
    this.results.push(getSettings);

    if (getSettings.success) {
      this.log(
        `✅ GET /settings passed (${getSettings.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(`❌ GET /settings failed: ${getSettings.error}`, "red");
    }

    const updateSettings = await this.makeRequest("/settings", "PUT", {
      theme: "dark",
      focusDuration: 25,
      shortBreakDuration: 5,
      notificationsEnabled: true,
    });
    this.results.push(updateSettings);

    if (updateSettings.success) {
      this.log(
        `✅ PUT /settings passed (${updateSettings.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(`❌ PUT /settings failed: ${updateSettings.error}`, "red");
    }
  }

  async testAchievementsAndStreaks() {
    this.log("\n🏆 Testing Achievements & Streaks Endpoints...", "blue");

    const getAchievements = await this.makeRequest("/achievements");
    this.results.push(getAchievements);

    if (getAchievements.success) {
      this.log(
        `✅ GET /achievements passed (${getAchievements.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(`❌ GET /achievements failed: ${getAchievements.error}`, "red");
    }

    const getStreaks = await this.makeRequest("/streaks");
    this.results.push(getStreaks);

    if (getStreaks.success) {
      this.log(
        `✅ GET /streaks passed (${getStreaks.responseTime}ms)`,
        "green",
      );
    } else {
      this.log(`❌ GET /streaks failed: ${getStreaks.error}`, "red");
    }
  }

  printSummary() {
    this.log("\n📋 Test Summary", "blue");
    this.log("─".repeat(50));

    const totalTests = this.results.length;
    const passedTests = this.results.filter((r) => r.success).length;
    const failedTests = totalTests - passedTests;
    const avgResponseTime =
      this.results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests;

    this.log(`Total Tests: ${totalTests}`);
    this.log(`✅ Passed: ${passedTests}`, "green");
    this.log(`❌ Failed: ${failedTests}`, failedTests > 0 ? "red" : "green");
    this.log(
      `⏱️  Average Response Time: ${avgResponseTime.toFixed(2)}ms`,
      "yellow",
    );

    if (failedTests > 0) {
      this.log("\n❌ Failed Tests:", "red");
      this.results
        .filter((r) => !r.success)
        .forEach((r) => {
          this.log(`  ${r.method} ${r.endpoint}: ${r.error}`, "red");
        });
    }

    this.log(
      `\n🎯 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`,
      passedTests === totalTests ? "green" : "yellow",
    );
  }

  async runAllTests() {
    this.log("🚀 Starting API Integration Tests...", "blue");
    this.log(`Testing against: ${this.baseUrl}`);

    try {
      await this.testHealthCheck();
      await this.testTaskEndpoints();
      await this.testDayPlanEndpoints();
      await this.testPomodoroEndpoints();
      await this.testFlowTrackingEndpoints();
      await this.testAnalyticsEndpoints();
      await this.testSettingsEndpoints();
      await this.testAchievementsAndStreaks();
    } catch (error) {
      this.log(`\n💥 Test runner error: ${error}`, "red");
    }

    this.printSummary();

    // Exit with error code if any tests failed
    const failedTests = this.results.filter((r) => !r.success).length;
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const baseUrl = process.env.API_BASE_URL || "http://localhost:8080";
  const tester = new APITester(baseUrl);
  tester.runAllTests();
}

export { APITester };
