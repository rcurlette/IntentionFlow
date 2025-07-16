/**
 * Data Migration Utilities
 * Handles migration between localStorage and database
 */

import { log } from "../config";
import { adminStorage } from "../admin-storage";
import {
  settingsApi,
  tasksApi,
  achievementsApi,
  streaksApi,
} from "../database";
import type { UserSettings, Task, Achievement } from "@/types";

export interface MigrationProgress {
  stage: string;
  completed: number;
  total: number;
  percentage: number;
  errors: string[];
}

export interface MigrationResult {
  success: boolean;
  totalRecords: number;
  migratedRecords: number;
  errors: string[];
  timeTaken: number;
}

export interface MigrationSummary {
  settings: MigrationResult;
  tasks: MigrationResult;
  achievements: MigrationResult;
  streaks: MigrationResult;
  overall: {
    success: boolean;
    totalTime: number;
    totalRecords: number;
    totalErrors: number;
  };
}

class DataMigrator {
  private progressCallback?: (progress: MigrationProgress) => void;

  public setProgressCallback(callback: (progress: MigrationProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(
    stage: string,
    completed: number,
    total: number,
    errors: string[] = [],
  ) {
    const progress: MigrationProgress = {
      stage,
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 100,
      errors,
    };

    log(
      "debug",
      `Migration progress: ${progress.stage} - ${progress.percentage}%`,
    );

    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  // Export data from localStorage
  public async exportFromLocalStorage(): Promise<{
    settings: UserSettings | null;
    tasks: Task[];
    achievements: any[];
    userData: any;
  }> {
    try {
      log("info", "Starting localStorage data export...");

      const settings = adminStorage.getUserSettings();
      const tasks = adminStorage.getAllTasks();
      const achievements = adminStorage.getAchievements();
      const userData = adminStorage.exportAllData();

      const exportData = {
        settings,
        tasks,
        achievements,
        userData,
      };

      log("info", "localStorage export completed:", {
        settings: !!settings,
        tasksCount: tasks.length,
        achievementsCount: achievements.length,
      });

      return exportData;
    } catch (error) {
      log("error", "Failed to export from localStorage:", error);
      throw error;
    }
  }

  // Import data to database
  public async importToDatabase(data: {
    settings: UserSettings | null;
    tasks: Task[];
    achievements: any[];
  }): Promise<MigrationSummary> {
    const startTime = Date.now();
    const summary: MigrationSummary = {
      settings: {
        success: false,
        totalRecords: 0,
        migratedRecords: 0,
        errors: [],
        timeTaken: 0,
      },
      tasks: {
        success: false,
        totalRecords: 0,
        migratedRecords: 0,
        errors: [],
        timeTaken: 0,
      },
      achievements: {
        success: false,
        totalRecords: 0,
        migratedRecords: 0,
        errors: [],
        timeTaken: 0,
      },
      streaks: {
        success: false,
        totalRecords: 0,
        migratedRecords: 0,
        errors: [],
        timeTaken: 0,
      },
      overall: {
        success: false,
        totalTime: 0,
        totalRecords: 0,
        totalErrors: 0,
      },
    };

    try {
      log("info", "Starting database import...");

      // Migrate settings
      summary.settings = await this.migrateSettings(data.settings);

      // Migrate tasks
      summary.tasks = await this.migrateTasks(data.tasks);

      // Migrate achievements
      summary.achievements = await this.migrateAchievements(data.achievements);

      // Migrate streaks (if available)
      summary.streaks = await this.migrateStreaks();

      // Calculate overall summary
      const endTime = Date.now();
      summary.overall = {
        success: [
          summary.settings,
          summary.tasks,
          summary.achievements,
          summary.streaks,
        ].every((result) => result.success),
        totalTime: endTime - startTime,
        totalRecords:
          summary.settings.totalRecords +
          summary.tasks.totalRecords +
          summary.achievements.totalRecords +
          summary.streaks.totalRecords,
        totalErrors:
          summary.settings.errors.length +
          summary.tasks.errors.length +
          summary.achievements.errors.length +
          summary.streaks.errors.length,
      };

      log("info", "Database import completed:", summary.overall);

      return summary;
    } catch (error) {
      log("error", "Database import failed:", error);
      throw error;
    }
  }

  private async migrateSettings(
    settings: UserSettings | null,
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      totalRecords: settings ? 1 : 0,
      migratedRecords: 0,
      errors: [],
      timeTaken: 0,
    };

    try {
      this.updateProgress("Migrating settings", 0, 1);

      if (settings) {
        await settingsApi.create(settings);
        result.migratedRecords = 1;
        result.success = true;
        log("info", "Settings migrated successfully");
      } else {
        result.success = true;
        log("info", "No settings to migrate");
      }

      this.updateProgress("Migrating settings", 1, 1);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      result.errors.push(`Settings migration failed: ${errorMessage}`);
      log("error", "Settings migration failed:", error);
    }

    result.timeTaken = Date.now() - startTime;
    return result;
  }

  private async migrateTasks(tasks: Task[]): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      totalRecords: tasks.length,
      migratedRecords: 0,
      errors: [],
      timeTaken: 0,
    };

    try {
      this.updateProgress("Migrating tasks", 0, tasks.length);

      for (let i = 0; i < tasks.length; i++) {
        try {
          const task = tasks[i];
          await tasksApi.create(task);
          result.migratedRecords++;

          this.updateProgress("Migrating tasks", i + 1, tasks.length);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          result.errors.push(`Task ${i + 1} migration failed: ${errorMessage}`);
          log("warn", `Failed to migrate task ${i + 1}:`, error);
        }
      }

      result.success = result.errors.length === 0;
      log(
        "info",
        `Tasks migration completed: ${result.migratedRecords}/${result.totalRecords}`,
      );
    } catch (error) {
      result.errors.push(`Tasks migration failed: ${error}`);
      log("error", "Tasks migration failed:", error);
    }

    result.timeTaken = Date.now() - startTime;
    return result;
  }

