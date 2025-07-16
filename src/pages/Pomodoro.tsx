import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Clock, Coffee, Zap } from "lucide-react";

type SessionType = "focus" | "shortBreak" | "longBreak";

interface PomodoroSession {
  id: string;
  type: SessionType;
  duration: number;
  completed: boolean;
  startTime?: Date;
}

export default function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(
    null,
  );

  const durations = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Session completed
      setIsActive(false);
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    if (sessionType === "focus") {
      setSessionsCompleted((prev) => prev + 1);
      // Auto-switch to break
      if ((sessionsCompleted + 1) % 4 === 0) {
        setSessionType("longBreak");
        setTimeLeft(durations.longBreak);
      } else {
        setSessionType("shortBreak");
        setTimeLeft(durations.shortBreak);
      }
    } else {
      // Switch back to focus after break
      setSessionType("focus");
      setTimeLeft(durations.focus);
    }
  };

  const startTimer = () => {
    setIsActive(true);
    if (!currentSession) {
      setCurrentSession({
        id: Date.now().toString(),
        type: sessionType,
        duration: durations[sessionType],
        completed: false,
        startTime: new Date(),
      });
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durations[sessionType]);
    setCurrentSession(null);
  };

  const switchSession = (type: SessionType) => {
    setSessionType(type);
    setTimeLeft(durations[type]);
    setIsActive(false);
    setCurrentSession(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    return ((durations[sessionType] - timeLeft) / durations[sessionType]) * 100;
  };

  const getSessionIcon = () => {
    switch (sessionType) {
      case "focus":
        return <Zap className="h-5 w-5" />;
      case "shortBreak":
        return <Coffee className="h-5 w-5" />;
      case "longBreak":
        return <Clock className="h-5 w-5" />;
    }
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case "focus":
        return "text-red-400 border-red-500";
      case "shortBreak":
        return "text-green-400 border-green-500";
      case "longBreak":
        return "text-blue-400 border-blue-500";
    }
  };

  return (
    <AppLayout
      title="Pomodoro Timer"
      description="Flow-optimized focus sessions"
    >
      <div className="pt-4 pb-8 px-4 container mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Pomodoro Timer</h1>
          <p className="text-slate-400">
            Structured focus sessions for optimal flow
          </p>
        </div>

        {/* Main Timer */}
        <div className="max-w-md mx-auto mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                {getSessionIcon()}
                <span className={getSessionColor()}>
                  {sessionType === "focus"
                    ? "Focus Session"
                    : sessionType === "shortBreak"
                      ? "Short Break"
                      : "Long Break"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {/* Timer Display */}
              <div className="mb-6">
                <div className="text-6xl font-mono font-bold text-white mb-4">
                  {formatTime(timeLeft)}
                </div>
                <Progress
                  value={getProgress()}
                  className="h-2 mb-4"
                  // className={`h-2 mb-4 ${getSessionColor()}`}
                />
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Badge variant="outline" className={getSessionColor()}>
                    Session {sessionsCompleted + 1}
                  </Badge>
                  <Badge variant="secondary">
                    {Math.floor(getProgress())}% Complete
                  </Badge>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={isActive ? pauseTimer : startTimer}
                  size="lg"
                  className="flex items-center space-x-2"
                >
                  {isActive ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                  <span>{isActive ? "Pause" : "Start"}</span>
                </Button>
                <Button
                  onClick={resetTimer}
                  variant="outline"
                  size="lg"
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Reset</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Type Selector */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => switchSession("focus")}
              variant={sessionType === "focus" ? "default" : "outline"}
              className="flex flex-col items-center justify-center space-y-1 h-16 px-2"
            >
              <Zap className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium">Focus</span>
              <span className="text-xs text-muted-foreground">25m</span>
            </Button>
            <Button
              onClick={() => switchSession("shortBreak")}
              variant={sessionType === "shortBreak" ? "default" : "outline"}
              className="flex flex-col items-center justify-center space-y-1 h-16 px-2"
            >
              <Coffee className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium">Short Break</span>
              <span className="text-xs text-muted-foreground">5m</span>
            </Button>
            <Button
              onClick={() => switchSession("longBreak")}
              variant={sessionType === "longBreak" ? "default" : "outline"}
              className="flex flex-col items-center justify-center space-y-1 h-16 px-2"
            >
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium">Long Break</span>
              <span className="text-xs text-muted-foreground">15m</span>
            </Button>
          </div>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-white">
                {sessionsCompleted}
              </div>
              <div className="text-sm text-slate-400">Sessions Today</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-white">
                {Math.floor((sessionsCompleted * 25) / 60)}h{" "}
                {(sessionsCompleted * 25) % 60}m
              </div>
              <div className="text-sm text-slate-400">Focus Time</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-white">7</div>
              <div className="text-sm text-slate-400">Day Streak</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
