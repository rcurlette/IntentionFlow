import { useState } from "react";
import { Task } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  getTaskTypeColor,
  getPeriodColor,
  getPriorityColor,
} from "@/lib/productivity-utils";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Clock,
  Brain,
  FileText,
  Zap,
  CheckCircle2,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  showPeriod?: boolean;
}

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  showPeriod = true,
}: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleToggleComplete = async () => {
    setIsCompleting(true);
    // Add a small delay for animation
    setTimeout(() => {
      onToggleComplete(task.id);
      setIsCompleting(false);
    }, 300);
  };

  const getTaskIcon = () => {
    switch (task.type) {
      case "brain":
        return <Brain className="h-4 w-4" />;
      case "admin":
        return <FileText className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
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
    <Card
      className={cn(
        "group transition-all duration-300 hover:shadow-md",
        task.completed && "opacity-70 bg-muted/50",
        isCompleting && "animate-celebration",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggleComplete}
              className={cn(
                "transition-all duration-200",
                task.completed && "data-[state=checked]:bg-success",
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getPriorityEmoji()}</span>
                <div className={cn("p-1 rounded", getTaskTypeColor(task.type))}>
                  {getTaskIcon()}
                </div>
                {showPeriod && (
                  <Badge
                    variant="outline"
                    className={getPeriodColor(task.period)}
                  >
                    {task.period}
                  </Badge>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(task.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1">
              <h3
                className={cn(
                  "font-medium text-sm leading-5",
                  task.completed && "line-through text-muted-foreground",
                )}
              >
                {task.title}
              </h3>

              {task.description && (
                <p
                  className={cn(
                    "text-xs text-muted-foreground line-clamp-2",
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
                  {task.pomodoroSessions && (
                    <div className="flex items-center space-x-1">
                      <span>🍅</span>
                      <span>{task.pomodoroSessions}</span>
                    </div>
                  )}
                </div>

                {task.completed && (
                  <div className="flex items-center space-x-1 text-success">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="text-xs font-medium">Done!</span>
                  </div>
                )}
              </div>

              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs px-2 py-0"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
