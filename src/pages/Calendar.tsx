import { useState, useEffect } from "react";
import { Task } from "@/types";
import { getAllTasks, addTask, updateTask, deleteTask } from "@/lib/storage";
import { CalendarView } from "@/components/app/CalendarView";
import { Navigation } from "@/components/app/Navigation";
import { generateId } from "@/lib/productivity-utils";

export default function Calendar() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all tasks
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const allTasks = await getAllTasks();
        setTasks(allTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  const handleCreateTask = async (
    taskData: Partial<Task> & { scheduledFor: string; dueTime?: string },
  ) => {
    try {
      const newTask = {
        ...taskData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: taskData.tags || [],
        contextTags: taskData.contextTags || [],
      };

      await addTask(newTask);

      // Update local state
      setTasks((prev) => [...prev, newTask as Task]);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, {
        ...updates,
        updatedAt: new Date(),
      });

      // Update local state
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: new Date() }
            : task,
        ),
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);

      // Update local state
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditTask = (task: Task) => {
    // For now, we'll implement a simple prompt-based edit
    // In a real app, you'd open a proper edit modal
    const newTitle = window.prompt("Edit task title:", task.title);
    if (newTitle && newTitle !== task.title) {
      handleUpdateTask(task.id, { title: newTitle });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20 pb-8 px-4 container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading calendar...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16 h-screen">
        <CalendarView
          tasks={tasks}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
          className="h-full"
        />
      </main>
    </div>
  );
}
