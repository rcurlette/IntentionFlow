import { useState } from "react";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  X,
  Trash2,
  Tag,
  Calendar,
  MoreHorizontal,
  Copy,
  Archive,
  Download,
  FileText,
} from "lucide-react";

interface TaskBulkOperationsProps {
  selectedTasks: Task[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkComplete: (taskIds: string[]) => void;
  onBulkDelete: (taskIds: string[]) => void;
  onBulkUpdatePeriod: (
    taskIds: string[],
    period: "morning" | "afternoon",
  ) => void;
  onBulkUpdatePriority: (taskIds: string[], priority: Task["priority"]) => void;
  onBulkAddTags: (taskIds: string[], tags: string[]) => void;
  onBulkDuplicate: (taskIds: string[]) => void;
  totalTaskCount: number;
}

export function TaskBulkOperations({
  selectedTasks,
  onSelectAll,
  onDeselectAll,
  onBulkComplete,
  onBulkDelete,
  onBulkUpdatePeriod,
  onBulkUpdatePriority,
  onBulkAddTags,
  onBulkDuplicate,
  totalTaskCount,
}: TaskBulkOperationsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newTags, setNewTags] = useState("");

  const selectedIds = selectedTasks.map((task) => task.id);
  const hasSelection = selectedTasks.length > 0;
  const allSelected =
    selectedTasks.length === totalTaskCount && totalTaskCount > 0;
  const completedCount = selectedTasks.filter((task) => task.completed).length;
  const pendingCount = selectedTasks.length - completedCount;

  const handleBulkAddTags = () => {
    if (newTags.trim() && hasSelection) {
      const tags = newTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      onBulkAddTags(selectedIds, tags);
      setNewTags("");
    }
  };

  const handleExportTasks = () => {
    const dataStr = JSON.stringify(selectedTasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tasks-export-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!hasSelection) {
    return (
      <div className="flex items-center justify-between p-4 border-b bg-muted/20">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={allSelected}
            onCheckedChange={allSelected ? onDeselectAll : onSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            Select tasks for bulk operations
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          {totalTaskCount} total tasks
        </Badge>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b bg-primary/5 border-primary/20">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={allSelected}
            onCheckedChange={allSelected ? onDeselectAll : onSelectAll}
          />
          <div className="flex items-center space-x-2">
            <Badge className="bg-primary text-primary-foreground">
              {selectedTasks.length} selected
            </Badge>
            {pendingCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {pendingCount} pending
              </Badge>
            )}
            {completedCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {completedCount} completed
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Actions */}
          {pendingCount > 0 && (
            <Button
              size="sm"
              onClick={() => onBulkComplete(selectedIds)}
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete {pendingCount}
            </Button>
          )}

          {/* Bulk Operations Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Period Updates */}
              <DropdownMenuItem
                onClick={() => onBulkUpdatePeriod(selectedIds, "morning")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Move to Morning
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onBulkUpdatePeriod(selectedIds, "afternoon")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Move to Afternoon
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Priority Updates */}
              <DropdownMenuItem
                onClick={() => onBulkUpdatePriority(selectedIds, "high")}
              >
                🔥 Set High Priority
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onBulkUpdatePriority(selectedIds, "medium")}
              >
                ⚡ Set Medium Priority
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onBulkUpdatePriority(selectedIds, "low")}
              >
                🌱 Set Low Priority
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Other Actions */}
              <DropdownMenuItem onClick={() => onBulkDuplicate(selectedIds)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportTasks}>
                <Download className="h-4 w-4 mr-2" />
                Export to JSON
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Selection */}
          <Button variant="ghost" size="sm" onClick={onDeselectAll}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Tag Addition */}
      <div className="px-4 py-3 bg-muted/10 border-b">
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="bulk-tags" className="text-sm">
            Add tags to selected tasks:
          </Label>
          <Input
            id="bulk-tags"
            placeholder="tag1, tag2, tag3..."
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            className="max-w-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleBulkAddTags();
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleBulkAddTags}
            disabled={!newTags.trim()}
          >
            Add Tags
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Tasks</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTasks.length} selected
              task(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onBulkDelete(selectedIds);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedTasks.length} Task(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
