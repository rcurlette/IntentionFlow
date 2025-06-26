import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Clock,
  Bell,
  Volume2,
  VolumeX,
  Save,
  RotateCcw,
} from "lucide-react";

interface PomodoroSettingsData {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  enableNotifications: boolean;
  enableSounds: boolean;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

interface PomodoroSettingsProps {
  settings: PomodoroSettingsData;
  onSave: (settings: PomodoroSettingsData) => void;
  disabled?: boolean;
}

export function PomodoroSettings({
  settings,
  onSave,
  disabled = false,
}: PomodoroSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState<PomodoroSettingsData>({
    ...settings,
    enableNotifications: false,
    enableSounds: true,
    autoStartBreaks: false,
    autoStartFocus: false,
  });

  const handleSave = () => {
    onSave(tempSettings);
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempSettings({
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      enableNotifications: false,
      enableSounds: true,
      autoStartBreaks: false,
      autoStartFocus: false,
    });
  };

  const updateSetting = <K extends keyof PomodoroSettingsData>(
    key: K,
    value: PomodoroSettingsData[K],
  ) => {
    setTempSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="border-primary/20 text-primary hover:bg-primary/5"
        >
          <Settings className="h-4 w-4 mr-2" />
          Timer Settings
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Pomodoro Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Duration Settings */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Timer Durations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="focus-duration" className="text-xs">
                    Focus (minutes)
                  </Label>
                  <Input
                    id="focus-duration"
                    type="number"
                    min="1"
                    max="90"
                    value={tempSettings.focusDuration}
                    onChange={(e) =>
                      updateSetting(
                        "focusDuration",
                        parseInt(e.target.value) || 25,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="short-break" className="text-xs">
                    Short Break (min)
                  </Label>
                  <Input
                    id="short-break"
                    type="number"
                    min="1"
                    max="30"
                    value={tempSettings.shortBreakDuration}
                    onChange={(e) =>
                      updateSetting(
                        "shortBreakDuration",
                        parseInt(e.target.value) || 5,
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="long-break" className="text-xs">
                    Long Break (min)
                  </Label>
                  <Input
                    id="long-break"
                    type="number"
                    min="5"
                    max="60"
                    value={tempSettings.longBreakDuration}
                    onChange={(e) =>
                      updateSetting(
                        "longBreakDuration",
                        parseInt(e.target.value) || 15,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="sessions-before-long" className="text-xs">
                    Sessions → Long
                  </Label>
                  <Input
                    id="sessions-before-long"
                    type="number"
                    min="2"
                    max="8"
                    value={tempSettings.sessionsBeforeLongBreak}
                    onChange={(e) =>
                      updateSetting(
                        "sessionsBeforeLongBreak",
                        parseInt(e.target.value) || 4,
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automation Settings */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Automation & Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium">Notifications</Label>
                  <div className="text-xs text-muted-foreground">
                    Browser notifications
                  </div>
                </div>
                <Switch
                  checked={tempSettings.enableNotifications}
                  onCheckedChange={(checked) =>
                    updateSetting("enableNotifications", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium">Sound Alerts</Label>
                  <div className="text-xs text-muted-foreground">
                    Audio cues for timers
                  </div>
                </div>
                <Switch
                  checked={tempSettings.enableSounds}
                  onCheckedChange={(checked) =>
                    updateSetting("enableSounds", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium">
                    Auto-start Breaks
                  </Label>
                  <div className="text-xs text-muted-foreground">
                    Start breaks automatically
                  </div>
                </div>
                <Switch
                  checked={tempSettings.autoStartBreaks}
                  onCheckedChange={(checked) =>
                    updateSetting("autoStartBreaks", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium">
                    Auto-start Focus
                  </Label>
                  <div className="text-xs text-muted-foreground">
                    Start focus after breaks
                  </div>
                </div>
                <Switch
                  checked={tempSettings.autoStartFocus}
                  onCheckedChange={(checked) =>
                    updateSetting("autoStartFocus", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground text-center">
              <div className="font-medium mb-1">Session Preview:</div>
              <div className="flex items-center justify-center space-x-1 text-xs">
                <Badge variant="outline" className="text-xs px-2">
                  {tempSettings.focusDuration}m Focus
                </Badge>
                <span>→</span>
                <Badge variant="outline" className="text-xs px-2">
                  {tempSettings.shortBreakDuration}m Break
                </Badge>
                <span>×{tempSettings.sessionsBeforeLongBreak - 1}</span>
                <span>→</span>
                <Badge variant="outline" className="text-xs px-2">
                  {tempSettings.longBreakDuration}m Long Break
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} size="sm" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
