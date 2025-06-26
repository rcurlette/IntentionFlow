import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Task } from "@/types";
import {
  getDayPlans,
  saveDayPlan,
  addTask,
  updateTask,
  deleteTask,
  getTodayPlan,
  getAllTasks,
} from "@/lib/storage";
import { getTemplates, createTasksFromTemplate } from "@/lib/task-templates";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { generateId } from "@/lib/productivity-utils";
import {
  getSmartSuggestions,
  getRecentTags,
  getTimeEstimateFromHistory,
} from "@/lib/smart-suggestions";
import {
  exportTasks,
  downloadFile,
  getExportFilename,
} from "@/lib/task-export";

import { Navigation } from "@/components/app/Navigation";
import { TaskCard } from "@/components/app/TaskCard";
import { EnhancedTaskItem } from "@/components/app/EnhancedTaskItem";
import { TasksEmptyState } from "@/components/app/TasksEmptyState";
import { TaskFilterPanel } from "@/components/app/TaskFilterPanel";
import { TaskTemplatesPanel } from "@/components/app/TaskTemplatesPanel";
import { TaskBulkOperations } from "@/components/app/TaskBulkOperations";
import { TaskAnalyticsDashboard } from "@/components/app/TaskAnalyticsDashboard";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Plus,
  Layers,
  BarChart3,
  Target,
  Brain,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";

