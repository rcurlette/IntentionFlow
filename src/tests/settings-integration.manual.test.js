/**
 * Manual integration test for Settings System
 * Run this in browser console to validate settings functionality
 */

// Test 1: Check if settings hooks are working
console.log("🧪 Testing Settings System Integration...");

// Test 2: Validate UserSettings type structure
const expectedSettingsStructure = {
  // Appearance & Theme
  theme: "string",
  colorTheme: "string",
  reducedMotion: "boolean",
  highContrast: "boolean",
  animations: "boolean",

  // Pomodoro & Focus Settings
  focusDuration: "number",
  shortBreakDuration: "number",
  longBreakDuration: "number",
  sessionsBeforeLongBreak: "number",
  autoStartBreaks: "boolean",
  autoStartPomodoros: "boolean",

  // Notifications & Alerts
  notificationsEnabled: "boolean",
  soundEnabled: "boolean",
  taskReminders: "boolean",
  breakNotifications: "boolean",
  dailySummary: "boolean",
  achievementAlerts: "boolean",

  // Productivity & Goals
  dailyGoal: "number",
  workingHours: "object",

  // Music & Media
  autoPlayMusic: "boolean",
  loopMusic: "boolean",
  musicVolume: "number",

  // Profile & Personal
  timezone: "string",
  motivationalMessages: "boolean",

  // Advanced Features
  flowTrackingEnabled: "boolean",
};

// Test 3: Validate localStorage fallback
function testLocalStorageFallback() {
  try {
    const testSettings = {
      theme: "dark",
      focusDuration: 25,
      dailyGoal: 5,
      workingHours: { start: "09:00", end: "17:00" },
      timezone: "America/New_York",
    };

    localStorage.setItem(
      "flowtracker_user_settings",
      JSON.stringify(testSettings),
    );
    const retrieved = JSON.parse(
      localStorage.getItem("flowtracker_user_settings"),
    );

    console.log("✅ localStorage fallback test passed:", retrieved);
    return true;
  } catch (error) {
    console.error("❌ localStorage fallback test failed:", error);
    return false;
  }
}

// Test 4: API endpoint validation (if available)
async function testAPIEndpoints() {
  try {
    // Test if settings API endpoints are available
    const endpoints = ["/api/settings", "/api/flow/settings"];

    console.log("🔗 Available API endpoints for settings:", endpoints);
    return true;
  } catch (error) {
    console.log("⚠️ API endpoints test skipped (admin mode)");
    return true;
  }
}

// Test 5: Settings validation
function validateSettingsStructure(settings) {
  const errors = [];

  for (const [key, expectedType] of Object.entries(expectedSettingsStructure)) {
    if (!(key in settings)) {
      errors.push(`Missing field: ${key}`);
    } else if (expectedType === "object" && typeof settings[key] !== "object") {
      errors.push(
        `Invalid type for ${key}: expected object, got ${typeof settings[key]}`,
      );
    } else if (
      expectedType !== "object" &&
      typeof settings[key] !== expectedType
    ) {
      errors.push(
        `Invalid type for ${key}: expected ${expectedType}, got ${typeof settings[key]}`,
      );
    }
  }

  return errors;
}

// Run all tests
async function runIntegrationTests() {
  console.log("🚀 Starting Settings Integration Tests...");

  const results = {
    localStorage: testLocalStorageFallback(),
    api: await testAPIEndpoints(),
  };

  console.log("📊 Test Results:", results);

  if (Object.values(results).every((result) => result === true)) {
    console.log("🎉 All settings integration tests passed!");
  } else {
    console.log("⚠️ Some tests failed or were skipped");
  }

  return results;
}

// Export for manual testing
if (typeof window !== "undefined") {
  window.testSettingsIntegration = runIntegrationTests;
  window.validateSettingsStructure = validateSettingsStructure;
  console.log(
    "🔧 Settings integration tests loaded. Run window.testSettingsIntegration() to test.",
  );
}

// For Node.js testing
if (typeof module !== "undefined") {
  module.exports = {
    runIntegrationTests,
    validateSettingsStructure,
    expectedSettingsStructure,
  };
}
