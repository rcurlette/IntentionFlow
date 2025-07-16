import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Target } from "lucide-react";

export default function Calendar() {
  return (
    <AppLayout title="Calendar" description="Plan your flow sessions">
      <div className="pt-4 pb-8 px-4 container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Flow Calendar</h1>
          <p className="text-slate-400">
            Schedule and track your optimal flow sessions
          </p>
        </div>

        {/* Calendar Grid Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar */}
          <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>December 2024</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-slate-400 p-2"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <div
                    key={day}
                    className="aspect-square flex items-center justify-center text-sm border border-slate-700 rounded hover:bg-slate-700 cursor-pointer relative"
                  >
                    {day}
                    {day === 15 && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="h-1 bg-blue-500 rounded"></div>
                      </div>
                    )}
                    {day === 20 && (
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="h-1 bg-green-500 rounded"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Today's Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Morning Focus</div>
                      <div className="text-xs text-slate-400">9:00 - 11:00</div>
                    </div>
                    <Badge variant="secondary">Brain</Badge>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700">
                    <Target className="h-4 w-4 text-green-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Admin Tasks</div>
                      <div className="text-xs text-slate-400">2:00 - 3:30</div>
                    </div>
                    <Badge variant="outline">Admin</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Deep Work Session</span>
                    <span className="text-slate-400">Tomorrow 9:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly Review</span>
                    <span className="text-slate-400">Friday 4:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flow Reflection</span>
                    <span className="text-slate-400">Sunday 6:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
