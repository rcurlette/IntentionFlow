import { useState, useEffect } from "react";
import {
  TaskAnalytics,
  calculateTaskAnalytics,
  getProductivityInsights,
} from "@/lib/task-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Brain,
  FileText,
  Calendar,
  Flame,
  Award,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

interface TaskAnalyticsDashboardProps {
  className?: string;
}

export function TaskAnalyticsDashboard({
  className,
}: TaskAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
        const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const analyticsData = await calculateTaskAnalytics({ from, to: now });
        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Error loading analytics:", error);
        // Set fallback analytics data
        setAnalytics({
          completionRate: 0,
          averageTasksPerDay: 0,
          totalTasksCompleted: 0,
          totalFocusTime: 0,
          typeBreakdown: {
            brain: { total: 0, completed: 0 },
            admin: { total: 0, completed: 0 },
          },
          priorityBreakdown: {
            high: { total: 0, completed: 0 },
            medium: { total: 0, completed: 0 },
            low: { total: 0, completed: 0 },
          },
          periodBreakdown: {
            morning: { total: 0, completed: 0 },
            afternoon: { total: 0, completed: 0 },
          },
          weeklyTrends: [],
          mostUsedTags: [],
          averageCompletionTime: 0,
          streakData: {
            currentStreak: 0,
            longestStreak: 0,
            streakDates: [],
          },
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [dateRange]);

  if (loading || !analytics) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const insights = getProductivityInsights(analytics);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Analytics</h2>
          <p className="text-muted-foreground">
            Insights into your productivity patterns
          </p>
        </div>
        <Select
          value={dateRange}
          onValueChange={(value: "7d" | "30d" | "90d") => setDateRange(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-primary">
                  {analytics.completionRate.toFixed(1)}%
                </p>
              </div>
              <Target className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-focus/10 to-focus/5 border-focus/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Total Focus Time
                </p>
                <p className="text-2xl font-bold text-focus">
                  {Math.round(analytics.totalFocusTime / 60)}h
                </p>
              </div>
              <Clock className="h-6 w-6 text-focus" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-energy/10 to-energy/5 border-energy/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Tasks Completed
                </p>
                <p className="text-2xl font-bold text-energy">
                  {analytics.totalTasksCompleted}
                </p>
              </div>
              <Award className="h-6 w-6 text-energy" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-admin/10 to-admin/5 border-admin/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Current Streak
                </p>
                <p className="text-2xl font-bold text-admin">
                  {analytics.streakData.currentStreak}
                </p>
              </div>
              <Flame className="h-6 w-6 text-admin" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Lightbulb className="h-4 w-4" />
              <span>Productivity Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg border",
                    insight.type === "success" &&
                      "border-success/20 bg-success/5",
                    insight.type === "warning" &&
                      "border-warning/20 bg-warning/5",
                    insight.type === "info" && "border-primary/20 bg-primary/5",
                  )}
                >
                  <span className="text-lg">{insight.icon}</span>
                  <div>
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {insight.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Brain className="h-4 w-4" />
              <span>Task Type Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-focus" />
                  <span className="text-sm font-medium">Brain Tasks</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {analytics.typeBreakdown.brain.completed}/
                  {analytics.typeBreakdown.brain.total}
                </span>
              </div>
              <Progress
                value={
                  analytics.typeBreakdown.brain.total > 0
                    ? (analytics.typeBreakdown.brain.completed /
                        analytics.typeBreakdown.brain.total) *
                      100
                    : 0
                }
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-admin" />
                  <span className="text-sm font-medium">Admin Tasks</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {analytics.typeBreakdown.admin.completed}/
                  {analytics.typeBreakdown.admin.total}
                </span>
              </div>
              <Progress
                value={
                  analytics.typeBreakdown.admin.total > 0
                    ? (analytics.typeBreakdown.admin.completed /
                        analytics.typeBreakdown.admin.total) *
                      100
                    : 0
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Target className="h-4 w-4" />
              <span>Priority Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["high", "medium", "low"] as const).map((priority) => {
              const data = analytics.priorityBreakdown[priority];
              const rate =
                data.total > 0 ? (data.completed / data.total) * 100 : 0;
              const emoji =
                priority === "high"
                  ? "🔥"
                  : priority === "medium"
                    ? "⚡"
                    : "🌱";

              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span>{emoji}</span>
                      <span className="text-sm font-medium capitalize">
                        {priority} Priority
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {data.completed}/{data.total}
                    </span>
                  </div>
                  <Progress value={rate} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Period Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>Period Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span>🌅</span>
                  <span className="text-sm font-medium">Morning</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {analytics.periodBreakdown.morning.completed}/
                  {analytics.periodBreakdown.morning.total}
                </span>
              </div>
              <Progress
                value={
                  analytics.periodBreakdown.morning.total > 0
                    ? (analytics.periodBreakdown.morning.completed /
                        analytics.periodBreakdown.morning.total) *
                      100
                    : 0
                }
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span>🌆</span>
                  <span className="text-sm font-medium">Afternoon</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {analytics.periodBreakdown.afternoon.completed}/
                  {analytics.periodBreakdown.afternoon.total}
                </span>
              </div>
              <Progress
                value={
                  analytics.periodBreakdown.afternoon.total > 0
                    ? (analytics.periodBreakdown.afternoon.completed /
                        analytics.periodBreakdown.afternoon.total) *
                      100
                    : 0
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Most Used Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Top Tags</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.mostUsedTags.length > 0 ? (
              <div className="space-y-2">
                {analytics.mostUsedTags.slice(0, 5).map((tag) => (
                  <div
                    key={tag.tag}
                    className="flex items-center justify-between"
                  >
                    <Badge variant="outline" className="text-xs">
                      #{tag.tag}
                    </Badge>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{tag.count} uses</span>
                      <span>•</span>
                      <span>{tag.completionRate.toFixed(0)}% done</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tags used yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Detailed Analytics
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Detailed Task Analytics</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {analytics.averageTasksPerDay.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Avg Tasks/Day
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {analytics.averageCompletionTime.toFixed(1)}h
                </div>
                <div className="text-xs text-muted-foreground">
                  Avg Completion Time
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {analytics.streakData.longestStreak}
                </div>
                <div className="text-xs text-muted-foreground">
                  Longest Streak
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {analytics.weeklyTrends.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Days Tracked
                </div>
              </div>
            </div>

            {/* Weekly Trends */}
            {analytics.weeklyTrends.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Daily Progress Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.weeklyTrends.slice(-7).map((day) => (
                      <div
                        key={day.date}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">
                          {new Date(day.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-muted-foreground">
                            {day.tasksCompleted} tasks
                          </span>
                          <div className="w-20">
                            <Progress
                              value={day.completionRate}
                              className="h-2"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12">
                            {day.completionRate.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
