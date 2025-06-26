import { useState, useEffect } from "react";
import { Navigation } from "@/components/app/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import apiClient, { ApiError } from "@/lib/api-client";
import { getStorageStatus } from "@/lib/storage-api";
import type { Task } from "@/types";
import {
  Code,
  Server,
  Database,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
} from "lucide-react";

export default function ApiDemo() {
  const [apiStatus, setApiStatus] = useState<{
    apiAvailable: boolean;
    useApiFirst: boolean;
    mode: "api" | "localStorage" | "hybrid";
  } | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for creating tasks
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "brain" as "brain" | "admin",
    period: "morning" as "morning" | "afternoon",
    priority: "medium" as "low" | "medium" | "high",
  });

  useEffect(() => {
    loadApiStatus();
    loadTasks();
  }, []);

  const loadApiStatus = async () => {
    try {
      const status = await getStorageStatus();
      setApiStatus(status);
    } catch (error) {
      console.error("Failed to load API status:", error);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.tasks.getAll();
      setTasks(response.tasks);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(`API Error: ${error.message}`);
      } else {
        setError("Failed to load tasks");
      }
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await apiClient.tasks.create({
        ...newTask,
        status: "todo",
        tags: [],
        timeSpent: 0,
        pomodoroCount: 0,
      });

      // Reset form
      setNewTask({
        title: "",
        description: "",
        type: "brain",
        period: "morning",
        priority: "medium",
      });

      // Reload tasks
      await loadTasks();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(`Failed to create task: ${error.message}`);
      } else {
        setError("Failed to create task");
      }
      console.error("Failed to create task:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.tasks.delete(taskId);
      await loadTasks();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(`Failed to delete task: ${error.message}`);
      } else {
        setError("Failed to delete task");
      }
      console.error("Failed to delete task:", error);
    } finally {
      setLoading(false);
    }
  };

  const testHealthCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.health.check();
      alert(
        `API Health Check Successful!\nStatus: ${response.status}\nTime: ${response.timestamp}`,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError(`Health check failed: ${error.message}`);
      } else {
        setError("Health check failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-8 px-4 container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-focus to-energy bg-clip-text text-transparent mb-2">
            API Demo & Testing
          </h1>
          <p className="text-muted-foreground">
            Test the Netlify Edge Functions API endpoints
          </p>
        </div>

        {/* API Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>API Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apiStatus ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  {apiStatus.apiAvailable ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className="text-sm">
                    API {apiStatus.apiAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-focus" />
                  <span className="text-sm">Mode: {apiStatus.mode}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={apiStatus.useApiFirst ? "default" : "outline"}
                  >
                    {apiStatus.useApiFirst ? "API First" : "LocalStorage First"}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading API status...</span>
              </div>
            )}

            <div className="mt-4 flex space-x-2">
              <Button onClick={loadApiStatus} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
              <Button onClick={testHealthCheck} size="sm" variant="outline">
                <Server className="h-4 w-4 mr-2" />
                Test Health Check
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Task */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Task</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter task title"
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
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newTask.type}
                    onValueChange={(value: "brain" | "admin") =>
                      setNewTask((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brain">🧠 Brain Task</SelectItem>
                      <SelectItem value="admin">📋 Admin Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="period">Period</Label>
                  <Select
                    value={newTask.period}
                    onValueChange={(value: "morning" | "afternoon") =>
                      setNewTask((prev) => ({ ...prev, period: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">🌅 Morning</SelectItem>
                      <SelectItem value="afternoon">🌆 Afternoon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setNewTask((prev) => ({ ...prev, priority: value }))
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

              <Button
                onClick={createTask}
                disabled={loading || !newTask.title.trim()}
                className="w-full"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Task via API
              </Button>
            </CardContent>
          </Card>

          {/* Task List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Tasks from API</span>
                </div>
                <Button onClick={loadTasks} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading tasks...</span>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tasks found</p>
                  <p className="text-sm">Create a task to test the API</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">
                            {task.title}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {task.type === "brain" ? "🧠" : "📋"} {task.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {task.period === "morning" ? "🌅" : "🌆"}{" "}
                            {task.period}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Priority:{" "}
                            {task.priority === "high"
                              ? "🔥"
                              : task.priority === "medium"
                                ? "⚡"
                                : "🌱"}{" "}
                            {task.priority}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Status: {task.status}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => deleteTask(task.id)}
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* API Endpoints Documentation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Available API Endpoints</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Task Management</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <code>GET /api/tasks</code> - Get all tasks
                  </li>
                  <li>
                    <code>GET /api/tasks/:id</code> - Get single task
                  </li>
                  <li>
                    <code>POST /api/tasks</code> - Create task
                  </li>
                  <li>
                    <code>PUT /api/tasks/:id</code> - Update task
                  </li>
                  <li>
                    <code>DELETE /api/tasks/:id</code> - Delete task
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Other Endpoints</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    <code>GET /api/day-plans</code> - Get day plan
                  </li>
                  <li>
                    <code>POST /api/pomodoro/sessions</code> - Create session
                  </li>
                  <li>
                    <code>GET /api/pomodoro/stats</code> - Get stats
                  </li>
                  <li>
                    <code>GET /api/health</code> - Health check
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
