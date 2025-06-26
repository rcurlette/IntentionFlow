import { Task } from "@/types";
import { generateId } from "./productivity-utils";

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: "development" | "admin" | "planning" | "learning" | "custom";
  icon: string;
  tasks: Omit<Task, "id" | "createdAt" | "completed" | "completedAt">[];
}

export const DEFAULT_TEMPLATES: TaskTemplate[] = [
  {
    id: "daily-standup",
    name: "Daily Standup",
    description: "Prepare for daily team meeting",
    category: "admin",
    icon: "👥",
    tasks: [
      {
        title: "Review yesterday's accomplishments",
        description: "Summarize what was completed yesterday",
        type: "admin",
        period: "morning",
        priority: "medium",
        timeBlock: 10,
        tags: ["standup", "review"],
      },
      {
        title: "Identify today's priorities",
        description: "Choose 2-3 main tasks for today",
        type: "brain",
        period: "morning",
        priority: "high",
        timeBlock: 15,
        tags: ["standup", "planning"],
      },
      {
        title: "Note any blockers or challenges",
        description: "Document anything preventing progress",
        type: "admin",
        period: "morning",
        priority: "medium",
        timeBlock: 5,
        tags: ["standup", "blockers"],
      },
    ],
  },
  {
    id: "code-review",
    name: "Code Review Session",
    description: "Comprehensive code review workflow",
    category: "development",
    icon: "🔍",
    tasks: [
      {
        title: "Review pull request requirements",
        description: "Understand the scope and goals of the PR",
        type: "brain",
        period: "morning",
        priority: "high",
        timeBlock: 15,
        tags: ["code-review", "analysis"],
      },
      {
        title: "Check code quality and standards",
        description: "Verify coding standards, patterns, and best practices",
        type: "brain",
        period: "morning",
        priority: "high",
        timeBlock: 30,
        tags: ["code-review", "quality"],
      },
      {
        title: "Test functionality locally",
        description: "Pull branch and test the feature manually",
        type: "brain",
        period: "afternoon",
        priority: "medium",
        timeBlock: 25,
        tags: ["code-review", "testing"],
      },
      {
        title: "Provide constructive feedback",
        description: "Write detailed, helpful review comments",
        type: "admin",
        period: "afternoon",
        priority: "medium",
        timeBlock: 20,
        tags: ["code-review", "feedback"],
      },
    ],
  },
  {
    id: "sprint-planning",
    name: "Sprint Planning",
    description: "Prepare for sprint planning meeting",
    category: "planning",
    icon: "📋",
    tasks: [
      {
        title: "Review product backlog",
        description: "Go through prioritized user stories and requirements",
        type: "brain",
        period: "morning",
        priority: "high",
        timeBlock: 45,
        tags: ["sprint", "backlog", "planning"],
      },
      {
        title: "Estimate story points",
        description: "Assess complexity and effort for each story",
        type: "brain",
        period: "morning",
        priority: "high",
        timeBlock: 30,
        tags: ["sprint", "estimation"],
      },
      {
        title: "Identify dependencies and risks",
        description: "Note any blockers or external dependencies",
        type: "brain",
        period: "afternoon",
        priority: "medium",
        timeBlock: 20,
        tags: ["sprint", "risk-assessment"],
      },
      {
        title: "Prepare questions for PO/SM",
        description: "List clarifications needed during planning",
        type: "admin",
        period: "afternoon",
        priority: "medium",
        timeBlock: 15,
        tags: ["sprint", "questions"],
      },
    ],
  },
  {
    id: "learning-session",
    name: "Learning Session",
    description: "Structured learning and skill development",
    category: "learning",
    icon: "🎓",
    tasks: [
      {
        title: "Set learning objectives",
        description: "Define what you want to learn in this session",
        type: "brain",
        period: "morning",
        priority: "high",
        timeBlock: 10,
        tags: ["learning", "goals"],
      },
      {
        title: "Study core concepts",
        description: "Deep dive into the main topic",
        type: "brain",
        period: "morning",
        priority: "high",
        timeBlock: 45,
        tags: ["learning", "study"],
      },
      {
        title: "Practice with examples",
        description: "Apply what you learned through hands-on practice",
        type: "brain",
        period: "afternoon",
        priority: "high",
        timeBlock: 30,
        tags: ["learning", "practice"],
      },
      {
        title: "Document key takeaways",
        description: "Write notes and key insights for future reference",
        type: "admin",
        period: "afternoon",
        priority: "medium",
        timeBlock: 15,
        tags: ["learning", "documentation"],
      },
    ],
  },
  {
    id: "project-kickoff",
    name: "Project Kickoff",
    description: "Start a new project with proper planning",
    category: "planning",
    icon: "🚀",
    tasks: [
      {
        title: "Define project scope and requirements",
        description: "Document what needs to be built and why",
        type: "brain",
        period: "morning",
        priority: "high",
        timeBlock: 60,
        tags: ["project", "requirements", "scope"],
      },
      {
        title: "Set up development environment",
        description: "Configure tools, repos, and development setup",
        type: "admin",
        period: "morning",
        priority: "high",
        timeBlock: 30,
        tags: ["project", "setup", "environment"],
      },
      {
        title: "Create project timeline",
        description: "Break down work into phases and milestones",
        type: "brain",
        period: "afternoon",
        priority: "medium",
        timeBlock: 45,
        tags: ["project", "timeline", "planning"],
      },
      {
        title: "Identify stakeholders and communication plan",
        description: "List who needs updates and how often",
        type: "admin",
        period: "afternoon",
        priority: "medium",
        timeBlock: 20,
        tags: ["project", "communication", "stakeholders"],
      },
    ],
  },
  {
    id: "email-management",
    name: "Email & Communication",
    description: "Process emails and messages efficiently",
    category: "admin",
    icon: "📧",
    tasks: [
      {
        title: "Inbox zero - quick triage",
        description: "Sort emails into action, archive, or delete",
        type: "admin",
        period: "morning",
        priority: "medium",
        timeBlock: 15,
        tags: ["email", "triage", "inbox"],
      },
      {
        title: "Respond to urgent messages",
        description: "Handle time-sensitive communications first",
        type: "admin",
        period: "morning",
        priority: "high",
        timeBlock: 20,
        tags: ["email", "urgent", "responses"],
      },
      {
        title: "Process remaining emails",
        description: "Work through non-urgent but important emails",
        type: "admin",
        period: "afternoon",
        priority: "medium",
        timeBlock: 25,
        tags: ["email", "processing"],
      },
      {
        title: "Send weekly updates",
        description: "Send status updates to relevant stakeholders",
        type: "admin",
        period: "afternoon",
        priority: "medium",
        timeBlock: 20,
        tags: ["email", "updates", "communication"],
      },
    ],
  },
];

