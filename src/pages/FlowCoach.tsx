import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/app/Navigation";
import { FlowCoaching } from "@/components/app/FlowCoaching";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getFlowProgress,
  getTodayFlowSession,
  getFlowInsights,
} from "@/lib/flow-storage";
import {
  Brain,
  Heart,
  ArrowLeft,
  BookOpen,
  Target,
  Lightbulb,
  TrendingUp,
  Calendar,
  Clock,
  Sparkles,
  MessageSquare,
  Star,
  Trophy,
} from "lucide-react";

interface FlowIdentity {
  archetype: string;
  daysLiving: number;
  currentPhase: "foundation" | "building" | "mastery";
  streak: number;
  startDate: Date;
}

interface Reflection {
  date: string;
  day: number;
  message: string;
  reflection: string;
}

export default function FlowCoach() {
  const [flowIdentity, setFlowIdentity] = useState<FlowIdentity>({
    archetype: "Deep Worker",
    daysLiving: 1,
    currentPhase: "foundation",
    streak: 1,
    startDate: new Date(),
  });

  const [completedRituals, setCompletedRituals] = useState(0);
  const [totalRituals, setTotalRituals] = useState(5);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [newReflection, setNewReflection] = useState("");
  const [showReflectionForm, setShowReflectionForm] = useState(false);

  // Load flow data on mount
  useEffect(() => {
    const flowData = getFlowProgress();

    if (flowData) {
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
    }

    // Load today's session to get ritual completion status
    const todaySession = getTodayFlowSession();
    if (todaySession) {
      const completed = todaySession.rituals.filter((r) => r.completed).length;
      setCompletedRituals(completed);
      setTotalRituals(todaySession.rituals.length);
    }

    // Load reflections
    const savedReflections = localStorage.getItem("flow-reflections");
    if (savedReflections) {
      setReflections(JSON.parse(savedReflections));
    }
  }, []);

  const saveReflection = () => {
    if (!newReflection.trim()) return;

    const reflection: Reflection = {
      date: new Date().toISOString(),
      day: flowIdentity.daysLiving,
      message: "Personal Reflection",
      reflection: newReflection,
    };

    const updatedReflections = [reflection, ...reflections];
    setReflections(updatedReflections);
    localStorage.setItem(
      "flow-reflections",
      JSON.stringify(updatedReflections),
    );
    setNewReflection("");
    setShowReflectionForm(false);
  };

  const getPhaseInfo = () => {
    if (flowIdentity.daysLiving <= 21) {
      return {
        phase: "Foundation Building",
        description: "Building your flow identity through consistent rituals",
        progress: (flowIdentity.daysLiving / 21) * 100,
        daysLeft: 21 - flowIdentity.daysLiving,
        color: "text-blue-400 border-blue-400/30",
        bgColor: "bg-blue-400/10",
      };
    } else if (flowIdentity.daysLiving <= 66) {
      return {
        phase: "Independence Growing",
        description: "Developing your personal flow patterns",
        progress: ((flowIdentity.daysLiving - 21) / 45) * 100,
        daysLeft: 66 - flowIdentity.daysLiving,
        color: "text-purple-400 border-purple-400/30",
        bgColor: "bg-purple-400/10",
      };
    } else {
      return {
        phase: "Flow Mastery",
        description: "Living as an embodied flow practitioner",
        progress: 100,
        daysLeft: 0,
        color: "text-gold-400 border-gold-400/30",
        bgColor: "bg-gold-400/10",
      };
    }
  };

  const phaseInfo = getPhaseInfo();

  const insights = getFlowInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />

      <main className="pt-20 pb-8 px-4 container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="text-slate-400 hover:text-slate-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Flow Dashboard
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Brain className="h-12 w-12 text-purple-400 animate-pulse" />
                <Sparkles className="h-6 w-6 text-yellow-300 absolute -top-1 -right-1 animate-bounce" />
              </div>
            </div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              Your Flow Coach
            </h1>

            <p className="text-slate-300 text-lg mb-4">
              Personalized guidance for your flow journey
            </p>

            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={cn("border-current", phaseInfo.color)}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Day {flowIdentity.daysLiving}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={cn("border-current", phaseInfo.color)}
                >
                  <Trophy className="h-3 w-3 mr-1" />
                  {flowIdentity.archetype}
                </Badge>
              </div>

              <div className="flex items-center space-x-2 text-slate-400">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{flowIdentity.streak} day streak</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Coaching Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Coaching Widget */}
            <FlowCoaching
              currentDay={flowIdentity.daysLiving}
              currentPhase={flowIdentity.currentPhase}
              completedRituals={completedRituals}
              totalRituals={totalRituals}
              streak={flowIdentity.streak}
              className="w-full"
            />

            {/* Phase Progress Detail */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-100">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  <span>Journey Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={cn(
                    "p-4 rounded-lg border",
                    phaseInfo.color,
                    phaseInfo.bgColor,
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{phaseInfo.phase}</h3>
                    <span className="text-sm">
                      {Math.round(phaseInfo.progress)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                    <div
                      className="bg-current h-2 rounded-full transition-all duration-300"
                      style={{ width: `${phaseInfo.progress}%` }}
                    />
                  </div>

                  <p className="text-sm opacity-90">{phaseInfo.description}</p>

                  {phaseInfo.daysLeft > 0 && (
                    <div className="mt-3 flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{phaseInfo.daysLeft} days to next phase</span>
                    </div>
                  )}
                </div>

                {/* Phase Milestones */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-300">
                    Journey Milestones
                  </h4>
                  <div className="space-y-2">
                    <div
                      className={cn(
                        "flex items-center space-x-3 p-2 rounded",
                        flowIdentity.daysLiving >= 21
                          ? "text-green-400 bg-green-400/10"
                          : "text-slate-400 bg-slate-700/30",
                      )}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          flowIdentity.daysLiving >= 21
                            ? "bg-green-400"
                            : "bg-slate-400",
                        )}
                      />
                      <span className="text-sm">
                        Foundation Complete (Day 21)
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center space-x-3 p-2 rounded",
                        flowIdentity.daysLiving >= 66
                          ? "text-green-400 bg-green-400/10"
                          : "text-slate-400 bg-slate-700/30",
                      )}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          flowIdentity.daysLiving >= 66
                            ? "bg-green-400"
                            : "bg-slate-400",
                        )}
                      />
                      <span className="text-sm">
                        Habit Formation Complete (Day 66)
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center space-x-3 p-2 rounded",
                        flowIdentity.daysLiving >= 90
                          ? "text-green-400 bg-green-400/10"
                          : "text-slate-400 bg-slate-700/30",
                      )}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          flowIdentity.daysLiving >= 90
                            ? "bg-green-400"
                            : "bg-slate-400",
                        )}
                      />
                      <span className="text-sm">Flow Mastery (Day 90+)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Reflection Journal */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-slate-100">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-amber-400" />
                    <span>Reflection Journal</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowReflectionForm(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Reflection
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {showReflectionForm && (
                  <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                    <h4 className="text-sm font-medium text-slate-200 mb-3">
                      How are you feeling about your flow journey?
                    </h4>
                    <Textarea
                      value={newReflection}
                      onChange={(e) => setNewReflection(e.target.value)}
                      placeholder="What insights, challenges, or breakthroughs are you experiencing?"
                      className="bg-slate-700/50 border-slate-600 text-slate-100 min-h-[100px] mb-3"
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowReflectionForm(false);
                          setNewReflection("");
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveReflection}
                        disabled={!newReflection.trim()}
                        className="flex-1"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Save Reflection
                      </Button>
                    </div>
                  </div>
                )}

                {reflections.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {reflections.slice(0, 5).map((reflection, index) => (
                      <div
                        key={index}
                        className="bg-slate-700/30 p-3 rounded border border-slate-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400">
                            Day {reflection.day} •{" "}
                            {new Date(reflection.date).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {reflection.message}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-200">
                          {reflection.reflection}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No reflections yet</p>
                    <p className="text-xs">
                      Start journaling your flow journey
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Quick Stats & Insights */}
          <div className="space-y-6">
            {/* Flow Insights */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-100">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  <span>Flow Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.patterns.length > 0 ? (
                  <div className="space-y-2">
                    {insights.patterns.slice(0, 3).map((pattern, index) => (
                      <div
                        key={index}
                        className="text-xs p-2 bg-slate-700/30 rounded border border-slate-600"
                      >
                        {pattern}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Complete more sessions to unlock personal insights
                  </p>
                )}

                <div className="pt-3 border-t border-slate-600">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">
                    Flow Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-slate-700/30 rounded">
                      <div className="font-semibold text-blue-400">
                        {insights.totalSessions}
                      </div>
                      <div className="text-slate-400">Sessions</div>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded">
                      <div className="font-semibold text-green-400">
                        {insights.completionRate}%
                      </div>
                      <div className="text-slate-400">Completion</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-100">
                  <Target className="h-5 w-5 text-green-400" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/">
                    <Brain className="h-4 w-4 mr-2" />
                    Return to Flow Dashboard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/analytics">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Detailed Analytics
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/tasks">
                    <Target className="h-4 w-4 mr-2" />
                    Manage Tasks
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
