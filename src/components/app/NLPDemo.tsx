import { useState } from "react";
import {
  NaturalLanguageProcessor,
  ParsedTask,
} from "@/lib/natural-language-processor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Brain,
  FileText,
  Clock,
  Calendar,
  Tag,
  Zap,
  Repeat,
  RefreshCw,
} from "lucide-react";

export function NLPDemo() {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedTask | null>(null);

  const examples = [
    "Meeting with John tomorrow at 3pm #work urgent",
    "Code review every Tuesday at 2pm",
    "Buy groceries today high priority",
    "Deep work session for 2 hours in the morning",
    "Call mom this weekend #personal",
    "Workout every day at 7am for 1 hour",
    "Write blog post by Friday",
    "Team standup daily at 9:30am #work",
    "Review quarterly reports urgent!!!",
    "Plan vacation in 2 weeks #personal low priority",
  ];

  const handleExampleClick = (example: string) => {
    setSelectedExample(example);
    const result = NaturalLanguageProcessor.parse(example);
    setParsedResult(result);
  };

  const getTypeIcon = (type: "brain" | "admin") => {
    return type === "brain" ? (
      <Brain className="h-3 w-3" />
    ) : (
      <FileText className="h-3 w-3" />
    );
  };

  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-gray-500";
  };

  const formatDueDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center space-x-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span>Natural Language Processing Demo</span>
        </h2>
        <p className="text-muted-foreground">
          Click any example below to see how our AI interprets natural language
          task descriptions
        </p>
      </div>

      {/* Examples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {examples.map((example, index) => (
          <Button
            key={index}
            variant={selectedExample === example ? "default" : "outline"}
            className="text-left justify-start h-auto p-3 text-wrap"
            onClick={() => handleExampleClick(example)}
          >
            <span className="break-all">{example}</span>
          </Button>
        ))}
      </div>

      {/* Random Example Button */}
      <div className="text-center">
        <Button
          variant="secondary"
          onClick={() => {
            const randomExample =
              examples[Math.floor(Math.random() * examples.length)];
            handleExampleClick(randomExample);
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Random Example
        </Button>
      </div>

      {/* Results */}
      {parsedResult && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>AI Parsing Results</span>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-sm",
                  getConfidenceColor(parsedResult.confidence),
                )}
              >
                {(parsedResult.confidence * 100).toFixed(0)}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Original vs Parsed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Original Input</h4>
                <div className="bg-muted/50 p-3 rounded text-sm">
                  "{selectedExample}"
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Parsed Title</h4>
                <div className="bg-background p-3 rounded text-sm border">
                  {parsedResult.title}
                </div>
              </div>
            </div>

            {/* Parsed Attributes */}
            <div>
              <h4 className="font-medium text-sm mb-3">
                Extracted Information
              </h4>
              <div className="flex flex-wrap gap-2">
                {/* Type */}
                <Badge variant="outline" className="text-sm">
                  {getTypeIcon(parsedResult.type)}
                  <span className="ml-1 capitalize">{parsedResult.type}</span>
                </Badge>

                {/* Period */}
                <Badge variant="outline" className="text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {parsedResult.period}
                </Badge>

                {/* Priority */}
                <Badge
                  className={cn(
                    "text-sm border",
                    getPriorityColor(parsedResult.priority),
                  )}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {parsedResult.priority}
                </Badge>

                {/* Due Date */}
                {parsedResult.dueDate && (
                  <Badge variant="outline" className="text-sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDueDate(parsedResult.dueDate)}
                    {parsedResult.dueTime && ` at ${parsedResult.dueTime}`}
                  </Badge>
                )}

                {/* Time Block */}
                {parsedResult.timeBlock && (
                  <Badge variant="outline" className="text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    {parsedResult.timeBlock}m
                  </Badge>
                )}

                {/* Recurrence */}
                {parsedResult.recurrence && (
                  <Badge variant="outline" className="text-sm">
                    <Repeat className="h-3 w-3 mr-1" />
                    {parsedResult.recurrence.pattern}
                  </Badge>
                )}

                {/* Tags */}
                {parsedResult.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            {parsedResult.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">AI Insights</h4>
                <div className="bg-muted/30 p-3 rounded space-y-1">
                  {parsedResult.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-sm text-muted-foreground"
                    >
                      <div className="w-1 h-1 bg-primary rounded-full" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* JSON Output for Developers */}
            <details className="mt-4">
              <summary className="font-medium text-sm cursor-pointer hover:text-primary">
                View Full JSON Output
              </summary>
              <pre className="mt-2 bg-muted/50 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(parsedResult, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
