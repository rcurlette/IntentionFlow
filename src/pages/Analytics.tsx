import { Navigation } from "@/components/app/Navigation";
import { TaskAnalyticsDashboard } from "@/components/app/TaskAnalyticsDashboard";
import { FlowInsightsDashboard } from "@/components/app/FlowInsightsDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Brain, Target } from "lucide-react";

export default function Analytics() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-8 px-4 container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-focus to-energy bg-clip-text text-transparent mb-2">
            Analytics & Progress
          </h1>
          <p className="text-muted-foreground">
            Track your productivity patterns and flow state insights
          </p>
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Task Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Flow Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <TaskAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="flow">
            <FlowInsightsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
