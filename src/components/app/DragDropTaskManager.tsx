import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task } from "@/types";
import { EnhancedTaskItem } from "./EnhancedTaskItem";
import { DroppableTaskSection } from "./DroppableTaskSection";
import { SortableTaskItem } from "./SortableTaskItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TasksEmptyState } from "./TasksEmptyState";
import { cn } from "@/lib/utils";

interface DragDropTaskManagerProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStartPomodoro?: (task: Task) => void;
  onAddTask?: (period: "morning" | "afternoon") => void;
  className?: string;
}

type TaskPeriod = "morning" | "afternoon" | "completed";

export function DragDropTaskManager({
  tasks,
  onUpdateTask,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onStartPomodoro,
  onAddTask,
  className,
}: DragDropTaskManagerProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Set up sensors for different input methods
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms hold to start drag on touch
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Organize tasks by period and completion status
  const morningTasks = tasks.filter(
    (task) => task.period === "morning" && !task.completed,
  );
  const afternoonTasks = tasks.filter(
    (task) => task.period === "afternoon" && !task.completed,
  );
  const completedTasks = tasks.filter((task) => task.completed);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
      setIsDragging(true);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // We can add visual feedback here if needed
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setIsDragging(false);

    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;

    // Handle dropping on different sections
    if (overId === "morning-section") {
      await onUpdateTask(activeTask.id, {
        period: "morning",
        completed: false,
        status: "todo",
      });
    } else if (overId === "afternoon-section") {
      await onUpdateTask(activeTask.id, {
        period: "afternoon",
        completed: false,
        status: "todo",
      });
    } else if (overId === "completed-section") {
      await onUpdateTask(activeTask.id, {
        completed: true,
        status: "completed",
        completedAt: new Date(),
      });
      onToggleComplete(activeTask.id);
    } else {
      // Handle reordering within the same section
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask && activeTask.period === overTask.period) {
        // For now, we'll just update the task to maintain the same period
        // In a full implementation, you might want to handle task ordering
        await onUpdateTask(activeTask.id, { period: activeTask.period });
      }
    }
  };

  const getSectionTitle = (period: TaskPeriod, count: number) => {
    const icons = {
      morning: "🌅",
      afternoon: "🌆",
      completed: "✅",
    };

    const titles = {
      morning: "Morning Tasks",
      afternoon: "Afternoon Tasks",
      completed: "Completed",
    };

    return (
      <div className="flex items-center space-x-2">
        <span>{icons[period]}</span>
        <span>{titles[period]}</span>
        <Badge variant="outline" className="ml-auto">
          {count}
        </Badge>
      </div>
    );
  };

  const getSectionClass = (period: TaskPeriod) => {
    const baseClass =
      "border-2 border-dashed border-transparent rounded-lg transition-all duration-200";
    const hoverClass = isDragging
      ? "border-primary/50 bg-primary/5"
      : "hover:border-border/50";

    switch (period) {
      case "morning":
        return cn(
          baseClass,
          hoverClass,
          "border-morning/20 bg-morning/5",
          isDragging && "hover:border-morning/50 hover:bg-morning/10",
        );
      case "afternoon":
        return cn(
          baseClass,
          hoverClass,
          "border-afternoon/20 bg-afternoon/5",
          isDragging && "hover:border-afternoon/50 hover:bg-afternoon/10",
        );
      case "completed":
        return cn(
          baseClass,
          hoverClass,
          "border-success/20 bg-success/5",
          isDragging && "hover:border-success/50 hover:bg-success/10",
        );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={cn("space-y-6", className)}>
        {/* Task Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Morning Tasks */}
          <DroppableTaskSection
            id="morning-section"
            className={getSectionClass("morning")}
          >
            <Card className="border-2 border-morning/20 bg-morning/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {getSectionTitle("morning", morningTasks.length)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 min-h-[200px]">
                  {morningTasks.length === 0 ? (
                    <TasksEmptyState
                      period="morning"
                      onAddTask={() => onAddTask?.("morning")}
                    />
                  ) : (
                    <SortableContext
                      items={morningTasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {morningTasks.map((task) => (
                        <SortableTaskItem
                          key={task.id}
                          task={task}
                          onToggleComplete={onToggleComplete}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                          onStartPomodoro={onStartPomodoro}
                        />
                      ))}
                    </SortableContext>
                  )}
                </div>
              </CardContent>
            </Card>
          </DroppableTaskSection>

          {/* Afternoon Tasks */}
          <DroppableTaskSection
            id="afternoon-section"
            className={getSectionClass("afternoon")}
          >
            <Card className="border-2 border-afternoon/20 bg-afternoon/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {getSectionTitle("afternoon", afternoonTasks.length)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 min-h-[200px]">
                  {afternoonTasks.length === 0 ? (
                    <TasksEmptyState
                      period="afternoon"
                      onAddTask={() => onAddTask?.("afternoon")}
                    />
                  ) : (
                    <SortableContext
                      items={afternoonTasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {afternoonTasks.map((task) => (
                        <SortableTaskItem
                          key={task.id}
                          task={task}
                          onToggleComplete={onToggleComplete}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                          onStartPomodoro={onStartPomodoro}
                        />
                      ))}
                    </SortableContext>
                  )}
                </div>
              </CardContent>
            </Card>
          </DroppableTaskSection>
        </div>

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <DroppableTaskSection
            id="completed-section"
            className={getSectionClass("completed")}
          >
            <Card className="border-2 border-success/20 bg-success/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {getSectionTitle("completed", completedTasks.length)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <SortableContext
                    items={completedTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {completedTasks.slice(0, 5).map((task) => (
                      <SortableTaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={onToggleComplete}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onStartPomodoro={onStartPomodoro}
                        disabled // Prevent dragging completed tasks for now
                      />
                    ))}
                  </SortableContext>
                  {completedTasks.length > 5 && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      And {completedTasks.length - 5} more completed tasks...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </DroppableTaskSection>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="transform rotate-2 opacity-90 shadow-lg">
            <EnhancedTaskItem
              task={activeTask}
              onToggleComplete={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
              className="bg-background border border-primary"
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
