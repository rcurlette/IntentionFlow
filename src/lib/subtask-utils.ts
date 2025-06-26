import { Task } from "@/types";

export interface SubtaskStats {
  totalSubtasks: number;
  completedSubtasks: number;
  progressPercentage: number;
  estimatedTimeRemaining: number;
  totalTimeSpent: number;
}

export class SubtaskManager {
  /**
   * Get all subtasks for a given parent task
   */
  static getSubtasks(parentTaskId: string, allTasks: Task[]): Task[] {
    return allTasks
      .filter((task) => task.parentTaskId === parentTaskId)
      .sort((a, b) => {
        // Sort by sortOrder first, then by creation date
        if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
          return a.sortOrder - b.sortOrder;
        }
        if (a.sortOrder !== undefined) return -1;
        if (b.sortOrder !== undefined) return 1;
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
  }

  /**
   * Get nested subtasks (subtasks of subtasks)
   */
  static getNestedSubtasks(
    parentTaskId: string,
    allTasks: Task[],
    maxDepth = 3,
  ): Task[] {
    const result: Task[] = [];
    const visited = new Set<string>();

    const collectSubtasks = (taskId: string, currentDepth: number) => {
      if (currentDepth >= maxDepth || visited.has(taskId)) return;
      visited.add(taskId);

      const directSubtasks = this.getSubtasks(taskId, allTasks);
      result.push(...directSubtasks);

      directSubtasks.forEach((subtask) => {
        collectSubtasks(subtask.id, currentDepth + 1);
      });
    };

    collectSubtasks(parentTaskId, 0);
    return result;
  }

  /**
   * Calculate subtask statistics for a parent task
   */
  static calculateStats(parentTaskId: string, allTasks: Task[]): SubtaskStats {
    const subtasks = this.getNestedSubtasks(parentTaskId, allTasks);
    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter((task) => task.completed).length;
    const progressPercentage =
      totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    const estimatedTimeRemaining = subtasks
      .filter((task) => !task.completed)
      .reduce((sum, task) => sum + (task.timeEstimate || 0), 0);

    const totalTimeSpent = subtasks.reduce(
      (sum, task) => sum + (task.timeSpent || 0),
      0,
    );

    return {
      totalSubtasks,
      completedSubtasks,
      progressPercentage,
      estimatedTimeRemaining,
      totalTimeSpent,
    };
  }

  /**
   * Create a new subtask
   */
  static createSubtask(
    parentTask: Task,
    subtaskData: Partial<Task>,
    allTasks: Task[],
  ): Task {
    const parentDepth = parentTask.depth || 0;
    const existingSubtasks = this.getSubtasks(parentTask.id, allTasks);
    const maxSortOrder = Math.max(
      0,
      ...existingSubtasks.map((st) => st.sortOrder || 0),
    );

    const subtask: Task = {
      id: crypto.randomUUID(),
      title: subtaskData.title || "New subtask",
      description: subtaskData.description || "",
      type: subtaskData.type || parentTask.type,
      period: subtaskData.period || parentTask.period,
      status: "todo",
      completed: false,
      priority: subtaskData.priority || "medium",
      tags: subtaskData.tags || [],
      contextTags: subtaskData.contextTags || [],

      // Subtask specific fields
      parentTaskId: parentTask.id,
      depth: parentDepth + 1,
      isSubtask: true,
      sortOrder: maxSortOrder + 1,

      // Time tracking
      timeEstimate: subtaskData.timeEstimate,
      timeSpent: 0,
      pomodoroCount: 0,

      // Dates
      createdAt: new Date(),
      updatedAt: new Date(),
      scheduledFor: subtaskData.scheduledFor || parentTask.scheduledFor,
      dueDate: subtaskData.dueDate || parentTask.dueDate,
      dueTime: subtaskData.dueTime,

      // Enhanced tracking
      energy: subtaskData.energy || parentTask.energy,
      focus: subtaskData.focus || parentTask.focus,

      ...subtaskData,
    };

    return subtask;
  }

  /**
   * Update parent task completion based on subtask completion
   */
  static updateParentCompletion(
    parentTask: Task,
    allTasks: Task[],
  ): Partial<Task> {
    const subtasks = this.getSubtasks(parentTask.id, allTasks);

    if (subtasks.length === 0) {
      return {}; // No changes needed if no subtasks
    }

    const stats = this.calculateStats(parentTask.id, allTasks);
    const allSubtasksCompleted =
      stats.totalSubtasks > 0 &&
      stats.completedSubtasks === stats.totalSubtasks;
    const anySubtaskCompleted = stats.completedSubtasks > 0;

    const updates: Partial<Task> = {
      updatedAt: new Date(),
    };

    // Auto-complete parent if all subtasks are completed
    if (allSubtasksCompleted && !parentTask.completed) {
      updates.status = "completed";
      updates.completed = true;
      updates.completedAt = new Date();
    }
    // Mark as in-progress if any subtask is completed but not all
    else if (anySubtaskCompleted && parentTask.status === "todo") {
      updates.status = "in-progress";
    }
    // Reset to todo if no subtasks are completed
    else if (!anySubtaskCompleted && parentTask.status === "in-progress") {
      updates.status = "todo";
    }

    return updates;
  }

  /**
   * Reorder subtasks within a parent
   */
  static reorderSubtasks(
    parentTaskId: string,
    newSubtaskOrder: string[],
    allTasks: Task[],
  ): Task[] {
    const subtasks = this.getSubtasks(parentTaskId, allTasks);
    const updatedSubtasks: Task[] = [];

    newSubtaskOrder.forEach((subtaskId, index) => {
      const subtask = subtasks.find((st) => st.id === subtaskId);
      if (subtask) {
        updatedSubtasks.push({
          ...subtask,
          sortOrder: index + 1,
          updatedAt: new Date(),
        });
      }
    });

    return updatedSubtasks;
  }

  /**
   * Delete a subtask and all its nested subtasks
   */
  static getSubtasksToDelete(subtaskId: string, allTasks: Task[]): string[] {
    const toDelete: string[] = [subtaskId];
    const visited = new Set<string>();

    const collectNestedIds = (taskId: string) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);

      const childSubtasks = allTasks.filter(
        (task) => task.parentTaskId === taskId,
      );
      childSubtasks.forEach((child) => {
        toDelete.push(child.id);
        collectNestedIds(child.id);
      });
    };

