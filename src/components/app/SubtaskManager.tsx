import { useState } from "react";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  GripVertical,
  Trash2,
  Edit,
  CheckCircle2,
  Circle,
  Clock,
  Target,
} from "lucide-react";

interface SubtaskManagerProps {
  parentTask: Task;
  subtasks: Task[];
  onCreateSubtask: (
    parentId: string,
    subtaskData: Partial<Task>,
  ) => Promise<void>;
  onUpdateSubtask: (subtaskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteSubtask: (subtaskId: string) => Promise<void>;
  onToggleSubtask: (subtaskId: string) => Promise<void>;
  onReorderSubtasks: (parentId: string, subtaskIds: string[]) => Promise<void>;
  depth?: number;
  maxDepth?: number;
  className?: string;
}

export function SubtaskManager({
  parentTask,
  subtasks,
  onCreateSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onToggleSubtask,
  onReorderSubtasks,
  depth = 0,
  maxDepth = 3,
  className,
}: SubtaskManagerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Calculate progress
  const completedSubtasks = subtasks.filter(
    (subtask) => subtask.completed,
  ).length;
  const totalSubtasks = subtasks.length;
  const progressPercentage =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleCreateSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    const subtaskData: Partial<Task> = {
      title: newSubtaskTitle,
      parentTaskId: parentTask.id,
      type: parentTask.type,
      period: parentTask.period,
      priority: "medium",
      depth: depth + 1,
      isSubtask: true,
      status: "todo",
      completed: false,
      tags: [],
      contextTags: [],
    };

    await onCreateSubtask(parentTask.id, subtaskData);
    setNewSubtaskTitle("");
    setIsAddingSubtask(false);
  };

