import { useState, useEffect } from "react";
import { Navigation } from "@/components/app/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import {
  getFlowProgress,
  getTodayFlowSession,
  saveFlowSession,
  initializeFlowJourney,
  getFlowInsights,
} from "@/lib/flow-storage";
import { FlowActions } from "@/components/app/FlowActions";
import { FlowCoaching } from "@/components/app/FlowCoaching";
import {
  Sunrise,
  Brain,
  Heart,
  Zap,
  Eye,
  Target,
  Sparkles,
  Timer,
  CheckCircle2,
  Circle,
  Mountain,
  Waves,
  Flame,
  Leaf,
  Clock,
  Calendar,
  Activity,
} from "lucide-react";

interface FlowState {
  energy: "low" | "medium" | "high";
  focus: "scattered" | "calm" | "sharp";
  mood: "challenged" | "neutral" | "inspired";
  environment: "chaotic" | "okay" | "optimal";
}

interface FlowRitual {
  id: string;
  name: string;
  icon: any;
  duration: number;
  description: string;
  completed: boolean;
  isCore: boolean;
}

interface FlowIdentity {
  archetype: string;
  daysLiving: number;
  currentPhase: "foundation" | "building" | "mastery";
  streak: number;
  startDate: Date;
}

export default function FlowDashboard() {
  const [flowState, setFlowState] = useState<FlowState>({
    energy: "medium",
    focus: "calm",
    mood: "neutral",
    environment: "okay",
  });

  const [flowIdentity, setFlowIdentity] = useState<FlowIdentity>({
    archetype: "Deep Worker",
    daysLiving: 1,
    currentPhase: "foundation",
    streak: 1,
    startDate: new Date(),
  });

  const [rituals, setRituals] = useState<FlowRitual[]>([
    {
      id: "meditation",
      name: "Mindful Presence",
      icon: Brain,
      duration: 5,
      description: "Center your mind and body",
      completed: false,
      isCore: true,
    },
    {
      id: "intention",
      name: "Flow Intention",
      icon: Target,
      duration: 3,
      description: "Set your flow intention for today",
      completed: false,
      isCore: true,
    },
    {
      id: "energy",
      name: "Energy Assessment",
      icon: Zap,
      duration: 2,
      description: "Tune into your current state",
      completed: false,
      isCore: true,
    },
    {
      id: "environment",
      name: "Space Optimization",
      icon: Eye,
      duration: 3,
      description: "Prepare your flow environment",
      completed: false,
      isCore: false,
    },
    {
      id: "vision",
      name: "Vision Alignment",
      icon: Heart,
      duration: 2,
      description: "Connect with your deeper purpose",
      completed: false,
      isCore: false,
    },
  ]);

  const [morningIntention, setMorningIntention] = useState("");
  const [meditationTimer, setMeditationTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [visionBoard, setVisionBoard] = useState<string | null>(null);

  // Load flow data on mount
  useEffect(() => {
    const flowData = getFlowProgress();

    if (!flowData) {
      // First time user - initialize with default archetype
      setIsFirstTime(true);
      const identity = initializeFlowJourney("Deep Worker");
      setFlowIdentity({
        archetype: identity.archetype,
        daysLiving: 1,
        currentPhase: identity.currentPhase,
        streak: identity.currentStreak,
        startDate: identity.startDate,
      });
    } else {
      // Load existing data
      const daysSinceStart =
        Math.floor(
          (new Date().getTime() - flowData.identity.startDate.getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1;

      setFlowIdentity({
        archetype: flowData.identity.archetype,
        daysLiving: daysSinceStart,
        currentPhase: flowData.identity.currentPhase,
        streak: flowData.identity.currentStreak,
        startDate: flowData.identity.startDate,
      });

      // Load today's session if it exists
      const todaySession = getTodayFlowSession();
      if (todaySession) {
        setFlowState(todaySession.flowState);
        setMorningIntention(todaySession.intention);
        setRituals((prev) =>
          prev.map((ritual) => {
            const todayRitual = todaySession.rituals.find(
              (r) => r.id === ritual.id,
            );
            return todayRitual
              ? { ...ritual, completed: todayRitual.completed }
              : ritual;
          }),
        );
      }

      // Load vision board
      const savedVisionBoard = localStorage.getItem("flow-vision-board");
      if (savedVisionBoard) {
        setVisionBoard(savedVisionBoard);
      }
    }
  }, []);

  // Save session when data changes
  useEffect(() => {
    if (flowIdentity.daysLiving > 0) {
      const saveSession = () => {
        const today = new Date().toISOString().split("T")[0];
        saveFlowSession({
          date: today,
          rituals: rituals.map((r) => ({
            id: r.id,
            name: r.name,
            duration: r.duration,
            description: r.description,
            completed: r.completed,
            completedAt: r.completed ? new Date() : undefined,
            isCore: r.isCore,
          })),
          flowState: {
            ...flowState,
            assessedAt: new Date(),
          },
          intention: morningIntention,
          completedAt: rituals.filter((r) => r.isCore).every((r) => r.completed)
            ? new Date()
            : undefined,
        });
      };

      // Debounce saves
      const timeoutId = setTimeout(saveSession, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [rituals, flowState, morningIntention, flowIdentity.daysLiving]);

  const completedRituals = rituals.filter((r) => r.completed).length;
  const totalRituals = rituals.length;
  const coreRituals = rituals.filter((r) => r.isCore);
  const completedCore = coreRituals.filter((r) => r.completed).length;

  const getPhaseMessage = () => {
    if (flowIdentity.daysLiving <= 21) {
      return {
        phase: "Foundation Building",
        message: "Building your flow identity through consistent rituals",
        daysLeft: 21 - flowIdentity.daysLiving,
        color: "text-blue-400",
      };
    } else if (flowIdentity.daysLiving <= 66) {
      return {
        phase: "Independence Growing",
        message: "Developing your personal flow patterns",
        daysLeft: 66 - flowIdentity.daysLiving,
        color: "text-purple-400",
      };
    } else {
      return {
        phase: "Flow Mastery",
        message: "Living as an embodied flow practitioner",
        daysLeft: 0,
        color: "text-gold-400",
      };
    }
  };

  const toggleRitual = (id: string) => {
    setRituals((prev) =>
      prev.map((ritual) =>
        ritual.id === id ? { ...ritual, completed: !ritual.completed } : ritual,
      ),
    );
  };

  const getEnergyIcon = (level: string) => {
    switch (level) {
      case "low":
        return <Leaf className="h-4 w-4 text-green-400" />;
      case "medium":
        return <Waves className="h-4 w-4 text-blue-400" />;
      case "high":
        return <Flame className="h-4 w-4 text-orange-400" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getFocusIcon = (level: string) => {
    switch (level) {
      case "scattered":
        return <Activity className="h-4 w-4 text-red-400" />;
      case "calm":
        return <Waves className="h-4 w-4 text-blue-400" />;
      case "sharp":
        return <Mountain className="h-4 w-4 text-purple-400" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const startMeditationTimer = (minutes: number) => {
    setMeditationTimer(minutes * 60);
    setIsTimerActive(true);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && meditationTimer > 0) {
      interval = setInterval(() => {
        setMeditationTimer((prev) => prev - 1);
      }, 1000);
    } else if (meditationTimer === 0 && isTimerActive) {
      setIsTimerActive(false);
      toggleRitual("meditation");
    }
    return () => clearInterval(interval);
  }, [isTimerActive, meditationTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVisionBoardUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setVisionBoard(imageData);
        localStorage.setItem("flow-vision-board", imageData);
        toggleRitual("vision");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVisionBoard = () => {
    setVisionBoard(null);
    localStorage.removeItem("flow-vision-board");
    setRituals((prev) =>
      prev.map((ritual) =>
        ritual.id === "vision" ? { ...ritual, completed: false } : ritual,
      ),
    );
  };

  const phaseInfo = getPhaseMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />

      <main className="pt-20 pb-8 px-4 container mx-auto max-w-6xl">
        {/* Header - Flow Identity */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Sunrise className="h-12 w-12 text-amber-400 animate-pulse" />
              <Sparkles className="h-6 w-6 text-yellow-300 absolute -top-1 -right-1 animate-bounce" />
            </div>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent mb-2">
            Good Morning, Flow Practitioner
          </h1>

          <p className="text-slate-300 text-lg mb-4">
            Day{" "}
            <span className="font-bold text-amber-400">
              {flowIdentity.daysLiving}
            </span>{" "}
            of living as a{" "}
            <span className="font-semibold text-blue-400">
              {flowIdentity.archetype}
            </span>
          </p>

          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className={cn("border-current", phaseInfo.color)}
              >
                <Timer className="h-3 w-3 mr-1" />
                {phaseInfo.phase}
              </Badge>
            </div>

            <div className="flex items-center space-x-2 text-slate-400">
              <Flame className="h-4 w-4 text-orange-400" />
              <span>{flowIdentity.streak} day streak</span>
            </div>

            {phaseInfo.daysLeft > 0 && (
              <div className="flex items-center space-x-2 text-slate-400">
                <Calendar className="h-4 w-4 text-purple-400" />
                <span>{phaseInfo.daysLeft} days to next phase</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Flow Coaching */}
          <FlowCoaching
            currentDay={flowIdentity.daysLiving}
            currentPhase={flowIdentity.currentPhase}
            completedRituals={completedRituals}
            totalRituals={totalRituals}
            streak={flowIdentity.streak}
          />

          {/* Flow State Assessment */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-100">
                <Heart className="h-5 w-5 text-pink-400" />
                <span>Current Flow State</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Energy Level */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Energy Level
                </label>
                <div className="flex space-x-2">
                  {["low", "medium", "high"].map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={
                        flowState.energy === level ? "default" : "outline"
                      }
                      onClick={() =>
                        setFlowState((prev) => ({
                          ...prev,
                          energy: level as any,
                        }))
                      }
                      className="flex-1 h-8"
                    >
                      {getEnergyIcon(level)}
                      <span className="ml-1 capitalize">{level}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Focus Quality */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Mental Focus
                </label>
                <div className="flex space-x-2">
                  {["scattered", "calm", "sharp"].map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={
                        flowState.focus === level ? "default" : "outline"
                      }
                      onClick={() =>
                        setFlowState((prev) => ({
                          ...prev,
                          focus: level as any,
                        }))
                      }
                      className="flex-1 h-8"
                    >
                      {getFocusIcon(level)}
                      <span className="ml-1 capitalize">{level}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Inner State
                </label>
                <div className="flex space-x-2">
                  {["challenged", "neutral", "inspired"].map((mood) => (
                    <Button
                      key={mood}
                      size="sm"
                      variant={flowState.mood === mood ? "default" : "outline"}
                      onClick={() =>
                        setFlowState((prev) => ({ ...prev, mood: mood as any }))
                      }
                      className="flex-1 h-8 text-xs"
                    >
                      <span className="capitalize">{mood}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Complete Assessment */}
              <Button
                className="w-full mt-4"
                onClick={() => toggleRitual("energy")}
                disabled={rituals.find((r) => r.id === "energy")?.completed}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {rituals.find((r) => r.id === "energy")?.completed
                  ? "Assessment Complete"
                  : "Complete Assessment"}
              </Button>
            </CardContent>
          </Card>

          {/* Flow Rituals */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-slate-100">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <span>Morning Flow Rituals</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {completedCore}/{coreRituals.length} Core
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rituals.map((ritual) => (
                <div
                  key={ritual.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-all",
                    ritual.completed
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-slate-700/30 border-slate-600 hover:border-slate-500",
                  )}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (ritual.id === "meditation" && !ritual.completed) {
                        // Show meditation timer options
                        return;
                      }
                      toggleRitual(ritual.id);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    {ritual.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>

                  <ritual.icon
                    className={cn(
                      "h-4 w-4",
                      ritual.completed ? "text-green-400" : "text-slate-400",
                    )}
                  />

                  <div className="flex-1">
                    <h4
                      className={cn(
                        "font-medium text-sm",
                        ritual.completed ? "text-green-300" : "text-slate-200",
                      )}
                    >
                      {ritual.name}
                      {ritual.isCore && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Core
                        </Badge>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {ritual.description}
                    </p>
                  </div>

                  <div className="text-xs text-slate-400">
                    {ritual.duration}m
                  </div>
                </div>
              ))}

              {/* Meditation Timer */}
              {!rituals.find((r) => r.id === "meditation")?.completed && (
                <div className="mt-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                  <h4 className="text-sm font-medium text-slate-200 mb-2">
                    Quick Meditation Timer
                  </h4>
                  {!isTimerActive ? (
                    <div className="flex space-x-2">
                      {[2, 5, 10].map((minutes) => (
                        <Button
                          key={minutes}
                          size="sm"
                          variant="outline"
                          onClick={() => startMeditationTimer(minutes)}
                          className="flex-1"
                        >
                          {minutes}m
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl font-mono text-blue-400 mb-2">
                        {formatTime(meditationTimer)}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsTimerActive(false);
                          setMeditationTimer(0);
                        }}
                      >
                        Stop
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Overall Progress */}
              <div className="mt-4 pt-4 border-t border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">
                    Morning Progress
                  </span>
                  <span className="text-sm text-slate-400">
                    {completedRituals}/{totalRituals}
                  </span>
                </div>
                <Progress
                  value={(completedRituals / totalRituals) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Flow Intention */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-100">
                <Target className="h-5 w-5 text-amber-400" />
                <span>Today's Flow Intention</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  How do you want to show up today?
                </label>
                <Textarea
                  value={morningIntention}
                  onChange={(e) => setMorningIntention(e.target.value)}
                  placeholder="I intend to flow with deep focus and creative energy..."
                  className="bg-slate-700/50 border-slate-600 text-slate-100 min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300">
                  Suggested Flow Intentions
                </h4>
                {[
                  "Deep work with sustained attention",
                  "Creative exploration with playful energy",
                  "Calm productivity with gentle focus",
                  "Bold action with confident momentum",
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setMorningIntention(suggestion)}
                    className="w-full text-left justify-start h-auto py-2 px-3 text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>

              <Button
                className="w-full"
                onClick={() => toggleRitual("intention")}
                disabled={
                  !morningIntention.trim() ||
                  rituals.find((r) => r.id === "intention")?.completed
                }
              >
                <Target className="h-4 w-4 mr-2" />
                {rituals.find((r) => r.id === "intention")?.completed
                  ? "Intention Set"
                  : "Set Intention"}
              </Button>

              {/* Vision Board Section */}
              <div className="mt-6 pt-4 border-t border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-slate-300">
                    Vision Board
                  </h4>
                  <Badge
                    variant={
                      rituals.find((r) => r.id === "vision")?.completed
                        ? "default"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {rituals.find((r) => r.id === "vision")?.completed
                      ? "Connected"
                      : "Optional"}
                  </Badge>
                </div>

                {visionBoard ? (
                  <div className="space-y-3">
                    <div className="relative group">
                      <img
                        src={visionBoard}
                        alt="Vision Board"
                        className="w-full h-32 object-cover rounded-lg border border-slate-600"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={removeVisionBoard}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 text-center">
                      Your vision anchors your flow intention
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
                      <Heart className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-400 mb-3">
                        Upload your vision board to anchor your flow
                      </p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleVisionBoardUpload}
                          className="hidden"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="pointer-events-none"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Upload Vision Board
                        </Button>
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      Goals, dreams, or visual inspiration to fuel your flow
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flow Transition */}
        {completedCore === coreRituals.length && (
          <div className="mt-6 space-y-6">
            <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <CheckCircle2 className="h-12 w-12 text-green-400" />
                    <Sparkles className="h-6 w-6 text-yellow-300 absolute -top-1 -right-1 animate-bounce" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-green-300 mb-2">
                  Flow State Activated ✨
                </h3>
                <p className="text-slate-300 mb-4">
                  Morning rituals complete! Use quick flow actions throughout
                  the day to maintain your flow state.
                </p>

                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Begin Flow Work
                </Button>
              </CardContent>
            </Card>

            {/* Flow Actions Section */}
            <FlowActions />
          </div>
        )}

        {/* Flow Actions Always Available (when rituals not complete) */}
        {completedCore < coreRituals.length && (
          <div className="mt-6">
            <FlowActions />
          </div>
        )}
      </main>
    </div>
  );
}
