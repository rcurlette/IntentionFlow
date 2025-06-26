import { useState, useEffect } from "react";
import { Task } from "@/types";
import { getTodayPlan } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getTaskTypeColor, getPeriodColor } from "@/lib/productivity-utils";
import {
  Link,
  Unlink,
  Target,
  Brain,
  FileText,
  Clock,
  CheckCircle2,
  Plus,
} from "lucide-react";

interface TaskLinkerProps {
  linkedTask: Task | null;
  onLinkTask: (taskId: string) => void;
  onUnlinkTask: () => void;
  disabled?: boolean;
}

export function TaskLinker({
  linkedTask,
  onLinkTask,
  onUnlinkTask,
  disabled = false,
}: TaskLinkerProps) {
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const todayPlan = await getTodayPlan();
        const incompleteTasks = [
          ...todayPlan.morningTasks,
          ...todayPlan.afternoonTasks,
        ].filter((task) => {
          // Handle both old and new task formats
          if (task.status) {
            return task.status !== "completed";
          }
          // Fallback to completed field for backward compatibility
          return !task.completed;
        });

        setAvailableTasks(incompleteTasks);
      } catch (error) {
        console.error("Error loading tasks for linker:", error);
      }
    };

    loadTasks();
  }, []);

  const handleLinkTask = () => {
    if (selectedTaskId) {
      onLinkTask(selectedTaskId);
      setSelectedTaskId("");
    }
  };

  const getTaskIcon = (type: Task["type"]) => {
    return type === "brain" ? (
      <Brain className="h-4 w-4" />
    ) : (
      <FileText className="h-4 w-4" />
    );
  };

  const formatTaskForSelect = (task: Task) => {
    const truncatedTitle =
      task.title.length > 30 ? `${task.title.slice(0, 30)}...` : task.title;
    return `${task.type === "brain" ? "🧠" : "📋"} ${truncatedTitle}`;
  };

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Link className="h-4 w-4" />
          <span>Link to Task</span>
          {linkedTask && (
            <Badge
              variant="outline"
              className="ml-auto bg-success text-success-foreground"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Linked
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {linkedTask ? (
          /* Linked Task Display */
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-background rounded-lg border">
              <div
                className={cn("p-1 rounded", getTaskTypeColor(linkedTask.type))}
              >
                {getTaskIcon(linkedTask.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-sm truncate">
                    {linkedTask.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={getPeriodColor(linkedTask.period)}
                  >
                    {linkedTask.period}
                  </Badge>
                </div>
                {linkedTask.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {linkedTask.description}
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                  {linkedTask.timeBlock && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{linkedTask.timeBlock}m</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Target className="h-3 w-3" />
                    <span>{linkedTask.priority} priority</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onUnlinkTask}
                disabled={disabled}
                className="text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/40"
              >
                <Unlink className="h-4 w-4 mr-2" />
                Unlink Task
              </Button>
            </div>

            <div className="bg-focus/10 rounded-lg p-3">
              <div className="text-xs text-muted-foreground text-center">
                💡 This Pomodoro session will be tracked for{" "}
                <span className="font-medium">{linkedTask.title}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Task Selection */
          <div className="space-y-4">
            {availableTasks.length > 0 ? (
              <>
                <div className="space-y-2">
                  <Select
                    value={selectedTaskId}
                    onValueChange={setSelectedTaskId}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a task to focus on..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {formatTaskForSelect(task)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleLinkTask}
                    disabled={!selectedTaskId || disabled}
                    size="sm"
                    className="w-full"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Link Selected Task
                  </Button>
                </div>

                <div className="text-center text-xs text-muted-foreground">
                  <p>Link a task to track your progress and stay focused</p>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground mb-3">
                  No incomplete tasks available
                </p>
                <p className="text-xs text-muted-foreground">
                  Add some tasks in your Dashboard to link them to Pomodoro
                  sessions
                </p>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground text-center">
                ⚡ Linking tasks helps track time spent and provides better
                analytics
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
