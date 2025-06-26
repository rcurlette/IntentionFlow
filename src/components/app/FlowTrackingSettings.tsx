import { useState } from "react";
import { FlowTrackingSettings as FlowSettings } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Brain,
  Clock,
  Calendar,
  Moon,
  Bell,
  Target,
  Info,
  PlayCircle,
  Pause,
  Settings,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface FlowTrackingSettingsProps {
  settings: FlowSettings;
  onUpdateSettings: (settings: FlowSettings) => void;
  onTriggerPrompt?: () => void;
  onRequestNotifications?: () => Promise<boolean>;
  hasNotificationPermission?: boolean;
  className?: string;
}

export function FlowTrackingSettings({
  settings,
  onUpdateSettings,
  onTriggerPrompt,
  onRequestNotifications,
  hasNotificationPermission = false,
  className,
}: FlowTrackingSettingsProps) {
  const [localSettings, setLocalSettings] = useState<FlowSettings>(settings);

  const handleUpdate = (updates: Partial<FlowSettings>) => {
    const newSettings = { ...localSettings, ...updates };
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const intervalOptions = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1.5 hours" },
    { value: 120, label: "2 hours" },
    { value: 180, label: "3 hours" },
  ];

  const promptStyleOptions = [
    { value: "gentle", label: "Gentle", description: "Polite notifications" },
    {
      value: "persistent",
      label: "Persistent",
      description: "Reminders until answered",
    },
    { value: "minimal", label: "Minimal", description: "Subtle prompts" },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>Flow State Tracking</span>
            </div>
            <Switch
              checked={localSettings.isEnabled}
              onCheckedChange={(enabled) =>
                handleUpdate({ isEnabled: enabled })
              }
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              FlowTracker will periodically ask about your current activity and
              flow state to help identify your optimal productivity patterns.
            </p>

            {localSettings.isEnabled && (
              <div className="space-y-3">
                <div className="flex items-center space-x-4 p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-primary">
                      Active
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-sm text-muted-foreground">
                    Next prompt in ~{localSettings.interval} minutes
                  </span>
                  {onTriggerPrompt && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onTriggerPrompt}
                        className="h-auto p-1"
                      >
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Test Now
                      </Button>
                    </>
                  )}
                </div>

                {/* Notifications Status */}
                <div className="flex items-center space-x-4 p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Browser Notifications
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  {hasNotificationPermission ? (
                    <Badge variant="default" className="bg-energy">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <>
                      <Badge
                        variant="outline"
                        className="border-warning text-warning"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Disabled
                      </Badge>
                      {onRequestNotifications && (
                        <>
                          <Separator orientation="vertical" className="h-4" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRequestNotifications}
                            className="h-auto p-1"
                          >
                            <Bell className="h-4 w-4 mr-1" />
                            Enable
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timing Settings */}
      {localSettings.isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Timing Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Prompt Interval</Label>
              <Select
                value={localSettings.interval.toString()}
                onValueChange={(value) =>
                  handleUpdate({ interval: parseInt(value) })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {intervalOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                How often you'll be asked about your flow state
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Quiet Hours Start</Label>
                <Input
                  type="time"
                  value={localSettings.quietHours.start}
                  onChange={(e) =>
                    handleUpdate({
                      quietHours: {
                        ...localSettings.quietHours,
                        start: e.target.value,
                      },
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Quiet Hours End</Label>
                <Input
                  type="time"
                  value={localSettings.quietHours.end}
                  onChange={(e) =>
                    handleUpdate({
                      quietHours: {
                        ...localSettings.quietHours,
                        end: e.target.value,
                      },
                    })
                  }
                  className="mt-2"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              No prompts during these hours (e.g., sleeping time)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Days Settings */}
      {localSettings.isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Tracking Days</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Select which days to track your flow state
              </p>
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day, index) => {
                  const isSelected = localSettings.trackingDays.includes(index);
                  return (
                    <Button
                      key={day}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newDays = isSelected
                          ? localSettings.trackingDays.filter(
                              (d) => d !== index,
                            )
                          : [...localSettings.trackingDays, index];
                        handleUpdate({ trackingDays: newDays });
                      }}
                      className="h-auto p-2"
                    >
                      <div className="text-center">
                        <div className="text-xs font-medium">
                          {day.slice(0, 3)}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Settings */}
      {localSettings.isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Advanced Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Prompt Style</Label>
              <Select
                value={localSettings.promptStyle}
                onValueChange={(value: any) =>
                  handleUpdate({ promptStyle: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {promptStyleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Auto-detect Activities
                </Label>
                <Switch
                  checked={localSettings.autoDetectActivity}
                  onCheckedChange={(enabled) =>
                    handleUpdate({ autoDetectActivity: enabled })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Suggest activities based on time of day and patterns
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Show Flow Insights
                </Label>
                <Switch
                  checked={localSettings.showFlowInsights}
                  onCheckedChange={(enabled) =>
                    handleUpdate({ showFlowInsights: enabled })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Display patterns and optimization suggestions
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium">
                Minimum Entries for Insights
              </Label>
              <Select
                value={localSettings.minimumEntriesForInsights.toString()}
                onValueChange={(value) =>
                  handleUpdate({ minimumEntriesForInsights: parseInt(value) })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 entries</SelectItem>
                  <SelectItem value="10">10 entries</SelectItem>
                  <SelectItem value="15">15 entries</SelectItem>
                  <SelectItem value="20">20 entries</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                How much data needed before showing reliable patterns
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help & Info */}
      <Card className="border-info bg-info/5">
        <CardContent className="flex items-start space-x-3 p-4">
          <Info className="h-5 w-5 text-info mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-sm">How Flow Tracking Works</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• You'll get periodic prompts asking what you're doing</li>
              <li>• Rate your flow, mood, and energy on a 1-5 scale</li>
              <li>
                • After 2-3 days, patterns emerge showing your optimal times
              </li>
              <li>
                • Use insights to schedule important work during peak hours
              </li>
              <li>
                • Research shows 20% productivity gains when aligned with flow
              </li>
              <li>
                • <strong>Quick access:</strong> Click "Track Flow" in
                navigation or press{" "}
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                  Ctrl+F
                </kbd>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
