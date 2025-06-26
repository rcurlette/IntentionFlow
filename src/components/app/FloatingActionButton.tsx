import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Plus, Sparkles, Zap } from "lucide-react";
import { QuickAddWithNLP } from "./QuickAddWithNLP";
import { Task } from "@/types";

interface FloatingActionButtonProps {
  onCreateTask: (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
  ) => Promise<void>;
  className?: string;
  position?: "bottom-right" | "bottom-left" | "bottom-center";
}

export function FloatingActionButton({
  onCreateTask,
  className,
  position = "bottom-right",
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case "bottom-left":
        return "bottom-6 left-6";
      case "bottom-center":
        return "bottom-6 left-1/2 transform -translate-x-1/2";
      case "bottom-right":
      default:
        return "bottom-6 right-6";
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div
        className={cn(
          "fixed z-50 transition-all duration-300",
          getPositionClasses(),
          className,
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className={cn(
            "h-14 shadow-lg hover:shadow-xl transition-all duration-300 group",
            "bg-gradient-to-r from-primary via-focus to-energy",
            "hover:scale-105 active:scale-95",
            isExpanded ? "px-6" : "w-14",
          )}
        >
          <Plus className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />

          <div
            className={cn(
              "overflow-hidden transition-all duration-300 flex items-center space-x-2",
              isExpanded ? "w-24 ml-2" : "w-0 ml-0",
            )}
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium whitespace-nowrap">
              Quick Add
            </span>
          </div>
        </Button>

        {/* Quick hint tooltip */}
        <div
          className={cn(
            "absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2",
            "bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg",
            "transition-all duration-200 pointer-events-none",
            isExpanded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2",
          )}
        >
          <div className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>Natural language task creation</span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-popover" />
        </div>
      </div>

      {/* Quick Add Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Quick Add Task with AI</span>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <QuickAddWithNLP
              onCreateTask={onCreateTask}
              onClose={() => setIsOpen(false)}
              autoFocus
              placeholder="Describe your task naturally... (e.g., 'Team meeting tomorrow at 2pm #work urgent')"
            />
          </div>

          {/* Quick Tips */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium flex items-center space-x-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>Pro Tips</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>• Use "tomorrow at 3pm" for scheduling</div>
              <div>• Add "#tag" for categories</div>
              <div>• Say "urgent" or "!!!" for high priority</div>
              <div>• Include "for 2 hours" for time blocks</div>
              <div>• Try "every Monday" for recurring tasks</div>
              <div>• Use "morning" or "afternoon" for periods</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
