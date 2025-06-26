import { Task } from "@/types";
import { addDays, addWeeks, addMonths, parse, isValid, format } from "date-fns";

export interface ParsedTask {
  title: string;
  description?: string;
  type: Task["type"];
  period: Task["period"];
  priority: Task["priority"];
  tags: string[];
  contextTags: string[];
  dueDate?: Date;
  dueTime?: string;
  timeBlock?: number;
  energy?: "low" | "medium" | "high";
  focus?: "shallow" | "deep";
  recurrence?: {
    pattern: "daily" | "weekly" | "monthly";
    interval: number;
    endDate?: Date;
  };
  confidence: number;
  originalInput: string;
  suggestions: string[];
}

interface TimePattern {
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => {
    time: string;
    period?: Task["period"];
  };
}

interface DatePattern {
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => Date;
}

interface RecurrencePattern {
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => ParsedTask["recurrence"];
}

// Time patterns for parsing
const TIME_PATTERNS: TimePattern[] = [
  {
    pattern: /(?:at\s+)?(\d{1,2}):(\d{2})\s*(am|pm)?/i,
    extract: (match) => {
      let hour = parseInt(match[1]);
      const minute = match[2];
      const ampm = match[3]?.toLowerCase();

      if (ampm === "pm" && hour !== 12) hour += 12;
      if (ampm === "am" && hour === 12) hour = 0;

      const time = `${hour.toString().padStart(2, "0")}:${minute}`;
      const period = hour < 12 ? "morning" : "afternoon";

      return { time, period };
    },
  },
  {
    pattern: /(?:at\s+)?(\d{1,2})\s*(am|pm)/i,
    extract: (match) => {
      let hour = parseInt(match[1]);
      const ampm = match[2].toLowerCase();

      if (ampm === "pm" && hour !== 12) hour += 12;
      if (ampm === "am" && hour === 12) hour = 0;

      const time = `${hour.toString().padStart(2, "0")}:00`;
      const period = hour < 12 ? "morning" : "afternoon";

      return { time, period };
    },
  },
  {
    pattern: /(?:in the\s+)?(morning|afternoon|evening)/i,
    extract: (match) => {
      const timeOfDay = match[1].toLowerCase();
      const period = timeOfDay === "morning" ? "morning" : "afternoon";
      return { time: "", period };
    },
  },
];

// Date patterns for parsing
const DATE_PATTERNS: DatePattern[] = [
  {
    pattern: /\b(today)\b/i,
    extract: () => new Date(),
  },
  {
    pattern: /\b(tomorrow)\b/i,
    extract: () => addDays(new Date(), 1),
  },
  {
    pattern:
      /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    extract: (match) => {
      const dayName = match[1].toLowerCase();
      const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const targetDay = days.indexOf(dayName);
      const today = new Date();
      const currentDay = today.getDay();

      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;

      return addDays(today, daysToAdd);
    },
  },
  {
    pattern: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    extract: (match) => {
      const dayName = match[1].toLowerCase();
      const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const targetDay = days.indexOf(dayName);
      const today = new Date();
      const currentDay = today.getDay();

      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;

      return addDays(today, daysToAdd);
    },
  },
  {
    pattern: /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/,
    extract: (match) => {
      const month = parseInt(match[1]) - 1; // JS months are 0-indexed
      const day = parseInt(match[2]);
      const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();

      return new Date(year, month, day);
    },
  },
  {
    pattern: /\bin\s+(\d+)\s+(days?|weeks?|months?)\b/i,
    extract: (match) => {
      const amount = parseInt(match[1]);
      const unit = match[2].toLowerCase();

      if (unit.startsWith("day")) {
        return addDays(new Date(), amount);
      } else if (unit.startsWith("week")) {
        return addWeeks(new Date(), amount);
      } else if (unit.startsWith("month")) {
        return addMonths(new Date(), amount);
      }

      return new Date();
    },
  },
];

