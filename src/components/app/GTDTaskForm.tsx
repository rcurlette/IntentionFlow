import { useState, useEffect } from "react";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Clock,
  Zap,
  Brain,
  FileText,
  Tag,
  User,
  AlertCircle,
  Timer,
  Repeat,
  Battery,
  Focus,
  X,
} from "lucide-react";
import { format, addDays, addWeeks, addMonths } from "date-fns";

interface GTDTaskFormProps {
  task?: Task;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  defaultPeriod?: "morning" | "afternoon";
}

const ENERGY_LEVELS = [
  {
    value: "low",
    label: "Low Energy",
    icon: "🔋",
    description: "Simple, routine tasks",
  },
  {
    value: "medium",
    label: "Medium Energy",
    icon: "⚡",
    description: "Regular work tasks",
  },
  {
    value: "high",
    label: "High Energy",
    icon: "🚀",
    description: "Complex, creative work",
  },
];

const FOCUS_LEVELS = [
  {
    value: "shallow",
    label: "Shallow Focus",
    icon: "📱",
    description: "Can handle interruptions",
  },
  {
    value: "deep",
    label: "Deep Focus",
    icon: "🎯",
    description: "Needs uninterrupted time",
  },
];

const CONTEXT_TAGS = [
  "@calls",
  "@computer",
  "@home",
  "@office",
  "@errands",
  "@waiting",
  "@review",
  "@read",
];

const QUICK_SCHEDULES = [
  { label: "Today", value: () => new Date() },
  { label: "Tomorrow", value: () => addDays(new Date(), 1) },
  {
    label: "This Weekend",
    value: () => {
      const today = new Date();
      const daysUntilSaturday = 6 - today.getDay();
      return addDays(today, daysUntilSaturday);
    },
  },
  { label: "Next Week", value: () => addWeeks(new Date(), 1) },
  { label: "Next Month", value: () => addMonths(new Date(), 1) },
];

export function GTDTaskForm({
  task,
  onSave,
  onCancel,
  defaultPeriod = "morning",
}: GTDTaskFormProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    type: "brain",
    period: defaultPeriod,
    priority: "medium",
    tags: [],
    contextTags: [],
    energy: "medium",
    focus: "shallow",
    timeEstimate: 30,
    ...task,
  });

  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    task?.scheduledFor ? new Date(task.scheduledFor) : undefined,
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate);
  const [isRecurring, setIsRecurring] = useState(task?.isRecurring || false);
  const [newTag, setNewTag] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData(task);
      setScheduledDate(
        task.scheduledFor ? new Date(task.scheduledFor) : undefined,
      );
      setDueDate(task.dueDate);
      setIsRecurring(task.isRecurring || false);
    }
  }, [task]);

  const handleSave = async () => {
    const taskData: Partial<Task> = {
      ...formData,
      scheduledFor: scheduledDate?.toISOString().split("T")[0],
      dueDate: dueDate,
      isRecurring,
      updatedAt: new Date(),
    };

    if (!task) {
      taskData.createdAt = new Date();
      taskData.sortOrder = Date.now(); // Use timestamp for initial sort order
    }

    await onSave(taskData);
  };

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags?.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }));
    }
    setNewTag("");
  };

  const handleAddContextTag = (contextTag: string) => {
    if (!formData.contextTags?.includes(contextTag)) {
      setFormData((prev) => ({
        ...prev,
        contextTags: [...(prev.contextTags || []), contextTag],
      }));
    }
  };

  const removeTag = (tagToRemove: string, isContext = false) => {
    const field = isContext ? "contextTags" : "tags";
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field]?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return "Select date";
    const today = new Date();
    const tomorrow = addDays(today, 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return format(date, "MMM dd, yyyy");
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="What needs to be done?"
            className="text-base"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Additional details, notes, or context..."
            rows={3}
          />
        </div>
      </div>

      {/* Core Properties */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Task Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: Task["type"]) =>
              setFormData((prev) => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brain">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>Brain Work</span>
                </div>
              </SelectItem>
              <SelectItem value="admin">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Admin Tasks</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Period</Label>
          <Select
            value={formData.period}
            onValueChange={(value: Task["period"]) =>
              setFormData((prev) => ({ ...prev, period: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">🌅 Morning</SelectItem>
              <SelectItem value="afternoon">🌆 Afternoon</SelectItem>
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
            <SelectTrigger>
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

      {/* GTD Date/Time Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Scheduling & Deadlines</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Schedule Buttons */}
          <div>
            <Label className="text-sm">Quick Schedule</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {QUICK_SCHEDULES.map((schedule) => (
                <Button
                  key={schedule.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setScheduledDate(schedule.value())}
                >
                  {schedule.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scheduled Date */}
            <div>
              <Label>Scheduled For</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateDisplay(scheduledDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Due Date */}
            <div>
              <Label className="flex items-center space-x-2">
                <span>Due Date</span>
                <AlertCircle className="h-3 w-3 text-red-500" />
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground",
                    )}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    {formatDateDisplay(dueDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Time Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueTime">Specific Time</Label>
              <Input
                id="dueTime"
                type="time"
                value={formData.dueTime || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueTime: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="timeEstimate">Time Estimate (minutes)</Label>
              <Input
                id="timeEstimate"
                type="number"
                value={formData.timeEstimate || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    timeEstimate: parseInt(e.target.value) || undefined,
                  }))
                }
                min="5"
                max="480"
                step="5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy & Focus Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Battery className="h-4 w-4" />
            <span>Energy & Focus Requirements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Energy Level Required</Label>
              <Select
                value={formData.energy}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData((prev) => ({ ...prev, energy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENERGY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center space-x-2">
                        <span>{level.icon}</span>
                        <div>
                          <div>{level.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {level.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Focus Level Required</Label>
              <Select
                value={formData.focus}
                onValueChange={(value: "shallow" | "deep") =>
                  setFormData((prev) => ({ ...prev, focus: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOCUS_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center space-x-2">
                        <span>{level.icon}</span>
                        <div>
                          <div>{level.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {level.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags & Contexts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Tag className="h-4 w-4" />
            <span>Tags & Contexts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Project Tags */}
          <div>
            <Label>Project Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add project tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(newTag);
                  }
                }}
              />
              <Button onClick={() => handleAddTag(newTag)} disabled={!newTag}>
                Add
              </Button>
            </div>
          </div>

          {/* GTD Context Tags */}
          <div>
            <Label>GTD Contexts</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.contextTags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => removeTag(tag, true)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {CONTEXT_TAGS.filter(
                (tag) => !formData.contextTags?.includes(tag),
              ).map((tag) => (
                <Button
                  key={tag}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddContextTag(tag)}
                  className="text-xs h-6"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Repeat className="h-4 w-4" />
              <span>Advanced Options</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Hide" : "Show"}
            </Button>
          </CardTitle>
        </CardHeader>
        {showAdvanced && (
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
              <Label htmlFor="recurring">Recurring Task</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delegatedTo">Delegated To</Label>
                <Input
                  id="delegatedTo"
                  value={formData.delegatedTo || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      delegatedTo: e.target.value,
                    }))
                  }
                  placeholder="Person responsible..."
                />
              </div>

              <div>
                <Label htmlFor="waitingFor">Waiting For</Label>
                <Input
                  id="waitingFor"
                  value={formData.waitingFor || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      waitingFor: e.target.value,
                    }))
                  }
                  placeholder="What you're waiting for..."
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!formData.title?.trim()}>
          {task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </div>
  );
}
