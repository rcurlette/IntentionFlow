import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatTimeRemaining } from "@/lib/productivity-utils";
import { TimerState } from "@/hooks/use-pomodoro";
import { Task } from "@/types";
import {
  Play,
  Pause,
  Square,
  SkipForward,
  RotateCcw,
  Timer,
  Coffee,
  Brain,
  Zap,
} from "lucide-react";

interface PomodoroTimerProps {
  state: TimerState;
  timeRemaining: number;
  totalDuration: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSkip: () => void;
  onReset: () => void;
}

export function PomodoroTimer({
  state,
  timeRemaining,
  totalDuration,
  onStart,
  onPause,
  onResume,
  onStop,
  onSkip,
  onReset,
}: PomodoroTimerProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;

  const getStateInfo = () => {
    switch (state) {
      case "running":
        return {
          icon: <Brain className="h-6 w-6 text-focus" />,
          title: "Focus Session",
          badge: "Focusing",
          badgeClass: "bg-focus text-focus-foreground animate-pulse-soft",
          cardClass: "border-focus/40 bg-focus/5",
          message: "🧠 Deep work mode activated! Stay focused!",
        };
      case "paused":
        return {
          icon: <Pause className="h-6 w-6 text-warning" />,
          title: "Paused",
          badge: "Paused",
          badgeClass: "bg-warning text-warning-foreground",
          cardClass: "border-warning/40 bg-warning/5",
          message: "⏸️ Take a breath, then get back to it!",
        };
      case "break":
        return {
          icon: <Coffee className="h-6 w-6 text-admin" />,
          title: "Short Break",
          badge: "Break Time",
          badgeClass: "bg-admin text-admin-foreground animate-pulse-soft",
          cardClass: "border-admin/40 bg-admin/5",
          message: "☕ Relax and recharge for 5 minutes!",
        };
      case "longBreak":
        return {
          icon: <Coffee className="h-6 w-6 text-energy" />,
          title: "Long Break",
          badge: "Long Break",
          badgeClass: "bg-energy text-energy-foreground animate-pulse-soft",
          cardClass: "border-energy/40 bg-energy/5",
          message: "🌟 Great work! Enjoy your longer break!",
        };
      default:
        return {
          icon: <Timer className="h-6 w-6 text-focus" />,
          title: "Ready to Focus",
          badge: "Ready",
          badgeClass: "bg-focus text-focus-foreground",
          cardClass: "border-focus/20 bg-focus/5",
          message: "🚀 Ready to start your productive session?",
        };
    }
  };

  const stateInfo = getStateInfo();

  // Trigger animation on state change
  useEffect(() => {
    if (state === "running" || state === "break" || state === "longBreak") {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Warning when time is running low
  const isWarningTime = timeRemaining <= 60 && state === "running";
  const isCriticalTime = timeRemaining <= 10 && state === "running";

  return (
    <Card
      className={cn(
        "border-2 transition-all duration-300",
        stateInfo.cardClass,
        isAnimating && "animate-celebration",
        isCriticalTime && "animate-pulse",
      )}
    >
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center space-x-2">
          {stateInfo.icon}
          <span>{stateInfo.title}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="text-center space-y-6">
        {/* Timer Display */}
        <div className="relative">
          <div
            className={cn(
              "text-6xl font-mono font-bold mb-2 transition-colors duration-200",
              state === "running" && "text-focus",
              state === "break" && "text-admin",
              state === "longBreak" && "text-energy",
              state === "paused" && "text-warning",
              state === "idle" && "text-focus",
              isWarningTime && "text-warning animate-pulse",
              isCriticalTime && "text-destructive animate-pulse",
            )}
          >
            {formatTimeRemaining(timeRemaining)}
          </div>
          <Badge className={stateInfo.badgeClass}>{stateInfo.badge}</Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress
            value={progress}
            className={cn(
              "h-3 transition-all duration-200",
              state === "running" && "bg-focus/20",
              state === "break" && "bg-admin/20",
              state === "longBreak" && "bg-energy/20",
            )}
          />
          <div className="text-xs text-muted-foreground">
            {Math.round(progress)}% complete
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-3">
          {state === "idle" && (
            <>
              <Button
                size="lg"
                onClick={onStart}
                className="bg-focus text-focus-foreground hover:bg-focus/90"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Focus
              </Button>
              <Button variant="outline" size="lg" onClick={onReset}>
                <RotateCcw className="h-5 w-5" />
              </Button>
            </>
          )}

          {state === "running" && (
            <>
              <Button
                size="lg"
                onClick={onPause}
                variant="outline"
                className="border-warning text-warning hover:bg-warning/10"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
              <Button
                size="lg"
                onClick={onStop}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <Square className="h-5 w-5 mr-2" />
                Stop
              </Button>
              <Button
                size="lg"
                onClick={onSkip}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <SkipForward className="h-5 w-5 mr-2" />
                Skip
              </Button>
            </>
          )}

          {state === "paused" && (
            <>
              <Button
                size="lg"
                onClick={onResume}
                className="bg-focus text-focus-foreground hover:bg-focus/90"
              >
                <Play className="h-5 w-5 mr-2" />
                Resume
              </Button>
              <Button
                size="lg"
                onClick={onStop}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <Square className="h-5 w-5 mr-2" />
                Stop
              </Button>
            </>
          )}

          {(state === "break" || state === "longBreak") && (
            <>
              <Button
                size="lg"
                onClick={onSkip}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <SkipForward className="h-5 w-5 mr-2" />
                Skip Break
              </Button>
              <Button variant="outline" size="lg" onClick={onReset}>
                <RotateCcw className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Status Message */}
        <div className="text-sm text-muted-foreground">
          <p>{stateInfo.message}</p>
        </div>

        {/* Warning for low time */}
        {isWarningTime && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2 text-warning">
              <Zap className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">
                {isCriticalTime
                  ? "Almost done! Final push!"
                  : "One minute remaining! Stay focused!"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
