import { useState, useMemo } from "react";
import { Task } from "@/types";

export interface TaskFilters {
  search: string;
  type: "all" | "brain" | "admin";
  period: "all" | "morning" | "afternoon" | "laterbird";
  priority: "all" | "low" | "medium" | "high";
  status: "all" | "completed" | "pending" | "overdue";
  tags: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  sortBy: "created" | "priority" | "title" | "updated" | "timeBlock";
  sortOrder: "asc" | "desc";
}

export function useTaskFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    type: "all",
    period: "all",
    priority: "all",
    status: "all",
    tags: [],
    dateRange: {},
    sortBy: "created",
    sortOrder: "desc",
  });

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
      );
    }

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter((task) => task.type === filters.type);
    }

    // Period filter
    if (filters.period !== "all") {
      if (filters.period === "laterbird") {
        // This would need to be handled differently based on how laterbird tasks are stored
        // For now, we'll assume they have a special tag or field
      } else {
        filtered = filtered.filter((task) => task.period === filters.period);
      }
    }

    // Priority filter
    if (filters.priority !== "all") {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    // Status filter
    if (filters.status !== "all") {
      if (filters.status === "completed") {
        filtered = filtered.filter((task) => task.completed);
      } else if (filters.status === "pending") {
        filtered = filtered.filter((task) => !task.completed);
      } else if (filters.status === "overdue") {
        // Define overdue logic based on your requirements
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(
          (task) =>
            !task.completed && task.createdAt < today && !task.completedAt,
        );
      }
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter((task) =>
        filters.tags.some((filterTag) =>
          task.tags?.some((taskTag) => taskTag === filterTag),
        ),
      );
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter((task) => {
        const taskDate = task.createdAt;
        if (filters.dateRange.from && taskDate < filters.dateRange.from) {
          return false;
        }
        if (filters.dateRange.to && taskDate > filters.dateRange.to) {
          return false;
        }
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "priority":
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "created":
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case "updated":
          const aUpdated = a.completedAt || a.createdAt;
          const bUpdated = b.completedAt || b.createdAt;
          comparison = aUpdated.getTime() - bUpdated.getTime();
          break;
        case "timeBlock":
          comparison = (a.timeBlock || 0) - (b.timeBlock || 0);
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [tasks, filters]);

  const updateFilter = <K extends keyof TaskFilters>(
    key: K,
    value: TaskFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      type: "all",
      period: "all",
      priority: "all",
      status: "all",
      tags: [],
      dateRange: {},
      sortBy: "created",
      sortOrder: "desc",
    });
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type !== "all") count++;
    if (filters.period !== "all") count++;
    if (filters.priority !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.tags.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    return count;
  };

  return {
    filters,
    filteredTasks,
    updateFilter,
    resetFilters,
    getFilterCount,
  };
}
