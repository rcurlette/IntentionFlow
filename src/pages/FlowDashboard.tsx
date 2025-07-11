import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/app/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"morning" | "evening">(
    "morning",
  );
  const [flowState, setFlowState] = useState<FlowStateLocal>({
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

  // Simplified loading logic for now
  useEffect(() => {
    if (user) {
      // Initialize with basic data
      setLoading(false);
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

  const phaseInfo = getPhaseMessage();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-slate-300">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your flow journey...</span>
        </div>
      </div>
    );
  }

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
            Welcome, Flow Practitioner
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
        {activeSection === "morning" ? <MorningSection /> : <EveningSection />}

        {/* Flow Actions - Always Available */}
        <div className="mt-8">
          <FlowActions />
        </div>
      </main>
    </div>
  );
}
