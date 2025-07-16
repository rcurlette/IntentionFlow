/**
 * FlowTracker Configuration System
 * Handles storage mode selection and app configuration
 */

export type StorageMode = "auto" | "database" | "localStorage" | "hybrid";

export interface FlowTrackerConfig {
  // Storage Configuration
  storageMode: StorageMode;
  enableFallback: boolean;
  debugStorage: boolean;
  forceAdminMode: boolean;

  // Database Configuration
  enableDatabase: boolean;
  databaseConnectTimeout: number;
  databaseRetryAttempts: number;

  // Sync Configuration
  syncInterval: number;
  offlineSyncEnabled: boolean;

  // Development Configuration
  isDevelopment: boolean;
  enableDevTools: boolean;
  logLevel: "error" | "warn" | "info" | "debug";

  // Feature Flags
  features: {
    flowTracking: boolean;
    pomodoroTimer: boolean;
    achievements: boolean;
    analytics: boolean;
    cloudSync: boolean;
  };
}

// Environment variable helpers
const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
};

const getEnvString = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Default configuration
const DEFAULT_CONFIG: FlowTrackerConfig = {
  // Storage Configuration
  storageMode: "auto",
  enableFallback: true,
  debugStorage: false,
  forceAdminMode: false,

  // Database Configuration
  enableDatabase: true,
  databaseConnectTimeout: 5000,
  databaseRetryAttempts: 3,

  // Sync Configuration
  syncInterval: 30000, // 30 seconds
  offlineSyncEnabled: true,

  // Development Configuration
  isDevelopment: import.meta.env.DEV,
  enableDevTools: import.meta.env.DEV,
  logLevel: import.meta.env.DEV ? "debug" : "warn",

  // Feature Flags
  features: {
    flowTracking: true,
    pomodoroTimer: true,
    achievements: true,
    analytics: true,
    cloudSync: true,
  },
};

// Load configuration from environment variables
export const config: FlowTrackerConfig = {
  // Storage Configuration
  storageMode: getEnvString(
    "VITE_FLOWTRACKER_STORAGE_MODE",
    DEFAULT_CONFIG.storageMode,
  ) as StorageMode,
  enableFallback: getEnvBoolean(
    "VITE_FLOWTRACKER_ENABLE_FALLBACK",
    DEFAULT_CONFIG.enableFallback,
  ),
  debugStorage: getEnvBoolean(
    "VITE_FLOWTRACKER_DEBUG_STORAGE",
    DEFAULT_CONFIG.debugStorage,
  ),
  forceAdminMode: getEnvBoolean(
    "VITE_FLOWTRACKER_FORCE_ADMIN_MODE",
    DEFAULT_CONFIG.forceAdminMode,
  ),

  // Database Configuration
  enableDatabase: getEnvBoolean(
    "VITE_FLOWTRACKER_ENABLE_DATABASE",
    DEFAULT_CONFIG.enableDatabase,
  ),
  databaseConnectTimeout: getEnvNumber(
    "VITE_FLOWTRACKER_DB_TIMEOUT",
    DEFAULT_CONFIG.databaseConnectTimeout,
  ),
  databaseRetryAttempts: getEnvNumber(
    "VITE_FLOWTRACKER_DB_RETRY_ATTEMPTS",
    DEFAULT_CONFIG.databaseRetryAttempts,
  ),

  // Sync Configuration
  syncInterval: getEnvNumber(
    "VITE_FLOWTRACKER_SYNC_INTERVAL",
    DEFAULT_CONFIG.syncInterval,
  ),
  offlineSyncEnabled: getEnvBoolean(
    "VITE_FLOWTRACKER_OFFLINE_SYNC",
    DEFAULT_CONFIG.offlineSyncEnabled,
  ),

  // Development Configuration
  isDevelopment: DEFAULT_CONFIG.isDevelopment,
  enableDevTools: getEnvBoolean(
    "VITE_FLOWTRACKER_DEV_TOOLS",
    DEFAULT_CONFIG.enableDevTools,
  ),
  logLevel: getEnvString(
    "VITE_FLOWTRACKER_LOG_LEVEL",
    DEFAULT_CONFIG.logLevel,
  ) as FlowTrackerConfig["logLevel"],

  // Feature Flags
  features: {
    flowTracking: getEnvBoolean(
      "VITE_FLOWTRACKER_FEATURE_FLOW_TRACKING",
      DEFAULT_CONFIG.features.flowTracking,
    ),
    pomodoroTimer: getEnvBoolean(
      "VITE_FLOWTRACKER_FEATURE_POMODORO",
      DEFAULT_CONFIG.features.pomodoroTimer,
    ),
    achievements: getEnvBoolean(
      "VITE_FLOWTRACKER_FEATURE_ACHIEVEMENTS",
      DEFAULT_CONFIG.features.achievements,
    ),
    analytics: getEnvBoolean(
      "VITE_FLOWTRACKER_FEATURE_ANALYTICS",
      DEFAULT_CONFIG.features.analytics,
    ),
    cloudSync: getEnvBoolean(
      "VITE_FLOWTRACKER_FEATURE_CLOUD_SYNC",
      DEFAULT_CONFIG.features.cloudSync,
    ),
  },
};

