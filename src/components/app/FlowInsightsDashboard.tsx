import { useState, useEffect } from "react";
import { FlowEntry, FlowInsights } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getFlowEntries,
  generateFlowInsights,
  getFlowSummary,
  getRecentFlowEntries,
} from "@/lib/flow-tracking";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Clock,
  Zap,
  Heart,
  Target,
  Calendar,
  BarChart3,
  Lightbulb,
  Coffee,
  Sunset,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

interface FlowInsightsDashboardProps {
  className?: string;
}

export function FlowInsightsDashboard({
  className,
}: FlowInsightsDashboardProps) {
  const [flowEntries, setFlowEntries] = useState<FlowEntry[]>([]);
  const [insights, setInsights] = useState<FlowInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFlowData();
  }, []);

  const loadFlowData = () => {
    setIsLoading(true);
    try {
      const entries = getFlowEntries();
      const recentEntries = getRecentFlowEntries(30); // Last 30 days
      const flowInsights = generateFlowInsights(recentEntries);

      setFlowEntries(entries);
      setInsights(flowInsights);
    } catch (error) {
      console.error("Error loading flow data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!insights || flowEntries.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Start Tracking Your Flow
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Enable flow tracking in settings to begin collecting data about
              your optimal productivity patterns. After a few entries, you'll
              see personalized insights here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = getFlowSummary(flowEntries);
  const hasEnoughData = insights.dataQuality.totalEntries >= 10;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span>Flow Insights</span>
          </h2>
          <p className="text-muted-foreground">
            Discover your optimal productivity patterns
          </p>
        </div>
        <Badge
          variant={hasEnoughData ? "default" : "outline"}
          className="flex items-center space-x-1"
        >
          <Info className="h-3 w-3" />
          <span>
            {insights.dataQuality.totalEntries} entries •{" "}
            {insights.dataQuality.daysTracked} days
          </span>
        </Badge>
      </div>

      {/* Data Quality Warning */}
      {!hasEnoughData && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="flex items-center space-x-3 p-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div className="flex-1">
              <p className="text-sm font-medium">More data needed</p>
              <p className="text-xs text-muted-foreground">
                {insights.dataQuality.entriesNeededForBetterInsights} more
                entries needed for reliable insights
              </p>
            </div>
            <Progress
              value={
                (insights.dataQuality.totalEntries /
                  (insights.dataQuality.totalEntries +
                    insights.dataQuality.entriesNeededForBetterInsights)) *
                100
              }
              className="w-20"
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="suggestions">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-energy" />
                  <span className="text-sm font-medium">Avg Flow</span>
                </div>
                <div className="text-2xl font-bold text-energy">
                  {summary.averageFlow}/5
                </div>
                <div className="text-xs text-muted-foreground">
                  {summary.totalEntries} entries
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-focus" />
                  <span className="text-sm font-medium">Avg Mood</span>
                </div>
                <div className="text-2xl font-bold text-focus">
                  {summary.averageMood}/5
                </div>
                <div className="text-xs text-muted-foreground">
                  Overall happiness
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Coffee className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Avg Energy</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {summary.averageEnergy}/5
                </div>
                <div className="text-xs text-muted-foreground">
                  Energy levels
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-admin" />
                  <span className="text-sm font-medium">Days Tracked</span>
                </div>
                <div className="text-2xl font-bold text-admin">
                  {summary.daysTracked}
                </div>
                <div className="text-xs text-muted-foreground">
                  Active tracking
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Peak and Low Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-energy" />
                  <span>Peak Flow Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.peakFlowHours.length > 0 ? (
                  <div className="space-y-2">
                    {insights.peakFlowHours.map((hour) => (
                      <div
                        key={hour}
                        className="flex items-center justify-between p-2 bg-energy/10 rounded"
                      >
                        <span className="font-medium">
                          {hour.toString().padStart(2, "0")}:00
                        </span>
                        <Badge className="bg-energy">High Flow</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Not enough data to identify peak hours yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  <span>Low Flow Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.lowFlowHours.length > 0 ? (
                  <div className="space-y-2">
                    {insights.lowFlowHours.map((hour) => (
                      <div
                        key={hour}
                        className="flex items-center justify-between p-2 bg-destructive/10 rounded"
                      >
                        <span className="font-medium">
                          {hour.toString().padStart(2, "0")}:00
                        </span>
                        <Badge variant="destructive">Low Flow</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No consistently low flow hours identified.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Coffee className="h-5 w-5 text-morning" />
                  <span>Morning Flow</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.bestActivitiesForMorning.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-3">
                      Your best morning activities:
                    </p>
                    {insights.bestActivitiesForMorning.map(
                      (activity, index) => (
                        <div
                          key={activity}
                          className="flex items-center space-x-3 p-2 bg-morning/10 rounded"
                        >
                          <div className="w-6 h-6 rounded-full bg-morning text-white text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <span className="font-medium">{activity}</span>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Track more morning activities to see patterns.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sunset className="h-5 w-5 text-afternoon" />
                  <span>Afternoon Flow</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.bestActivitiesForAfternoon.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-3">
                      Your best afternoon activities:
                    </p>
                    {insights.bestActivitiesForAfternoon.map(
                      (activity, index) => (
                        <div
                          key={activity}
                          className="flex items-center space-x-3 p-2 bg-afternoon/10 rounded"
                        >
                          <div className="w-6 h-6 rounded-full bg-afternoon text-white text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <span className="font-medium">{activity}</span>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Track more afternoon activities to see patterns.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weekly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-focus" />
                <span>Weekly Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(insights.weeklyTrends).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                  {Object.values(insights.weeklyTrends).map((trend) => (
                    <div
                      key={trend.day}
                      className="text-center p-3 border rounded"
                    >
                      <div className="text-xs font-medium text-muted-foreground">
                        {trend.day.slice(0, 3)}
                      </div>
                      <div className="text-lg font-bold text-focus">
                        {trend.avgFlow}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {trend.bestActivity.slice(0, 8)}
                        {trend.bestActivity.length > 8 ? "..." : ""}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Track activities across multiple days to see weekly patterns.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-energy" />
                  <span>Top Activities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Most Common</span>
                    <span className="text-muted-foreground">
                      {summary.mostCommonActivity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Best Flow</span>
                    <span className="text-muted-foreground">
                      {summary.bestFlowActivity}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <span>Activities to Reconsider</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.activitiesToAvoid.length > 0 ? (
                  <div className="space-y-2">
                    {insights.activitiesToAvoid.map((activity) => (
                      <div
                        key={activity}
                        className="flex items-center space-x-2 p-2 bg-warning/10 rounded"
                      >
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="text-sm">{activity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No consistently problematic activities identified.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-energy" />
                <span>Personalized Suggestions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.improvementSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-energy/5 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-energy text-white text-xs flex items-center justify-center mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm flex-1">{suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optimal Flow Pattern */}
          {hasEnoughData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Suggested Daily Flow Pattern</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-morning mb-3 flex items-center space-x-2">
                      <Coffee className="h-4 w-4" />
                      <span>Morning</span>
                    </h4>
                    <div className="space-y-2">
                      {insights.optimalFlowPattern.morning.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-morning/10 rounded text-sm"
                          >
                            <span className="font-medium">{item.time}</span>
                            <span>{item.activity}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.expectedFlow.toFixed(1)}★
                            </Badge>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-afternoon mb-3 flex items-center space-x-2">
                      <Sunset className="h-4 w-4" />
                      <span>Afternoon</span>
                    </h4>
                    <div className="space-y-2">
                      {insights.optimalFlowPattern.afternoon.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-afternoon/10 rounded text-sm"
                          >
                            <span className="font-medium">{item.time}</span>
                            <span>{item.activity}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.expectedFlow.toFixed(1)}★
                            </Badge>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
