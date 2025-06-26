import { Task } from "@/types";

export interface ExportOptions {
  format: "json" | "csv" | "markdown" | "txt";
  includeCompleted: boolean;
  includePending: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export function exportTasks(tasks: Task[], options: ExportOptions): string {
  let filteredTasks = tasks;

  // Filter by completion status
  if (!options.includeCompleted) {
    filteredTasks = filteredTasks.filter((task) => !task.completed);
  }
  if (!options.includePending) {
    filteredTasks = filteredTasks.filter((task) => task.completed);
  }

  // Filter by date range
  if (options.dateRange) {
    filteredTasks = filteredTasks.filter((task) => {
      const taskDate = task.createdAt;
      return (
        (!options.dateRange!.from || taskDate >= options.dateRange!.from) &&
        (!options.dateRange!.to || taskDate <= options.dateRange!.to)
      );
    });
  }

  switch (options.format) {
    case "json":
      return exportAsJSON(filteredTasks);
    case "csv":
      return exportAsCSV(filteredTasks);
    case "markdown":
      return exportAsMarkdown(filteredTasks);
    case "txt":
      return exportAsText(filteredTasks);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

function exportAsJSON(tasks: Task[]): string {
  return JSON.stringify(tasks, null, 2);
}

function exportAsCSV(tasks: Task[]): string {
  const headers = [
    "Title",
    "Description",
    "Type",
    "Period",
    "Priority",
    "Completed",
    "Time Block (min)",
    "Tags",
    "Created At",
    "Completed At",
  ];

  const rows = tasks.map((task) => [
    `"${task.title.replace(/"/g, '""')}"`,
    `"${(task.description || "").replace(/"/g, '""')}"`,
    task.type,
    task.period,
    task.priority,
    task.completed ? "Yes" : "No",
    task.timeBlock || "",
    `"${(task.tags || []).join(", ")}"`,
    task.createdAt.toISOString(),
    task.completedAt?.toISOString() || "",
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

function exportAsMarkdown(tasks: Task[]): string {
  const title = `# Task Export\n\nGenerated on ${new Date().toLocaleDateString()}\n\n`;

  const morningTasks = tasks.filter((task) => task.period === "morning");
  const afternoonTasks = tasks.filter((task) => task.period === "afternoon");

  let markdown = title;

  if (morningTasks.length > 0) {
    markdown += "## 🌅 Morning Tasks\n\n";
    morningTasks.forEach((task) => {
      const checkbox = task.completed ? "- [x]" : "- [ ]";
      const typeIcon = task.type === "brain" ? "🧠" : "📋";
      const priorityIcon =
        task.priority === "high"
          ? "🔥"
          : task.priority === "medium"
            ? "⚡"
            : "🌱";

      markdown += `${checkbox} ${typeIcon} ${priorityIcon} **${task.title}**`;

      if (task.timeBlock) {
        markdown += ` _(${task.timeBlock}m)_`;
      }

      markdown += "\n";

      if (task.description) {
        markdown += `  > ${task.description}\n`;
      }

      if (task.tags && task.tags.length > 0) {
        markdown += `  > Tags: ${task.tags.map((tag) => `#${tag}`).join(", ")}\n`;
      }

      markdown += "\n";
    });
  }

  if (afternoonTasks.length > 0) {
    markdown += "## 🌆 Afternoon Tasks\n\n";
    afternoonTasks.forEach((task) => {
      const checkbox = task.completed ? "- [x]" : "- [ ]";
      const typeIcon = task.type === "brain" ? "🧠" : "📋";
      const priorityIcon =
        task.priority === "high"
          ? "🔥"
          : task.priority === "medium"
            ? "⚡"
            : "🌱";

      markdown += `${checkbox} ${typeIcon} ${priorityIcon} **${task.title}**`;

      if (task.timeBlock) {
        markdown += ` _(${task.timeBlock}m)_`;
      }

      markdown += "\n";

      if (task.description) {
        markdown += `  > ${task.description}\n`;
      }

      if (task.tags && task.tags.length > 0) {
        markdown += `  > Tags: ${task.tags.map((tag) => `#${tag}`).join(", ")}\n`;
      }

      markdown += "\n";
    });
  }

  return markdown;
}

function exportAsText(tasks: Task[]): string {
  const title = `TASK EXPORT\nGenerated on ${new Date().toLocaleDateString()}\n${"=".repeat(50)}\n\n`;

  const morningTasks = tasks.filter((task) => task.period === "morning");
  const afternoonTasks = tasks.filter((task) => task.period === "afternoon");

  let text = title;

  if (morningTasks.length > 0) {
    text += "MORNING TASKS\n" + "-".repeat(20) + "\n\n";
    morningTasks.forEach((task, index) => {
      text += `${index + 1}. ${task.completed ? "[DONE]" : "[    ]"} ${task.title}\n`;
      text += `   Type: ${task.type.toUpperCase()} | Priority: ${task.priority.toUpperCase()}`;

      if (task.timeBlock) {
        text += ` | Time: ${task.timeBlock}m`;
      }

      text += "\n";

      if (task.description) {
        text += `   Description: ${task.description}\n`;
      }

      if (task.tags && task.tags.length > 0) {
        text += `   Tags: ${task.tags.join(", ")}\n`;
      }

      text += "\n";
    });
  }

  if (afternoonTasks.length > 0) {
    text += "AFTERNOON TASKS\n" + "-".repeat(20) + "\n\n";
    afternoonTasks.forEach((task, index) => {
      text += `${index + 1}. ${task.completed ? "[DONE]" : "[    ]"} ${task.title}\n`;
      text += `   Type: ${task.type.toUpperCase()} | Priority: ${task.priority.toUpperCase()}`;

      if (task.timeBlock) {
        text += ` | Time: ${task.timeBlock}m`;
      }

      text += "\n";

      if (task.description) {
        text += `   Description: ${task.description}\n`;
      }

      if (task.tags && task.tags.length > 0) {
        text += `   Tags: ${task.tags.join(", ")}\n`;
      }

      text += "\n";
    });
  }

  return text;
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getExportFilename(format: string): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `flowtracker-tasks-${timestamp}.${format}`;
}