  const handleEditSubtask = async (subtaskId: string) => {
    if (!editingTitle.trim()) return;

    await onUpdateSubtask(subtaskId, {
      title: editingTitle,
      updatedAt: new Date(),
    });

    setEditingSubtaskId(null);
    setEditingTitle("");
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    } else if (e.key === "Escape") {
      setIsAddingSubtask(false);
      setEditingSubtaskId(null);
      setNewSubtaskTitle("");
      setEditingTitle("");
    }
  };

  const getIndentLevel = () => {
    return Math.min(depth * 20, 60); // Max indent of 60px
  };

  const getSubtasksByParent = (parentId: string) => {
    return subtasks.filter((subtask) => subtask.parentTaskId === parentId);
  };

  if (totalSubtasks === 0 && !isAddingSubtask) return null;

  return (
    <div
      className={cn("mt-3", className)}
      style={{ marginLeft: `${getIndentLevel()}px` }}
    >
      {/* Subtasks Header with Progress */}
      {totalSubtasks > 0 && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="flex items-center justify-between mb-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-1">
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <span className="ml-1 text-xs text-muted-foreground">
                  Subtasks ({completedSubtasks}/{totalSubtasks})
                </span>
              </Button>
            </CollapsibleTrigger>

            <div className="flex items-center space-x-2">
              {totalSubtasks > 0 && (
                <div className="flex items-center space-x-1">
                  <Progress value={progressPercentage} className="w-16 h-1" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              )}

              {depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsAddingSubtask(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <CollapsibleContent className="space-y-1">
            {/* Existing Subtasks */}
            {subtasks.map((subtask, index) => (
              <SubtaskItem
                key={subtask.id}
                subtask={subtask}
                index={index}
                onToggle={() => onToggleSubtask(subtask.id)}
                onUpdate={onUpdateSubtask}
                onDelete={onDeleteSubtask}
                onStartEdit={(title) => {
                  setEditingSubtaskId(subtask.id);
                  setEditingTitle(title);
                }}
                isEditing={editingSubtaskId === subtask.id}
                editingTitle={editingTitle}
                onEditingTitleChange={setEditingTitle}
                onSaveEdit={() => handleEditSubtask(subtask.id)}
                onCancelEdit={() => {
                  setEditingSubtaskId(null);
                  setEditingTitle("");
                }}
                depth={depth + 1}
              />
            ))}

            {/* Nested Subtasks */}
            {subtasks.map((subtask) => {
              const nestedSubtasks = getSubtasksByParent(subtask.id);
              if (nestedSubtasks.length === 0) return null;

              return (
                <SubtaskManager
                  key={`nested-${subtask.id}`}
                  parentTask={subtask}
                  subtasks={nestedSubtasks}
                  onCreateSubtask={onCreateSubtask}
                  onUpdateSubtask={onUpdateSubtask}
                  onDeleteSubtask={onDeleteSubtask}
                  onToggleSubtask={onToggleSubtask}
                  onReorderSubtasks={onReorderSubtasks}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Add Subtask Input */}
      {isAddingSubtask && (
        <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-md">
          <Circle className="h-4 w-4 text-muted-foreground" />
          <Input
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, handleCreateSubtask)}
            placeholder="Add subtask..."
            className="h-7 text-sm"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleCreateSubtask}
            disabled={!newSubtaskTitle.trim()}
          >
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAddingSubtask(false);
              setNewSubtaskTitle("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Quick Add Button for Empty State */}
      {totalSubtasks === 0 && !isAddingSubtask && depth < maxDepth && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAddingSubtask(true)}
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add subtask
        </Button>
      )}
    </div>
  );
}

interface SubtaskItemProps {
  subtask: Task;
  index: number;
  onToggle: () => void;
  onUpdate: (subtaskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (subtaskId: string) => Promise<void>;
  onStartEdit: (title: string) => void;
  isEditing: boolean;
  editingTitle: string;
  onEditingTitleChange: (title: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  depth: number;
}

function SubtaskItem({
  subtask,
  index,
  onToggle,
  onUpdate,
  onDelete,
  onStartEdit,
  isEditing,
  editingTitle,
  onEditingTitleChange,
  onSaveEdit,
  onCancelEdit,
  depth,
}: SubtaskItemProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSaveEdit();
    } else if (e.key === "Escape") {
      onCancelEdit();
    }
  };

  const handleQuickAction = async (action: string) => {
    switch (action) {
      case "high-priority":
        await onUpdate(subtask.id, { priority: "high", updatedAt: new Date() });
        break;
      case "add-estimate":
        await onUpdate(subtask.id, { timeEstimate: 30, updatedAt: new Date() });
        break;
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center space-x-2 p-2 rounded-md hover:bg-muted/30 transition-colors",
        subtask.completed && "opacity-70",
      )}
    >
      {/* Drag Handle */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab" />
      </div>

      {/* Checkbox */}
      <Checkbox
        checked={subtask.completed}
        onCheckedChange={onToggle}
        className="h-4 w-4"
      />

      {/* Title */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editingTitle}
            onChange={(e) => onEditingTitleChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={onSaveEdit}
            className="h-6 text-sm"
            autoFocus
          />
        ) : (
          <span
            className={cn(
              "text-sm cursor-pointer",
              subtask.completed && "line-through text-muted-foreground",
            )}
            onClick={() => onStartEdit(subtask.title)}
          >
            {subtask.title}
          </span>
        )}
      </div>

      {/* Priority Badge */}
      {subtask.priority === "high" && (
        <Badge variant="destructive" className="h-4 text-xs px-1">
          🔥
        </Badge>
      )}

      {/* Time Estimate */}
      {subtask.timeEstimate && (
        <Badge variant="outline" className="h-4 text-xs px-1">
          <Clock className="h-2 w-2 mr-1" />
          {subtask.timeEstimate}m
        </Badge>
      )}

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onStartEdit(subtask.title)}>
              <Edit className="h-3 w-3 mr-2" />
              Edit
            </DropdownMenuItem>

            {subtask.priority !== "high" && (
              <DropdownMenuItem
                onClick={() => handleQuickAction("high-priority")}
              >
                <Target className="h-3 w-3 mr-2 text-red-600" />
                Make High Priority
              </DropdownMenuItem>
            )}

            {!subtask.timeEstimate && (
              <DropdownMenuItem
                onClick={() => handleQuickAction("add-estimate")}
              >
                <Clock className="h-3 w-3 mr-2 text-blue-600" />
                Add Time Estimate
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => onDelete(subtask.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
