import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Brain,
  Heart,
  Target,
  Lightbulb,
  TrendingUp,
  Award,
  MessageSquare,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface CoachingMessage {
  id: string;
  type: "insight" | "challenge" | "encouragement" | "pattern" | "milestone";
  title: string;
  content: string;
  actionable?: string;
  priority: "low" | "medium" | "high";
  phase: "foundation" | "building" | "mastery";
  dayRange: [number, number]; // [min, max] days when this message is relevant
}

interface FlowCoachingProps {
  currentDay: number;
  currentPhase: "foundation" | "building" | "mastery";
  completedRituals: number;
  totalRituals: number;
  streak: number;
  className?: string;
}

export function FlowCoaching({
  currentDay,
  currentPhase,
  completedRituals,
  totalRituals,
  streak,
  className,
}: FlowCoachingProps) {
  const [currentMessage, setCurrentMessage] = useState<CoachingMessage | null>(
    null,
  );
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [userReflection, setUserReflection] = useState("");
  const [showReflectionPrompt, setShowReflectionPrompt] = useState(false);

  const coachingMessages: CoachingMessage[] = [
    // Foundation Phase (Days 1-21)
    {
      id: "foundation-welcome",
      type: "encouragement",
      title: "Welcome to Your Flow Journey",
      content:
        "You're beginning a 66-day transformation into flow mastery. The first 21 days are about building your foundation - focus on consistency over perfection. Small, daily actions create lasting change.",
      actionable: "Complete just one core ritual today. That's a win.",
      priority: "high",
      phase: "foundation",
      dayRange: [1, 3],
    },
    {
      id: "foundation-ritual-importance",
      type: "insight",
      title: "Why Morning Rituals Matter",
      content:
        "Morning rituals aren't just tasks - they're identity statements. Each time you meditate or set an intention, you're providing evidence that you ARE a flow practitioner. This identity shift is more powerful than motivation.",
      actionable: "Notice how you feel different after completing rituals.",
      priority: "medium",
      phase: "foundation",
      dayRange: [4, 10],
    },
    {
      id: "foundation-streak-power",
      type: "pattern",
      title: "The Compound Effect is Working",
      content:
        "Your brain is already adapting. Each day you complete rituals, neural pathways strengthen. You're literally rewiring yourself for flow. The changes might be subtle now, but they're happening.",
      actionable: "Trust the process, even when progress feels slow.",
      priority: "medium",
      phase: "foundation",
      dayRange: [7, 14],
    },
    {
      id: "foundation-resistance",
      type: "insight",
      title: "When Resistance Appears",
      content:
        "Feeling resistance to your rituals? That's normal and actually a good sign - it means you're pushing against old patterns. Resistance often peaks around day 10-14. Push through this and momentum builds.",
      actionable:
        "When resistant, commit to just 2 minutes. Often you'll continue.",
      priority: "high",
      phase: "foundation",
      dayRange: [10, 18],
    },
    {
      id: "foundation-completion",
      type: "milestone",
      title: "Foundation Phase Complete! 🎉",
      content:
        "Incredible! You've completed 21 days of consistent flow practice. Research shows you've passed the first major habit formation milestone. You're now entering the independence building phase.",
      actionable: "Reflect on how you've changed since day 1.",
      priority: "high",
      phase: "foundation",
      dayRange: [21, 21],
    },

    // Building Phase (Days 22-66)
    {
      id: "building-welcome",
      type: "encouragement",
      title: "Building Independence",
      content:
        "The next 45 days are about developing your personal flow patterns. You've proven you can be consistent - now let's optimize. Pay attention to what works best for your unique rhythm.",
      actionable: "Experiment with ritual timing and variations this week.",
      priority: "medium",
      phase: "building",
      dayRange: [22, 28],
    },
    {
      id: "building-patterns",
      type: "pattern",
      title: "Your Flow Patterns Are Emerging",
      content:
        "Notice how your energy and focus vary by day? These patterns are valuable data. Your optimal flow windows, best ritual sequences, and peak performance times are becoming clear.",
      actionable: "Track when you feel most/least flow-ready each day.",
      priority: "medium",
      phase: "building",
      dayRange: [30, 45],
    },
    {
      id: "building-customization",
      type: "insight",
      title: "Make It Yours",
      content:
        "Generic advice only goes so far. You're now experienced enough to customize your practice. What rituals resonate most? What timing works best? Trust your developing intuition.",
      actionable: "Modify one ritual to better fit your personal style.",
      priority: "medium",
      phase: "building",
      dayRange: [35, 50],
    },
    {
      id: "building-social",
      type: "challenge",
      title: "Share Your Practice",
      content:
        "Flow is contagious. Sharing your practice (without preaching) often inspires others and deepens your own commitment. Consider mentoring someone just starting their journey.",
      actionable:
        "Share one insight from your practice with someone you care about.",
      priority: "low",
      phase: "building",
      dayRange: [45, 60],
    },
    {
      id: "building-completion",
      type: "milestone",
      title: "You're a Flow Practitioner! ⭐",
      content:
        "66 days! You've officially crossed the habit formation threshold. These practices are now part of who you are. You've transformed from someone who 'does' flow to someone who 'IS' flow.",
      actionable: "Celebrate this massive achievement - you've earned it!",
      priority: "high",
      phase: "building",
      dayRange: [66, 66],
    },

    // Mastery Phase (Days 67+)
    {
      id: "mastery-welcome",
      type: "encouragement",
      title: "Flow Mastery Unlocked",
      content:
        "Welcome to the mastery phase! You're now among the small percentage who've created lasting change. Your role shifts from student to practitioner to teacher. How will you deepen and share your flow?",
      actionable: "Set one new flow-related learning goal.",
      priority: "medium",
      phase: "mastery",
      dayRange: [67, 75],
    },
    {
      id: "mastery-teaching",
      type: "insight",
      title: "Teaching Deepens Learning",
      content:
        "The best way to deepen mastery is through teaching. Every person you help start their flow journey strengthens your own understanding and commitment.",
      actionable: "Identify one person you could mentor in flow practices.",
      priority: "medium",
      phase: "mastery",
      dayRange: [80, 120],
    },
    {
      id: "mastery-innovation",
      type: "challenge",
      title: "Innovate Your Practice",
      content:
        "You've mastered the fundamentals. Now innovate! What new rituals, techniques, or approaches might enhance your flow? Experimentation is the hallmark of mastery.",
      actionable: "Try one completely new flow-enhancing practice this week.",
      priority: "low",
      phase: "mastery",
      dayRange: [90, 365],
    },
  ];

  // Get relevant coaching message
  useEffect(() => {
    const relevantMessages = coachingMessages.filter(
      (msg) =>
        msg.phase === currentPhase &&
        currentDay >= msg.dayRange[0] &&
        currentDay <= msg.dayRange[1] &&
        !messageHistory.includes(msg.id),
    );

    if (relevantMessages.length > 0) {
      // Prioritize high priority messages
      const highPriority = relevantMessages.filter(
        (msg) => msg.priority === "high",
      );
      const message =
        highPriority.length > 0 ? highPriority[0] : relevantMessages[0];

      setCurrentMessage(message);
    }
  }, [currentDay, currentPhase, messageHistory]);

  const dismissMessage = () => {
    if (currentMessage) {
      setMessageHistory((prev) => [...prev, currentMessage.id]);
      localStorage.setItem(
        "flow-coaching-history",
        JSON.stringify([...messageHistory, currentMessage.id]),
      );
      setCurrentMessage(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "insight":
        return <Lightbulb className="h-4 w-4" />;
      case "challenge":
        return <Target className="h-4 w-4" />;
      case "encouragement":
        return <Heart className="h-4 w-4" />;
      case "pattern":
        return <TrendingUp className="h-4 w-4" />;
      case "milestone":
        return <Award className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "insight":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "challenge":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "encouragement":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "pattern":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "milestone":
        return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      default:
        return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  // Load message history
  useEffect(() => {
    const saved = localStorage.getItem("flow-coaching-history");
    if (saved) {
      setMessageHistory(JSON.parse(saved));
    }
  }, []);

  const getPhaseProgress = () => {
    switch (currentPhase) {
      case "foundation":
        return Math.min((currentDay / 21) * 100, 100);
      case "building":
        return Math.min(((currentDay - 21) / 45) * 100, 100);
      case "mastery":
        return 100;
      default:
        return 0;
    }
  };

  const getPhaseDescription = () => {
    switch (currentPhase) {
      case "foundation":
        return "Building your flow identity through consistent rituals";
      case "building":
        return "Developing your personal flow patterns and independence";
      case "mastery":
        return "Deepening practice and sharing flow wisdom";
      default:
        return "";
    }
  };

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-slate-100">
          <Brain className="h-5 w-5 text-purple-400" />
          <span>Flow Coach</span>
          <Badge
            variant="outline"
            className="text-xs text-purple-400 border-purple-400/30"
          >
            Day {currentDay}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phase Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300 capitalize">
              {currentPhase} Phase
            </span>
            <span className="text-xs text-slate-400">
              {Math.round(getPhaseProgress())}%
            </span>
          </div>
          <Progress value={getPhaseProgress()} className="h-2 mb-1" />
          <p className="text-xs text-slate-500">{getPhaseDescription()}</p>
        </div>

        {/* Current Coaching Message */}
        {currentMessage && (
          <div
            className={cn(
              "p-4 rounded-lg border",
              getTypeColor(currentMessage.type),
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getTypeIcon(currentMessage.type)}
                <h4 className="font-medium text-sm">{currentMessage.title}</h4>
              </div>
              <Badge
                variant="outline"
                className="text-xs capitalize border-current"
              >
                {currentMessage.type}
              </Badge>
            </div>

            <p className="text-sm leading-relaxed mb-3">
              {currentMessage.content}
            </p>

            {currentMessage.actionable && (
              <div className="bg-black/20 p-3 rounded border border-current/30 mb-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Target className="h-3 w-3" />
                  <span className="text-xs font-medium">Action Step:</span>
                </div>
                <p className="text-xs">{currentMessage.actionable}</p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowReflectionPrompt(true)}
                className="flex-1"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Reflect
              </Button>
              <Button size="sm" onClick={dismissMessage} className="flex-1">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Got It
              </Button>
            </div>
          </div>
        )}

        {/* Reflection Prompt */}
        {showReflectionPrompt && (
          <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
            <h4 className="text-sm font-medium text-slate-200 mb-2">
              Reflection Moment
            </h4>
            <Textarea
              value={userReflection}
              onChange={(e) => setUserReflection(e.target.value)}
              placeholder="How does this coaching insight land for you? What comes up?"
              className="bg-slate-700/50 border-slate-600 text-slate-100 text-xs min-h-[60px] mb-3"
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowReflectionPrompt(false);
                  setUserReflection("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  // Save reflection
                  const reflections =
                    JSON.parse(
                      localStorage.getItem("flow-reflections") || "[]",
                    ) || [];
                  reflections.push({
                    date: new Date().toISOString(),
                    day: currentDay,
                    message: currentMessage?.title,
                    reflection: userReflection,
                  });
                  localStorage.setItem(
                    "flow-reflections",
                    JSON.stringify(reflections),
                  );

                  setShowReflectionPrompt(false);
                  setUserReflection("");
                  dismissMessage();
                }}
                disabled={!userReflection.trim()}
                className="flex-1"
              >
                <Heart className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Daily Coaching Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-600">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-400">{streak}</div>
            <div className="text-xs text-slate-400">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-400">
              {Math.round((completedRituals / totalRituals) * 100)}%
            </div>
            <div className="text-xs text-slate-400">Today's Progress</div>
          </div>
        </div>

        {/* Phase-Specific Encouragement */}
        {!currentMessage && (
          <div className="text-center py-4">
            <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-slate-200 mb-1">
              Keep Flowing
            </h4>
            <p className="text-xs text-slate-400">
              {currentPhase === "foundation" &&
                "Every ritual builds your flow identity"}
              {currentPhase === "building" &&
                "Your personal patterns are emerging"}
              {currentPhase === "mastery" && "You're living in flow mastery"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
