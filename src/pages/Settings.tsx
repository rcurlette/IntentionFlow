import { Navigation } from "@/components/app/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/lib/theme-context";
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
  Contrast,
  Zap,
  Sun,
  Moon,
} from "lucide-react";

export default function Settings() {
  const { theme, colorTheme, setTheme, setColorTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-8 px-4 container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-focus to-energy bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your productivity experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <Input id="focus-duration" type="number" defaultValue="25" />
              </div>
              <div>
                <Label htmlFor="short-break">Short Break (minutes)</Label>
                <Input id="short-break" type="number" defaultValue="5" />
              </div>
              <div>
                <Label htmlFor="long-break">Long Break (minutes)</Label>
                <Input id="long-break" type="number" defaultValue="15" />
              </div>
              <div>
                <Label htmlFor="sessions-before-long">
                  Sessions before long break
                </Label>
                <Input
                  id="sessions-before-long"
                  type="number"
                  defaultValue="4"
                />
              </div>
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
                <Label htmlFor="task-reminders">Task Reminders</Label>
                <Switch id="task-reminders" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="break-notifications">Break Notifications</Label>
                <Switch id="break-notifications" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-summary">Daily Summary</Label>
                <Switch id="daily-summary" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="achievement-alerts">Achievement Alerts</Label>
                <Switch id="achievement-alerts" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Accessibility & Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Color Theme</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={
                      colorTheme === "accessible" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setColorTheme("accessible")}
                    className="justify-start"
                  >
                    <Contrast className="h-4 w-4 mr-2" />
                    Accessible
                    {colorTheme === "accessible" && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Active
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant={colorTheme === "vibrant" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setColorTheme("vibrant")}
                    className="justify-start"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Vibrant
                    {colorTheme === "vibrant" && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Active
                      </Badge>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Accessible theme provides better contrast and
                  colorblind-friendly colors
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Brightness</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="justify-start"
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                    {theme === "light" && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Active
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="justify-start"
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                    {theme === "dark" && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Active
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="animations">Animations</Label>
                <Switch id="animations" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="motivational-messages">
                  Motivational Messages
                </Label>
                <Switch id="motivational-messages" defaultChecked />
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
            Advanced Settings Coming Soon!
          </h3>
          <p>
            This page will include OAuth integration, cloud sync, and advanced
            customization options.
          </p>
          <p className="text-sm mt-2">
            Features: Google auth, Supabase integration, and backup settings! ⚙️
          </p>
        </div>
      </main>
    </div>
  );
}
