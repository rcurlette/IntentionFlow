import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getFlowStateMessage } from "@/lib/productivity-utils";
import {
  Brain,
  Zap,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Waves,
  Target,
  Shield,
} from "lucide-react";

interface FlowStateMonitorProps {
  flowScore: number;
  distractionCount: number;
  onAddDistraction: () => void;
  isTimerRunning: boolean;
  sessionsCompleted: number;
}

export function FlowStateMonitor({
  flowScore,
  distractionCount,
  onAddDistraction,
  isTimerRunning,
  sessionsCompleted,
}: FlowStateMonitorProps) {
  const getFlowLevel = () => {
    if (flowScore >= 90) return "peak";
    if (flowScore >= 70) return "high";
    if (flowScore >= 50) return "good";
    if (flowScore >= 30) return "building";
    return "distracted";
  };

  const getFlowColor = () => {
    const level = getFlowLevel();
    switch (level) {
      case "peak":
        return "text-energy";
      case "high":
        return "text-focus";
      case "good":
        return "text-primary";
      case "building":
        return "text-warning";
      default:
        return "text-destructive";
    }
  };

  const getFlowIcon = () => {
    const level = getFlowLevel();
    switch (level) {
      case "peak":
        return <Waves className="h-5 w-5 text-energy animate-pulse-soft" />;
      case "high":
        return <TrendingUp className="h-5 w-5 text-focus" />;
      case "good":
        return <Target className="h-5 w-5 text-primary" />;
      case "building":
        return <Brain className="h-5 w-5 text-warning" />;
      default:
        return <TrendingDown className="h-5 w-5 text-destructive" />;
    }
  };

  const getFlowBadge = () => {
    const level = getFlowLevel();
    const badges = {
      peak: { text: "Peak Flow", class: "bg-energy text-energy-foreground" },
      high: { text: "High Focus", class: "bg-focus text-focus-foreground" },
      good: { text: "Good Focus", class: "bg-primary text-primary-foreground" },
      building: {
        text: "Building",
        class: "bg-warning text-warning-foreground",
      },
      distracted: {
        text: "Distracted",
        class: "bg-destructive text-destructive-foreground",
      },
    };
    return badges[level];
  };

  const getProgressColor = () => {
    if (flowScore >= 90) return "bg-energy";
    if (flowScore >= 70) return "bg-focus";
    if (flowScore >= 50) return "bg-primary";
    if (flowScore >= 30) return "bg-warning";
    return "bg-destructive";
  };

  const badgeInfo = getFlowBadge();

  return (
    <div className="space-y-4">
      {/* Flow Score Card */}
      <Card
        className={cn(
          "border-2 transition-all duration-300",
          flowScore >= 90 && "border-energy/40 bg-energy/5",
          flowScore >= 70 && flowScore < 90 && "border-focus/40 bg-focus/5",
          flowScore >= 50 && flowScore < 70 && "border-primary/40 bg-primary/5",
          flowScore >= 30 && flowScore < 50 && "border-warning/40 bg-warning/5",
          flowScore < 30 && "border-destructive/40 bg-destructive/5",
        )}
      >
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getFlowIcon()}
              <span className="text-sm">Flow State</span>
            </div>
            <Badge className={badgeInfo.class}>{badgeInfo.text}</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Flow Score Display */}
          <div className="text-center">
            <div className={cn("text-4xl font-bold", getFlowColor())}>
              {flowScore}
            </div>
            <div className="text-xs text-muted-foreground">Flow Score</div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress
              value={flowScore}
              className="h-3"
              style={{
                ["--progress-background" as any]: getProgressColor(),
              }}
            />
            <div className="text-xs text-muted-foreground text-center">
              {getFlowStateMessage(flowScore)}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">
                {sessionsCompleted}
              </div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-destructive">
                {distractionCount}
              </div>
              <div className="text-xs text-muted-foreground">Distractions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distraction Tracker */}
      <Card className="border-dashed">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Distraction Monitor</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddDistraction}
              disabled={!isTimerRunning}
              className="border-destructive/20 text-destructive hover:bg-destructive/5"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />I Got Distracted
            </Button>
            <div className="text-xs text-muted-foreground mt-2">
              {isTimerRunning
                ? "Click when you notice your mind wandering"
                : "Available during focus sessions"}
            </div>
          </div>

          {/* Distraction Impact */}
          {distractionCount > 0 && (
            <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/20">
              <div className="text-xs text-center">
                <div className="font-medium text-destructive mb-1">
                  Impact: -{distractionCount * 10} points
                </div>
                <div className="text-muted-foreground">
                  Each distraction reduces your flow score by 10 points
                </div>
              </div>
            </div>
          )}

          {/* Flow Tips */}
          <div className="bg-focus/10 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-focus mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <div className="font-medium text-focus mb-1">Flow Tips:</div>
                <ul className="space-y-1">
                  <li>• Put phone in another room</li>
                  <li>• Close unnecessary browser tabs</li>
                  <li>• Use noise-canceling headphones</li>
                  <li>• Set clear session goals</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
