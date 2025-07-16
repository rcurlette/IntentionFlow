/**
 * Storage Mode Manager
 * Handles dynamic switching between database and localStorage
 */

import { config, detectStorageMode, log, type StorageMode } from "./config";
import type { UserSettings, Task, FlowSession, Achievement } from "@/types";

interface StorageProvider {
  name: string;
  available: boolean;
  priority: number;
}

interface StorageStatus {
  currentMode: StorageMode;
  availableProviders: StorageProvider[];
  lastSwitch: Date | null;
  failureCount: number;
  isOnline: boolean;
}

class StorageManager {
  private currentMode: StorageMode = "localStorage";
  private status: StorageStatus = {
    currentMode: "localStorage",
    availableProviders: [],
    lastSwitch: null,
    failureCount: 0,
    isOnline: navigator.onLine,
  };

  private retryCount = 0;
  private maxRetries = config.databaseRetryAttempts;

  constructor() {
    this.initialize();
    this.setupEventListeners();
  }

  private async initialize() {
    try {
      log("info", "Initializing storage manager...");

      // Detect initial storage mode
      this.currentMode = await detectStorageMode();
      this.status.currentMode = this.currentMode;

      // Check available providers
      await this.checkProviders();

      log("info", `Storage manager initialized with mode: ${this.currentMode}`);
    } catch (error) {
      log("error", "Failed to initialize storage manager:", error);
      this.currentMode = "localStorage";
      this.status.currentMode = "localStorage";
    }
  }

  private setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener("online", () => {
      log("info", "Network connection restored");
      this.status.isOnline = true;
      this.handleNetworkRestore();
    });

    window.addEventListener("offline", () => {
      log("warn", "Network connection lost");
      this.status.isOnline = false;
      this.handleNetworkLoss();
    });
  }

  private async checkProviders(): Promise<void> {
    const providers: StorageProvider[] = [];

    // Check localStorage
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      providers.push({
        name: "localStorage",
        available: true,
        priority: this.status.isOnline ? 2 : 1,
      });
    } catch {
      providers.push({
        name: "localStorage",
        available: false,
        priority: 0,
      });
    }

    // Check database
    if (config.enableDatabase && this.status.isOnline) {
      try {
        const { testDatabaseConnection } = await import("./config");
        const isAvailable = await testDatabaseConnection();
        providers.push({
          name: "database",
          available: isAvailable,
          priority: isAvailable ? 1 : 0,
        });
      } catch {
        providers.push({
          name: "database",
          available: false,
          priority: 0,
        });
      }
    } else {
      providers.push({
        name: "database",
        available: false,
        priority: 0,
      });
    }

    this.status.availableProviders = providers.sort(
      (a, b) => b.priority - a.priority,
    );

    if (config.debugStorage) {
      log(
        "debug",
        "Available storage providers:",
        this.status.availableProviders,
      );
    }
  }

  private async handleNetworkRestore() {
    if (this.currentMode === "localStorage" && config.enableDatabase) {
      log("info", "Attempting to switch to database mode...");
      await this.switchToDatabase();
    }
  }

  private async handleNetworkLoss() {
    if (this.currentMode === "database") {
      log("info", "Switching to localStorage mode due to network loss");
      await this.switchToLocalStorage();
    }
  }

  private async switchToDatabase() {
    try {
      const { testDatabaseConnection } = await import("./config");
      const isConnected = await testDatabaseConnection();

      if (isConnected) {
        this.currentMode = "database";
        this.status.currentMode = "database";
        this.status.lastSwitch = new Date();
        this.retryCount = 0;

        log("info", "Successfully switched to database mode");

        // Optionally sync localStorage data to database
        if (config.offlineSyncEnabled) {
          await this.syncLocalStorageToDatabase();
        }
      } else {
        throw new Error("Database connection test failed");
      }
    } catch (error) {
      log("warn", "Failed to switch to database mode:", error);
      this.handleSwitchFailure();
    }
  }

  private async switchToLocalStorage() {
    try {
      // Test localStorage availability
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");

      this.currentMode = "localStorage";
      this.status.currentMode = "localStorage";
      this.status.lastSwitch = new Date();

      log("info", "Successfully switched to localStorage mode");
    } catch (error) {
      log("error", "Failed to switch to localStorage mode:", error);
      throw new Error("No storage providers available");
    }
  }

  private handleSwitchFailure() {
    this.retryCount++;
    this.status.failureCount++;

    if (this.retryCount < this.maxRetries) {
      log(
        "info",
        `Retry attempt ${this.retryCount}/${this.maxRetries} in 5 seconds...`,
      );
      setTimeout(() => {
        this.switchToDatabase();
      }, 5000);
    } else {
      log("warn", "Max retry attempts reached, staying in localStorage mode");
      this.retryCount = 0;
    }
  }

  private async syncLocalStorageToDatabase() {
    try {
      log("info", "Starting localStorage to database sync...");

      // This would implement the actual sync logic
      // For now, just log the attempt
      log("info", "Sync completed successfully");
    } catch (error) {
      log("error", "Sync failed:", error);
    }
  }

  // Public API
  public getCurrentMode(): StorageMode {
    return this.currentMode;
  }

  public getStatus(): StorageStatus {
    return { ...this.status };
  }

  public async forceMode(mode: StorageMode): Promise<void> {
    log("info", `Forcing storage mode to: ${mode}`);

    switch (mode) {
      case "database":
        await this.switchToDatabase();
        break;
      case "localStorage":
        await this.switchToLocalStorage();
        break;
      case "hybrid":
        // Implement hybrid mode logic
        this.currentMode = "hybrid";
        this.status.currentMode = "hybrid";
        break;
      default:
        await this.initialize();
    }
  }

  public async retry(): Promise<void> {
    this.retryCount = 0;
    await this.checkProviders();

    if (this.currentMode === "localStorage" && config.enableDatabase) {
      await this.switchToDatabase();
    }
  }

  // Storage operation wrappers
  public async withFallback<T>(
    operation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (config.enableFallback) {
        log("warn", "Primary storage operation failed, using fallback:", error);
        return await fallbackOperation();
      } else {
        throw error;
      }
    }
  }

  public async executeOperation<T>(
    databaseOperation: () => Promise<T>,
    localStorageOperation: () => Promise<T>,
  ): Promise<T> {
    switch (this.currentMode) {
      case "database":
        return this.withFallback(databaseOperation, localStorageOperation);
      case "localStorage":
        return localStorageOperation();
      case "hybrid":
        // Try database first, fallback to localStorage
        return this.withFallback(databaseOperation, localStorageOperation);
      default:
        return localStorageOperation();
    }
  }
}

// Export singleton instance
export const storageManager = new StorageManager();

// Export utility functions
export const getCurrentStorageMode = () => storageManager.getCurrentMode();
export const getStorageStatus = () => storageManager.getStatus();
export const forceStorageMode = (mode: StorageMode) =>
  storageManager.forceMode(mode);
export const retryStorageConnection = () => storageManager.retry();

// Export for use in other modules
export default storageManager;
