import { useState, useMemo } from "react";
import { Task } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Calendar,
  List,
  Grid3x3,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  FileText,
  Zap,
  Timer,
  Target,
} from "lucide-react";
import { EnhancedTaskItem } from "./EnhancedTaskItem";
import { TaskQuickActions } from "./TaskQuickActions";
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  differenceInDays,
} from "date-fns";

interface TaskDashboardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onStartPomodoro?: (task: Task) => void;
}

type ViewMode = "list" | "board" | "calendar" | "timeline";

export function TaskDashboard({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
  onEditTask,
  onToggleComplete,
  onStartPomodoro,
}: TaskDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("board");

  // Compute task statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && isPast(t.dueDate),
    ).length;
    const dueToday = tasks.filter(
      (t) => !t.completed && t.dueDate && isToday(t.dueDate),
    ).length;
    const dueTomorrow = tasks.filter(
      (t) => !t.completed && t.dueDate && isTomorrow(t.dueDate),
    ).length;

    const brainTasks = tasks.filter((t) => t.type === "brain").length;
    const adminTasks = tasks.filter((t) => t.type === "admin").length;

    const highPriority = tasks.filter((t) => t.priority === "high").length;
    const mediumPriority = tasks.filter((t) => t.priority === "medium").length;
    const lowPriority = tasks.filter((t) => t.priority === "low").length;

    const totalTimeEstimate = tasks.reduce(
      (sum, t) => sum + (t.timeEstimate || 0),
      0,
    );
    const totalTimeSpent = tasks.reduce(
      (sum, t) => sum + (t.timeSpent || 0),
      0,
    );

    return {
      total,
      completed,
      inProgress,
      overdue,
      dueToday,
      dueTomorrow,
      brainTasks,
      adminTasks,
      highPriority,
      mediumPriority,
      lowPriority,
      totalTimeEstimate,
      totalTimeSpent,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  // Organize tasks by different criteria
  const organizedTasks = useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);

    // By period
    const byPeriod = {
      morning: activeTasks.filter((t) => t.period === "morning"),
      afternoon: activeTasks.filter((t) => t.period === "afternoon"),
    };

    // By priority
    const byPriority = {
      high: activeTasks.filter((t) => t.priority === "high"),
      medium: activeTasks.filter((t) => t.priority === "medium"),
      low: activeTasks.filter((t) => t.priority === "low"),
    };

    // By due date
    const overdue = activeTasks.filter((t) => t.dueDate && isPast(t.dueDate));
    const today = activeTasks.filter((t) => t.dueDate && isToday(t.dueDate));
    const tomorrow = activeTasks.filter(
      (t) => t.dueDate && isTomorrow(t.dueDate),
    );
    const thisWeek = activeTasks.filter((t) => {
      if (!t.dueDate) return false;
      const days = differenceInDays(t.dueDate, new Date());
      return days > 1 && days <= 7;
    });
    const later = activeTasks.filter((t) => {
      if (!t.dueDate) return false;
      const days = differenceInDays(t.dueDate, new Date());
      return days > 7;
    });
    const noDueDate = activeTasks.filter((t) => !t.dueDate);

    return {
      byPeriod,
      byPriority,
      byDueDate: {
        overdue,
        today,
        tomorrow,
        thisWeek,
        later,
        noDueDate,
      },
      completed: completedTasks,
    };
  }, [tasks]);

  const getDueDateColor = (task: Task) => {
    if (!task.dueDate || task.completed) return "";

    if (isPast(task.dueDate)) return "text-red-600 bg-red-50 border-red-200";
    if (isToday(task.dueDate))
      return "text-orange-600 bg-orange-50 border-orange-200";
    if (isTomorrow(task.dueDate))
      return "text-yellow-600 bg-yellow-50 border-yellow-200";

    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  const formatDueDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isPast(date)) return `Overdue (${format(date, "MMM dd")})`;

    const days = differenceInDays(date, new Date());
    if (days <= 7) return format(date, "EEE, MMM dd");

    return format(date, "MMM dd, yyyy");
  };

  const renderTaskSection = (
    title: string,
    tasks: Task[],
    icon: React.ReactNode,
    color?: string,
  ) => (
    <Card className={cn("", color)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <span>{title}</span>
            <Badge variant="outline">{tasks.length}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tasks in this section
            </p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="group relative">
                <EnhancedTaskItem
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStartPomodoro={onStartPomodoro}
                />
                <div className="absolute top-2 right-2">
                  <TaskQuickActions
                    task={task}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    onDuplicateTask={onDuplicateTask}
                    onStartPomodoro={onStartPomodoro}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.overdue}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Due Today</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.dueToday}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.completionRate}%
                </p>
              </div>
            </div>
            <Progress value={stats.completionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Time Est.</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(stats.totalTimeEstimate / 60)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Task Overview</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === "board" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("board")}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Board
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Timeline
          </Button>
        </div>
      </div>

      {/* Task Views */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsContent value="board" className="space-y-6">
          {/* Period-based Board View */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {renderTaskSection(
              "Morning Tasks",
              organizedTasks.byPeriod.morning,
              <Clock className="h-4 w-4 text-orange-600" />,
              "border-orange-200 bg-orange-50/30",
            )}
            {renderTaskSection(
              "Afternoon Tasks",
              organizedTasks.byPeriod.afternoon,
              <Clock className="h-4 w-4 text-blue-600" />,
              "border-blue-200 bg-blue-50/30",
            )}
          </div>

          {/* Priority Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderTaskSection(
              "High Priority",
              organizedTasks.byPriority.high,
              <Zap className="h-4 w-4 text-red-600" />,
              "border-red-200 bg-red-50/30",
            )}
            {renderTaskSection(
              "Medium Priority",
              organizedTasks.byPriority.medium,
              <Zap className="h-4 w-4 text-yellow-600" />,
              "border-yellow-200 bg-yellow-50/30",
            )}
            {renderTaskSection(
              "Low Priority",
              organizedTasks.byPriority.low,
              <Zap className="h-4 w-4 text-green-600" />,
              "border-green-200 bg-green-50/30",
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          {/* Due Date Timeline View */}
          <div className="space-y-4">
            {organizedTasks.byDueDate.overdue.length > 0 &&
              renderTaskSection(
                "Overdue",
                organizedTasks.byDueDate.overdue,
                <AlertTriangle className="h-4 w-4 text-red-600" />,
                "border-red-300 bg-red-50",
              )}

            {organizedTasks.byDueDate.today.length > 0 &&
              renderTaskSection(
                "Due Today",
                organizedTasks.byDueDate.today,
                <Clock className="h-4 w-4 text-orange-600" />,
                "border-orange-300 bg-orange-50",
              )}

            {organizedTasks.byDueDate.tomorrow.length > 0 &&
              renderTaskSection(
                "Due Tomorrow",
                organizedTasks.byDueDate.tomorrow,
                <Calendar className="h-4 w-4 text-yellow-600" />,
                "border-yellow-300 bg-yellow-50",
              )}

            {organizedTasks.byDueDate.thisWeek.length > 0 &&
              renderTaskSection(
                "This Week",
                organizedTasks.byDueDate.thisWeek,
                <Calendar className="h-4 w-4 text-blue-600" />,
                "border-blue-300 bg-blue-50",
              )}

            {organizedTasks.byDueDate.later.length > 0 &&
              renderTaskSection(
                "Later",
                organizedTasks.byDueDate.later,
                <Calendar className="h-4 w-4 text-gray-600" />,
                "border-gray-300 bg-gray-50",
              )}

            {organizedTasks.byDueDate.noDueDate.length > 0 &&
              renderTaskSection(
                "No Due Date",
                organizedTasks.byDueDate.noDueDate,
                <Calendar className="h-4 w-4 text-gray-400" />,
                "border-gray-200 bg-gray-50/50",
              )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {/* Simple List View */}
          <Card>
            <CardHeader>
              <CardTitle>All Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks
                  .filter((t) => !t.completed)
                  .map((task) => (
                    <div key={task.id} className="group relative">
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex-1">
                          <EnhancedTaskItem
                            task={task}
                            onToggleComplete={onToggleComplete}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                            onStartPomodoro={onStartPomodoro}
                            className="border-0 p-0 bg-transparent"
                          />
                        </div>

                        {task.dueDate && (
                          <Badge
                            className={cn("text-xs", getDueDateColor(task))}
                          >
                            {formatDueDate(task.dueDate)}
                          </Badge>
                        )}

                        <TaskQuickActions
                          task={task}
                          onUpdateTask={onUpdateTask}
                          onDeleteTask={onDeleteTask}
                          onDuplicateTask={onDuplicateTask}
                          onStartPomodoro={onStartPomodoro}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
