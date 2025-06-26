import { Task } from "@/types";
import { getDayPlans } from "./storage";

export interface SmartSuggestions {
  suggestedType: "brain" | "admin";
  confidence: number;
  suggestedTags: string[];
  suggestedTimeBlock: number;
  reasoning: string;
}

// Keywords that suggest admin tasks
const ADMIN_KEYWORDS = [
  "email",
  "emails",
  "inbox",
  "respond",
  "reply",
  "meeting",
  "call",
  "calendar",
  "schedule",
  "admin",
  "administrative",
  "paperwork",
  "billing",
  "invoice",
  "expense",
  "report",
  "status",
  "update",
  "sync",
  "backup",
  "organize",
  "cleanup",
  "maintenance",
  "review",
  "approve",
  "sign",
  "submit",
  "file",
  "documentation",
  "doc",
  "manual",
  "guide",
  "process",
  "procedure",
];

// Keywords that suggest brain tasks
const BRAIN_KEYWORDS = [
  "develop",
  "code",
  "programming",
  "algorithm",
  "design",
  "create",
  "build",
  "implement",
  "architect",
  "refactor",
  "debug",
  "solve",
  "analyze",
  "research",
  "study",
  "learn",
  "understand",
  "explore",
  "investigate",
  "prototype",
  "experiment",
  "test",
  "optimize",
  "improve",
  "enhance",
  "feature",
  "bug",
  "fix",
  "problem",
  "solution",
  "strategy",
  "plan",
  "brainstorm",
  "ideate",
  "creative",
  "innovation",
  "thinking",
  "concept",
  "framework",
  "system",
];

export function getSmartSuggestions(
  title: string,
  description: string = "",
): SmartSuggestions {
  const text = `${title} ${description}`.toLowerCase();
  const words = text.split(/\s+/);

  // Calculate type suggestion
  const adminMatches = ADMIN_KEYWORDS.filter((keyword) =>
    words.some((word) => word.includes(keyword) || keyword.includes(word)),
  ).length;

  const brainMatches = BRAIN_KEYWORDS.filter((keyword) =>
    words.some((word) => word.includes(keyword) || keyword.includes(word)),
  ).length;

  let suggestedType: "brain" | "admin" = "brain"; // Default
  let confidence = 0.5; // Default confidence
  let reasoning = "No specific keywords detected, defaulting to brain task";

  if (adminMatches > brainMatches) {
    suggestedType = "admin";
    confidence = Math.min(0.9, 0.5 + adminMatches * 0.1);
    reasoning = `Detected ${adminMatches} admin-related keywords`;
  } else if (brainMatches > adminMatches) {
    suggestedType = "brain";
    confidence = Math.min(0.9, 0.5 + brainMatches * 0.1);
    reasoning = `Detected ${brainMatches} focus/brain-related keywords`;
  }

  // Get suggested tags based on common patterns
  const suggestedTags = getSuggestedTags(text);

  // Get suggested time block based on type and keywords
  const suggestedTimeBlock = getSuggestedTimeBlock(text, suggestedType);

  return {
    suggestedType,
    confidence,
    suggestedTags,
    suggestedTimeBlock,
    reasoning,
  };
}

function getSuggestedTags(text: string): string[] {
  const tags: string[] = [];

  // Common tag patterns
  const tagPatterns = [
    { keywords: ["email", "inbox", "message"], tag: "communication" },
    { keywords: ["meeting", "call", "conference"], tag: "meetings" },
    { keywords: ["code", "programming", "develop"], tag: "coding" },
    { keywords: ["bug", "fix", "debug"], tag: "bugfix" },
    { keywords: ["research", "study", "learn"], tag: "research" },
    { keywords: ["urgent", "asap", "priority"], tag: "urgent" },
    { keywords: ["review", "check", "verify"], tag: "review" },
    { keywords: ["plan", "planning", "strategy"], tag: "planning" },
    { keywords: ["design", "ui", "ux"], tag: "design" },
    { keywords: ["test", "testing", "qa"], tag: "testing" },
  ];

  tagPatterns.forEach((pattern) => {
    if (pattern.keywords.some((keyword) => text.includes(keyword))) {
      tags.push(pattern.tag);
    }
  });

  return tags.slice(0, 3); // Limit to 3 suggestions
}

