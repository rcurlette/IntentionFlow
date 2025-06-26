import { Navigation } from "@/components/app/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Zap,
  Timer,
  TrendingUp,
} from "lucide-react";

export default function Pomodoro() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-8 px-4 container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-focus to-energy bg-clip-text text-transparent mb-2">
            Focus Timer
          </h1>
          <p className="text-muted-foreground">
            Enter your flow state with the Pomodoro Technique
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="bg-gradient-to-br from-focus/20 to-focus/10 border-focus/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Timer className="h-6 w-6 text-focus" />
                <span>Focus Session</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="relative">
                <div className="text-6xl font-mono font-bold text-focus mb-2">
                  25:00
                </div>
                <Badge className="bg-focus text-focus-foreground">
                  Ready to Focus
                </Badge>
              </div>

              <Progress value={0} className="h-3" />

              <div className="flex justify-center space-x-4">
                <Button size="lg" className="bg-focus text-focus-foreground">
                  <Play className="h-5 w-5 mr-2" />
                  Start Focus
                </Button>
                <Button variant="outline" size="lg">
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>🍅 Focus for 25 minutes, then take a 5-minute break</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm">
                <Brain className="h-4 w-4" />
                <span>Today's Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">0</div>
              <p className="text-xs text-muted-foreground">
                Pomodoros completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Focus Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-focus">0h 0m</div>
              <p className="text-xs text-muted-foreground">Deep work today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>Flow Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-energy">0</div>
              <p className="text-xs text-muted-foreground">Out of 100</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center py-12 text-muted-foreground">
          <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">
            Full Pomodoro Timer Coming Soon!
          </h3>
          <p>
            This page will include a fully functional timer, flow state
            tracking, and distraction monitoring.
          </p>
          <p className="text-sm mt-2">
            Features: Custom intervals, task linking, and focus analytics! ⏰
          </p>
        </div>
      </main>
    </div>
  );
}
