import { Navigation } from "@/components/app/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Brain, FileText, Plus, Filter } from "lucide-react";

export default function Tasks() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-8 px-4 container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-focus to-energy bg-clip-text text-transparent mb-2">
            Task Management
          </h1>
          <p className="text-muted-foreground">
            Organize your brain and admin tasks for optimal flow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-focus/20 to-focus/10 border-focus/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-focus">
                <Brain className="h-5 w-5" />
                <span>Brain Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Deep work, creative thinking, and complex problem-solving tasks
              </p>
              <Button className="w-full bg-focus text-focus-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add Brain Task
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-admin/20 to-admin/10 border-admin/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-admin">
                <FileText className="h-5 w-5" />
                <span>Admin Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Emails, meetings, routine tasks, and administrative work
              </p>
              <Button className="w-full bg-admin text-admin-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Add Admin Task
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Quick Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  🔥 High Priority
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  ⏰ Today's Tasks
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  ✅ Completed
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center py-12 text-muted-foreground">
          <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">
            Advanced Task Management Coming Soon!
          </h3>
          <p>
            This page will include task templates, bulk operations, advanced
            filtering, and task analytics.
          </p>
          <p className="text-sm mt-2">
            For now, you can manage tasks from the Dashboard! 🚀
          </p>
        </div>
      </main>
    </div>
  );
}
