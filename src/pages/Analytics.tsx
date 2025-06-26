import { Navigation } from "@/components/app/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Flame,
  Clock,
  Brain,
  CheckCircle2,
} from "lucide-react";

export default function Analytics() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-8 px-4 container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-focus to-energy bg-clip-text text-transparent mb-2">
            Progress & Analytics
          </h1>
          <p className="text-muted-foreground">
            Track your productivity journey and celebrate your wins
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-energy/20 to-energy/10 border-energy/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Current Streak</p>
                  <p className="text-2xl font-bold text-energy">0 days</p>
                </div>
                <Flame className="h-8 w-8 text-energy" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-focus/20 to-focus/10 border-focus/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Focus Time</p>
                  <p className="text-2xl font-bold text-focus">0h 0m</p>
                </div>
                <Clock className="h-8 w-8 text-focus" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/20 to-success/10 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Tasks Completed</p>
                  <p className="text-2xl font-bold text-success">0</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Achievements</p>
                  <p className="text-2xl font-bold text-primary">0</p>
                </div>
                <Award className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Weekly Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, index) => (
                    <div key={day} className="flex items-center space-x-3">
                      <span className="text-sm font-medium w-8">{day}</span>
                      <Progress value={0} className="flex-1" />
                      <span className="text-sm text-muted-foreground">0%</span>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Task Type Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-focus rounded-full"></div>
                    <span className="text-sm">Brain Tasks</span>
                  </div>
                  <span className="text-sm font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-admin rounded-full"></div>
                    <span className="text-sm">Admin Tasks</span>
                  </div>
                  <span className="text-sm font-medium">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Achievements & Milestones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-muted">
                <div className="text-2xl">🏆</div>
                <div>
                  <p className="font-medium text-sm">First Task</p>
                  <p className="text-xs text-muted-foreground">
                    Complete your first task
                  </p>
                </div>
                <Badge variant="outline">Locked</Badge>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-muted">
                <div className="text-2xl">🔥</div>
                <div>
                  <p className="font-medium text-sm">7-Day Streak</p>
                  <p className="text-xs text-muted-foreground">
                    Complete tasks for 7 days
                  </p>
                </div>
                <Badge variant="outline">Locked</Badge>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-muted">
                <div className="text-2xl">⚡</div>
                <div>
                  <p className="font-medium text-sm">Flow State</p>
                  <p className="text-xs text-muted-foreground">
                    Complete 5 Pomodoros in a day
                  </p>
                </div>
                <Badge variant="outline">Locked</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center py-12 text-muted-foreground">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">
            Advanced Analytics Coming Soon!
          </h3>
          <p>
            This page will include detailed charts, habit tracking, and
            performance insights.
          </p>
          <p className="text-sm mt-2">
            Features: Monthly reports, productivity patterns, and goal setting!
            📊
          </p>
        </div>
      </main>
    </div>
  );
}
