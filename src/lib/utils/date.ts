/**
 * Date utility functions for FlowTracker
 * Optimized for AI readability and NextJS compatibility
 */

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return `${formatDate(d)} at ${formatTime(d)}`;
};

export const getToday = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const isToday = (date: Date | string): boolean => {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

export const isThisWeek = (date: Date | string): boolean => {
  const d = new Date(date);
  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));

  return d >= weekStart && d <= weekEnd;
};

export const getDaysBetween = (
  startDate: Date | string,
  endDate: Date | string,
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const addDays = (date: Date | string, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const getWeekStart = (date: Date | string = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

export const getWeekEnd = (date: Date | string = new Date()): Date => {
  const weekStart = getWeekStart(date);
  return addDays(weekStart, 6);
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const parseDuration = (durationString: string): number => {
  const timePattern = /(\d+)([hms])/g;
  let totalSeconds = 0;
  let match;

  while ((match = timePattern.exec(durationString)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "h":
        totalSeconds += value * 3600;
        break;
      case "m":
        totalSeconds += value * 60;
        break;
      case "s":
        totalSeconds += value;
        break;
    }
  }

  return totalSeconds;
};

export const getTimeOfDay = (): "morning" | "afternoon" | "evening" => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "morning";
  } else if (hour < 18) {
    return "afternoon";
  } else {
    return "evening";
  }
};

export const isMorning = (): boolean => getTimeOfDay() === "morning";
export const isAfternoon = (): boolean => getTimeOfDay() === "afternoon";
export const isEvening = (): boolean => getTimeOfDay() === "evening";
