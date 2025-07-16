import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  storageManager,
  getCurrentStorageMode,
  getStorageStatus,
  forceStorageMode,
  retryStorageConnection,
} from "@/lib/storage-manager";
import {
  dataMigrator,
  migrateToDatabase,
  backupData,
  validateMigration,
  type MigrationProgress,
  type MigrationSummary,
} from "@/lib/migration/data-migrator";
import { config, getConfigStatus } from "@/lib/config";
import {
  Database,
  HardDrive,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Settings,
  Activity,
  Zap,
} from "lucide-react";

export function StorageManager() {
  const { toast } = useToast();
  const [storageMode, setStorageMode] = useState(getCurrentStorageMode());
  const [storageStatus, setStorageStatus] = useState(getStorageStatus());
  const [configStatus, setConfigStatus] = useState(getConfigStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [migrationProgress, setMigrationProgress] =
    useState<MigrationProgress | null>(null);
  const [migrationSummary, setMigrationSummary] =
    useState<MigrationSummary | null>(null);

  // Update status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStorageMode(getCurrentStorageMode());
      setStorageStatus(getStorageStatus());
      setConfigStatus(getConfigStatus());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Set up migration progress callback
  useEffect(() => {
    dataMigrator.setProgressCallback(setMigrationProgress);
  }, []);

  const handleForceMode = async (mode: "database" | "localStorage") => {
    setIsLoading(true);
    try {
      await forceStorageMode(mode);
      setStorageMode(getCurrentStorageMode());
      toast({
        title: "Storage Mode Changed",
        description: `Successfully switched to ${mode} mode.`,
      });
    } catch (error) {
      toast({
        title: "Mode Switch Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryConnection = async () => {
    setIsLoading(true);
    try {
      await retryStorageConnection();
      setStorageStatus(getStorageStatus());
      toast({
        title: "Connection Retry",
        description: "Storage connection has been retried.",
      });
    } catch (error) {
      toast({
        title: "Retry Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigration = async () => {
    setIsLoading(true);
    setMigrationProgress(null);
    setMigrationSummary(null);

    try {
      const summary = await migrateToDatabase();
      setMigrationSummary(summary);

      if (summary.overall.success) {
        toast({
          title: "Migration Successful",
          description: `Migrated ${summary.overall.totalRecords} records successfully.`,
        });
      } else {
        toast({
          title: "Migration Completed with Errors",
          description: `${summary.overall.totalErrors} errors occurred during migration.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Migration Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setMigrationProgress(null);
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      const backupData = await backupData();
      const blob = new Blob([backupData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flowtracker-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Created",
        description: "Your data has been backed up successfully.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidation = async () => {
    setIsLoading(true);
    try {
      const validation = await validateMigration();

      if (validation.isValid) {
        toast({
          title: "Validation Successful",
          description: "All migrated data is valid and consistent.",
        });
      } else {
        toast({
          title: "Validation Issues Found",
          description: `${validation.issues.length} issues detected.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Validation Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStorageModeIcon = (mode: string) => {
    switch (mode) {
      case "database":
        return <Database className="h-4 w-4" />;
      case "localStorage":
        return <HardDrive className="h-4 w-4" />;
      case "hybrid":
        return <Activity className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getStorageModeColor = (mode: string) => {
    switch (mode) {
      case "database":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "localStorage":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "hybrid":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Storage Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Current Mode:</span>
              <Badge
                variant="outline"
                className={getStorageModeColor(storageMode)}
              >
                {getStorageModeIcon(storageMode)}
                <span className="ml-1 capitalize">{storageMode}</span>
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Network:</span>
              <Badge
                variant="outline"
                className={
                  storageStatus.isOnline
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }
              >
                {storageStatus.isOnline ? "Online" : "Offline"}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Providers:</span>
              <span className="text-sm text-white">
                {
                  storageStatus.availableProviders.filter((p) => p.available)
                    .length
                }
                /{storageStatus.availableProviders.length}
              </span>
            </div>
          </div>

          {storageStatus.failureCount > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-400">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                {storageStatus.failureCount} connection failures detected
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Storage Mode:</span>
              <div className="text-white font-medium">{config.storageMode}</div>
            </div>
            <div>
              <span className="text-slate-400">Database:</span>
              <div className="text-white font-medium">
                {config.enableDatabase ? "Enabled" : "Disabled"}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Fallback:</span>
              <div className="text-white font-medium">
                {config.enableFallback ? "Enabled" : "Disabled"}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Debug:</span>
              <div className="text-white font-medium">
                {config.debugStorage ? "Enabled" : "Disabled"}
              </div>
            </div>
          </div>

          {!configStatus.valid && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Configuration issues: {configStatus.errors.join(", ")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Mode Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Storage Mode Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={() => handleForceMode("database")}
              disabled={isLoading}
              variant={storageMode === "database" ? "default" : "outline"}
              className="flex items-center space-x-2"
            >
              <Database className="h-4 w-4" />
              <span>Database Mode</span>
            </Button>

            <Button
              onClick={() => handleForceMode("localStorage")}
              disabled={isLoading}
              variant={storageMode === "localStorage" ? "default" : "outline"}
              className="flex items-center space-x-2"
            >
              <HardDrive className="h-4 w-4" />
              <span>Local Storage</span>
            </Button>

            <Button
              onClick={handleRetryConnection}
              disabled={isLoading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Connection</span>
            </Button>

            <Button
              onClick={handleValidation}
              disabled={isLoading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Validate Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Migration Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Data Migration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {migrationProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">
                  {migrationProgress.stage}
                </span>
                <span className="text-white">
                  {migrationProgress.completed}/{migrationProgress.total} (
                  {migrationProgress.percentage}%)
                </span>
              </div>
              <Progress value={migrationProgress.percentage} />
              {migrationProgress.errors.length > 0 && (
                <div className="text-sm text-red-400">
                  {migrationProgress.errors.length} errors occurred
                </div>
              )}
            </div>
          )}

          {migrationSummary && (
            <div className="p-4 bg-slate-700 rounded-lg space-y-2">
              <h4 className="font-medium text-white">Migration Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Settings:</span>
                  <div className="text-white">
                    {migrationSummary.settings.migratedRecords}/
                    {migrationSummary.settings.totalRecords}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Tasks:</span>
                  <div className="text-white">
                    {migrationSummary.tasks.migratedRecords}/
                    {migrationSummary.tasks.totalRecords}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Achievements:</span>
                  <div className="text-white">
                    {migrationSummary.achievements.migratedRecords}/
                    {migrationSummary.achievements.totalRecords}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Time:</span>
                  <div className="text-white">
                    {(migrationSummary.overall.totalTime / 1000).toFixed(1)}s
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleMigration}
              disabled={isLoading || storageMode === "database"}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Migrate to Database</span>
            </Button>

            <Button
              onClick={handleBackup}
              disabled={isLoading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Backup Data</span>
            </Button>

            <Button
              onClick={handleValidation}
              disabled={isLoading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Validate Migration</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
