import { supabase } from "../supabase";
import { Task } from "../../types";

export async function createTask(
  taskData: Omit<Task, "id" | "createdAt" | "updatedAt">,
): Promise<Task> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: taskData.title,
      description: taskData.description,
      type: taskData.type,
      period: taskData.period,
      status: taskData.status || "todo",
      priority: taskData.priority,
      completed: taskData.completed || false,
      time_block: taskData.timeBlock,
      time_estimate: taskData.timeEstimate,
      time_spent: taskData.timeSpent,
      pomodoro_count: taskData.pomodoroCount,
      tags: taskData.tags,
      context_tags: taskData.contextTags,
      scheduled_for: taskData.scheduledFor,
      due_date: taskData.dueDate?.toISOString(),
      due_time: taskData.dueTime,
      started_at: taskData.startedAt?.toISOString(),
      completed_at: taskData.completedAt?.toISOString(),
      parent_task_id: taskData.parentTaskId,
      subtask_ids: taskData.subtaskIds,
      depth: taskData.depth,
      is_subtask: taskData.isSubtask,
      sort_order: taskData.sortOrder,
      project_id: taskData.projectId,
      energy: taskData.energy,
      focus: taskData.focus,
      delegated_to: taskData.delegatedTo,
      waiting_for: taskData.waitingFor,
    })
    .select()
    .single();

  if (error) throw error;
  return mapTaskFromDatabase(data);
}

export async function getAllTasks(): Promise<Task[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(mapTaskFromDatabase);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }
  return mapTaskFromDatabase(data);
}

export async function updateTask(
  id: string,
  updates: Partial<Task>,
): Promise<Task> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: updates.title,
      description: updates.description,
      type: updates.type,
      period: updates.period,
      status: updates.status,
      priority: updates.priority,
      completed: updates.completed,
      time_block: updates.timeBlock,
      time_estimate: updates.timeEstimate,
      time_spent: updates.timeSpent,
      pomodoro_count: updates.pomodoroCount,
      tags: updates.tags,
      context_tags: updates.contextTags,
      scheduled_for: updates.scheduledFor,
      due_date: updates.dueDate?.toISOString(),
      due_time: updates.dueTime,
      started_at: updates.startedAt?.toISOString(),
      completed_at: updates.completedAt?.toISOString(),
      parent_task_id: updates.parentTaskId,
      subtask_ids: updates.subtaskIds,
      depth: updates.depth,
      is_subtask: updates.isSubtask,
      sort_order: updates.sortOrder,
      project_id: updates.projectId,
      energy: updates.energy,
      focus: updates.focus,
      delegated_to: updates.delegatedTo,
      waiting_for: updates.waitingFor,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return mapTaskFromDatabase(data);
}

export async function deleteTask(id: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("scheduled_for", date)
    .order("due_time", { ascending: true });

  if (error) throw error;
  return data.map(mapTaskFromDatabase);
}

export async function getSubtasks(parentTaskId: string): Promise<Task[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("parent_task_id", parentTaskId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data.map(mapTaskFromDatabase);
}

// Helper function to map database row to Task interface
function mapTaskFromDatabase(data: any): Task {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    type: data.type,
    period: data.period,
    status: data.status,
    priority: data.priority,
    completed: data.completed,
    timeBlock: data.time_block,
    timeEstimate: data.time_estimate,
    timeSpent: data.time_spent,
    pomodoroCount: data.pomodoro_count,
    tags: data.tags || [],
    contextTags: data.context_tags || [],
    scheduledFor: data.scheduled_for,
    dueDate: data.due_date ? new Date(data.due_date) : undefined,
    dueTime: data.due_time,
    startedAt: data.started_at ? new Date(data.started_at) : undefined,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    parentTaskId: data.parent_task_id,
    subtaskIds: data.subtask_ids || [],
    depth: data.depth,
    isSubtask: data.is_subtask,
    sortOrder: data.sort_order,
    projectId: data.project_id,
    energy: data.energy,
    focus: data.focus,
    delegatedTo: data.delegated_to,
    waitingFor: data.waiting_for,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    subtasks: [], // Will be populated by separate calls if needed
  };
}
