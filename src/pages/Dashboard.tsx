import { useEffect, useState } from "react";
import { DayPlan, Task } from "@/types";
import {
  getTodayPlan,
  updateTask,
  deleteTask,
  addTask,
  addLaterBirdTask,
} from "@/lib/storage";
import {
  getMotivationalMessage,
  getStreakMessage,
  calculateCompletionRate,
  getTimeOfDay,
} from "@/lib/productivity-utils";
import { Navigation } from "@/components/app/Navigation";
import { TaskCard } from "@/components/app/TaskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Sun,
  Sunset,
  Target,
  Zap,
  Calendar,
  TrendingUp,
  Clock,
  Flame,
  Coffee,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "brain" as Task["type"],
    period: getTimeOfDay() as Task["period"],
    priority: "medium" as Task["priority"],
    timeBlock: 25,
  });

  useEffect(() => {
    setDayPlan(getTodayPlan());
  }, []);

  const handleToggleComplete = (taskId: string) => {
    updateTask(taskId, { completed: !findTask(taskId)?.completed });
    setDayPlan(getTodayPlan());
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setDayPlan(getTodayPlan());
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || "",
      type: task.type,
      period: task.period,
      priority: task.priority,
      timeBlock: task.timeBlock || 25,
    });
    setIsAddTaskOpen(true);
  };

  const handleSaveTask = () => {
    if (!newTask.title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: newTask.title,
        description: newTask.description,
        type: newTask.type,
        period: newTask.period,
        priority: newTask.priority,
        timeBlock: newTask.timeBlock,
      });
    } else {
      addTask({
        title: newTask.title,
        description: newTask.description,
        type: newTask.type,
        period: newTask.period,
        priority: newTask.priority,
        timeBlock: newTask.timeBlock,
        completed: false,
      });
    }

    setDayPlan(getTodayPlan());
    setIsAddTaskOpen(false);
    setEditingTask(null);
    setNewTask({
      title: "",
      description: "",
      type: "brain",
      period: getTimeOfDay(),
      priority: "medium",
      timeBlock: 25,
    });
  };

  const findTask = (taskId: string): Task | undefined => {
    if (!dayPlan) return undefined;
    return [
      ...dayPlan.morningTasks,
      ...dayPlan.afternoonTasks,
      ...dayPlan.laterBird,
    ].find((task) => task.id === taskId);
  };

  const getStats = () => {
    if (!dayPlan) return { morning: 0, afternoon: 0, overall: 0 };
    return {
      morning: calculateCompletionRate(dayPlan.morningTasks),
      afternoon: calculateCompletionRate(dayPlan.afternoonTasks),
      overall: calculateCompletionRate([
        ...dayPlan.morningTasks,
        ...dayPlan.afternoonTasks,
      ]),
    };
  };

  if (!dayPlan) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16 flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const currentPeriod = getTimeOfDay();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-8 px-4 container mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-focus to-energy bg-clip-text text-transparent">
                Today's Flow
              </h1>
              <p className="text-muted-foreground mt-1">
                {getMotivationalMessage()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="bg-energy text-energy-foreground"
              >
                <Flame className="h-3 w-3 mr-1" />
                {getStreakMessage(dayPlan.streakCount)}
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-morning/20 to-morning/10 border-morning/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-morning-foreground">
                      Morning
                    </p>
                    <p className="text-2xl font-bold text-morning">
                      {stats.morning}%
                    </p>
                  </div>
                  <Sun className="h-8 w-8 text-morning" />
                </div>
                <Progress value={stats.morning} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-afternoon/20 to-afternoon/10 border-afternoon/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-afternoon-foreground">
                      Afternoon
                    </p>
                    <p className="text-2xl font-bold text-afternoon">
                      {stats.afternoon}%
                    </p>
                  </div>
                  <Sunset className="h-8 w-8 text-afternoon" />
                </div>
                <Progress value={stats.afternoon} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Overall</p>
                    <p className="text-2xl font-bold text-primary">
                      {stats.overall}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <Progress value={stats.overall} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-focus/20 to-focus/10 border-focus/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Pomodoros</p>
                    <p className="text-2xl font-bold text-focus">
                      {dayPlan.pomodoroCompleted}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-focus" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Task Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Morning Tasks */}
          <Card
            className={cn(
              "border-2",
              currentPeriod === "morning"
                ? "border-morning shadow-lg bg-morning/5"
                : "border-morning/20",
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sun className="h-5 w-5 text-morning" />
                  <span className="text-morning">Morning Tasks</span>
                  <Coffee className="h-4 w-4 text-morning animate-pulse" />
                  {currentPeriod === "morning" && (
                    <Badge className="bg-morning text-morning-foreground animate-pulse-soft">
                      Active Period
                    </Badge>
                  )}
                </div>
                <Dialog
                  open={isAddTaskOpen}
                  onOpenChange={(open) => {
                    setIsAddTaskOpen(open);
                    if (!open) {
                      setEditingTask(null);
                      setNewTask({
                        title: "",
                        description: "",
                        type: "brain",
                        period: getTimeOfDay(),
                        priority: "medium",
                        timeBlock: 25,
                      });
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() =>
                        setNewTask((prev) => ({ ...prev, period: "morning" }))
                      }
                      className="bg-morning text-morning-foreground hover:bg-morning/90"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingTask ? "Edit Task" : "Add New Task"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newTask.title}
                          onChange={(e) =>
                            setNewTask((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="What do you want to accomplish?"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newTask.description}
                          onChange={(e) =>
                            setNewTask((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Any additional details..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Select
                            value={newTask.type}
                            onValueChange={(value: Task["type"]) =>
                              setNewTask((prev) => ({ ...prev, type: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="brain">
                                🧠 Brain (Focus work)
                              </SelectItem>
                              <SelectItem value="admin">
                                📋 Admin (Routine tasks)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="period">Period</Label>
                          <Select
                            value={newTask.period}
                            onValueChange={(value: Task["period"]) =>
                              setNewTask((prev) => ({ ...prev, period: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">
                                🌅 Morning
                              </SelectItem>
                              <SelectItem value="afternoon">
                                🌆 Afternoon
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            value={newTask.priority}
                            onValueChange={(value: Task["priority"]) =>
                              setNewTask((prev) => ({
                                ...prev,
                                priority: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">🌱 Low</SelectItem>
                              <SelectItem value="medium">⚡ Medium</SelectItem>
                              <SelectItem value="high">🔥 High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="timeBlock">Time Block (min)</Label>
                          <Input
                            id="timeBlock"
                            type="number"
                            value={newTask.timeBlock}
                            onChange={(e) =>
                              setNewTask((prev) => ({
                                ...prev,
                                timeBlock: parseInt(e.target.value) || 25,
                              }))
                            }
                            min="5"
                            max="120"
                          />
                        </div>
                      </div>
                      <Button onClick={handleSaveTask} className="w-full">
                        <Sparkles className="h-4 w-4 mr-2" />
                        {editingTask ? "Update Task" : "Create Task"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dayPlan.morningTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sun className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No morning tasks yet</p>
                    <p className="text-sm">Start your day with intention! ☀️</p>
                  </div>
                ) : (
                  dayPlan.morningTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      showPeriod={false}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Afternoon Tasks */}
          <Card
            className={cn(
              "border-2",
              currentPeriod === "afternoon"
                ? "border-afternoon shadow-lg bg-afternoon/5"
                : "border-afternoon/20",
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sunset className="h-5 w-5 text-afternoon" />
                  <span className="text-afternoon">Afternoon Tasks</span>
                  <Zap className="h-4 w-4 text-afternoon animate-pulse" />
                  {currentPeriod === "afternoon" && (
                    <Badge className="bg-afternoon text-afternoon-foreground animate-pulse-soft">
                      Active Period
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setNewTask((prev) => ({ ...prev, period: "afternoon" }));
                    setIsAddTaskOpen(true);
                  }}
                  className="bg-afternoon text-afternoon-foreground hover:bg-afternoon/90"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dayPlan.afternoonTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sunset className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No afternoon tasks yet</p>
                    <p className="text-sm">Keep the momentum going! 🚀</p>
                  </div>
                ) : (
                  dayPlan.afternoonTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      showPeriod={false}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Later Bird Section */}
        {dayPlan.laterBird.length > 0 && (
          <Card className="mt-6 border-warning bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-warning">
                <TrendingUp className="h-5 w-5" />
                <span>Later Bird</span>
                <Badge
                  variant="outline"
                  className="text-warning border-warning"
                >
                  {dayPlan.laterBird.length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dayPlan.laterBird.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
