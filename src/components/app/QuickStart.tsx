import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Target,
  Brain,
  FileText,
  Clock,
  Zap,
  Coffee,
  Sunset,
  ArrowRight,
} from "lucide-react";

interface QuickStartProps {
  onAddFirstTask: (
    type: "brain" | "admin",
    period: "morning" | "afternoon",
  ) => void;
}

export function QuickStart({ onAddFirstTask }: QuickStartProps) {
  return (
    <Card className="bg-gradient-to-br from-energy/10 via-primary/10 to-focus/10 border-2 border-primary/20">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          <div className="relative">
            <Sparkles className="h-12 w-12 text-primary animate-pulse-soft" />
            <Zap className="absolute -top-1 -right-1 h-6 w-6 text-energy animate-wiggle" />
          </div>
        </div>
        <CardTitle className="bg-gradient-to-r from-primary via-focus to-energy bg-clip-text text-transparent">
          Welcome to FlowTracker! 🎉
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Let's set you up for an amazing, productive day!
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="font-medium text-primary">🧠 The Flow Mindset</h3>
          <p className="text-sm text-muted-foreground">
            Organize your day into <strong>morning</strong> and{" "}
            <strong>afternoon</strong> periods, with{" "}
            <strong className="text-focus">brain tasks</strong> for deep work
            and <strong className="text-admin">admin tasks</strong> for routine
            activities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Coffee className="h-5 w-5 text-morning" />
              <span className="font-medium text-morning">Morning Power</span>
            </div>
            <div className="space-y-2">
              <Button
                size="sm"
                onClick={() => onAddFirstTask("admin", "morning")}
                className="w-full bg-admin text-admin-foreground justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                Add Admin Task
                <ArrowRight className="h-3 w-3 ml-auto" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddFirstTask("brain", "morning")}
                className="w-full justify-start border-focus text-focus"
              >
                <Brain className="h-4 w-4 mr-2" />
                Add Brain Task
                <ArrowRight className="h-3 w-3 ml-auto" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sunset className="h-5 w-5 text-afternoon" />
              <span className="font-medium text-afternoon">
                Afternoon Energy
              </span>
            </div>
            <div className="space-y-2">
              <Button
                size="sm"
                onClick={() => onAddFirstTask("brain", "afternoon")}
                className="w-full bg-focus text-focus-foreground justify-start"
              >
                <Brain className="h-4 w-4 mr-2" />
                Add Brain Task
                <ArrowRight className="h-3 w-3 ml-auto" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddFirstTask("admin", "afternoon")}
                className="w-full justify-start border-admin text-admin"
              >
                <FileText className="h-4 w-4 mr-2" />
                Add Admin Task
                <ArrowRight className="h-3 w-3 ml-auto" />
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-focus/10 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">
              Pro Tips for Flow State:
            </span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>🌅 Use your first hour for creative or challenging tasks</li>
            <li>🍅 Try the Pomodoro technique: 25min focus + 5min break</li>
            <li>
              🧠 Group similar tasks together to minimize context switching
            </li>
            <li>⚡ Take breaks to maintain high energy throughout the day</li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Pomodoro Ready
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Motivational
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Flow-Focused
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
