import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Moon,
  Calendar,
  Brain,
  Lightbulb,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface EveningReflection {
  id: string;
  date: string;
  tomorrowPlans: string;
  preparation: string;
  randomThoughts: string;
  dontForget: string;
  createdAt: Date;
  completedAt?: Date;
}

interface EveningSectionProps {
  className?: string;
}

export function EveningSection({ className }: EveningSectionProps) {
  const [reflection, setReflection] = useState<EveningReflection>({
    id: "",
    date: format(new Date(), "yyyy-MM-dd"),
    tomorrowPlans: "",
    preparation: "",
    randomThoughts: "",
    dontForget: "",
    createdAt: new Date(),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load today's reflection if exists
  useEffect(() => {
    const loadTodayReflection = () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const saved = localStorage.getItem(`evening-reflection-${today}`);

      if (saved) {
        const savedReflection = JSON.parse(saved);
        setReflection(savedReflection);
        setIsCompleted(!!savedReflection.completedAt);
        setLastSaved(new Date(savedReflection.createdAt));
      }
    };

    loadTodayReflection();
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (
      reflection.tomorrowPlans ||
      reflection.preparation ||
      reflection.randomThoughts ||
      reflection.dontForget
    ) {
      const timeoutId = setTimeout(() => {
        saveDraft();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [
    reflection.tomorrowPlans,
    reflection.preparation,
    reflection.randomThoughts,
    reflection.dontForget,
  ]);

  const saveDraft = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const draftReflection = {
      ...reflection,
      id: reflection.id || `evening-${today}-${Date.now()}`,
      date: today,
      createdAt: new Date(),
    };

    localStorage.setItem(
      `evening-reflection-${today}`,
      JSON.stringify(draftReflection),
    );
    setReflection(draftReflection);
    setLastSaved(new Date());
  };

  const submitReflection = async () => {
    if (!hasContent()) return;

    setIsSubmitting(true);

    try {
      const completedReflection = {
        ...reflection,
        id: reflection.id || `evening-${reflection.date}-${Date.now()}`,
        completedAt: new Date(),
      };

      // Save to localStorage (will be replaced with API call)
      localStorage.setItem(
        `evening-reflection-${reflection.date}`,
        JSON.stringify(completedReflection),
      );

      // TODO: Replace with actual API call
      // await fetch('/api/evening-reflections', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(completedReflection)
      // });

      setReflection(completedReflection);
      setIsCompleted(true);

      // Store in history
      const history = JSON.parse(
        localStorage.getItem("evening-reflections-history") || "[]",
      );
      history.unshift(completedReflection);
      localStorage.setItem(
        "evening-reflections-history",
        JSON.stringify(history.slice(0, 30)),
      ); // Keep last 30
    } catch (error) {
      console.error("Failed to submit evening reflection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasContent = () => {
    return (
      reflection.tomorrowPlans.trim() ||
      reflection.preparation.trim() ||
      reflection.randomThoughts.trim() ||
      reflection.dontForget.trim()
    );
  };

  const getCompletionPercentage = () => {
    const fields = [
      reflection.tomorrowPlans,
      reflection.preparation,
      reflection.randomThoughts,
      reflection.dontForget,
    ];
    const filledFields = fields.filter((field) => field.trim()).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const updateField = (field: keyof EveningReflection, value: string) => {
    setReflection((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-slate-100">
          <div className="flex items-center space-x-2">
            <Moon className="h-5 w-5 text-indigo-400" />
            <span>Tomorrow I Will...</span>
          </div>
          <div className="flex items-center space-x-2">
            {isCompleted && (
              <Badge variant="default" className="bg-green-500 text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
            {!isCompleted && hasContent() && (
              <Badge
                variant="outline"
                className="border-blue-400 text-blue-400"
              >
                {getCompletionPercentage()}% Draft
              </Badge>
            )}
          </div>
        </CardTitle>
        {lastSaved && !isCompleted && (
          <p className="text-xs text-slate-400">
            Last saved: {format(lastSaved, "HH:mm")}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {!isCompleted ? (
          <>
            {/* Tomorrow Plans */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <label className="text-base font-medium text-slate-300">
                  What am I going to do tomorrow?
                </label>
              </div>
              <Textarea
                value={reflection.tomorrowPlans}
                onChange={(e) => updateField("tomorrowPlans", e.target.value)}
                placeholder="Tomorrow I will focus on... I plan to accomplish... My main priorities are..."
                className="bg-slate-700/50 border-slate-600 text-slate-100 min-h-[80px] resize-none"
              />
            </div>

            <Separator className="bg-slate-600" />

            {/* Preparation */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <ArrowRight className="h-4 w-4 text-green-400" />
                <label className="text-base font-medium text-slate-300">
                  What do I need to do to be ready?
                </label>
              </div>
              <Textarea
                value={reflection.preparation}
                onChange={(e) => updateField("preparation", e.target.value)}
                placeholder="To be ready I need to... I should prepare... Setup required..."
                className="bg-slate-700/50 border-slate-600 text-slate-100 min-h-[80px] resize-none"
              />
            </div>

            <Separator className="bg-slate-600" />

            {/* Random Thoughts */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-purple-400" />
                <label className="text-base font-medium text-slate-300">
                  Random thoughts?
                </label>
              </div>
              <Textarea
                value={reflection.randomThoughts}
                onChange={(e) => updateField("randomThoughts", e.target.value)}
                placeholder="Things on my mind... Ideas that came up... Concerns or questions..."
                className="bg-slate-700/50 border-slate-600 text-slate-100 min-h-[80px] resize-none"
              />
            </div>

            <Separator className="bg-slate-600" />

            {/* Don't Forget */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                <label className="text-base font-medium text-slate-300">
                  Don't forget...
                </label>
              </div>
              <Textarea
                value={reflection.dontForget}
                onChange={(e) => updateField("dontForget", e.target.value)}
                placeholder="Important reminders... Things I must not forget... Commitments..."
                className="bg-slate-700/50 border-slate-600 text-slate-100 min-h-[80px] resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  {hasContent() ? (
                    <span>
                      Complete your evening reflection to prepare for tomorrow
                    </span>
                  ) : (
                    <span>
                      Start reflecting on tomorrow to set your intentions
                    </span>
                  )}
                </div>
                <Button
                  onClick={submitReflection}
                  disabled={!hasContent() || isSubmitting}
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Complete Reflection
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Completed State
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <CheckCircle2 className="h-12 w-12 text-green-400" />
                  <Sparkles className="h-6 w-6 text-yellow-300 absolute -top-1 -right-1 animate-bounce" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-green-300 mb-2">
                Evening Reflection Complete ✨
              </h3>
              <p className="text-slate-300">
                You're prepared for tomorrow! Your intentions are set and your
                mind is clear.
              </p>
            </div>

            {/* Summary of completed reflection */}
            <div className="space-y-3 bg-slate-700/30 p-4 rounded-lg border border-slate-600">
              <h4 className="font-medium text-slate-200 mb-2">
                Tonight's Reflection Summary:
              </h4>

              {reflection.tomorrowPlans && (
                <div className="text-sm">
                  <span className="text-blue-400 font-medium">
                    Tomorrow's Plans:
                  </span>
                  <p className="text-slate-300 mt-1">
                    {reflection.tomorrowPlans.slice(0, 100)}...
                  </p>
                </div>
              )}

              {reflection.preparation && (
                <div className="text-sm">
                  <span className="text-green-400 font-medium">
                    Preparation:
                  </span>
                  <p className="text-slate-300 mt-1">
                    {reflection.preparation.slice(0, 100)}...
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCompleted(false)}
                className="flex-1"
              >
                Edit Reflection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // View full reflection in modal or navigate to history
                  console.log("View full reflection");
                }}
                className="flex-1"
              >
                View Full
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