    collectNestedIds(subtaskId);
    return toDelete;
  }

  /**
   * Move a subtask to a different parent
   */
  static moveSubtask(
    subtaskId: string,
    newParentId: string,
    allTasks: Task[],
  ): Partial<Task> {
    const subtask = allTasks.find((task) => task.id === subtaskId);
    const newParent = allTasks.find((task) => task.id === newParentId);

    if (!subtask || !newParent) {
      throw new Error("Subtask or new parent not found");
    }

    const newDepth = (newParent.depth || 0) + 1;
    const newParentSubtasks = this.getSubtasks(newParentId, allTasks);
    const maxSortOrder = Math.max(
      0,
      ...newParentSubtasks.map((st) => st.sortOrder || 0),
    );

    return {
      parentTaskId: newParentId,
      depth: newDepth,
      sortOrder: maxSortOrder + 1,
      type: newParent.type, // Inherit parent's type
      period: newParent.period, // Inherit parent's period
      updatedAt: new Date(),
    };
  }

  /**
   * Get task hierarchy for display
   */
  static getTaskHierarchy(
    rootTaskId: string,
    allTasks: Task[],
    maxDepth = 3,
  ): Task[] {
    const result: Task[] = [];
    const visited = new Set<string>();

    const buildHierarchy = (taskId: string, currentDepth: number) => {
      if (currentDepth >= maxDepth || visited.has(taskId)) return;
      visited.add(taskId);

      const task = allTasks.find((t) => t.id === taskId);
      if (!task) return;

      // Add the task itself if it's not the root or if we want to include root
      if (currentDepth > 0 || task.id === rootTaskId) {
        result.push(task);
      }

      // Add its subtasks
      const subtasks = this.getSubtasks(taskId, allTasks);
      subtasks.forEach((subtask) => {
        result.push(subtask);
        buildHierarchy(subtask.id, currentDepth + 1);
      });
    };

    buildHierarchy(rootTaskId, 0);
    return result;
  }

  /**
   * Calculate aggregate time estimates for parent tasks
   */
  static calculateAggregateEstimate(
    parentTaskId: string,
    allTasks: Task[],
  ): number {
    const subtasks = this.getNestedSubtasks(parentTaskId, allTasks);
    const parentTask = allTasks.find((task) => task.id === parentTaskId);

    const subtaskEstimate = subtasks.reduce(
      (sum, task) => sum + (task.timeEstimate || 0),
      0,
    );
    const parentEstimate = parentTask?.timeEstimate || 0;

    // If parent has an estimate, use the maximum of parent estimate or sum of subtasks
    // If no parent estimate, use sum of subtasks
    return parentEstimate > 0
      ? Math.max(parentEstimate, subtaskEstimate)
      : subtaskEstimate;
  }

  /**
   * Get flattened task list with proper indentation info
   */
  static getFlattenedTasks(tasks: Task[]): Array<Task & { indent: number }> {
    const rootTasks = tasks.filter((task) => !task.parentTaskId);
    const result: Array<Task & { indent: number }> = [];

    const addTaskWithChildren = (task: Task, indent: number) => {
      result.push({ ...task, indent });

      const children = this.getSubtasks(task.id, tasks);
      children.forEach((child) => {
        addTaskWithChildren(child, indent + 1);
      });
    };

    rootTasks.forEach((task) => {
      addTaskWithChildren(task, 0);
    });

    return result;
  }
}

// Export utility functions for easy use
export const {
  getSubtasks,
  getNestedSubtasks,
  calculateStats,
  createSubtask,
  updateParentCompletion,
  reorderSubtasks,
  getSubtasksToDelete,
  moveSubtask,
  getTaskHierarchy,
  calculateAggregateEstimate,
  getFlattenedTasks,
} = SubtaskManager;
