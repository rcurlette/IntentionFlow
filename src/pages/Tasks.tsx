import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Target, Brain, Settings } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  type: "brain" | "admin";
  period: "morning" | "afternoon";
  completed: boolean;
  priority: "low" | "medium" | "high";
  estimatedTime?: number;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Deep work session",
      description: "Focus on core project deliverables",
      type: "brain",
      period: "morning",
      completed: false,
      priority: "high",
      estimatedTime: 120,
    },
    {
      id: "2",
      title: "Email processing",
      description: "Clear inbox and respond to urgent items",
      type: "admin",
      period: "afternoon",
      completed: false,
      priority: "medium",
      estimatedTime: 30,
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-500/10";
      case "medium":
        return "border-yellow-500 bg-yellow-500/10";
      default:
        return "border-green-500 bg-green-500/10";
    }
  };

  return (
    <AppLayout title="Tasks" description="Manage your flow-optimized tasks">
      <div className="pt-4 pb-8 px-4 container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Task Management
          </h1>
          <p className="text-slate-400">
            Organize your work for optimal flow states
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button className="h-20 flex flex-col space-y-2">
            <Plus className="h-6 w-6" />
            <span>Add Task</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col space-y-2">
            <Target className="h-6 w-6" />
            <span>Quick Focus</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col space-y-2">
            <Settings className="h-6 w-6" />
            <span>Templates</span>
          </Button>
        </div>

        {/* Task Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Morning Tasks */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-amber-400">
                <Brain className="h-5 w-5" />
                <span>Morning Flow</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks
                  .filter((task) => task.period === "morning")
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        task.completed
                          ? "bg-green-500/20 border-green-500/50"
                          : getPriorityColor(task.priority)
                      }`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3
                            className={`font-medium ${task.completed ? "line-through text-slate-400" : "text-white"}`}
                          >
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-slate-400 mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge
                              variant={
                                task.type === "brain" ? "default" : "secondary"
                              }
                            >
                              {task.type}
                            </Badge>
                            <Badge variant="outline">{task.priority}</Badge>
                            {task.estimatedTime && (
                              <div className="flex items-center space-x-1 text-xs text-slate-400">
                                <Clock className="h-3 w-3" />
                                <span>{task.estimatedTime}m</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Afternoon Tasks */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-400">
                <Settings className="h-5 w-5" />
                <span>Afternoon Flow</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks
                  .filter((task) => task.period === "afternoon")
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        task.completed
                          ? "bg-green-500/20 border-green-500/50"
                          : getPriorityColor(task.priority)
                      }`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3
                            className={`font-medium ${task.completed ? "line-through text-slate-400" : "text-white"}`}
                          >
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-slate-400 mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge
                              variant={
                                task.type === "brain" ? "default" : "secondary"
                              }
                            >
                              {task.type}
                            </Badge>
                            <Badge variant="outline">{task.priority}</Badge>
                            {task.estimatedTime && (
                              <div className="flex items-center space-x-1 text-xs text-slate-400">
                                <Clock className="h-3 w-3" />
                                <span>{task.estimatedTime}m</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