export function getTemplates(): TaskTemplate[] {
  const stored = localStorage.getItem("flowtracker_task_templates");
  if (stored) {
    try {
      const customTemplates = JSON.parse(stored);
      return [...DEFAULT_TEMPLATES, ...customTemplates];
    } catch {
      return DEFAULT_TEMPLATES;
    }
  }
  return DEFAULT_TEMPLATES;
}

export function saveTemplate(template: Omit<TaskTemplate, "id">): TaskTemplate {
  const newTemplate: TaskTemplate = {
    ...template,
    id: generateId(),
  };

  const customTemplates = getCustomTemplates();
  customTemplates.push(newTemplate);
  localStorage.setItem(
    "flowtracker_task_templates",
    JSON.stringify(customTemplates),
  );

  return newTemplate;
}

export function getCustomTemplates(): TaskTemplate[] {
  const stored = localStorage.getItem("flowtracker_task_templates");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function deleteTemplate(templateId: string): void {
  const customTemplates = getCustomTemplates();
  const filtered = customTemplates.filter((t) => t.id !== templateId);
  localStorage.setItem("flowtracker_task_templates", JSON.stringify(filtered));
}

export function createTasksFromTemplate(
  template: TaskTemplate,
  period: "morning" | "afternoon" = "morning",
): Omit<Task, "id" | "createdAt">[] {
  return template.tasks.map((task) => ({
    ...task,
    period: task.period || period,
    completed: false,
  }));
}
