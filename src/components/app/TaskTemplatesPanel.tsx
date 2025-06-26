import { useState } from "react";
import { TaskTemplate, createTasksFromTemplate } from "@/lib/task-templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Plus,
  FileText,
  Clock,
  Target,
  Brain,
  Zap,
  Settings,
  Eye,
  Layers,
} from "lucide-react";

interface TaskTemplatesPanelProps {
  templates: TaskTemplate[];
  onUseTemplate: (
    template: TaskTemplate,
    period: "morning" | "afternoon",
  ) => void;
  onCreateCustomTemplate?: () => void;
}

export function TaskTemplatesPanel({
  templates,
  onUseTemplate,
  onCreateCustomTemplate,
}: TaskTemplatesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(
    null,
  );
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "afternoon">(
    "morning",
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  const getCategoryIcon = (category: TaskTemplate["category"]) => {
    switch (category) {
      case "development":
        return "💻";
      case "admin":
        return "📋";
      case "planning":
        return "📅";
      case "learning":
        return "🎓";
      case "custom":
        return "⭐";
      default:
        return "📝";
    }
  };

  const getCategoryColor = (category: TaskTemplate["category"]) => {
    switch (category) {
      case "development":
        return "text-focus border-focus/20 bg-focus/5";
      case "admin":
        return "text-admin border-admin/20 bg-admin/5";
      case "planning":
        return "text-primary border-primary/20 bg-primary/5";
      case "learning":
        return "text-energy border-energy/20 bg-energy/5";
      case "custom":
        return "text-purple-600 border-purple-200 bg-purple-50";
      default:
        return "text-muted-foreground border-muted-foreground/20 bg-muted/5";
    }
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onUseTemplate(selectedTemplate, selectedPeriod);
      setIsOpen(false);
      setSelectedTemplate(null);
    }
  };

  const groupedTemplates = templates.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    },
    {} as Record<string, TaskTemplate[]>,
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Layers className="h-4 w-4 mr-2" />
            Use Template
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Layers className="h-5 w-5" />
              <span>Task Templates</span>
              <Badge variant="outline" className="ml-auto">
                {templates.length} templates
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {Object.entries(groupedTemplates).map(
              ([category, categoryTemplates]) => (
                <div key={category}>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg">
                      {getCategoryIcon(category as TaskTemplate["category"])}
                    </span>
                    <h3 className="font-medium capitalize">{category}</h3>
                    <Badge variant="outline" className="text-xs">
                      {categoryTemplates.length}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={cn(
                          "cursor-pointer border-2 transition-all duration-200 hover:shadow-md",
                          selectedTemplate?.id === template.id
                            ? "border-primary bg-primary/5"
                            : getCategoryColor(template.category),
                        )}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{template.icon}</span>
                              <span>{template.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTemplate(template);
                                setPreviewOpen(true);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {template.description}
                          </p>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Target className="h-3 w-3" />
                                <span>{template.tasks.length} tasks</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {template.tasks.reduce(
                                    (sum, task) => sum + (task.timeBlock || 0),
                                    0,
                                  )}
                                  m
                                </span>
                              </div>
                            </div>

                            <div className="flex space-x-1">
                              {template.tasks.map((task, idx) => (
                                <div
                                  key={idx}
                                  className={cn(
                                    "w-2 h-2 rounded-full",
                                    task.type === "brain"
                                      ? "bg-focus"
                                      : "bg-admin",
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ),
            )}

            {/* Custom Template Creation */}
            <Card className="border-dashed border-2 border-primary/20">
              <CardContent className="py-8 text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">Create Custom Template</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Build your own task template for recurring workflows
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateCustomTemplate}
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Template Selection Actions */}
          {selectedTemplate && (
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium flex items-center space-x-2">
                    <span>{selectedTemplate.icon}</span>
                    <span>{selectedTemplate.name}</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.tasks.length} tasks •{" "}
                    {selectedTemplate.tasks.reduce(
                      (sum, task) => sum + (task.timeBlock || 0),
                      0,
                    )}{" "}
                    minutes
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <Select
                    value={selectedPeriod}
                    onValueChange={(value: "morning" | "afternoon") =>
                      setSelectedPeriod(value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">🌅 Morning</SelectItem>
                      <SelectItem value="afternoon">🌆 Afternoon</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={handleUseTemplate}>
                    <Zap className="h-4 w-4 mr-2" />
                    Add Tasks
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>{selectedTemplate?.icon}</span>
              <span>{selectedTemplate?.name}</span>
              <Badge variant="outline">Preview</Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {selectedTemplate.description}
              </p>

              <div className="space-y-3">
                <h4 className="font-medium">Tasks included:</h4>
                {selectedTemplate.tasks.map((task, idx) => (
                  <Card key={idx} className="p-3">
                    <div className="flex items-start space-x-3">
                      <div
                        className={cn(
                          "p-1 rounded mt-0.5",
                          task.type === "brain"
                            ? "bg-focus text-focus-foreground"
                            : "bg-admin text-admin-foreground",
                        )}
                      >
                        {task.type === "brain" ? (
                          <Brain className="h-3 w-3" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-medium text-sm">{task.title}</h5>
                          <Badge variant="outline" className="text-xs">
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {task.timeBlock}m
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {task.description}
                          </p>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