export default function Tasks() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<any>(null);
  const [recentTags, setRecentTags] = useState<string[]>([]);

  const navigate = useNavigate();

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "brain" as Task["type"],
    period: "morning" as Task["period"],
    priority: "medium" as Task["priority"],
    timeBlock: 25,
    tags: [] as string[],
  });

  const templates = getTemplates();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTask: () => setIsCreateTaskOpen(true),
    onEscape: () => {
      setIsCreateTaskOpen(false);
      setEditingTask(null);
    },
  });

  // Load all tasks from database
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasks = await getAllTasks();
        setAllTasks(tasks);

        // Load recent tags
        const recent = await getRecentTags(8);
        setRecentTags(recent.map((r) => r.tag));
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    };

    loadTasks();
  }, []);

  // Get available tags from all tasks
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    allTasks.forEach((task) => {
      task.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [allTasks]);

  // Use filtering hook
  const { filters, filteredTasks, updateFilter, resetFilters, getFilterCount } =
    useTaskFilters(allTasks);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        type: newTask.type,
        period: newTask.period,
        priority: newTask.priority,
        timeBlock: newTask.timeBlock,
        tags: newTask.tags,
        completed: false,
      };

      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await addTask(taskData);
      }

      // Reload tasks
      const tasks = await getAllTasks();
      setAllTasks(tasks);

      // Reset form
      setNewTask({
        title: "",
        description: "",
        type: "brain",
        period: "morning",
        priority: "medium",
        timeBlock: 25,
        tags: [],
      });
      setIsCreateTaskOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error creating/updating task:", error);
    }
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
      tags: task.tags || [],
    });
    setIsCreateTaskOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setAllTasks((prev) => prev.filter((task) => task.id !== taskId));
      setSelectedTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    const task = allTasks.find((t) => t.id === taskId);
    if (task) {
      try {
        await updateTask(taskId, { completed: !task.completed });
        setAllTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t,
          ),
        );
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  const handleUseTemplate = async (
    template: any,
    period: "morning" | "afternoon",
  ) => {
    try {
      const tasksFromTemplate = createTasksFromTemplate(template, period);

      // Add all tasks from template
      for (const taskData of tasksFromTemplate) {
        await addTask(taskData);
      }

      // Reload tasks
      const tasks = await getAllTasks();
      setAllTasks(tasks);
    } catch (error) {
      console.error("Error using template:", error);
    }
  };

  const handleTaskSelection = (task: Task, selected: boolean) => {
    setSelectedTasks((prev) =>
      selected
        ? [...prev, task]
        : prev.filter((selectedTask) => selectedTask.id !== task.id),
    );
  };

  const handleSelectAll = () => {
    setSelectedTasks([...filteredTasks]);
  };

  const handleDeselectAll = () => {
    setSelectedTasks([]);
  };

  // Bulk operations
  const handleBulkComplete = (taskIds: string[]) => {
    taskIds.forEach((id) => {
      updateTask(id, { completed: true });
    });
    setAllTasks((prev) =>
      prev.map((task) =>
        taskIds.includes(task.id) ? { ...task, completed: true } : task,
      ),
    );
    setSelectedTasks([]);
  };

  const handleBulkDelete = (taskIds: string[]) => {
    taskIds.forEach((id) => {
      deleteTask(id);
    });
    setAllTasks((prev) => prev.filter((task) => !taskIds.includes(task.id)));
    setSelectedTasks([]);
  };

  const handleBulkUpdatePeriod = (
    taskIds: string[],
    period: "morning" | "afternoon",
  ) => {
    taskIds.forEach((id) => {
      updateTask(id, { period });
    });
    setAllTasks((prev) =>
      prev.map((task) =>
        taskIds.includes(task.id) ? { ...task, period } : task,
      ),
    );
  };

  const handleBulkUpdatePriority = (
    taskIds: string[],
    priority: Task["priority"],
  ) => {
    taskIds.forEach((id) => {
      updateTask(id, { priority });
    });
    setAllTasks((prev) =>
      prev.map((task) =>
        taskIds.includes(task.id) ? { ...task, priority } : task,
      ),
    );
  };

  const handleBulkAddTags = (taskIds: string[], tags: string[]) => {
    taskIds.forEach((id) => {
      const task = allTasks.find((t) => t.id === id);
      if (task) {
        const existingTags = task.tags || [];
        const newTags = [...new Set([...existingTags, ...tags])];
        updateTask(id, { tags: newTags });
      }
    });
    // Reload tasks to get updated tags
    const dayPlans = getDayPlans();
    const tasks: Task[] = [];
    dayPlans.forEach((plan) => {
      tasks.push(
        ...plan.morningTasks,
        ...plan.afternoonTasks,
        ...plan.laterBird,
      );
    });
    setAllTasks(tasks);
  };

  const handleBulkDuplicate = (taskIds: string[]) => {
    taskIds.forEach((id) => {
      const task = allTasks.find((t) => t.id === id);
      if (task) {
        addTask({
          title: `${task.title} (Copy)`,
          description: task.description,
          type: task.type,
          period: task.period,
          priority: task.priority,
          timeBlock: task.timeBlock,
          tags: task.tags,
          completed: false,
        });
      }
    });
    // Reload tasks
    const dayPlans = getDayPlans();
    const tasks: Task[] = [];
    dayPlans.forEach((plan) => {
      tasks.push(
        ...plan.morningTasks,
        ...plan.afternoonTasks,
        ...plan.laterBird,
      );
    });
    setAllTasks(tasks);
  };

  const handleTagInput = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    setNewTask((prev) => ({ ...prev, tags }));
  };

  const handleTitleChange = (title: string) => {
    setNewTask((prev) => ({ ...prev, title }));

    // Get smart suggestions when title has enough content
    if (title.length > 3) {
      const suggestions = getSmartSuggestions(title, newTask.description);
      setSmartSuggestions(suggestions);

      // Auto-apply high-confidence suggestions
      if (suggestions.confidence > 0.8) {
        setNewTask((prev) => ({
          ...prev,
          type: suggestions.suggestedType,
          timeBlock: suggestions.suggestedTimeBlock,
        }));
      }
    } else {
      setSmartSuggestions(null);
    }
  };

  const handleStartPomodoro = (task: Task) => {
    // Navigate to Pomodoro page with task linked
    navigate("/pomodoro", { state: { linkedTask: task } });
  };

  const handleExportTasks = (format: "json" | "csv" | "markdown" | "txt") => {
    const content = exportTasks(filteredTasks, {
      format,
      includeCompleted: true,
      includePending: true,
    });

    const mimeTypes = {
      json: "application/json",
      csv: "text/csv",
      markdown: "text/markdown",
      txt: "text/plain",
    };

    downloadFile(content, getExportFilename(format), mimeTypes[format]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-8 px-4 container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-focus to-energy bg-clip-text text-transparent">
                Advanced Task Management
              </h1>
              <p className="text-muted-foreground">
                Organize, filter, and analyze your productivity
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <TaskTemplatesPanel
                templates={templates}
                onUseTemplate={handleUseTemplate}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="manage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Manage Tasks</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-6">
            {/* Big New Task Button */}
            <div className="flex justify-center">
              <Dialog
                open={isCreateTaskOpen}
                onOpenChange={(open) => {
                  setIsCreateTaskOpen(open);
                  if (!open) {
                    setEditingTask(null);
                    setNewTask({
                      title: "",
                      description: "",
                      type: "brain",
                      period: "morning",
                      priority: "medium",
                      timeBlock: 25,
                      tags: [],
                    });
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-6 w-6 mr-3" />
                    Add New Task
                    <Sparkles className="h-5 w-5 ml-3 animate-pulse" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingTask ? "Edit Task" : "Create New Task"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="What needs to be done?"
                        autoFocus
                      />
                      {smartSuggestions && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                          <span className="text-muted-foreground">
                            💡 {smartSuggestions.reasoning}
                          </span>
                        </div>
                      )}
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
                        placeholder="Additional details..."
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
                              ���� Morning
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
                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={newTask.tags.join(", ")}
                        onChange={(e) => handleTagInput(e.target.value)}
                        placeholder="coding, urgent, research..."
                      />
                      {recentTags.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">
                            Recent tags:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {recentTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                onClick={() => {
                                  const currentTags = newTask.tags;
                                  if (!currentTags.includes(tag)) {
                                    setNewTask((prev) => ({
                                      ...prev,
                                      tags: [...currentTags, tag],
                                    }));
                                  }
                                }}
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button onClick={handleCreateTask} className="w-full">
                      <Sparkles className="h-4 w-4 mr-2" />
                      {editingTask ? "Update Task" : "Create Task"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Two-Box Task View - Mobile Responsive */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Morning Tasks */}
              <Card className="border-2 border-morning/20 bg-morning/5">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-morning rounded-full"></div>
                      <span className="text-morning">Morning Tasks</span>
                      <Badge
                        variant="outline"
                        className="text-morning border-morning"
                      >
                        {
                          filteredTasks.filter(
                            (task) => task.period === "morning",
                          ).length
                        }
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredTasks.filter((task) => task.period === "morning")
                      .length === 0 ? (
                      <TasksEmptyState
                        period="morning"
                        onAddTask={() => {
                          setNewTask((prev) => ({
                            ...prev,
                            period: "morning",
                          }));
                          setIsCreateTaskOpen(true);
                        }}
                      />
                    ) : (
                      filteredTasks
                        .filter((task) => task.period === "morning")
                        .map((task) => {
                          if (!task.id) {
                            console.warn("Task missing ID:", task);
                            return null;
                          }
                          return (
                            <EnhancedTaskItem
                              key={task.id}
                              task={task}
                              onToggleComplete={handleToggleComplete}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                              onStartPomodoro={handleStartPomodoro}
                            />
                          );
                        })
                        .filter(Boolean)
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Afternoon Tasks */}
              <Card className="border-2 border-afternoon/20 bg-afternoon/5">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-afternoon rounded-full"></div>
                      <span className="text-afternoon">Afternoon Tasks</span>
                      <Badge
                        variant="outline"
                        className="text-afternoon border-afternoon"
                      >
                        {
                          filteredTasks.filter(
                            (task) => task.period === "afternoon",
                          ).length
                        }
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredTasks.filter((task) => task.period === "afternoon")
                      .length === 0 ? (
                      <TasksEmptyState
                        period="afternoon"
                        onAddTask={() => {
                          setNewTask((prev) => ({
                            ...prev,
                            period: "afternoon",
                          }));
                          setIsCreateTaskOpen(true);
                        }}
                      />
                    ) : (
                      filteredTasks
                        .filter((task) => task.period === "afternoon")
                        .map((task) => {
                          if (!task.id) {
                            console.warn("Task missing ID:", task);
                            return null;
                          }
                          return (
                            <EnhancedTaskItem
                              key={task.id}
                              task={task}
                              onToggleComplete={handleToggleComplete}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                              onStartPomodoro={handleStartPomodoro}
                            />
                          );
                        })
                        .filter(Boolean)
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Panel - Moved Below Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>Filters & Search</span>
                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleExportTasks("json")}
                        >
                          📄 JSON Format
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportTasks("csv")}
                        >
                          📊 CSV Format
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportTasks("markdown")}
                        >
                          📝 Markdown Format
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportTasks("txt")}
                        >
                          📃 Text Format
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Badge variant="outline">
                      {filteredTasks.length} of {allTasks.length} tasks
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskFilterPanel
                  filters={filters}
                  onUpdateFilter={updateFilter}
                  onResetFilters={resetFilters}
                  filterCount={getFilterCount()}
                  availableTags={availableTags}
                />
              </CardContent>
            </Card>

            {/* Bulk Operations */}
            <TaskBulkOperations
              selectedTasks={selectedTasks}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onBulkComplete={handleBulkComplete}
              onBulkDelete={handleBulkDelete}
              onBulkUpdatePeriod={handleBulkUpdatePeriod}
              onBulkUpdatePriority={handleBulkUpdatePriority}
              onBulkAddTags={handleBulkAddTags}
              onBulkDuplicate={handleBulkDuplicate}
              totalTaskCount={filteredTasks.length}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <TaskAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
