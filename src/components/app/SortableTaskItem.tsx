import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types";
import { EnhancedTaskItem } from "./EnhancedTaskItem";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface SortableTaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStartPomodoro?: (task: Task) => void;
  disabled?: boolean;
  className?: string;
}

export function SortableTaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartPomodoro,
  disabled = false,
  className,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative",
        isDragging && "z-50 opacity-50",
        disabled && "cursor-default",
        className,
      )}
    >
      {/* Drag Handle */}
      {!disabled && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-1 top-1/2 transform -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Task Item */}
      <div className={cn(!disabled && "pl-8")}>
        <EnhancedTaskItem
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onStartPomodoro={onStartPomodoro}
          className={cn(
            "transition-all duration-200",
            isDragging && "border-primary shadow-lg bg-background",
          )}
        />
      </div>
    </div>
  );
}
