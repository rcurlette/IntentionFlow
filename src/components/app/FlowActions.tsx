import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Zap,
  Brain,
  Eye,
  Heart,
  Wind,
  Mountain,
  Timer,
  CheckCircle2,
  Waves,
  Sparkles,
  Target,
  Leaf,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

interface FlowAction {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number; // in seconds
  description: string;
  category: "reset" | "boost" | "align" | "assess";
  instructions: string[];
  completedToday?: number;
  streakCount?: number;
}

interface FlowActionProps {
  className?: string;
  onActionComplete?: (actionId: string) => void;
}

export function FlowActions({ className, onActionComplete }: FlowActionProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dailyActions, setDailyActions] = useState<Record<string, number>>({});

  const flowActions: FlowAction[] = [
    {
      id: "breath-reset",
      name: "Breath Reset",
      icon: Wind,
      duration: 30,
      category: "reset",
      description: "30-second breathing to center yourself",
      instructions: [
        "Sit or stand comfortably",
        "Inhale slowly for 4 counts",
        "Hold for 4 counts",
        "Exhale slowly for 6 counts",
        "Repeat until timer completes",
      ],
    },
    {
      id: "posture-check",
      name: "Posture Flow",
      icon: Mountain,
      duration: 60,
      category: "boost",
      description: "1-minute body awareness and alignment",
      instructions: [
        "Notice your current posture",
        "Roll shoulders back and down",
        "Lengthen your spine",
        "Relax your jaw and face",
        "Take 3 deep breaths in this aligned position",
      ],
    },
    {
      id: "environment-scan",
      name: "Space Optimization",
      icon: Eye,
      duration: 90,
      category: "align",
      description: "Quick environment alignment for flow",
      instructions: [
        "Look around your current space",
        "Remove one distracting item",
        "Adjust lighting if needed",
        "Clear your immediate work area",
        "Set one intention for this space",
      ],
    },
    {
      id: "energy-pulse",
      name: "Energy Pulse Check",
      icon: Zap,
      duration: 45,
      category: "assess",
      description: "Quick energy level assessment",
      instructions: [
        "Close your eyes and scan your body",
        "Notice your energy level (1-10)",
        "Identify where you feel most energized",
        "Notice any areas of tension",
        "Set an energy intention for the next hour",
      ],
    },
    {
      id: "micro-meditation",
      name: "Micro Flow State",
      icon: Brain,
      duration: 120,
      category: "boost",
      description: "2-minute flow state activation",
      instructions: [
        "Close your eyes and breathe naturally",
        "Notice thoughts without judgment",
        "Focus on the sensation of breathing",
        "When mind wanders, gently return to breath",
        "End with one intention for focused work",
      ],
    },
    {
      id: "intention-check",
      name: "Intention Realign",
      icon: Target,
      duration: 75,
      category: "align",
      description: "Quick check-in with your deeper purpose",
      instructions: [
        "Pause current activity",
        "Ask: 'Why am I doing this?'",
        "Connect with your deeper intention",
        "Adjust approach if needed",
        "Proceed with renewed purpose",
      ],
    },
  ];

  // Load daily actions from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(`flow-actions-${today}`);
    if (saved) {
      setDailyActions(JSON.parse(saved));
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isRunning) {
      completeAction();
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const startAction = (action: FlowAction) => {
    setActiveAction(action.id);
    setTimer(action.duration);
    setCurrentStep(0);
    setIsRunning(true);
  };

  const completeAction = () => {
    if (activeAction) {
      const today = new Date().toISOString().split("T")[0];
      const newDailyActions = {
        ...dailyActions,
        [activeAction]: (dailyActions[activeAction] || 0) + 1,
      };
      setDailyActions(newDailyActions);
      localStorage.setItem(
        `flow-actions-${today}`,
        JSON.stringify(newDailyActions),
      );

      onActionComplete?.(activeAction);
    }

    resetAction();
  };

  const resetAction = () => {
    setActiveAction(null);
    setTimer(0);
    setIsRunning(false);
    setCurrentStep(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "reset":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "boost":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "align":
        return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      case "assess":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      default:
        return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "reset":
        return <RotateCcw className="h-3 w-3" />;
      case "boost":
        return <Zap className="h-3 w-3" />;
      case "align":
        return <Target className="h-3 w-3" />;
      case "assess":
        return <Eye className="h-3 w-3" />;
      default:
        return <Sparkles className="h-3 w-3" />;
    }
  };

  const totalActionsToday = Object.values(dailyActions).reduce(
    (sum, count) => sum + count,
    0,
  );

  if (activeAction) {
    const action = flowActions.find((a) => a.id === activeAction);
    if (!action) return null;

    return (
      <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-100">
            <div className="flex items-center space-x-2">
              <action.icon className="h-5 w-5 text-blue-400" />
              <span>{action.name}</span>
            </div>
            <Badge
              variant="outline"
              className={getCategoryColor(action.category)}
            >
              {getCategoryIcon(action.category)}
              <span className="ml-1 capitalize">{action.category}</span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-4xl font-mono text-blue-400 mb-2">
              {formatTime(timer)}
            </div>
            <Progress
              value={((action.duration - timer) / action.duration) * 100}
              className="h-2 mb-4"
            />
          </div>

          {/* Current Instruction */}
          <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">
                Step {Math.min(currentStep + 1, action.instructions.length)} of{" "}
                {action.instructions.length}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setCurrentStep((prev) =>
                    Math.min(prev + 1, action.instructions.length - 1),
                  )
                }
                disabled={currentStep >= action.instructions.length - 1}
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-slate-200 leading-relaxed">
              {action.instructions[currentStep]}
            </p>
          </div>

          {/* Instructions List */}
          <div className="space-y-2">
            {action.instructions.map((instruction, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center space-x-2 text-sm p-2 rounded",
                  index <= currentStep
                    ? "text-green-300 bg-green-500/10"
                    : "text-slate-400 bg-slate-700/20",
                )}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                ) : index === currentStep ? (
                  <div className="h-3 w-3 bg-blue-400 rounded-full animate-pulse" />
                ) : (
                  <div className="h-3 w-3 border border-slate-500 rounded-full" />
                )}
                <span>{instruction}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={resetAction} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={completeAction}
              disabled={timer > 0}
              className="flex-1"
            >
              {timer > 0 ? "In Progress..." : "Complete"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-slate-100">
          <div className="flex items-center space-x-2">
            <Waves className="h-5 w-5 text-blue-400" />
            <span>Quick Flow Actions</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {totalActionsToday} today
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-400 mb-4">
          2-minute actions to maintain and boost your flow state throughout the
          day
        </p>

        {/* Action Categories */}
        <div className="grid grid-cols-2 gap-3">
          {["reset", "boost", "align", "assess"].map((category) => {
            const categoryActions = flowActions.filter(
              (a) => a.category === category,
            );
            const categoryCount = categoryActions.reduce(
              (sum, action) => sum + (dailyActions[action.id] || 0),
              0,
            );

            return (
              <div
                key={category}
                className={cn(
                  "p-3 rounded-lg border text-center",
                  getCategoryColor(category),
                )}
              >
                <div className="flex items-center justify-center mb-1">
                  {getCategoryIcon(category)}
                </div>
                <div className="text-xs font-medium capitalize">{category}</div>
                <div className="text-xs opacity-70">{categoryCount} today</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions Grid */}
        <div className="space-y-2">
          {flowActions.map((action) => {
            const completedToday = dailyActions[action.id] || 0;

            return (
              <div
                key={action.id}
                className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
              >
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    getCategoryColor(action.category),
                  )}
                >
                  <action.icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-slate-200 text-sm">
                      {action.name}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {action.duration}s
                    </Badge>
                    {completedToday > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {completedToday}x
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{action.description}</p>
                </div>

                <Button
                  size="sm"
                  onClick={() => startAction(action)}
                  className="h-8"
                >
                  <Timer className="h-3 w-3 mr-1" />
                  Start
                </Button>
              </div>
            );
          })}
        </div>

        {/* Daily Progress */}
        {totalActionsToday > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">
                Daily Flow Momentum
              </span>
              <span className="text-sm text-slate-400">
                {totalActionsToday} actions
              </span>
            </div>
            <Progress
              value={Math.min((totalActionsToday / 10) * 100, 100)}
              className="h-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              {totalActionsToday < 10
                ? `${10 - totalActionsToday} more for flow mastery today`
                : "🎉 Flow master! You've exceeded today's target"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
