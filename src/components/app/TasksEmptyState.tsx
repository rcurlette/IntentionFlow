import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Sparkles, Zap, Target, Coffee, Sunset } from "lucide-react";

interface TasksEmptyStateProps {
  period: "morning" | "afternoon";
  onAddTask: () => void;
  className?: string;
}

export function TasksEmptyState({
  period,
  onAddTask,
  className,
}: TasksEmptyStateProps) {
  const getPeriodInfo = () => {
    if (period === "morning") {
      return {
        icon: <Coffee className="h-12 w-12 opacity-50" />,
        emoji: "🌅",
        title: "No morning tasks yet",
        subtitle: "Start your day with intention!",
        suggestions: [
          "🧠 Plan your most challenging task first",
          "☕ Review your goals for the day",
          "📧 Check and respond to urgent emails",
          "💡 Work on that creative project",
        ],
        color: "morning",
        bgColor: "bg-morning/10",
        borderColor: "border-morning/20",
        textColor: "text-morning",
      };
    } else {
      return {
        icon: <Sunset className="h-12 w-12 opacity-50" />,
        emoji: "🌆",
        title: "No afternoon tasks yet",
        subtitle: "Keep the momentum going!",
        suggestions: [
          "⚡ Tackle those admin tasks",
          "📱 Follow up on pending items",
          "🤝 Schedule important meetings",
          "📝 Plan tomorrow's priorities",
        ],
        color: "afternoon",
        bgColor: "bg-afternoon/10",
        borderColor: "border-afternoon/20",
        textColor: "text-afternoon",
      };
    }
  };

  const info = getPeriodInfo();

  return (
    <div className={cn("text-center py-8", className)}>
      <div className="mb-4">
        <div className="text-4xl mb-2">{info.emoji}</div>
        {info.icon}
      </div>

      <h3 className="text-lg font-medium mb-2">{info.title}</h3>
      <p className="text-muted-foreground mb-6">{info.subtitle}</p>

      <Card
        className={cn("mb-6 border-dashed", info.borderColor, info.bgColor)}
      >
        <CardContent className="p-4">
          <h4
            className={cn(
              "font-medium mb-3 flex items-center justify-center space-x-2",
              info.textColor,
            )}
          >
            <Target className="h-4 w-4" />
            <span>Quick Ideas</span>
          </h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            {info.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {suggestion}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={onAddTask}
        className={cn(
          "transition-all duration-200 hover:scale-105",
          period === "morning"
            ? "bg-morning text-morning-foreground hover:bg-morning/90"
            : "bg-afternoon text-afternoon-foreground hover:bg-afternoon/90",
        )}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Your First {period === "morning" ? "Morning" : "Afternoon"} Task
        <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
      </Button>

      <div className="mt-4 text-xs text-muted-foreground">
        💡 Tip: Press{" "}
        <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+N</kbd> anytime
        to add a new task
      </div>
    </div>
  );
}
