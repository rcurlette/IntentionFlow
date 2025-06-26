import { useState } from "react";
import { FlowEntry } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Brain,
  FileText,
  Coffee,
  Clock,
  Heart,
  Zap,
  Smile,
  Frown,
  Meh,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface FlowTrackingPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: Omit<FlowEntry, "id" | "createdAt">) => void;
  isSubmitting?: boolean;
}

export function FlowTrackingPrompt({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: FlowTrackingPromptProps) {
  const [activity, setActivity] = useState("");
  const [activityType, setActivityType] =
    useState<FlowEntry["activityType"]>("other");
  const [flowRating, setFlowRating] = useState<number>(3);
  const [mood, setMood] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"activity" | "ratings" | "optional">(
    "activity",
  );

  const resetForm = () => {
    setActivity("");
    setActivityType("other");
    setFlowRating(3);
    setMood(3);
    setEnergyLevel(3);
    setNotes("");
    setStep("activity");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (step === "activity") {
      setStep("ratings");
    } else if (step === "ratings") {
      setStep("optional");
    }
  };

  const handleBack = () => {
    if (step === "optional") {
      setStep("ratings");
    } else if (step === "ratings") {
      setStep("activity");
    }
  };

  const handleSubmit = () => {
    if (!activity.trim()) return;

    const entry: Omit<FlowEntry, "id" | "createdAt"> = {
      timestamp: new Date(),
      activity: activity.trim(),
      activityType,
      flowRating,
      mood,
      energyLevel,
      notes: notes.trim() || undefined,
      tags: [], // Could be extracted from activity text later
    };

    onSubmit(entry);
    resetForm();
  };

  const getRatingIcon = (rating: number, type: "flow" | "mood" | "energy") => {
    if (type === "flow") {
      if (rating >= 4) return <Zap className="h-4 w-4 text-energy" />;
      if (rating >= 3) return <CheckCircle className="h-4 w-4 text-focus" />;
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (type === "mood") {
      if (rating >= 4) return <Smile className="h-4 w-4 text-energy" />;
      if (rating >= 3) return <Meh className="h-4 w-4 text-focus" />;
      return <Frown className="h-4 w-4 text-destructive" />;
    }
    // energy
    if (rating >= 4) return <Zap className="h-4 w-4 text-energy" />;
    if (rating >= 3) return <Heart className="h-4 w-4 text-focus" />;
    return <Coffee className="h-4 w-4 text-muted-foreground" />;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "bg-energy";
    if (rating >= 3) return "bg-focus";
    if (rating >= 2) return "bg-warning";
    return "bg-destructive";
  };

  const getRatingLabel = (rating: number, type: "flow" | "mood" | "energy") => {
    if (type === "flow") {
      const labels = ["Terrible", "Poor", "Okay", "Good", "Amazing"];
      return labels[rating - 1];
    }
    if (type === "mood") {
      const labels = ["Frustrated", "Stressed", "Neutral", "Happy", "Joyful"];
      return labels[rating - 1];
    }
    // energy
    const labels = ["Drained", "Low", "Moderate", "High", "Energized"];
    return labels[rating - 1];
  };

  const commonActivities = [
    { label: "Email", type: "admin" as const },
    { label: "Coding", type: "brain" as const },
    { label: "Meeting", type: "admin" as const },
    { label: "Writing", type: "brain" as const },
    { label: "Research", type: "brain" as const },
    { label: "Planning", type: "admin" as const },
    { label: "Review", type: "admin" as const },
    { label: "Learning", type: "brain" as const },
    { label: "Break", type: "break" as const },
    { label: "Social Media", type: "other" as const },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>How's your flow? 🌊</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                step === "activity" ? "bg-primary" : "bg-muted",
              )}
            ></div>
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                step === "ratings" ? "bg-primary" : "bg-muted",
              )}
            ></div>
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                step === "optional" ? "bg-primary" : "bg-muted",
              )}
            ></div>
          </div>

          {/* Step 1: Activity */}
          {step === "activity" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="activity">What are you doing right now?</Label>
                <Input
                  id="activity"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="e.g., Writing code, Checking emails, Taking a break..."
                  className="mt-2"
                  autoFocus
                />
              </div>

              {/* Quick activity buttons */}
              <div>
                <Label className="text-sm text-muted-foreground">
                  Quick select:
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {commonActivities.map((item) => (
                    <Button
                      key={item.label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActivity(item.label);
                        setActivityType(item.type);
                      }}
                      className="justify-start"
                    >
                      {item.type === "brain" && (
                        <Brain className="h-3 w-3 mr-2" />
                      )}
                      {item.type === "admin" && (
                        <FileText className="h-3 w-3 mr-2" />
                      )}
                      {item.type === "break" && (
                        <Coffee className="h-3 w-3 mr-2" />
                      )}
                      {item.type === "other" && (
                        <Clock className="h-3 w-3 mr-2" />
                      )}
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="activityType">Activity Type</Label>
                <Select
                  value={activityType}
                  onValueChange={(value: FlowEntry["activityType"]) =>
                    setActivityType(value)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brain">
                      🧠 Brain Work (Creative/Focus)
                    </SelectItem>
                    <SelectItem value="admin">
                      📋 Admin Work (Routine/Process)
                    </SelectItem>
                    <SelectItem value="break">☕ Break/Rest</SelectItem>
                    <SelectItem value="other">🔄 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Ratings */}
          {step === "ratings" && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-medium mb-2">
                  How are you feeling about "{activity}"?
                </h3>
                <Badge variant="outline" className="text-xs">
                  {activityType === "brain" && "🧠 Brain Work"}
                  {activityType === "admin" && "📋 Admin Work"}
                  {activityType === "break" && "☕ Break"}
                  {activityType === "other" && "🔄 Other"}
                </Badge>
              </div>

              {/* Flow Rating */}
              <div>
                <Label className="flex items-center space-x-2 mb-3">
                  {getRatingIcon(flowRating, "flow")}
                  <span>Flow State: {getRatingLabel(flowRating, "flow")}</span>
                </Label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={flowRating === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFlowRating(rating)}
                      className={cn(
                        "w-12 h-12 rounded-full p-0",
                        flowRating === rating && getRatingColor(rating),
                      )}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Mood Rating */}
              <div>
                <Label className="flex items-center space-x-2 mb-3">
                  {getRatingIcon(mood, "mood")}
                  <span>Mood: {getRatingLabel(mood, "mood")}</span>
                </Label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={mood === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMood(rating)}
                      className={cn(
                        "w-12 h-12 rounded-full p-0",
                        mood === rating && getRatingColor(rating),
                      )}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div>
                <Label className="flex items-center space-x-2 mb-3">
                  {getRatingIcon(energyLevel, "energy")}
                  <span>Energy: {getRatingLabel(energyLevel, "energy")}</span>
                </Label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={energyLevel === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEnergyLevel(rating)}
                      className={cn(
                        "w-12 h-12 rounded-full p-0",
                        energyLevel === rating && getRatingColor(rating),
                      )}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Optional */}
          {step === "optional" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes" className="text-sm">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any insights about this activity? What's working well or not?"
                  className="mt-2 min-h-20"
                />
              </div>

              <div className="text-center text-sm text-muted-foreground">
                This helps FlowTracker learn your patterns and suggest optimal
                schedules!
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between">
            <div>
              {step !== "activity" && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClose}>
                <X className="h-4 w-4 mr-2" />
                Skip
              </Button>

              {step === "optional" ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!activity.trim() || isSubmitting}
                  className="bg-energy hover:bg-energy/90"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Entry"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!activity.trim()}
                  className="bg-focus hover:bg-focus/90"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
