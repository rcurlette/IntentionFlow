import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import {
  Database,
  Play,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react";

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export function SupabaseTestPanel() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>(
    {},
  );
  const [isRunning, setIsRunning] = useState(false);
  // Generate proper UUID for testing
  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  };

  const [testUserId] = useState(generateUUID());
  const [customQuery, setCustomQuery] = useState("");
  const [queryResult, setQueryResult] = useState<any>(null);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    try {
      setIsRunning(true);
      const result = await testFn();
      setTestResults((prev) => ({
        ...prev,
        [testName]: {
          success: true,
          message: "Test passed",
          data: result,
        },
      }));
    } catch (error: any) {
      setTestResults((prev) => ({
        ...prev,
        [testName]: {
          success: false,
          message: "Test failed",
          error: error.message,
        },
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const testConnectionAndTables = async () => {
    if (!supabase) throw new Error("Supabase not configured");

    // Test connection by querying auth settings
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    // Test table access (this will show RLS enforcement)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("count(*)")
      .limit(1);

    return { connection: "OK", tables: profiles ? "Accessible" : "RLS Active" };
  };

  const testCreateProfile = async () => {
    if (!supabase) throw new Error("Supabase not configured");

    const profileData = {
      id: testUserId,
      email: `test-${Date.now()}@flowtracker.test`,
      name: "Test User",
      flow_archetype: "Deep Worker",
      flow_start_date: new Date().toISOString().split("T")[0],
    };

    const { data, error } = await supabase
      .from("profiles")
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const testCreateTask = async () => {
    if (!supabase) throw new Error("Supabase not configured");

    const taskData = {
      user_id: testUserId,
      title: `Test Task - ${new Date().toLocaleTimeString()}`,
      description: "This is a test task created from the debug panel",
      type: "brain" as const,
      period: "morning" as const,
      status: "todo" as const,
      priority: "high" as const,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert(taskData)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const testCreateFlowSession = async () => {
    if (!supabase) throw new Error("Supabase not configured");

    const sessionData = {
      user_id: testUserId,
      date: new Date().toISOString().split("T")[0],
      rituals: [
        {
          id: "meditation",
          name: "Mindful Presence",
          duration: 5,
          completed: true,
          isCore: true,
        },
        {
          id: "intention",
          name: "Flow Intention",
          duration: 3,
          completed: false,
          isCore: true,
        },
      ],
      flow_state: {
        energy: "high",
        focus: "sharp",
        mood: "inspired",
        environment: "optimal",
        assessedAt: new Date().toISOString(),
      },
      intention: "Test deep work session",
      phase: "foundation" as const,
      day_number: 1,
    };

    const { data, error } = await supabase
      .from("flow_sessions")
      .upsert(sessionData, { onConflict: "user_id,date" })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const testCreateFlowAction = async () => {
    if (!supabase) throw new Error("Supabase not configured");

    const actionData = {
      user_id: testUserId,
      action_id: "breath-reset",
      date: new Date().toISOString().split("T")[0],
      completed_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("flow_actions")
      .insert(actionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const testCreateUserSettings = async () => {
    if (!supabase) throw new Error("Supabase not configured");

    const settingsData = {
      user_id: testUserId,
      theme: "dark" as const,
      color_theme: "vibrant" as const,
      focus_duration: 25,
      short_break_duration: 5,
      long_break_duration: 15,
      daily_goal: 4,
      notifications_enabled: true,
      sound_enabled: true,
    };

    const { data, error } = await supabase
      .from("user_settings")
      .upsert(settingsData, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const readAllUserData = async () => {
    if (!supabase) throw new Error("Supabase not configured");

    const [profiles, tasks, sessions, actions, settings] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", testUserId),
      supabase.from("tasks").select("*").eq("user_id", testUserId),
      supabase.from("flow_sessions").select("*").eq("user_id", testUserId),
      supabase.from("flow_actions").select("*").eq("user_id", testUserId),
      supabase.from("user_settings").select("*").eq("user_id", testUserId),
    ]);

    return {
      profile: profiles.data?.[0],
      tasks: tasks.data,
      sessions: sessions.data,
      actions: actions.data,
      settings: settings.data?.[0],
    };
  };

  const cleanupTestData = async () => {
    if (!supabase) throw new Error("Supabase not configured");

    // Delete in reverse order due to foreign key constraints
    await Promise.all([
      supabase.from("flow_actions").delete().eq("user_id", testUserId),
      supabase.from("user_settings").delete().eq("user_id", testUserId),
      supabase.from("flow_sessions").delete().eq("user_id", testUserId),
      supabase.from("tasks").delete().eq("user_id", testUserId),
    ]);

    await supabase.from("profiles").delete().eq("id", testUserId);

    return "Test data cleaned up";
  };

  const runCustomQuery = async () => {
    if (!customQuery.trim()) return;

    try {
      setIsRunning(true);
      // This is a simplified example - in a real app you'd want more security
      const { data, error } = await supabase.rpc("custom_query", {
        query_text: customQuery,
      });

      if (error) throw error;
      setQueryResult(data);
    } catch (error: any) {
      setQueryResult({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const exportAdminData = () => {
    const adminData = {
      profile: JSON.parse(
        localStorage.getItem("flowtracker_admin_profile") || "{}",
      ),
      flowSessions: JSON.parse(
        localStorage.getItem("flowtracker_admin_flow_sessions") || "[]",
      ),
      flowActions: JSON.parse(
        localStorage.getItem("flowtracker_admin_flow_actions") || "[]",
      ),
      userSettings: JSON.parse(
        localStorage.getItem("flowtracker_admin_user_settings") || "{}",
      ),
    };

    const blob = new Blob([JSON.stringify(adminData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flowtracker-admin-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTestStatus = (testName: string) => {
    const result = testResults[testName];
    if (!result) return "pending";
    return result.success ? "success" : "error";
  };

  const getTestIcon = (testName: string) => {
    const status = getTestStatus(testName);
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Play className="h-4 w-4 text-slate-400" />;
    }
  };

  const tests = [
    {
      name: "connection",
      label: "Connection & Tables",
      fn: testConnectionAndTables,
    },
    { name: "profile", label: "Create Profile", fn: testCreateProfile },
    { name: "task", label: "Create Task", fn: testCreateTask },
    {
      name: "session",
      label: "Create Flow Session",
      fn: testCreateFlowSession,
    },
    { name: "action", label: "Create Flow Action", fn: testCreateFlowAction },
    {
      name: "settings",
      label: "Create User Settings",
      fn: testCreateUserSettings,
    },
    { name: "read", label: "Read All Data", fn: readAllUserData },
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-400" />
          <span>Supabase Database Testing</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tests" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tests">Database Tests</TabsTrigger>
            <TabsTrigger value="query">Custom Query</TabsTrigger>
            <TabsTrigger value="migration">Data Migration</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-4">
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                Test User ID: <code className="text-xs">{testUserId}</code>
                <br />
                This will create test data in your Supabase database.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tests.map((test) => (
                <Button
                  key={test.name}
                  variant="outline"
                  onClick={() => runTest(test.name, test.fn)}
                  disabled={isRunning}
                  className="justify-between h-auto p-3"
                >
                  <span>{test.label}</span>
                  {getTestIcon(test.name)}
                </Button>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={() => runTest("cleanup", cleanupTestData)}
                disabled={isRunning}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cleanup Test Data
              </Button>
              <Button
                onClick={() => setTestResults({})}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Results
              </Button>
            </div>

            {Object.keys(testResults).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-slate-300">Test Results:</h4>
                {Object.entries(testResults).map(([name, result]) => (
                  <div
                    key={name}
                    className={`p-3 rounded border ${
                      result.success
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{name}</span>
                      <Badge
                        variant={result.success ? "default" : "destructive"}
                      >
                        {result.success ? "Pass" : "Fail"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400">{result.message}</p>
                    {result.error && (
                      <p className="text-xs text-red-400 mt-1">
                        {result.error}
                      </p>
                    )}
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-slate-400">
                          Show data
                        </summary>
                        <pre className="text-xs bg-slate-700/30 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="query" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-query">Custom SQL Query</Label>
              <Textarea
                id="custom-query"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="SELECT * FROM profiles WHERE id = 'user-id';"
                className="font-mono text-sm"
                rows={4}
              />
            </div>

            <Button
              onClick={runCustomQuery}
              disabled={isRunning || !customQuery.trim()}
              className="w-full"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Execute Query
            </Button>

            {queryResult && (
              <div className="bg-slate-700/30 p-4 rounded border">
                <h4 className="font-medium mb-2">Query Result:</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(queryResult, null, 2)}
                </pre>
              </div>
            )}
          </TabsContent>

          <TabsContent value="migration" className="space-y-4">
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                Migrate your admin localStorage data to Supabase database.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={exportAdminData}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Admin Data (JSON)
              </Button>

              <Button
                onClick={() => {
                  // TODO: Implement migration logic
                  alert("Migration feature coming soon!");
                }}
                className="w-full"
                disabled
              >
                <Upload className="h-4 w-4 mr-2" />
                Migrate to Supabase (Coming Soon)
              </Button>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p>• Export creates a JSON file with all your admin data</p>
              <p>• Migration will transfer localStorage data to Supabase</p>
              <p>• Your data will be preserved during the transition</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
