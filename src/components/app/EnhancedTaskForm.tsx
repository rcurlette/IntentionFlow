import { useState, useEffect } from "react";
import { Task } from "@/types";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Sparkles,
  Brain,
  FileText,
  Zap,
  Target,
  User,
} from "lucide-react";
import { getSmartSuggestions, getRecentTags } from "@/lib/smart-suggestions";

interface EnhancedTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => Promise<void>;
  task?: Task | null; // For editing
  defaultPeriod?: "morning" | "afternoon";
  defaultDate?: string; // YYYY-MM-DD format
}

export function EnhancedTaskForm({
  isOpen,
  onClose,
  onSubmit,
  task = null,
  defaultPeriod = "morning",
  defaultDate,
}: EnhancedTaskFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "brain" as Task["type"],
    period: defaultPeriod,
    priority: "medium" as Task["priority"],
    timeBlock: 25,
    timeEstimate: 30,
    tags: [] as string[],
    contextTags: [] as string[],
    scheduledFor: defaultDate || "",
    dueDate: null as Date | null,
    dueTime: "",
    energy: "medium" as Task["energy"],
    focus: "shallow" as Task["focus"],
    delegatedTo: "",
    waitingFor: "",
  });

  const [smartSuggestions, setSmartSuggestions] = useState<any>(null);
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Load recent tags
  useEffect(() => {
    const loadRecentTags = async () => {
      try {
        const recent = await getRecentTags(8);
        setRecentTags(recent.map((r) => r.tag));
      } catch (error) {
        console.error("Error loading recent tags:", error);
      }
    };
    loadRecentTags();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        type: task.type,
        period: task.period,
        priority: task.priority,
        timeBlock: task.timeBlock || 25,
        timeEstimate: task.timeEstimate || 30,
        tags: task.tags || [],
        contextTags: task.contextTags || [],
        scheduledFor: task.scheduledFor || "",
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        dueTime: task.dueTime || "",
        energy: task.energy || "medium",
        focus: task.focus || "shallow",
        delegatedTo: task.delegatedTo || "",
        waitingFor: task.waitingFor || "",
      });
    } else {
      // Reset form for new task
      setFormData({
        title: "",
        description: "",
        type: "brain",
        period: defaultPeriod,
        priority: "medium",
        timeBlock: 25,
        timeEstimate: 30,
        tags: [],
        contextTags: [],
        scheduledFor: defaultDate || "",
        dueDate: null,
        dueTime: "",
        energy: "medium",
        focus: "shallow",
        delegatedTo: "",
        waitingFor: "",
      });
    }
  }, [task, defaultPeriod, defaultDate]);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({ ...prev, title }));

    // Get smart suggestions
    if (title.length > 3) {
      const suggestions = getSmartSuggestions(title, formData.description);
      setSmartSuggestions(suggestions);

      // Auto-apply high-confidence suggestions
      if (suggestions.confidence > 0.8) {
        setFormData((prev) => ({
          ...prev,
          type: suggestions.suggestedType,
          timeBlock: suggestions.suggestedTimeBlock,
          energy: suggestions.suggestedEnergy || prev.energy,
          focus: suggestions.suggestedFocus || prev.focus,
        }));
      }
    } else {
      setSmartSuggestions(null);
    }
  };

  const handleTagInput = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleContextTagInput = (value: string) => {
    const contextTags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    setFormData((prev) => ({ ...prev, contextTags }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const taskData = {
      ...formData,
      dueDate: formData.dueDate || undefined,
      ...(task ? { id: task.id } : {}),
    };

    await onSubmit(taskData);
    onClose();
  };

  const quickScheduleOptions = [
    { label: "Today", value: format(new Date(), "yyyy-MM-dd") },
    { label: "Tomorrow", value: format(addDays(new Date(), 1), "yyyy-MM-dd") },
    {
      label: "Next Week",
      value: format(addDays(new Date(), 7), "yyyy-MM-dd"),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>{task ? "Edit Task" : "Create New Task"}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="What needs to be done?"
              className="mt-1"
              autoFocus
            />
            {smartSuggestions && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                <span className="text-muted-foreground">
                  💡 {smartSuggestions.reasoning}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Additional details..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Task Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Task["type"]) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brain">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-focus" />
                      <span>Brain (Focus work)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-admin" />
                      <span>Admin (Routine tasks)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Task["priority"]) =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🌱 Low</SelectItem>
                  <SelectItem value="medium">⚡ Medium</SelectItem>
                  <SelectItem value="high">🔥 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Scheduling</Label>

            {/* Quick Schedule Buttons */}
            <div className="flex flex-wrap gap-2">
              {quickScheduleOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduledFor: option.value,
                    }))
                  }
                  className={cn(
                    formData.scheduledFor === option.value &&
                      "border-primary bg-primary/10",
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Custom Date Picker */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Scheduled Date</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !formData.scheduledFor && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduledFor
                        ? format(new Date(formData.scheduledFor), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        formData.scheduledFor
                          ? new Date(formData.scheduledFor)
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          setFormData((prev) => ({
                            ...prev,
                            scheduledFor: format(date, "yyyy-MM-dd"),
                          }));
                        }
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dueTime: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Period</Label>
              <Select
                value={formData.period}
                onValueChange={(value: Task["period"]) =>
                  setFormData((prev) => ({ ...prev, period: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">🌅 Morning</SelectItem>
                  <SelectItem value="afternoon">🌆 Afternoon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Energy and Focus */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Energy Required</Label>
              <Select
                value={formData.energy}
                onValueChange={(value: Task["energy"]) =>
                  setFormData((prev) => ({ ...prev, energy: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">💤 Low</SelectItem>
                  <SelectItem value="medium">⚡ Medium</SelectItem>
                  <SelectItem value="high">🔥 High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Focus Level</Label>
              <Select
                value={formData.focus}
                onValueChange={(value: Task["focus"]) =>
                  setFormData((prev) => ({ ...prev, focus: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shallow">🌊 Shallow</SelectItem>
                  <SelectItem value="deep">🏔️ Deep</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time Estimates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Time Block (minutes)</Label>
              <Input
                type="number"
                value={formData.timeBlock}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    timeBlock: parseInt(e.target.value) || 25,
                  }))
                }
                min="5"
                max="120"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Estimated Duration (minutes)</Label>
              <Input
                type="number"
                value={formData.timeEstimate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    timeEstimate: parseInt(e.target.value) || 30,
                  }))
                }
                min="5"
                max="480"
                className="mt-1"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags (comma-separated)</Label>
            <Input
              value={formData.tags.join(", ")}
              onChange={(e) => handleTagInput(e.target.value)}
              placeholder="work, urgent, research..."
              className="mt-1"
            />
            {recentTags.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1">
                  Recent tags:
                </div>
                <div className="flex flex-wrap gap-1">
                  {recentTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        const currentTags = formData.tags;
                        if (!currentTags.includes(tag)) {
                          setFormData((prev) => ({
                            ...prev,
                            tags: [...currentTags, tag],
                          }));
                        }
                      }}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Context Tags */}
          <div>
            <Label>Context Tags (GTD)</Label>
            <Input
              value={formData.contextTags.join(", ")}
              onChange={(e) => handleContextTagInput(e.target.value)}
              placeholder="@calls, @computer, @errands..."
              className="mt-1"
            />
          </div>

          {/* Delegation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Delegated To</Label>
              <Input
                value={formData.delegatedTo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    delegatedTo: e.target.value,
                  }))
                }
                placeholder="Person or team..."
                className="mt-1"
              />
            </div>

            <div>
              <Label>Waiting For</Label>
              <Input
                value={formData.waitingFor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    waitingFor: e.target.value,
                  }))
                }
                placeholder="Response, approval..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim()}>
              <Sparkles className="h-4 w-4 mr-2" />
              {task ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
