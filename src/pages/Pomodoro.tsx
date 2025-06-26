import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Navigation } from "@/components/app/Navigation";
import { PomodoroTimer } from "@/components/app/PomodoroTimer";
import { TaskLinker } from "@/components/app/TaskLinker";
import { FlowStateMonitor } from "@/components/app/FlowStateMonitor";
import { PomodoroSettings } from "@/components/app/PomodoroSettings";
import { FocusMusicSelector } from "@/components/app/FocusMusicSelector";
import { YouTubeMusicPlayer } from "@/components/app/YouTubeMusicPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePomodoro } from "@/hooks/use-pomodoro";
import { getTodayPlan } from "@/lib/storage";
import { formatTimeRemaining } from "@/lib/productivity-utils";
import {
  Clock,
  Brain,
  Target,
  TrendingUp,
  Calendar,
  Award,
  History,
  BarChart3,
} from "lucide-react";

export default function Pomodoro() {
  const location = useLocation();

  const {
    state,
    timeRemaining,
    currentSession,
    linkedTask,
    sessionsCompleted,
    distractionCount,
    flowScore,
    settings,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    skipTimer,
    resetTimer,
    addDistraction,
    setSettings,
    getCurrentDuration,
  } = usePomodoro();

  const [todayPomodoroCount, setTodayPomodoroCount] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  useEffect(() => {
    const loadTodayPlan = async () => {
      try {
        const todayPlan = await getTodayPlan();
        setTodayPomodoroCount(todayPlan.pomodoroCompleted);
        setTotalFocusTime(todayPlan.pomodoroCompleted * settings.focusDuration);
      } catch (error) {
        console.error("Error loading today plan:", error);
      }
    };

    loadTodayPlan();
  }, [sessionsCompleted, settings.focusDuration]);

  // Handle linked task from navigation
  useEffect(() => {
    const linkedTask = location.state?.linkedTask;
    if (linkedTask && state === "idle") {
      handleStartWithTask(linkedTask.id).catch((error) => {
        console.error("Error starting timer with linked task:", error);
      });
    }
  }, [location.state]);

  const handleStartWithTask = async (taskId: string) => {
    await startTimer(taskId);
  };

  const handleStartWithoutTask = async () => {
    await startTimer();
  };

  const handleLinkTask = (taskId: string) => {
    if (state === "idle") {
      handleStartWithTask(taskId);
    }
  };

  const handleUnlinkTask = () => {
    // Just unlink, don't stop the timer
  };

  const formatFocusTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-8 px-4 container mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-focus to-energy bg-clip-text text-transparent">
              Focus Timer
            </h1>
            <PomodoroSettings
              settings={settings}
              onSave={setSettings}
              disabled={state === "running"}
            />
          </div>
          <p className="text-muted-foreground">
            Enter your flow state with the Pomodoro Technique
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Today's Sessions
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {todayPomodoroCount}
                  </p>
                </div>
                <Brain className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-focus/10 to-focus/5 border-focus/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Focus Time
                  </p>
                  <p className="text-2xl font-bold text-focus">
                    {formatFocusTime(totalFocusTime)}
                  </p>
                </div>
                <Clock className="h-6 w-6 text-focus" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-energy/10 to-energy/5 border-energy/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Flow Score
                  </p>
                  <p className="text-2xl font-bold text-energy">{flowScore}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-energy" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-admin/10 to-admin/5 border-admin/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Current Streak
                  </p>
                  <p className="text-2xl font-bold text-admin">
                    {sessionsCompleted}
                  </p>
                </div>
                <Target className="h-6 w-6 text-admin" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer - Takes up more space */}
          <div className="lg:col-span-2 space-y-6">
            <PomodoroTimer
              state={state}
              timeRemaining={timeRemaining}
              totalDuration={getCurrentDuration()}
              onStart={handleStartWithoutTask}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onStop={stopTimer}
              onSkip={skipTimer}
              onReset={resetTimer}
            />

            {/* Task Linking */}
            <TaskLinker
              linkedTask={linkedTask}
              onLinkTask={handleLinkTask}
              onUnlinkTask={handleUnlinkTask}
              disabled={state !== "idle"}
            />
          </div>

          {/* Flow State Monitor and Music */}
          <div className="space-y-6">
            <FocusMusicSelector isTimerRunning={state === "running"} />

            <YouTubeMusicPlayer autoPlay={state === "running"} />

            <FlowStateMonitor
              flowScore={flowScore}
              distractionCount={distractionCount}
              onAddDistraction={addDistraction}
              isTimerRunning={state === "running"}
              sessionsCompleted={sessionsCompleted}
            />

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Target className="h-4 w-4" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  disabled={state !== "idle"}
                  onClick={() => handleStartWithoutTask()}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Quick Focus Session
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={resetTimer}
                  disabled={state === "running"}
                >
                  <History className="h-4 w-4 mr-2" />
                  Reset All Counters
                </Button>
                <div className="text-xs text-muted-foreground text-center pt-2">
                  Focus sessions are automatically saved to your daily progress
                </div>
              </CardContent>
            </Card>

            {/* Session Info */}
            {currentSession && (
              <Card className="border-focus/40 bg-focus/5">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Current Session</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      Started:{" "}
                      {currentSession.startTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div>Duration: {currentSession.duration} minutes</div>
                    {linkedTask && <div>Linked to: {linkedTask.title}</div>}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Achievement Notifications */}
        {sessionsCompleted > 0 && sessionsCompleted % 5 === 0 && (
          <div className="fixed bottom-4 right-4 max-w-sm">
            <Card className="border-energy bg-energy/10 animate-celebration">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Award className="h-8 w-8 text-energy animate-bounce" />
                  <div>
                    <div className="font-medium text-energy">
                      Amazing Progress! 🎉
                    </div>
                    <div className="text-sm text-muted-foreground">
                      You've completed {sessionsCompleted} focus sessions!
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
