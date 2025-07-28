import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { adminStorage } from "@/lib/admin-storage";
import {
  Sunrise,
  Play,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Target,
  Sparkles,
  Timer,
  Brain,
  Heart,
  Zap,
  Eye,
  List,
  Coffee,
} from "lucide-react";

// Constants
const FIRST_HOUR_DURATION = 60;
const DEFAULT_MORNING_RITUALS = [
  { id: "meditation", name: "Mindful Presence", duration: 5, completed: false, isCore: true },
  { id: "intention", name: "Flow Intention", duration: 3, completed: false, isCore: true },
  { id: "movement", name: "Physical Activation", duration: 7, completed: false, isCore: false },
];

// Types
interface Task {
  id: string;
  title: string;
  type: "morning" | "afternoon" | "first-hour";
  completed: boolean;
  createdAt: Date;
}

interface FlowRitual {
  id: string;
  name: string;
  icon: any;
  duration: number;
  description: string;
  completed: boolean;
  isCore: boolean;
}

interface MorningSectionProps {
  className?: string;
  rituals: FlowRitual[];
  onToggleRitual: (id: string) => void;
  onStartMeditationTimer: (minutes: number) => void;
  meditationTimer: number;
  isTimerActive: boolean;
}

export function MorningSection({
  className,
  rituals,
  onToggleRitual,
  onStartMeditationTimer,
  meditationTimer,
  isTimerActive,
}: MorningSectionProps) {
  const [firstHourActivity, setFirstHourActivity] = useState("");
  const [bulkTaskInput, setBulkTaskInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskType, setActiveTaskType] = useState<"morning" | "afternoon">(
    "morning",
  );

  // Load tasks from localStorage
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const savedTasks = localStorage.getItem(`morning-tasks-${today}`);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    const savedFirstHour = localStorage.getItem(`first-hour-${today}`);
    if (savedFirstHour) {
      setFirstHourActivity(savedFirstHour);
    }
  }, []);

  // Auto-save tasks
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    localStorage.setItem(`morning-tasks-${today}`, JSON.stringify(tasks));
  }, [tasks]);

  // Auto-save first hour activity
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    if (firstHourActivity.trim()) {
      localStorage.setItem(`first-hour-${today}`, firstHourActivity);
    }
  }, [firstHourActivity]);

  const addFirstHourTask = () => {
    if (!firstHourActivity.trim()) return;

    const task: Task = {
      id: `first-hour-${Date.now()}`,
      title: firstHourActivity,
      type: "first-hour",
      completed: false,
      createdAt: new Date(),
    };

    setTasks((prev) => [task, ...prev]);
    setFirstHourActivity("");
  };

  const addBulkTasks = () => {
    if (!bulkTaskInput.trim()) return;

    const lines = bulkTaskInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-"))
      .map((line) => line.substring(1).trim())
      .filter((line) => line.length > 0);

    const newTasks = lines.map((title) => ({
      id: `${activeTaskType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      type: activeTaskType,
      completed: false,
      createdAt: new Date(),
    }));

    setTasks((prev) => [...newTasks, ...prev]);
    setBulkTaskInput("");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const startFirstHourPomodoro = () => {
    // TODO: Integration with pomodoro timer
    console.log("Starting 60-minute first hour pomodoro");
    // Navigate to pomodoro page with 60-minute preset
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const completedRituals = rituals.filter((r) => r.completed).length;
  const totalRituals = rituals.length;
  const coreRituals = rituals.filter((r) => r.isCore);
  const completedCore = coreRituals.filter((r) => r.completed).length;

  const morningTasks = tasks.filter((t) => t.type === "morning");
  const afternoonTasks = tasks.filter((t) => t.type === "afternoon");
  const firstHourTasks = tasks.filter((t) => t.type === "first-hour");

  return (
    <div className={cn("space-y-6", className)}>
      {/* First Hour Section */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-100">
            <div className="flex items-center space-x-2">
              <Coffee className="h-5 w-5 text-amber-400" />
              <span>First Hour Focus</span>
            </div>
            <Badge
              variant="outline"
              className="border-amber-400 text-amber-400"
            >
              Most Important
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="text-base font-medium text-slate-300 block">
              What's your most important activity for the first hour?
            </label>
            <div className="flex space-x-2">
              <Input
                value={firstHourActivity}
                onChange={(e) => setFirstHourActivity(e.target.value)}
                placeholder="Deep work, creative project, learning..."
                className="bg-slate-700/50 border-slate-600 text-slate-100 flex-1"
                onKeyPress={(e) => e.key === "Enter" && addFirstHourTask()}
              />
              <Button
                onClick={addFirstHourTask}
                disabled={!firstHourActivity.trim()}
                className="bg-amber-500 hover:bg-amber-600"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {firstHourTasks.length > 0 && (
            <div className="space-y-2">
              {firstHourTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500/70 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleTask(task.id)}
                      className="h-8 w-8 p-0 hover:bg-slate-600/50"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-300" />
                      )}
                    </Button>
                    <span
                      className={cn(
                        "text-slate-100 font-medium",
                        task.completed && "line-through text-slate-400",
                      )}
                    >
                      {task.title}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={startFirstHourPomodoro}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                    asChild
                  >
                    <Link to={`/pomodoro?duration=${FIRST_HOUR_DURATION}&focus=true`}>
                      <Play className="h-4 w-4 mr-2" />
                      60min Focus
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Morning Rituals */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-100">
            <div className="flex items-center space-x-2">
              <Sunrise className="h-5 w-5 text-orange-400" />
              <span>Morning Flow Rituals</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {completedCore}/{coreRituals.length} Core
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {rituals.map((ritual) => (
              <div
                key={ritual.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border transition-all",
                  ritual.completed
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-slate-700/30 border-slate-600 hover:border-slate-500",
                )}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleRitual(ritual.id)}
                  className="h-8 w-8 p-0"
                >
                  {ritual.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-400" />
                  )}
                </Button>

                <ritual.icon
                  className={cn(
                    "h-4 w-4",
                    ritual.completed ? "text-green-400" : "text-slate-400",
                  )}
                />

                <div className="flex-1">
                  <h4
                    className={cn(
                      "font-medium text-base",
                      ritual.completed ? "text-green-300" : "text-slate-200",
                    )}
                  >
                    {ritual.name}
                    {ritual.isCore && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Core
                      </Badge>
                    )}
                  </h4>
                  <p className="text-sm text-slate-400">{ritual.description}</p>
                </div>

                <div className="text-sm text-slate-400">{ritual.duration}m</div>
              </div>
            ))}
          </div>

          {/* Meditation Timer */}
          {!rituals.find((r) => r.id === "meditation")?.completed && (
            <div className="mt-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600">
              <h4 className="text-base font-medium text-slate-200 mb-3">
                Quick Meditation Timer
              </h4>
              {!isTimerActive ? (
                <div className="flex space-x-2">
                  {[2, 5, 10].map((minutes) => (
                    <Button
                      key={minutes}
                      size="sm"
                      variant="outline"
                      onClick={() => onStartMeditationTimer(minutes)}
                      className="flex-1"
                    >
                      {minutes}m
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-mono text-blue-400 mb-2">
                    {formatTime(meditationTimer)}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Stop timer logic would be handled by parent
                    }}
                  >
                    Stop
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Overall Progress */}
          <div className="mt-4 pt-4 border-t border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">Morning Progress</span>
              <span className="text-sm text-slate-400">
                {completedRituals}/{totalRituals}
              </span>
            </div>
            <Progress
              value={(completedRituals / totalRituals) * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Task Creation */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-100">
            <List className="h-5 w-5 text-blue-400" />
            <span>Add Tasks in Bulk</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2 mb-3">
            <Button
              size="sm"
              variant={activeTaskType === "morning" ? "default" : "outline"}
              onClick={() => setActiveTaskType("morning")}
              className="flex-1"
            >
              Morning Tasks
            </Button>
            <Button
              size="sm"
              variant={activeTaskType === "afternoon" ? "default" : "outline"}
              onClick={() => setActiveTaskType("afternoon")}
              className="flex-1"
            >
              Afternoon Tasks
            </Button>
          </div>

          <div className="space-y-3">
            <label className="text-base font-medium text-slate-300 block">
              Add multiple tasks (start each with a hyphen -)
            </label>
            <Textarea
              value={bulkTaskInput}
              onChange={(e) => setBulkTaskInput(e.target.value)}
              placeholder="- Review project documents&#10;- Call client about requirements&#10;- Update dashboard mockups&#10;- Plan next week's sprint"
              className="bg-slate-700/50 border-slate-600 text-slate-100 min-h-[120px] font-mono text-sm"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Each line starting with '-' becomes a {activeTaskType} task
              </p>
              <Button
                onClick={addBulkTasks}
                disabled={!bulkTaskInput.trim() || !bulkTaskInput.includes("-")}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tasks
              </Button>
            </div>
          </div>

          {/* Task Lists */}
          {(morningTasks.length > 0 || afternoonTasks.length > 0) && (
            <Separator className="bg-slate-600" />
          )}

          {morningTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300 flex items-center space-x-2">
                <Sunrise className="h-4 w-4 text-orange-400" />
                <span>
                  Morning Tasks (
                  {morningTasks.filter((t) => t.completed).length}/
                  {morningTasks.length})
                </span>
              </h4>
              {morningTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-slate-700/30 rounded border border-slate-600"
                >
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleTask(task.id)}
                      className="h-6 w-6 p-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                      ) : (
                        <Circle className="h-3 w-3 text-slate-400" />
                      )}
                    </Button>
                    <span
                      className={cn(
                        "text-sm text-slate-200",
                        task.completed && "line-through text-slate-400",
                      )}
                    >
                      {task.title}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTask(task.id)}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}

          {afternoonTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300 flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span>
                  Afternoon Tasks (
                  {afternoonTasks.filter((t) => t.completed).length}/
                  {afternoonTasks.length})
                </span>
              </h4>
              {afternoonTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-slate-700/30 rounded border border-slate-600"
                >
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleTask(task.id)}
                      className="h-6 w-6 p-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                      ) : (
                        <Circle className="h-3 w-3 text-slate-400" />
                      )}
                    </Button>
                    <span
                      className={cn(
                        "text-sm text-slate-200",
                        task.completed && "line-through text-slate-400",
                      )}
                    >
                      {task.title}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTask(task.id)}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
