import { useState } from "react";
import { Task } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Brain,
  FileText,
  Clock,
  Edit,
  Trash2,
  Play,
  MoreHorizontal,
  Plus,
  ChevronRight,
  Target,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubtaskManager } from "./SubtaskManager";

interface EnhancedTaskItemProps {
  task: Task;
  subtasks?: Task[];
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStartPomodoro?: (task: Task) => void;
  onCreateSubtask?: (
    parentId: string,
    subtaskData: Partial<Task>,
  ) => Promise<void>;
  onUpdateSubtask?: (
    subtaskId: string,
    updates: Partial<Task>,
  ) => Promise<void>;
  onDeleteSubtask?: (subtaskId: string) => Promise<void>;
  onToggleSubtask?: (subtaskId: string) => Promise<void>;
  onReorderSubtasks?: (parentId: string, subtaskIds: string[]) => Promise<void>;
  className?: string;
}

export function EnhancedTaskItem({
  task,
  subtasks = [],
  onToggleComplete,
  onEdit,
  onDelete,
  onStartPomodoro,
  onCreateSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onToggleSubtask,
  onReorderSubtasks,
  className,
}: EnhancedTaskItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(true);

  // Calculate subtask progress
  const completedSubtasks = subtasks.filter(
    (subtask) => subtask.completed,
  ).length;
  const totalSubtasks = subtasks.length;
  const subtaskProgress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleToggleComplete = async () => {
    onToggleComplete(task.id);
  };

  const getPriorityEmoji = () => {
    switch (task.priority) {
      case "high":
        return "🔥";
      case "medium":
        return "⚡";
      case "low":
        return "🌱";
      default:
        return "⭐";
    }
  };

  return (
    <div
      className={cn(
        "flex items-start space-x-3 p-3 bg-background rounded-lg border hover:shadow-md transition-all duration-200 group focus-within:ring-2 focus-within:ring-primary/20",
        task.completed && "bg-success/10 border-success/20",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={handleToggleComplete}
        className={cn(
          "mt-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20",
          task.completed && "data-[state=checked]:bg-success",
        )}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <div
            className={cn(
              "p-1 rounded transition-colors duration-200",
              task.type === "brain"
                ? "bg-focus text-focus-foreground"
                : "bg-admin text-admin-foreground",
            )}
          >
            {task.type === "brain" ? (
              <Brain className="h-3 w-3" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
          </div>
          <h3
            className={cn(
              "font-medium text-sm transition-all duration-200",
              task.completed && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </h3>
          <Badge variant="outline" className="text-xs">
            {getPriorityEmoji()}
          </Badge>
        </div>

        {task.description && (
          <p
            className={cn(
              "text-xs text-muted-foreground mb-1 transition-all duration-200",
              task.completed && "line-through",
            )}
          >
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {task.timeBlock && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{task.timeBlock}m</span>
              </div>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 2).map((tag, index) => (
                  <Badge
                    key={`${task.id}-tag-${index}-${tag}`}
                    variant="secondary"
                    className="text-xs px-1 py-0"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Hover Actions */}
          <div
            className={cn(
              "flex items-center space-x-1 transition-all duration-200",
              isHovered
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-2",
            )}
          >
            {!task.completed && onStartPomodoro && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-focus hover:text-focus hover:bg-focus/10"
                onClick={() => onStartPomodoro(task)}
                title="Start Pomodoro Session"
              >
                <Play className="h-3 w-3" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
              onClick={() => onEdit(task)}
              title="Edit Task"
            >
              <Edit className="h-3 w-3" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="h-3 w-3 mr-2" />
                  Edit
                </DropdownMenuItem>
                {!task.completed && onStartPomodoro && (
                  <DropdownMenuItem onClick={() => onStartPomodoro(task)}>
                    <Play className="h-3 w-3 mr-2" />
                    Start Focus
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
