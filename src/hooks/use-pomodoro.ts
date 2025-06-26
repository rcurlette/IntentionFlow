import { useState, useEffect, useCallback, useRef } from "react";
import { PomodoroSession, Task } from "@/types";
import { generateId } from "@/lib/productivity-utils";
import { getTodayPlan, saveDayPlan } from "@/lib/storage";

export type TimerState = "idle" | "running" | "paused" | "break" | "longBreak";

interface PomodoroSettings {
  focusDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsBeforeLongBreak: number;
}

export function usePomodoro() {
  const [state, setState] = useState<TimerState>("idle");
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // seconds
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(
    null,
  );
  const [linkedTask, setLinkedTask] = useState<Task | null>(null);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);
  const [flowScore, setFlowScore] = useState(100);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const [settings, setSettings] = useState<PomodoroSettings>({
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
  });

  const getCurrentDuration = useCallback(() => {
    switch (state) {
      case "running":
        return settings.focusDuration * 60;
      case "break":
        return settings.shortBreakDuration * 60;
      case "longBreak":
        return settings.longBreakDuration * 60;
      default:
        return settings.focusDuration * 60;
    }
  }, [state, settings]);

  const startTimer = useCallback(
    (taskId?: string) => {
      const newSession: PomodoroSession = {
        id: generateId(),
        taskId,
        startTime: new Date(),
        completed: false,
        type: "focus",
        duration: settings.focusDuration,
      };

      setCurrentSession(newSession);
      setState("running");
      setTimeRemaining(settings.focusDuration * 60);
      startTimeRef.current = new Date();
      setDistractionCount(0);
      setFlowScore(100);

      // Link task if provided
      if (taskId) {
        const todayPlan = getTodayPlan();
        const allTasks = [
          ...todayPlan.morningTasks,
          ...todayPlan.afternoonTasks,
          ...todayPlan.laterBird,
        ];
        const task = allTasks.find((t) => t.id === taskId);
        if (task) {
          setLinkedTask(task);
        }
      }
    },
    [settings.focusDuration],
  );

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState("paused");
  }, []);

  const resumeTimer = useCallback(() => {
    setState("running");
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState("idle");
    setTimeRemaining(settings.focusDuration * 60);
    setCurrentSession(null);
    setLinkedTask(null);
    startTimeRef.current = null;
  }, [settings.focusDuration]);

  const skipTimer = useCallback(() => {
    if (currentSession && state === "running") {
      // Complete the session early
      const completedSession = {
        ...currentSession,
        endTime: new Date(),
        completed: true,
      };

      // Save session and update today's plan
      const todayPlan = getTodayPlan();
      todayPlan.pomodoroCompleted += 1;
      saveDayPlan(todayPlan);

      setSessionsCompleted((prev) => prev + 1);
    }

    // Determine next state
    const nextSessionCount = sessionsCompleted + 1;
    const shouldLongBreak =
      nextSessionCount % settings.sessionsBeforeLongBreak === 0;

    if (state === "running") {
      const nextState = shouldLongBreak ? "longBreak" : "break";
      setState(nextState);
      setTimeRemaining(
        shouldLongBreak
          ? settings.longBreakDuration * 60
          : settings.shortBreakDuration * 60,
      );
    } else {
      setState("idle");
      setTimeRemaining(settings.focusDuration * 60);
    }

    setCurrentSession(null);
  }, [currentSession, state, sessionsCompleted, settings]);

  const addDistraction = useCallback(() => {
    setDistractionCount((prev) => prev + 1);
    setFlowScore((prev) => Math.max(0, prev - 10));
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setSessionsCompleted(0);
    setDistractionCount(0);
    setFlowScore(100);
  }, [stopTimer]);

  // Timer countdown effect
  useEffect(() => {
    if (state === "running" || state === "break" || state === "longBreak") {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer finished
            if (state === "running") {
              // Focus session completed
              if (currentSession) {
                const completedSession = {
                  ...currentSession,
                  endTime: new Date(),
                  completed: true,
                };

                // Update pomodoro count
                const todayPlan = getTodayPlan();
                todayPlan.pomodoroCompleted += 1;
                saveDayPlan(todayPlan);
              }

              setSessionsCompleted((prev) => prev + 1);

              // Determine break type
              const nextCount = sessionsCompleted + 1;
              const shouldLongBreak =
                nextCount % settings.sessionsBeforeLongBreak === 0;

              const nextState = shouldLongBreak ? "longBreak" : "break";
              setState(nextState);

              return shouldLongBreak
                ? settings.longBreakDuration * 60
                : settings.shortBreakDuration * 60;
            } else {
              // Break finished, back to idle
              setState("idle");
              setCurrentSession(null);
              setLinkedTask(null);
              return settings.focusDuration * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state, currentSession, sessionsCompleted, settings]);

  // Flow score calculation
  useEffect(() => {
    if (state === "running" && startTimeRef.current) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current!.getTime();
        const minutes = elapsed / (1000 * 60);

        // Increase flow score over time (up to 100)
        const timeBonus = Math.min(20, minutes * 2);
        const distractionPenalty = distractionCount * 10;
        const newScore = Math.max(
          0,
          Math.min(100, 80 + timeBonus - distractionPenalty),
        );

        setFlowScore(newScore);
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [state, distractionCount]);

  return {
    // State
    state,
    timeRemaining,
    currentSession,
    linkedTask,
    sessionsCompleted,
    distractionCount,
    flowScore,
    settings,

    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    skipTimer,
    resetTimer,
    addDistraction,
    setSettings,

    // Utilities
    getCurrentDuration,
  };
}