// Configuration validation
export const validateConfig = (cfg: FlowTrackerConfig): string[] => {
  const errors: string[] = [];

  if (
    !["auto", "database", "localStorage", "hybrid"].includes(cfg.storageMode)
  ) {
    errors.push(`Invalid storage mode: ${cfg.storageMode}`);
  }

  if (cfg.databaseConnectTimeout < 1000) {
    errors.push("Database connect timeout must be at least 1000ms");
  }

  if (cfg.databaseRetryAttempts < 0 || cfg.databaseRetryAttempts > 10) {
    errors.push("Database retry attempts must be between 0 and 10");
  }

  if (cfg.syncInterval < 5000) {
    errors.push("Sync interval must be at least 5000ms");
  }

  return errors;
};

// Storage mode detection
export const detectStorageMode = async (): Promise<StorageMode> => {
  if (config.forceAdminMode) {
    log("info", "Admin mode forced via configuration");
    return "localStorage";
  }

  if (config.storageMode !== "auto") {
    log("info", `Storage mode set to: ${config.storageMode}`);
    return config.storageMode;
  }

  // Auto-detection logic
  try {
    // Check if we have Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      log("info", "No Supabase configuration found, using localStorage");
      return "localStorage";
    }

    // Test database connectivity
    if (config.enableDatabase) {
      const isConnected = await testDatabaseConnection();
      if (isConnected) {
        log("info", "Database connection successful, using database mode");
        return "database";
      }
    }

    log("warn", "Database unavailable, falling back to localStorage");
    return "localStorage";
  } catch (error) {
    log("error", "Error detecting storage mode:", error);
    return "localStorage";
  }
};

// Database connection test
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    // Dynamic import to avoid loading Supabase if not needed
    const { supabase } = await import("./supabase");

    // Test with a simple query
    const { error } = await supabase.from("profiles").select("id").limit(1);

    return !error;
  } catch (error) {
    log("warn", "Database connection test failed:", error);
    return false;
  }
};

// Logging utility
export const log = (
  level: FlowTrackerConfig["logLevel"],
  message: string,
  ...args: any[]
): void => {
  const levels: Record<FlowTrackerConfig["logLevel"], number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  if (levels[level] <= levels[config.logLevel]) {
    const prefix = `[FlowTracker:${level.toUpperCase()}]`;
    console[level === "debug" ? "log" : level](prefix, message, ...args);
  }
};

// Configuration status
export const getConfigStatus = () => {
  const errors = validateConfig(config);

  return {
    valid: errors.length === 0,
    errors,
    config: {
      storageMode: config.storageMode,
      enableDatabase: config.enableDatabase,
      enableFallback: config.enableFallback,
      isDevelopment: config.isDevelopment,
      debugStorage: config.debugStorage,
    },
  };
};

// Export singleton instance
export default config;