function getSuggestedTimeBlock(text: string, type: "brain" | "admin"): number {
  // Default time blocks
  let baseTime = type === "brain" ? 45 : 20;

  // Adjust based on keywords
  if (text.includes("quick") || text.includes("brief")) {
    baseTime = Math.max(10, baseTime - 15);
  } else if (
    text.includes("deep") ||
    text.includes("complex") ||
    text.includes("research")
  ) {
    baseTime = Math.min(90, baseTime + 30);
  } else if (text.includes("review") || text.includes("check")) {
    baseTime = 15;
  } else if (text.includes("meeting") || text.includes("call")) {
    baseTime = 30;
  }

  // Round to nearest 5 minutes
  return Math.round(baseTime / 5) * 5;
}

export async function getRecentTags(
  limit: number = 10,
): Promise<Array<{ tag: string; count: number; lastUsed: Date }>> {
  const dayPlans = await getDayPlans();
  const tagUsage: Record<string, { count: number; lastUsed: Date }> = {};

  Object.values(dayPlans).forEach((plan) => {
    const allTasks = [...plan.morningTasks, ...plan.afternoonTasks];
    allTasks.forEach((task) => {
      if (task.tags) {
        task.tags.forEach((tag) => {
          if (!tagUsage[tag]) {
            tagUsage[tag] = { count: 0, lastUsed: task.createdAt };
          }
          tagUsage[tag].count++;
          if (task.createdAt > tagUsage[tag].lastUsed) {
            tagUsage[tag].lastUsed = task.createdAt;
          }
        });
      }
    });
  });

  return Object.entries(tagUsage)
    .map(([tag, usage]) => ({ tag, ...usage }))
    .sort((a, b) => {
      // Sort by recency and usage
      const recencyWeight = 0.7;
      const usageWeight = 0.3;

      const aScore =
        recencyWeight * a.lastUsed.getTime() + usageWeight * a.count * 86400000; // 1 day in ms
      const bScore =
        recencyWeight * b.lastUsed.getTime() + usageWeight * b.count * 86400000;

      return bScore - aScore;
    })
    .slice(0, limit);
}

export async function getSimilarTasks(
  title: string,
  description: string = "",
): Promise<Task[]> {
  const dayPlans = await getDayPlans();
  const allTasks: Task[] = [];

  Object.values(dayPlans).forEach((plan) => {
    allTasks.push(...plan.morningTasks, ...plan.afternoonTasks);
  });

  const searchText = `${title} ${description}`.toLowerCase();
  const searchWords = searchText.split(/\s+/).filter((word) => word.length > 2);

  const similarities = allTasks.map((task) => {
    const taskText = `${task.title} ${task.description || ""}`.toLowerCase();
    const taskWords = taskText.split(/\s+/);

    const commonWords = searchWords.filter((word) =>
      taskWords.some(
        (taskWord) => taskWord.includes(word) || word.includes(taskWord),
      ),
    );

    const similarity = commonWords.length / Math.max(searchWords.length, 1);

    return { task, similarity };
  });

  return similarities
    .filter((item) => item.similarity > 0.3) // At least 30% similarity
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5)
    .map((item) => item.task);
}

export async function getTimeEstimateFromHistory(
  title: string,
  description: string = "",
): Promise<number | null> {
  const similarTasks = await getSimilarTasks(title, description);
  const similarTasks = getSimilarTasks(title, description);
  const completedSimilarTasks = similarTasks.filter(
    (task) => task.completed && task.timeBlock && task.type === taskType,
  );

  if (completedSimilarTasks.length === 0) {
    return null;
  }

  const avgTime =
    completedSimilarTasks.reduce(
      (sum, task) => sum + (task.timeBlock || 0),
      0,
    ) / completedSimilarTasks.length;

  // Round to nearest 5 minutes
  return Math.round(avgTime / 5) * 5;
}