// Recurrence patterns
const RECURRENCE_PATTERNS: RecurrencePattern[] = [
  {
    pattern: /\bevery\s+(day|daily)\b/i,
    extract: () => ({ pattern: "daily", interval: 1 }),
  },
  {
    pattern: /\bevery\s+(week|weekly)\b/i,
    extract: () => ({ pattern: "weekly", interval: 1 }),
  },
  {
    pattern: /\bevery\s+(month|monthly)\b/i,
    extract: () => ({ pattern: "monthly", interval: 1 }),
  },
  {
    pattern: /\bevery\s+(\d+)\s+(days?|weeks?|months?)\b/i,
    extract: (match) => {
      const interval = parseInt(match[1]);
      const unit = match[2].toLowerCase();

      if (unit.startsWith("day")) {
        return { pattern: "daily", interval };
      } else if (unit.startsWith("week")) {
        return { pattern: "weekly", interval };
      } else if (unit.startsWith("month")) {
        return { pattern: "monthly", interval };
      }

      return { pattern: "daily", interval: 1 };
    },
  },
  {
    pattern:
      /\bevery\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    extract: () => ({ pattern: "weekly", interval: 1 }),
  },
];

// Priority keywords
const PRIORITY_KEYWORDS = {
  high: [
    "urgent",
    "asap",
    "critical",
    "important",
    "high priority",
    "!!!",
    "emergency",
  ],
  medium: ["medium", "normal", "standard"],
  low: ["low", "minor", "when possible", "eventually", "someday"],
};

// Type keywords
const TYPE_KEYWORDS = {
  brain: [
    "code",
    "coding",
    "develop",
    "design",
    "plan",
    "think",
    "analyze",
    "research",
    "write",
    "create",
    "brainstorm",
    "focus",
    "deep work",
    "strategy",
    "learn",
    "study",
    "review",
    "architect",
    "solve",
    "optimize",
  ],
  admin: [
    "email",
    "meeting",
    "call",
    "admin",
    "paperwork",
    "file",
    "organize",
    "schedule",
    "book",
    "pay",
    "buy",
    "order",
    "respond",
    "reply",
    "check",
    "update",
    "sync",
    "backup",
    "clean",
    "sort",
  ],
};

// Tag patterns
const TAG_PATTERNS = [
  /#(\w+)/g, // hashtags
  /\b(personal|work|home|health|finance|shopping|travel)\b/gi, // common categories
];

// Context patterns (GTD contexts)
const CONTEXT_PATTERNS = [
  /@(\w+)/g, // @context tags
  /\b(calls?|phone|email|computer|office|home|errands?|waiting|review|read)\b/gi,
];

// Energy level keywords
const ENERGY_KEYWORDS = {
  low: ["simple", "easy", "quick", "routine", "basic", "light"],
  medium: ["normal", "regular", "standard", "moderate"],
  high: [
    "complex",
    "challenging",
    "intensive",
    "creative",
    "difficult",
    "deep",
  ],
};

// Focus level keywords
const FOCUS_KEYWORDS = {
  shallow: ["quick", "simple", "call", "email", "message", "check", "update"],
  deep: [
    "focus",
    "deep",
    "think",
    "analyze",
    "design",
    "code",
    "write",
    "create",
    "plan",
  ],
};

// Duration patterns
const DURATION_PATTERNS = [
  {
    pattern: /for\s+(\d+)\s*(hours?|hrs?|h)\b/i,
    extract: (match: RegExpMatchArray) => parseInt(match[1]) * 60,
  },
  {
    pattern: /for\s+(\d+)\s*(minutes?|mins?|m)\b/i,
    extract: (match: RegExpMatchArray) => parseInt(match[1]),
  },
  {
    pattern: /(\d+)\s*hr?s?\s*(\d+)?\s*m(?:in)?s?/i,
    extract: (match: RegExpMatchArray) => {
      const hours = parseInt(match[1]) * 60;
      const minutes = match[2] ? parseInt(match[2]) : 0;
      return hours + minutes;
    },
  },
];

