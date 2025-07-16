import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageLoading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { adminStorage } from "@/lib/admin-storage";
import { FlowActions } from "@/components/app/FlowActions";
import { MorningSection } from "@/components/app/MorningSection";
import { EveningSection } from "@/components/app/EveningSection";
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
  Loader2,
  Moon,
} from "lucide-react";

type FlowRitualLocal = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number;
  description: string;
  completed: boolean;
  isCore: boolean;
};

interface FlowStateLocal {
  energy: "low" | "medium" | "high";
  focus: "scattered" | "calm" | "sharp";
  mood: "challenged" | "neutral" | "inspired";
  environment: "chaotic" | "okay" | "optimal";
}

interface FlowIdentity {
  archetype: string;
  daysLiving: number;
  currentPhase: "foundation" | "building" | "mastery";
  streak: number;
  startDate: Date;
}

export default function FlowDashboard() {
  const { user, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"morning" | "evening">(
    "morning",
  );
  const [flowState, setFlowState] = useState<FlowStateLocal>({
    energy: "medium",
    focus: "calm",
    mood: "neutral",
    environment: "okay",
  });

  const [rituals, setRituals] = useState<FlowRitualLocal[]>([
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

  const [meditationTimer, setMeditationTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [flowIdentity, setFlowIdentity] = useState<FlowIdentity>({
    archetype: "Deep Worker",
    daysLiving: 1,
    currentPhase: "foundation",
    streak: 1,
    startDate: new Date(),
  });

  // Load admin data from localStorage
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          // Get admin profile
          const profile = adminStorage.getCurrentProfile();

          if (!profile.flowStartDate) {
            // First time setup
            adminStorage.initializeUserFlow("Deep Worker");
          }

          // Calculate days since start
          const startDate = new Date(profile.flowStartDate);
          const daysSinceStart =
            Math.floor(
              (new Date().getTime() - startDate.getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1;

          // Get flow stats
          const stats = adminStorage.getUserFlowStats();

          setFlowIdentity({
            archetype: profile.flowArchetype || "Deep Worker",
            daysLiving: daysSinceStart,
            currentPhase: stats.currentPhase as
              | "foundation"
              | "building"
              | "mastery",
            streak: stats.currentStreak,
            startDate: startDate,
          });

          // Load today's session if it exists
          const todaySession = adminStorage.getTodayFlowSession();
          if (todaySession) {
            setFlowState({
              energy: todaySession.flowState.energy,
              focus: todaySession.flowState.focus,
              mood: todaySession.flowState.mood,
              environment: todaySession.flowState.environment,
            });
            // Add more session data loading as needed
          }

          setLoading(false);
        } catch (error) {
          console.error("Error loading admin flow data:", error);
          setLoading(false);
        }
      };

      loadData();
    }
  }, [user]);

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

  const startMeditationTimer = (minutes: number) => {
    setMeditationTimer(minutes * 60);
    setIsTimerActive(true);
  };

  // Timer effect
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

  const phaseInfo = getPhaseMessage();

  if (authLoading || loading) {
    return <PageLoading message="Loading your flow journey..." />;
  }

  return (
    <AppLayout
      title="Flow Dashboard"
      description="Your personal flow tracking dashboard"
    >
      <div className="pt-4 pb-8 px-4 container mx-auto max-w-6xl">
        {/* Header - Flow Identity */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Sunrise className="h-12 w-12 text-amber-400 animate-pulse" />
              <Sparkles className="h-6 w-6 text-yellow-300 absolute -top-1 -right-1 animate-bounce" />
            </div>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent mb-2">
            Welcome, Flow Practitioner
          </h1>

          <div className="mb-4">
            <Badge
              variant="outline"
              className="bg-green-500/10 border-green-500/30 text-green-400"
            >
              ✨ Admin Mode - Personal Use
            </Badge>
          </div>

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

        {/* Section Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-1">
            <Button
              variant={activeSection === "morning" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("morning")}
              className="mr-1"
            >
              <Sunrise className="h-4 w-4 mr-2" />
              Morning Rituals
            </Button>
            <Button
              variant={activeSection === "evening" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("evening")}
            >
              <Moon className="h-4 w-4 mr-2" />
              Evening Reflection
            </Button>
          </div>
        </div>

        {/* Dynamic Content Based on Active Section */}
        {activeSection === "morning" ? (
          <MorningSection
            rituals={rituals}
            onToggleRitual={toggleRitual}
            onStartMeditationTimer={startMeditationTimer}
            meditationTimer={meditationTimer}
            isTimerActive={isTimerActive}
          />
        ) : (
          <EveningSection />
        )}

        {/* Flow Actions - Always Available */}
        <div className="mt-8">
          <FlowActions />
        </div>
      </div>
    </AppLayout>
  );
}
