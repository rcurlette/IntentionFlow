import { Task, DayPlan } from "@/types";
import { getDayPlans } from "./storage";

export interface TaskAnalytics {
  completionRate: number;
  averageTasksPerDay: number;
  totalTasksCompleted: number;
  totalFocusTime: number;
  typeBreakdown: {
    brain: { total: number; completed: number };
    admin: { total: number; completed: number };
  };
  priorityBreakdown: {
    high: { total: number; completed: number };
    medium: { total: number; completed: number };
    low: { total: number; completed: number };
  };
  periodBreakdown: {
    morning: { total: number; completed: number };
    afternoon: { total: number; completed: number };
  };
  weeklyTrends: Array<{
    date: string;
    tasksCompleted: number;
    completionRate: number;
  }>;
  mostUsedTags: Array<{
    tag: string;
    count: number;
    completionRate: number;
  }>;
  averageCompletionTime: number; // in hours
  streakData: {
    currentStreak: number;
    longestStreak: number;
    streakDates: string[];
  };
}

export function calculateTaskAnalytics(
  dateRange: { from: Date; to: Date } = {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  },
): TaskAnalytics {
  const dayPlans = getDayPlans();
  const filteredPlans = dayPlans.filter((plan) => {
    const planDate = new Date(plan.date);
    return planDate >= dateRange.from && planDate <= dateRange.to;
  });

  // Get all tasks from filtered plans
  const allTasks: Task[] = [];
  filteredPlans.forEach((plan) => {
    allTasks.push(...plan.morningTasks, ...plan.afternoonTasks);
  });

  const completedTasks = allTasks.filter((task) => task.completed);

  // Basic metrics
  const completionRate =
    allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;
  const averageTasksPerDay =
    filteredPlans.length > 0 ? allTasks.length / filteredPlans.length : 0;
  const totalFocusTime = completedTasks.reduce(
    (sum, task) => sum + (task.timeBlock || 0),
    0,
  );

  // Type breakdown
  const typeBreakdown = {
    brain: {
      total: allTasks.filter((task) => task.type === "brain").length,
      completed: completedTasks.filter((task) => task.type === "brain").length,
    },
    admin: {
      total: allTasks.filter((task) => task.type === "admin").length,
      completed: completedTasks.filter((task) => task.type === "admin").length,
    },
  };

  // Priority breakdown
  const priorityBreakdown = {
    high: {
      total: allTasks.filter((task) => task.priority === "high").length,
      completed: completedTasks.filter((task) => task.priority === "high")
        .length,
    },
    medium: {
      total: allTasks.filter((task) => task.priority === "medium").length,
      completed: completedTasks.filter((task) => task.priority === "medium")
        .length,
    },
    low: {
      total: allTasks.filter((task) => task.priority === "low").length,
      completed: completedTasks.filter((task) => task.priority === "low")
        .length,
    },
  };

  // Period breakdown
  const periodBreakdown = {
    morning: {
      total: allTasks.filter((task) => task.period === "morning").length,
      completed: completedTasks.filter((task) => task.period === "morning")
        .length,
    },
    afternoon: {
      total: allTasks.filter((task) => task.period === "afternoon").length,
      completed: completedTasks.filter((task) => task.period === "afternoon")
        .length,
    },
  };

  // Weekly trends
  const weeklyTrends = generateWeeklyTrends(filteredPlans);

  // Most used tags
  const mostUsedTags = calculateMostUsedTags(allTasks);

  // Average completion time
  const averageCompletionTime = calculateAverageCompletionTime(completedTasks);

  // Streak data
  const streakData = calculateStreakData(filteredPlans);

  return {
    completionRate,
    averageTasksPerDay,
    totalTasksCompleted: completedTasks.length,
    totalFocusTime,
    typeBreakdown,
    priorityBreakdown,
    periodBreakdown,
    weeklyTrends,
    mostUsedTags,
    averageCompletionTime,
    streakData,
  };
}