export class NaturalLanguageProcessor {
  static parse(input: string): ParsedTask {
    const originalInput = input.trim();
    let workingText = originalInput.toLowerCase();
    const suggestions: string[] = [];

    // Initialize result with defaults
    const result: ParsedTask = {
      title: originalInput,
      type: "brain",
      period: "morning",
      priority: "medium",
      tags: [],
      contextTags: [],
      energy: "medium",
      focus: "shallow",
      confidence: 0.5,
      originalInput,
      suggestions,
    };

    // Extract time information
    const timeInfo = this.extractTime(workingText);
    if (timeInfo.time) {
      result.dueTime = timeInfo.time;
      suggestions.push(`Set time to ${timeInfo.time}`);
    }
    if (timeInfo.period) {
      result.period = timeInfo.period;
      suggestions.push(`Scheduled for ${timeInfo.period}`);
    }

    // Extract date information
    const dateInfo = this.extractDate(workingText);
    if (dateInfo) {
      result.dueDate = dateInfo;
      suggestions.push(`Due date: ${format(dateInfo, "MMM dd, yyyy")}`);
    }

    // Extract recurrence
    const recurrence = this.extractRecurrence(workingText);
    if (recurrence) {
      result.recurrence = recurrence;
      suggestions.push(`Repeats ${recurrence.pattern}`);
    }

    // Extract priority
    const priority = this.extractPriority(workingText);
    if (priority) {
      result.priority = priority;
      suggestions.push(`Priority: ${priority}`);
    }

    // Extract type
    const type = this.extractType(workingText);
    if (type) {
      result.type = type;
      suggestions.push(`Task type: ${type}`);
    }

    // Extract tags
    const tags = this.extractTags(originalInput);
    if (tags.length > 0) {
      result.tags = tags;
      suggestions.push(`Tags: ${tags.join(", ")}`);
    }

    // Extract context tags
    const contextTags = this.extractContextTags(originalInput);
    if (contextTags.length > 0) {
      result.contextTags = contextTags;
      suggestions.push(`Contexts: ${contextTags.join(", ")}`);
    }

    // Extract energy level
    const energy = this.extractEnergy(workingText);
    if (energy) {
      result.energy = energy;
      suggestions.push(`Energy: ${energy}`);
    }

    // Extract focus level
    const focus = this.extractFocus(workingText);
    if (focus) {
      result.focus = focus;
      suggestions.push(`Focus: ${focus}`);
    }

    // Extract duration/time block
    const duration = this.extractDuration(workingText);
    if (duration) {
      result.timeBlock = duration;
      suggestions.push(`Time block: ${duration} minutes`);
    }

    // Clean up title by removing parsed elements
    result.title = this.cleanTitle(originalInput);

    // Calculate confidence based on what we parsed
    result.confidence = this.calculateConfidence(result, originalInput);

    return result;
  }

  private static extractTime(text: string): {
    time?: string;
    period?: Task["period"];
  } {
    for (const pattern of TIME_PATTERNS) {
      const match = text.match(pattern.pattern);
      if (match) {
        return pattern.extract(match);
      }
    }
    return {};
  }

  private static extractDate(text: string): Date | undefined {
    for (const pattern of DATE_PATTERNS) {
      const match = text.match(pattern.pattern);
      if (match) {
        const date = pattern.extract(match);
        if (isValid(date)) {
          return date;
        }
      }
    }
    return undefined;
  }

  private static extractRecurrence(
    text: string,
  ): ParsedTask["recurrence"] | undefined {
    for (const pattern of RECURRENCE_PATTERNS) {
      const match = text.match(pattern.pattern);
      if (match) {
        return pattern.extract(match);
      }
    }
    return undefined;
  }