  private async migrateAchievements(
    achievements: any[],
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      totalRecords: achievements.length,
      migratedRecords: 0,
      errors: [],
      timeTaken: 0,
    };

    try {
      this.updateProgress("Migrating achievements", 0, achievements.length);

      for (let i = 0; i < achievements.length; i++) {
        try {
          const achievement = achievements[i];
          await achievementsApi.create(achievement);
          result.migratedRecords++;

          this.updateProgress(
            "Migrating achievements",
            i + 1,
            achievements.length,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          result.errors.push(
            `Achievement ${i + 1} migration failed: ${errorMessage}`,
          );
          log("warn", `Failed to migrate achievement ${i + 1}:`, error);
        }
      }

      result.success = result.errors.length === 0;
      log(
        "info",
        `Achievements migration completed: ${result.migratedRecords}/${result.totalRecords}`,
      );
    } catch (error) {
      result.errors.push(`Achievements migration failed: ${error}`);
      log("error", "Achievements migration failed:", error);
    }

    result.timeTaken = Date.now() - startTime;
    return result;
  }

  private async migrateStreaks(): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      totalRecords: 1,
      migratedRecords: 0,
      errors: [],
      timeTaken: 0,
    };

    try {
      this.updateProgress("Migrating streaks", 0, 1);

      // Try to get streak data from localStorage
      const currentStreak = parseInt(
        localStorage.getItem("flowtracker_current_streak") || "0",
      );
      const longestStreak = parseInt(
        localStorage.getItem("flowtracker_longest_streak") || "0",
      );

      if (currentStreak > 0 || longestStreak > 0) {
        await streaksApi.update(currentStreak, longestStreak);
        result.migratedRecords = 1;
        log("info", "Streaks migrated successfully");
      }

      result.success = true;
      this.updateProgress("Migrating streaks", 1, 1);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      result.errors.push(`Streaks migration failed: ${errorMessage}`);
      log("error", "Streaks migration failed:", error);
    }

    result.timeTaken = Date.now() - startTime;
    return result;
  }

  // Full migration from localStorage to database
  public async migrateLocalStorageToDatabase(): Promise<MigrationSummary> {
    try {
      log("info", "Starting full migration from localStorage to database...");

      // Export data from localStorage
      const exportedData = await this.exportFromLocalStorage();

      // Import data to database
      const summary = await this.importToDatabase(exportedData);

      log("info", "Full migration completed:", summary.overall);

      return summary;
    } catch (error) {
      log("error", "Full migration failed:", error);
      throw error;
    }
  }

  // Backup localStorage data
  public async backupLocalStorageData(): Promise<string> {
    try {
      const data = await this.exportFromLocalStorage();
      const backup = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        data,
      };

      return JSON.stringify(backup, null, 2);
    } catch (error) {
      log("error", "Failed to backup localStorage data:", error);
      throw error;
    }
  }

  // Validate migrated data
  public async validateMigration(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check if settings exist in database
      try {
        await settingsApi.get();
      } catch (error) {
        issues.push("Settings not found in database");
      }

      // Check if tasks exist in database
      try {
        const tasks = await tasksApi.getAll();
        const localTasks = adminStorage.getAllTasks();

        if (tasks.length !== localTasks.length) {
          issues.push(
            `Task count mismatch: database(${tasks.length}) vs localStorage(${localTasks.length})`,
          );
        }
      } catch (error) {
        issues.push("Could not verify tasks migration");
      }

      log("info", "Migration validation completed:", {
        isValid: issues.length === 0,
        issues,
      });

      return {
        isValid: issues.length === 0,
        issues,
      };
    } catch (error) {
      log("error", "Migration validation failed:", error);
      return {
        isValid: false,
        issues: [`Validation failed: ${error}`],
      };
    }
  }
}

// Export singleton instance
export const dataMigrator = new DataMigrator();

// Export utility functions
export const migrateToDatabase = () =>
  dataMigrator.migrateLocalStorageToDatabase();
export const backupData = () => dataMigrator.backupLocalStorageData();
export const validateMigration = () => dataMigrator.validateMigration();

export default dataMigrator;
