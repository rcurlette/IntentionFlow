import { useState } from "react";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Clock,
  Calendar,
  Copy,
  Share,
  Timer,
  Zap,
  MoreHorizontal,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Archive,
  Star,
  MessageSquare,
  Link,
  Trash2,
} from "lucide-react";
import { GTDTaskForm } from "./GTDTaskForm";

interface TaskQuickActionsProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onStartPomodoro?: (task: Task) => void;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
}

export function TaskQuickActions({
  task,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
  onStartPomodoro,
  showLabel = false,
  size = "default",
}: TaskQuickActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const handleQuickAction = async (action: string) => {
    const now = new Date();

    switch (action) {
      case "complete":
        await onUpdateTask(task.id, {
          status: "completed",
          completed: true,
          completedAt: now,
          updatedAt: now,
        });
        break;

      case "start":
        await onUpdateTask(task.id, {
          status: "in-progress",
          startedAt: now,
          updatedAt: now,
        });
        break;

      case "pause":
        await onUpdateTask(task.id, {
          status: "todo",
          updatedAt: now,
        });
        break;

      case "reset":
        await onUpdateTask(task.id, {
          status: "todo",
          completed: false,
          startedAt: undefined,
          completedAt: undefined,
          timeSpent: 0,
          pomodoroCount: 0,
          updatedAt: now,
        });
        break;

      case "high-priority":
        await onUpdateTask(task.id, {
          priority: "high",
          updatedAt: now,
        });
        break;

      case "schedule-today":
        await onUpdateTask(task.id, {
          scheduledFor: now.toISOString().split("T")[0],
          updatedAt: now,
        });
        break;

      case "schedule-tomorrow":
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        await onUpdateTask(task.id, {
          scheduledFor: tomorrow.toISOString().split("T")[0],
          updatedAt: now,
        });
        break;

      case "move-morning":
        await onUpdateTask(task.id, {
          period: "morning",
          updatedAt: now,
        });
        break;

      case "move-afternoon":
        await onUpdateTask(task.id, {
          period: "afternoon",
          updatedAt: now,
        });
        break;
    }
  };

  const handleShare = async () => {
    const shareText = `Task: ${task.title}\n${task.description ? task.description + "\n" : ""}Priority: ${task.priority}\nType: ${task.type}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: task.title,
          text: shareText,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  const handleCopyLink = async () => {
    const taskUrl = `${window.location.origin}/tasks?task=${task.id}`;
    await navigator.clipboard.writeText(taskUrl);
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <PauseCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const canStart = task.status === "todo";
  const canPause = task.status === "in-progress";
  const canComplete = task.status !== "completed";
  const canReset =
    task.status !== "todo" || task.timeSpent || task.pomodoroCount;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            className={cn(
              "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
              showLabel && "w-auto px-2",
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
            {showLabel && <span className="ml-2">Actions</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Quick Actions</span>
            <div className="flex items-center space-x-1">
              {getStatusIcon()}
              <Badge variant="outline" className="text-xs">
                {task.status}
              </Badge>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Status Actions */}
          {canStart && (
            <DropdownMenuItem onClick={() => handleQuickAction("start")}>
              <PlayCircle className="h-4 w-4 mr-2 text-green-600" />
              Start Task
            </DropdownMenuItem>
          )}

          {canPause && (
            <DropdownMenuItem onClick={() => handleQuickAction("pause")}>
              <PauseCircle className="h-4 w-4 mr-2 text-yellow-600" />
              Pause Task
            </DropdownMenuItem>
          )}

          {canComplete && (
            <DropdownMenuItem onClick={() => handleQuickAction("complete")}>
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
              Mark Complete
            </DropdownMenuItem>
          )}

          {canReset && (
            <DropdownMenuItem onClick={() => handleQuickAction("reset")}>
              <RotateCcw className="h-4 w-4 mr-2 text-gray-600" />
              Reset Progress
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Focus Actions */}
          {onStartPomodoro && !task.completed && (
            <DropdownMenuItem onClick={() => onStartPomodoro(task)}>
              <Timer className="h-4 w-4 mr-2 text-red-600" />
              Start Pomodoro
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Edit Details
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Scheduling Actions */}
          <DropdownMenuItem onClick={() => handleQuickAction("schedule-today")}>
            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
            Schedule Today
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleQuickAction("schedule-tomorrow")}
          >
            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
            Schedule Tomorrow
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Priority Actions */}
          {task.priority !== "high" && (
            <DropdownMenuItem
              onClick={() => handleQuickAction("high-priority")}
            >
              <Zap className="h-4 w-4 mr-2 text-red-600" />
              Make High Priority
            </DropdownMenuItem>
          )}

          {/* Period Actions */}
          {task.period !== "morning" && (
            <DropdownMenuItem onClick={() => handleQuickAction("move-morning")}>
              <Clock className="h-4 w-4 mr-2 text-orange-600" />
              Move to Morning
            </DropdownMenuItem>
          )}

          {task.period !== "afternoon" && (
            <DropdownMenuItem
              onClick={() => handleQuickAction("move-afternoon")}
            >
              <Clock className="h-4 w-4 mr-2 text-blue-600" />
              Move to Afternoon
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Utility Actions */}
          <DropdownMenuItem onClick={() => onDuplicateTask(task)}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Task
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            Share Task
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleCopyLink}>
            <Link className="h-4 w-4 mr-2" />
            Copy Link
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => onDeleteTask(task.id)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <GTDTaskForm
            task={task}
            onSave={async (updates) => {
              await onUpdateTask(task.id, updates);
              setIsEditOpen(false);
            }}
            onCancel={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