  private static extractPriority(text: string): Task["priority"] | undefined {
    // Check for exclamation marks
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount >= 3) return "high";
    if (exclamationCount >= 2) return "medium";

    // Check for priority keywords
    for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return priority as Task["priority"];
        }
      }
    }

    return undefined;
  }

  private static extractType(text: string): Task["type"] | undefined {
    let brainScore = 0;
    let adminScore = 0;

    // Check brain keywords
    for (const keyword of TYPE_KEYWORDS.brain) {
      if (text.includes(keyword.toLowerCase())) {
        brainScore++;
      }
    }

    // Check admin keywords
    for (const keyword of TYPE_KEYWORDS.admin) {
      if (text.includes(keyword.toLowerCase())) {
        adminScore++;
      }
    }

    if (brainScore > adminScore) return "brain";
    if (adminScore > brainScore) return "admin";

    return undefined;
  }

  private static extractTags(text: string): string[] {
    const tags: Set<string> = new Set();

    // Extract hashtags
    const hashtagMatches = text.matchAll(/#(\w+)/g);
    for (const match of hashtagMatches) {
      tags.add(match[1].toLowerCase());
    }

    // Extract common category words
    const categoryPattern =
      /\b(personal|work|home|health|finance|shopping|travel|urgent|meeting|call|email)\b/gi;
    const categoryMatches = text.matchAll(categoryPattern);
    for (const match of categoryMatches) {
      tags.add(match[1].toLowerCase());
    }

    return Array.from(tags);
  }

  private static extractContextTags(text: string): string[] {
    const contexts: Set<string> = new Set();

    // Extract @context tags
    const contextMatches = text.matchAll(/@(\w+)/g);
    for (const match of contextMatches) {
      contexts.add(`@${match[1].toLowerCase()}`);
    }

    // Extract implied contexts
    const contextWords = [
      { words: ["call", "phone"], context: "@calls" },
      { words: ["email", "message"], context: "@email" },
      { words: ["computer", "code", "type"], context: "@computer" },
      { words: ["office", "work"], context: "@office" },
      { words: ["home", "house"], context: "@home" },
      { words: ["errands", "shopping", "buy"], context: "@errands" },
      { words: ["waiting", "wait"], context: "@waiting" },
      { words: ["review", "check"], context: "@review" },
      { words: ["read", "reading"], context: "@read" },
    ];

    for (const { words, context } of contextWords) {
      for (const word of words) {
        if (text.toLowerCase().includes(word)) {
          contexts.add(context);
          break;
        }
      }
    }

    return Array.from(contexts);
  }

  private static extractEnergy(
    text: string,
  ): "low" | "medium" | "high" | undefined {
    let lowScore = 0;
    let mediumScore = 0;
    let highScore = 0;

    // Check energy keywords
    for (const keyword of ENERGY_KEYWORDS.low) {
      if (text.includes(keyword.toLowerCase())) lowScore++;
    }
    for (const keyword of ENERGY_KEYWORDS.medium) {
      if (text.includes(keyword.toLowerCase())) mediumScore++;
    }
    for (const keyword of ENERGY_KEYWORDS.high) {
      if (text.includes(keyword.toLowerCase())) highScore++;
    }

    if (highScore > lowScore && highScore > mediumScore) return "high";
    if (lowScore > mediumScore && lowScore > highScore) return "low";
    if (mediumScore > 0) return "medium";

    return undefined;
  }

  private static extractFocus(text: string): "shallow" | "deep" | undefined {
    let shallowScore = 0;
    let deepScore = 0;

    // Check focus keywords
    for (const keyword of FOCUS_KEYWORDS.shallow) {
      if (text.includes(keyword.toLowerCase())) shallowScore++;
    }
    for (const keyword of FOCUS_KEYWORDS.deep) {
      if (text.includes(keyword.toLowerCase())) deepScore++;
    }

    if (deepScore > shallowScore) return "deep";
    if (shallowScore > deepScore) return "shallow";

    return undefined;
  }

  private static extractDuration(text: string): number | undefined {
    for (const pattern of DURATION_PATTERNS) {
      const match = text.match(pattern.pattern);
      if (match) {
        return pattern.extract(match);
      }
    }
    return undefined;
  }

  private static cleanTitle(originalText: string): string {
    let title = originalText;

    // Remove time patterns
    for (const pattern of TIME_PATTERNS) {
      title = title.replace(pattern.pattern, "");
    }

    // Remove date patterns
    for (const pattern of DATE_PATTERNS) {
      title = title.replace(pattern.pattern, "");
    }

    // Remove recurrence patterns
    for (const pattern of RECURRENCE_PATTERNS) {
      title = title.replace(pattern.pattern, "");
    }

    // Remove duration patterns
    for (const pattern of DURATION_PATTERNS) {
      title = title.replace(pattern.pattern, "");
    }

    // Remove priority keywords
    for (const keywords of Object.values(PRIORITY_KEYWORDS)) {
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        title = title.replace(regex, "");
      }
    }

    // Remove common prepositions and clean up
    title = title
      .replace(/\b(at|on|in|for|due|by|until|before|after)\b/gi, "")
      .replace(/\s+/g, " ")
      .replace(/^[,\s]+|[,\s]+$/g, "")
      .trim();

    return title || originalText;
  }

  private static calculateConfidence(
    result: ParsedTask,
    originalInput: string,
  ): number {
    let confidence = 0.3; // Base confidence

    // Increase confidence for each parsed element
    if (result.dueDate) confidence += 0.12;
    if (result.dueTime) confidence += 0.12;
    if (result.recurrence) confidence += 0.08;
    if (result.priority !== "medium") confidence += 0.08;
    if (result.type && result.type !== "brain") confidence += 0.08;
    if (result.tags.length > 0) confidence += 0.08;
    if (result.contextTags.length > 0) confidence += 0.08;
    if (result.timeBlock) confidence += 0.08;
    if (result.energy && result.energy !== "medium") confidence += 0.05;
    if (result.focus && result.focus !== "shallow") confidence += 0.05;

    // Bonus for complex parsing
    if (result.suggestions.length >= 3) confidence += 0.08;
    if (result.suggestions.length >= 5) confidence += 0.08;
    if (result.suggestions.length >= 7) confidence += 0.04;

    return Math.min(confidence, 1.0);
  }

  // Helper method for getting example inputs
  static getExamples(): string[] {
    return [
      "Meeting with John tomorrow at 3pm",
      "Code review every Tuesday at 2pm #work",
      "Buy groceries today high priority",
      "Deep work session for 2 hours in the morning",
      "Call mom this weekend",
      "Workout every day at 7am for 1 hour",
      "Write blog post by Friday #personal",
      "Team standup daily at 9:30am",
      "Review quarterly reports urgent!!!",
      "Plan vacation in 2 weeks #personal",
    ];
  }

  // Helper method for testing
  static test(): void {
    const examples = this.getExamples();
    console.log("NLP Testing Results:");
    console.log("=".repeat(50));

    examples.forEach((example, index) => {
      const result = this.parse(example);
      console.log(`\n${index + 1}. "${example}"`);
      console.log(`   Title: "${result.title}"`);
      console.log(
        `   Type: ${result.type}, Period: ${result.period}, Priority: ${result.priority}`,
      );
      if (result.dueDate)
        console.log(`   Due: ${format(result.dueDate, "MMM dd, yyyy")}`);
      if (result.dueTime) console.log(`   Time: ${result.dueTime}`);
      if (result.timeBlock) console.log(`   Duration: ${result.timeBlock} min`);
      if (result.tags.length) console.log(`   Tags: ${result.tags.join(", ")}`);
      if (result.recurrence)
        console.log(`   Recurs: ${result.recurrence.pattern}`);
      console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   Suggestions: ${result.suggestions.join("; ")}`);
    });
  }
}
