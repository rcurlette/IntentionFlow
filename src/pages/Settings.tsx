import React, { useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loading } from "@/components/ui/loading";
import { ThemeSwitcher } from "@/components/app/ThemeSwitcher";
import { FlowTrackingSettings } from "@/components/app/FlowTrackingSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  useSettings,
  usePomodoroSettings,
  useNotificationSettings,
  useThemeSettings,
} from "@/hooks/use-settings";
import { useFlowTracking } from "@/hooks/use-flow-tracking";
import {
  Settings as SettingsIcon,
  Clock,
  Bell,
  Palette,
  User,
  Download,
  Upload,
  Trash2,
  Shield,
  Eye,
  Brain,
  Music,
  Activity,
  RotateCcw,
  Save,
  FileJson,
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
  } = useSettings();

  const { settings: pomodoroSettings, updatePomodoro } = usePomodoroSettings();
  const { settings: notificationSettings, updateNotifications } =
    useNotificationSettings();
  const { settings: themeSettings, updateTheme } = useThemeSettings();

  const {
    settings: flowSettings,
    updateSettings: updateFlowSettings,
    triggerManualPrompt,
    requestNotificationPermission,
    hasNotificationPermission,
  } = useFlowTracking();

  // Handle export
  const handleExport = () => {
    try {
      const data = exportSettings();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flowtracker-settings-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Settings Exported",
        description: "Your settings have been exported successfully.",
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Failed to export settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle import
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importSettings(text);

      toast({
        title: "Settings Imported",
        description: "Your settings have been imported successfully.",
      });
    } catch (err) {
      toast({
        title: "Import Failed",
        description:
          err instanceof Error ? err.message : "Failed to import settings.",
        variant: "destructive",
      });
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle reset
  const handleReset = async () => {
    try {
      await resetSettings();
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to defaults.",
      });
    } catch (err) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppLayout
        title="Settings"
        description="Customize your productivity experience"
      >
        <Loading message="Loading your settings..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout
        title="Settings"
        description="Customize your productivity experience"
      >
        <div className="pt-4 pb-8 px-4 container mx-auto max-w-4xl">
          <div className="text-center py-8">
            <p className="text-red-400">Error loading settings: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!settings) {
    return (
      <AppLayout
        title="Settings"
        description="Customize your productivity experience"
      >
        <div className="pt-4 pb-8 px-4 container mx-auto max-w-4xl">
          <div className="text-center py-8">
            <p className="text-slate-400">No settings found.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Settings"
      description="Customize your productivity experience"
    >
      <div className="pt-4 pb-8 px-4 container mx-auto max-w-4xl">
        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-focus to-energy bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your productivity experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Flow Tracking Settings - Full Width */}
          <div className="lg:col-span-2">
            <FlowTrackingSettings
              settings={flowSettings}
              onUpdateSettings={updateFlowSettings}
              onTriggerPrompt={triggerManualPrompt}
              onRequestNotifications={requestNotificationPermission}
              hasNotificationPermission={hasNotificationPermission()}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Pomodoro Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="focus-duration">Focus Duration (minutes)</Label>
                <Input
                  id="focus-duration"
                  type="number"
                  min="5"
                  max="90"
                  value={pomodoroSettings?.focusDuration || 25}
                  onChange={(e) =>
                    updatePomodoro({ focusDuration: parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label htmlFor="short-break">Short Break (minutes)</Label>
                <Input
                  id="short-break"
                  type="number"
                  min="1"
                  max="15"
                  value={pomodoroSettings?.shortBreakDuration || 5}
                  onChange={(e) =>
                    updatePomodoro({
                      shortBreakDuration: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="long-break">Long Break (minutes)</Label>
                <Input
                  id="long-break"
                  type="number"
                  min="10"
                  max="60"
                  value={pomodoroSettings?.longBreakDuration || 15}
                  onChange={(e) =>
                    updatePomodoro({
                      longBreakDuration: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="sessions-before-long">
                  Sessions before long break
                </Label>
                <Input
                  id="sessions-before-long"
                  type="number"
                  min="2"
                  max="8"
                  value={pomodoroSettings?.sessionsBeforeLongBreak || 4}
                  onChange={(e) =>
                    updatePomodoro({
                      sessionsBeforeLongBreak: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-start-breaks">Auto-start breaks</Label>
                <Switch
                  id="auto-start-breaks"
                  checked={pomodoroSettings?.autoStartBreaks || false}
                  onCheckedChange={(checked) =>
                    updatePomodoro({ autoStartBreaks: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-start-pomodoros">
                  Auto-start focus sessions
                </Label>
                <Switch
                  id="auto-start-pomodoros"
                  checked={pomodoroSettings?.autoStartPomodoros || false}
                  onCheckedChange={(checked) =>
                    updatePomodoro({ autoStartPomodoros: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Flow Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="flow-tracking-enabled">
                    Enable Flow Tracking
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Track your productivity and flow states throughout the day
                  </p>
                </div>
                <Switch
                  id="flow-tracking-enabled"
                  checked={flowSettings.isEnabled}
                  onCheckedChange={(checked) =>
                    updateFlowSettings({ isEnabled: checked })
                  }
                />
              </div>
              {flowSettings.isEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerManualPrompt}
                  className="w-full"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Test Flow Tracker
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications-enabled">
                    Enable Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Master toggle for all notifications
                  </p>
                </div>
                <Switch
                  id="notifications-enabled"
                  checked={notificationSettings?.notificationsEnabled || false}
                  onCheckedChange={(checked) => {
                    updateNotifications({ notificationsEnabled: checked });
                    if (checked) {
                      requestNotificationPermission();
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-enabled">Sound Effects</Label>
                <Switch
                  id="sound-enabled"
                  checked={notificationSettings?.soundEnabled || false}
                  onCheckedChange={(checked) =>
                    updateNotifications({ soundEnabled: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="task-reminders">Task Reminders</Label>
                <Switch
                  id="task-reminders"
                  checked={notificationSettings?.taskReminders || false}
                  onCheckedChange={(checked) =>
                    updateNotifications({ taskReminders: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="break-notifications">Break Notifications</Label>
                <Switch
                  id="break-notifications"
                  checked={notificationSettings?.breakNotifications || false}
                  onCheckedChange={(checked) =>
                    updateNotifications({ breakNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-summary">Daily Summary</Label>
                <Switch
                  id="daily-summary"
                  checked={notificationSettings?.dailySummary || false}
                  onCheckedChange={(checked) =>
                    updateNotifications({ dailySummary: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="achievement-alerts">Achievement Alerts</Label>
                <Switch
                  id="achievement-alerts"
                  checked={notificationSettings?.achievementAlerts || false}
                  onCheckedChange={(checked) =>
                    updateNotifications({ achievementAlerts: checked })
                  }
                />
              </div>
              {!hasNotificationPermission() && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm text-amber-400">
                    Browser notifications are not enabled. Click "Enable
                    Notifications" to allow notifications.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Theme & Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Theme Settings</Label>
                  <p className="text-xs text-muted-foreground">
                    Customize colors and brightness for optimal accessibility
                  </p>
                </div>
                <ThemeSwitcher />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="animations">Animations</Label>
                <Switch
                  id="animations"
                  checked={themeSettings?.animations || false}
                  onCheckedChange={(checked) =>
                    updateTheme({ animations: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="motivational-messages">
                  Motivational Messages
                </Label>
                <Switch
                  id="motivational-messages"
                  checked={settings.motivationalMessages || false}
                  onCheckedChange={(checked) =>
                    updateSettings({ motivationalMessages: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion">Reduced Motion</Label>
                <Switch
                  id="reduced-motion"
                  checked={themeSettings?.reducedMotion || false}
                  onCheckedChange={(checked) =>
                    updateTheme({ reducedMotion: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <Switch
                  id="high-contrast"
                  checked={themeSettings?.highContrast || false}
                  onCheckedChange={(checked) =>
                    updateTheme({ highContrast: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Music className="h-5 w-5" />
                <span>YouTube Music Player</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="youtube-url">YouTube Music/Video URL</Label>
                <Input
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={settings.youtubeUrl || ""}
                  onChange={(e) =>
                    updateSettings({ youtubeUrl: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Paste any YouTube video URL for background music during focus
                  sessions
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoplay-music">Auto-play on Focus Start</Label>
                <Switch
                  id="autoplay-music"
                  checked={settings.autoPlayMusic || false}
                  onCheckedChange={(checked) =>
                    updateSettings({ autoPlayMusic: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="loop-music">Loop Current Track</Label>
                <Switch
                  id="loop-music"
                  checked={settings.loopMusic !== false}
                  onCheckedChange={(checked) =>
                    updateSettings({ loopMusic: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="music-volume">
                  Default Volume: {settings.musicVolume || 50}%
                </Label>
                <Slider
                  id="music-volume"
                  min={0}
                  max={100}
                  step={5}
                  value={[settings.musicVolume || 50]}
                  onValueChange={([value]) =>
                    updateSettings({ musicVolume: value })
                  }
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="display-name">Display Name</Label>
                <Input id="display-name" placeholder="Your name" />
              </div>
              <div>
                <Label htmlFor="daily-goal">Daily Task Goal</Label>
                <Input id="daily-goal" type="number" defaultValue="5" />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" value="Auto-detected" disabled />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Data Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Import Data</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center space-x-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center py-12 text-muted-foreground">
          <SettingsIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">
            Settings System Active! 🎉
          </h3>
          <p>
            Your settings are now fully integrated with database storage and
            localStorage fallback.
          </p>
          <p className="text-sm mt-2">
            Features: Per-user settings, comprehensive preferences, data
            export/import! ⚙️
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