function generateWeeklyTrends(plans: DayPlan[]): TaskAnalytics["weeklyTrends"] {
  return plans
    .map((plan) => {
      const allTasks = [...plan.morningTasks, ...plan.afternoonTasks];
      const completedTasks = allTasks.filter((task) => task.completed);
      const completionRate =
        allTasks.length > 0
          ? (completedTasks.length / allTasks.length) * 100
          : 0;

      return {
        date: plan.date,
        tasksCompleted: completedTasks.length,
        completionRate,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateMostUsedTags(tasks: Task[]): TaskAnalytics["mostUsedTags"] {
  const tagCounts: Record<string, { total: number; completed: number }> = {};

  tasks.forEach((task) => {
    task.tags?.forEach((tag) => {
      if (!tagCounts[tag]) {
        tagCounts[tag] = { total: 0, completed: 0 };
      }
      tagCounts[tag].total++;
      if (task.completed) {
        tagCounts[tag].completed++;
      }
    });
  });

  return Object.entries(tagCounts)
    .map(([tag, counts]) => ({
      tag,
      count: counts.total,
      completionRate:
        counts.total > 0 ? (counts.completed / counts.total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 tags
}

function calculateAverageCompletionTime(tasks: Task[]): number {
  const tasksWithTime = tasks.filter(
    (task) => task.completedAt && task.createdAt,
  );

  if (tasksWithTime.length === 0) return 0;

  const totalTime = tasksWithTime.reduce((sum, task) => {
    const completionTime =
      (task.completedAt!.getTime() - task.createdAt.getTime()) /
      (1000 * 60 * 60); // Convert to hours
    return sum + completionTime;
  }, 0);

  return totalTime / tasksWithTime.length;
}

function calculateStreakData(plans: DayPlan[]): TaskAnalytics["streakData"] {
  const sortedPlans = plans
    .filter((plan) => {
      const allTasks = [...plan.morningTasks, ...plan.afternoonTasks];
      return allTasks.length > 0; // Only include days with tasks
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const streakDates: string[] = [];

  const today = new Date().toISOString().split("T")[0];

  // Calculate current streak
  for (let i = 0; i < sortedPlans.length; i++) {
    const plan = sortedPlans[i];
    const allTasks = [...plan.morningTasks, ...plan.afternoonTasks];
    const hasCompletedTasks = allTasks.some((task) => task.completed);

    if (hasCompletedTasks) {
      if (i === 0 || plan.date === today) {
        currentStreak++;
        streakDates.unshift(plan.date);
      } else {
        const prevDate = new Date(sortedPlans[i - 1].date);
        const currentDate = new Date(plan.date);
        const dayDiff =
          (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

        if (dayDiff === 1) {
          currentStreak++;
          streakDates.unshift(plan.date);
        } else {
          break;
        }
      }
    } else {
      break;
    }
  }

  // Calculate longest streak
  sortedPlans.forEach((plan) => {
    const allTasks = [...plan.morningTasks, ...plan.afternoonTasks];
    const hasCompletedTasks = allTasks.some((task) => task.completed);

    if (hasCompletedTasks) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  });

  return {
    currentStreak,
    longestStreak,
    streakDates,
  };
}

export function getProductivityInsights(analytics: TaskAnalytics): Array<{
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  icon: string;
}> {
  const insights = [];

  // Completion rate insights
  if (analytics.completionRate >= 80) {
    insights.push({
      type: "success" as const,
      title: "Excellent Completion Rate!",
      message: `You're completing ${analytics.completionRate.toFixed(1)}% of your tasks. Keep up the great work!`,
      icon: "🎉",
    });
  } else if (analytics.completionRate < 50) {
    insights.push({
      type: "warning" as const,
      title: "Completion Rate Needs Attention",
      message: `Your completion rate is ${analytics.completionRate.toFixed(1)}%. Consider breaking down large tasks or reducing your daily load.`,
      icon: "⚠️",
    });
  }

  // Type balance insights
  const brainRate =
    analytics.typeBreakdown.brain.total > 0
      ? (analytics.typeBreakdown.brain.completed /
          analytics.typeBreakdown.brain.total) *
        100
      : 0;
  const adminRate =
    analytics.typeBreakdown.admin.total > 0
      ? (analytics.typeBreakdown.admin.completed /
          analytics.typeBreakdown.admin.total) *
        100
      : 0;

  if (Math.abs(brainRate - adminRate) > 30) {
    insights.push({
      type: "info" as const,
      title: "Task Type Imbalance",
      message: `Your ${brainRate > adminRate ? "admin" : "brain"} task completion rate is significantly lower. Consider balancing your focus.`,
      icon: "⚖️",
    });
  }

  // Streak insights
  if (analytics.streakData.currentStreak >= 7) {
    insights.push({
      type: "success" as const,
      title: "Amazing Streak!",
      message: `You've maintained productivity for ${analytics.streakData.currentStreak} days straight!`,
      icon: "🔥",
    });
  }

  // Focus time insights
  if (analytics.totalFocusTime >= 300) {
    // 5+ hours
    insights.push({
      type: "success" as const,
      title: "Deep Work Champion",
      message: `You've accumulated ${Math.round(analytics.totalFocusTime / 60)} hours of focused work time!`,
      icon: "🧠",
    });
  }

  return insights;
}
