import { useState, useMemo } from "react";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Grip,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CalendarViewProps {
  tasks: Task[];
  onCreateTask: (
    taskData: Partial<Task> & { scheduledFor: string; dueTime?: string },
  ) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onEditTask: (task: Task) => void;
  className?: string;
}

export function CalendarView({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  className,
}: CalendarViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [addingTaskToDate, setAddingTaskToDate] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");

  // Get the start of the current week (Monday)
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Get tasks for each day
  const getTasksForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return tasks
      .filter((task) => task.scheduledFor === dateStr)
      .sort((a, b) => {
        if (!a.dueTime && !b.dueTime) return 0;
        if (!a.dueTime) return 1;
        if (!b.dueTime) return -1;
        return a.dueTime.localeCompare(b.dueTime);
      });
  };

  // Mini calendar for sidebar
  const miniCalendarDays = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const handleCreateTask = async (date: Date) => {
    if (!newTaskTitle.trim()) return;

    const dateStr = format(date, "yyyy-MM-dd");

    await onCreateTask({
      title: newTaskTitle,
      scheduledFor: dateStr,
      dueTime: newTaskTime || undefined,
      type: "brain",
      period: new Date().getHours() < 12 ? "morning" : "afternoon",
      priority: "medium",
      status: "todo",
      completed: false,
    });

    setNewTaskTitle("");
    setNewTaskTime("");
    setAddingTaskToDate(null);
  };

  const handleTaskDrop = async (
    taskId: string,
    newDate: Date,
    newTime?: string,
  ) => {
    const dateStr = format(newDate, "yyyy-MM-dd");
    await onUpdateTask(taskId, {
      scheduledFor: dateStr,
      dueTime: newTime,
      updatedAt: new Date(),
    });
  };

  const getTaskColor = (task: Task) => {
    if (task.completed) return "bg-gray-200 text-gray-600 border-gray-300";

    switch (task.priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
      default:
        return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200";
    }
  };

  const getProjectColor = (tags: string[] = []) => {
    if (tags.includes("work")) return "bg-blue-500";
    if (tags.includes("personal")) return "bg-green-500";
    if (tags.includes("growth")) return "bg-purple-500";
    if (tags.includes("family")) return "bg-orange-500";
    return "bg-gray-400";
  };

  return (
    <div className={cn("flex h-full bg-gray-50", className)}>
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Mini Calendar */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(selectedDate, "MMMM yyyy")}
            </h2>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(subWeeks(selectedDate, 4))}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(addWeeks(selectedDate, 4))}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mini Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <div key={`header-${index}`} className="py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {miniCalendarDays.map((day, index) => (
              <button
                key={`mini-cal-${day.toISOString()}`}
                onClick={() => {
                  setSelectedDate(day);
                  setCurrentWeek(day);
                }}
                className={cn(
                  "h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors",
                  isToday(day)
                    ? "bg-blue-600 text-white font-semibold"
                    : isSameDay(day, selectedDate)
                      ? "bg-blue-100 text-blue-600 font-medium"
                      : isSameMonth(day, selectedDate)
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-gray-300",
                )}
              >
                {format(day, "d")}
              </button>
            ))}
          </div>
        </div>

        {/* Project Channels */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
            Channels
          </h3>
          <div className="space-y-2">
            {[
              { name: "All", count: tasks.length, color: "bg-gray-400" },
              {
                name: "Work",
                count: tasks.filter((t) => t.tags?.includes("work")).length,
                color: "bg-blue-500",
              },
              {
                name: "Growth",
                count: tasks.filter((t) => t.tags?.includes("growth")).length,
                color: "bg-purple-500",
              },
              {
                name: "Personal",
                count: tasks.filter((t) => t.tags?.includes("personal")).length,
                color: "bg-green-500",
              },
              {
                name: "Family",
                count: tasks.filter((t) => t.tags?.includes("family")).length,
                color: "bg-orange-500",
              },
            ].map((channel) => (
              <div
                key={channel.name}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className={cn("w-3 h-3 rounded-full", channel.color)} />
                <span className="text-sm text-gray-700 flex-1">
                  {channel.name}
                </span>
                <span className="text-xs text-gray-400">{channel.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-1 flex flex-col">
        {/* Calendar Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                className="h-9 px-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                {format(weekStart, "MMMM d")} -{" "}
                {format(addDays(weekStart, 6), "d, yyyy")}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                className="h-9 px-3"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(new Date())}
              >
                Today
              </Button>
              <div className="flex rounded-lg border border-gray-300 bg-gray-50 p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white shadow-sm"
                >
                  Tasks
                </Button>
                <Button variant="ghost" size="sm">
                  Calendar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 bg-gray-50">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-white">
            {weekDays.map((day, dayIndex) => (
              <div
                key={`week-header-${day.toISOString()}`}
                className="border-r border-gray-200 last:border-r-0"
              >
                <div className="p-4 text-center">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {format(day, "EEE")}
                  </div>
                  <div
                    className={cn(
                      "text-2xl font-semibold mt-1",
                      isToday(day) ? "text-blue-600" : "text-gray-900",
                    )}
                  >
                    {format(day, "d")}
                  </div>
                  {isToday(day) && (
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      {format(day, "MMMM")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-7 flex-1">
            {weekDays.map((day, columnIndex) => {
              const dayTasks = getTasksForDay(day);
              const dateStr = format(day, "yyyy-MM-dd");
              const isAddingTask = addingTaskToDate === dateStr;

              return (
                <div
                  key={`tasks-column-${day.toISOString()}`}
                  className="border-r border-gray-200 last:border-r-0 p-4 min-h-[600px] bg-white"
                >
                  {/* Add Task Button */}
                  {!isAddingTask && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAddingTaskToDate(dateStr)}
                      className="w-full justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-2 border-dashed border-gray-200 hover:border-gray-300 h-10 mb-3"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add a task
                    </Button>
                  )}

                  {/* Add Task Form */}
                  {isAddingTask && (
                    <Card className="mb-3 border-blue-200 bg-blue-50">
                      <CardContent className="p-3">
                        <Input
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleCreateTask(day);
                            } else if (e.key === "Escape") {
                              setAddingTaskToDate(null);
                              setNewTaskTitle("");
                              setNewTaskTime("");
                            }
                          }}
                          placeholder="Task title..."
                          className="mb-2 text-sm border-none bg-white focus:ring-blue-500"
                          autoFocus
                        />
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={newTaskTime}
                            onChange={(e) => setNewTaskTime(e.target.value)}
                            className="w-24 text-xs border-none bg-white"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleCreateTask(day)}
                            disabled={!newTaskTitle.trim()}
                            className="h-7 px-3 text-xs"
                          >
                            Add
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAddingTaskToDate(null);
                              setNewTaskTitle("");
                              setNewTaskTime("");
                            }}
                            className="h-7 px-3 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tasks */}
                  <div className="space-y-2">
                    {dayTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onUpdate={onUpdateTask}
                        className={getTaskColor(task)}
                        projectColor={getProjectColor(task.tags)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  className?: string;
  projectColor?: string;
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onUpdate,
  className,
  projectColor = "bg-gray-400",
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleToggleComplete = async () => {
    await onUpdate(task.id, {
      completed: !task.completed,
      status: task.completed ? "todo" : "completed",
      completedAt: task.completed ? undefined : new Date(),
      updatedAt: new Date(),
    });
  };

  return (
    <Card
      className={cn(
        "border cursor-pointer transition-all duration-200 group",
        className,
        task.completed && "opacity-70",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleToggleComplete}
    >
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          {/* Project Color Dot */}
          <div
            className={cn(
              "w-3 h-3 rounded-full mt-1 flex-shrink-0",
              projectColor,
            )}
          />

          <div className="flex-1 min-w-0">
            {/* Time */}
            {task.dueTime && (
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Clock className="h-3 w-3 mr-1" />
                {task.dueTime}
              </div>
            )}

            {/* Title */}
            <h3
              className={cn(
                "text-sm font-medium leading-tight",
                task.completed && "line-through text-gray-500",
              )}
            >
              {task.title}
            </h3>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs px-1 py-0 h-4"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            className={cn(
              "flex items-center space-x-1 transition-opacity",
              isHovered ? "opacity-100" : "opacity-0",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cursor-grab">
              <Grip className="h-3 w-3 text-gray-400" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(task.id)}>
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
