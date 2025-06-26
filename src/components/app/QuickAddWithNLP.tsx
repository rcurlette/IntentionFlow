import { useState, useRef, useEffect } from "react";
import { Task } from "@/types";
import {
  NaturalLanguageProcessor,
  ParsedTask,
} from "@/lib/natural-language-processor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Plus,
  Clock,
  Calendar,
  Tag,
  Zap,
  Brain,
  FileText,
  Repeat,
  X,
  Wand2,
} from "lucide-react";

interface QuickAddWithNLPProps {
  onCreateTask: (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
  ) => Promise<void>;
  onClose?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}

export function QuickAddWithNLP({
  onCreateTask,
  onClose,
  autoFocus = false,
  placeholder = "Add task using natural language... (e.g., 'Meeting with John tomorrow at 3pm')",
  className,
}: QuickAddWithNLPProps) {
  const [input, setInput] = useState("");
  const [parsedTask, setParsedTask] = useState<ParsedTask | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (input.trim().length > 3) {
      const debounceTimer = setTimeout(() => {
        setIsProcessing(true);
        try {
          const parsed = NaturalLanguageProcessor.parse(input);
          setParsedTask(parsed);
          setShowPreview(true);
        } catch (error) {
          console.error("NLP parsing error:", error);
        } finally {
          setIsProcessing(false);
        }
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      setParsedTask(null);
      setShowPreview(false);
    }
  }, [input]);

  const handleSubmit = async () => {
    if (!parsedTask || !parsedTask.title.trim()) return;

    try {
      setIsProcessing(true);

      const taskData = {
        title: parsedTask.title,
        description: parsedTask.description || "",
        type: parsedTask.type,
        period: parsedTask.period,
        priority: parsedTask.priority,
        tags: parsedTask.tags,
        timeBlock: parsedTask.timeBlock,
        scheduledFor: parsedTask.dueDate?.toISOString().split("T")[0],
      };

      await onCreateTask(taskData);

      // Reset form
      setInput("");
      setParsedTask(null);
      setShowPreview(false);

      // Focus back on input for quick successive additions
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      if (onClose) {
        onClose();
      } else {
        setInput("");
        setParsedTask(null);
        setShowPreview(false);
      }
    }
  };

  const getTypeIcon = (type: Task["type"]) => {
    return type === "brain" ? (
      <Brain className="h-3 w-3" />
    ) : (
      <FileText className="h-3 w-3" />
    );
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
    <div className={cn("space-y-3", className)}>
      {/* Input Field */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="pr-10 text-base"
              disabled={isProcessing}
            />
            {isProcessing && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Wand2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!parsedTask || isProcessing || !parsedTask.title.trim()}
            className="px-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>

          {onClose && (
            <Button variant="ghost" onClick={onClose} className="px-3">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Quick Examples */}
        {!input && (
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-xs text-muted-foreground mr-2">Try:</span>
            {[
              "Meeting tomorrow 3pm",
              "Code review #work",
              "Buy groceries urgent",
            ].map((example) => (
              <Button
                key={example}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setInput(example)}
              >
                "{example}"
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* NLP Preview */}
      {showPreview && parsedTask && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            {/* Confidence and AI indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Interpretation</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    getConfidenceColor(parsedTask.confidence),
                  )}
                >
                  {(parsedTask.confidence * 100).toFixed(0)}% confidence
                </Badge>
              </div>

              {parsedTask.suggestions.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {parsedTask.suggestions.length} insights
                </Badge>
              )}
            </div>

            {/* Parsed Title */}
            <div>
              <h4 className="font-medium text-foreground">
                {parsedTask.title}
              </h4>
              {parsedTask.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {parsedTask.description}
                </p>
              )}
            </div>

            {/* Parsed Attributes */}
            <div className="flex flex-wrap gap-2">
              {/* Type */}
              <Badge variant="outline" className="text-xs">
                {getTypeIcon(parsedTask.type)}
                <span className="ml-1 capitalize">{parsedTask.type}</span>
              </Badge>

              {/* Period */}
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {parsedTask.period}
              </Badge>

              {/* Priority */}
              <Badge
                className={cn(
                  "text-xs border",
                  getPriorityColor(parsedTask.priority),
                )}
              >
                <Zap className="h-3 w-3 mr-1" />
                {parsedTask.priority}
              </Badge>

              {/* Due Date */}
              {parsedTask.dueDate && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDueDate(parsedTask.dueDate)}
                  {parsedTask.dueTime && ` at ${parsedTask.dueTime}`}
                </Badge>
              )}

              {/* Time Block */}
              {parsedTask.timeBlock && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {parsedTask.timeBlock}m
                </Badge>
              )}

              {/* Recurrence */}
              {parsedTask.recurrence && (
                <Badge variant="outline" className="text-xs">
                  <Repeat className="h-3 w-3 mr-1" />
                  {parsedTask.recurrence.pattern}
                </Badge>
              )}

              {/* Tags */}
              {parsedTask.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Suggestions */}
            {parsedTask.suggestions.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="font-medium">AI detected:</div>
                  {parsedTask.suggestions
                    .slice(0, 3)
                    .map((suggestion, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
