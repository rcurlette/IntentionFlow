import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import {
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Copy,
} from "lucide-react";

interface TableStatus {
  name: string;
  exists: boolean;
  accessible: boolean;
  error?: string;
}

export function DatabaseSetupChecker() {
  const [checking, setChecking] = useState(false);
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [setupInstructions, setSetupInstructions] = useState(false);

  const requiredTables = [
    "profiles",
    "user_settings",
    "tasks",
    "flow_sessions",
    "pomodoro_sessions",
    "flow_actions",
    "achievements",
    "user_streaks",
    "flow_entries",
    "flow_tracking_settings",
  ];

  const checkDatabaseSetup = async () => {
    if (!supabase) {
      setTableStatuses([]);
      return;
    }

    setChecking(true);
    const statuses: TableStatus[] = [];

    for (const tableName of requiredTables) {
      try {
        // Check if table exists by attempting a simple query
        const { data, error } = await supabase
          .from(tableName)
          .select("count(*)")
          .limit(1);

        const exists = !error?.message.includes("does not exist");
        const accessible = !error || error.code !== "42P01";

        statuses.push({
          name: tableName,
          exists,
          accessible,
          error: error?.message,
        });
      } catch (error: any) {
        statuses.push({
          name: tableName,
          exists: false,
          accessible: false,
          error: error.message,
        });
      }
    }

    setTableStatuses(statuses);
    setChecking(false);

    // Show setup instructions if any tables are missing
    const anyMissing = statuses.some((status) => !status.exists);
    if (anyMissing) {
      setSetupInstructions(true);
    }
  };

  const getStatusIcon = (status: TableStatus) => {
    if (!status.exists) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (!status.accessible) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusBadge = (status: TableStatus) => {
    if (!status.exists) {
      return <Badge variant="destructive">Missing</Badge>;
    }
    if (!status.accessible) {
      return <Badge variant="secondary">RLS Active</Badge>;
    }
    return <Badge variant="default">Ready</Badge>;
  };

  const copySetupSQL = () => {
    const sqlContent = `-- FlowTracker Database Schema Setup
-- Run this in your Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    flow_archetype TEXT,
    flow_start_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('brain', 'admin')),
    period TEXT NOT NULL CHECK (period IN ('morning', 'afternoon')),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    completed BOOLEAN DEFAULT FALSE,
    time_block INTEGER,
    time_estimate INTEGER,
    time_spent INTEGER,
    pomodoro_count INTEGER DEFAULT 0,
    tags TEXT[],
    context_tags TEXT[],
    scheduled_for DATE,
    due_date TIMESTAMP WITH TIME ZONE,
    due_time TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    subtask_ids TEXT[],
    depth INTEGER DEFAULT 0,
    is_subtask BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    project_id TEXT,
    energy TEXT CHECK (energy IN ('low', 'medium', 'high')),
    focus TEXT CHECK (focus IN ('shallow', 'deep')),
    delegated_to TEXT,
    waiting_for TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create flow_sessions table
CREATE TABLE IF NOT EXISTS flow_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    rituals JSONB NOT NULL,
    flow_state JSONB NOT NULL,
    intention TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    phase TEXT NOT NULL CHECK (phase IN ('foundation', 'building', 'mastery')),
    day_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Create flow_actions table
CREATE TABLE IF NOT EXISTS flow_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_id TEXT NOT NULL,
    date DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
    color_theme TEXT DEFAULT 'vibrant' CHECK (color_theme IN ('vibrant', 'accessible')),
    focus_duration INTEGER DEFAULT 25,
    short_break_duration INTEGER DEFAULT 5,
    long_break_duration INTEGER DEFAULT 15,
    sessions_before_long_break INTEGER DEFAULT 4,
    auto_start_breaks BOOLEAN DEFAULT FALSE,
    auto_start_pomodoros BOOLEAN DEFAULT FALSE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    daily_goal INTEGER DEFAULT 4,
    vision_board_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own flow sessions" ON flow_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flow sessions" ON flow_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flow sessions" ON flow_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own flow actions" ON flow_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flow actions" ON flow_actions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_flow_sessions_user_id ON flow_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_flow_actions_user_id ON flow_actions(user_id);`;

    navigator.clipboard.writeText(sqlContent).then(() => {
      alert("Setup SQL copied to clipboard!");
    });
  };

  const allTablesReady =
    tableStatuses.length > 0 && tableStatuses.every((status) => status.exists);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-purple-400" />
          <span>Database Setup Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-400">
            Check if all required database tables are set up correctly
          </p>
          <Button
            onClick={checkDatabaseSetup}
            disabled={checking}
            size="sm"
            variant="outline"
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Check Setup
          </Button>
        </div>

        {tableStatuses.length > 0 && (
          <div className="space-y-3">
            <div className="grid gap-2">
              {tableStatuses.map((status) => (
                <div
                  key={status.name}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded border border-slate-600"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status)}
                    <span className="font-medium">{status.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(status)}
                  </div>
                </div>
              ))}
            </div>

            <Alert
              variant={allTablesReady ? "default" : "destructive"}
              className={allTablesReady ? "border-green-500/30" : ""}
            >
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {allTablesReady
                  ? "✅ All database tables are set up correctly!"
                  : "❌ Some database tables are missing. Run the setup SQL to create them."}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {setupInstructions && (
          <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded">
            <h4 className="font-medium text-blue-400 mb-3">
              Database Setup Required
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="space-y-2">
                <p className="font-medium">Quick Setup Steps:</p>
                <ol className="space-y-1 list-decimal list-inside text-slate-400">
                  <li>Go to your Supabase project dashboard</li>
                  <li>Navigate to SQL Editor</li>
                  <li>Copy and run the setup SQL</li>
                  <li>Verify all tables are created</li>
                  <li>Come back and run the check again</li>
                </ol>
              </div>

              <div className="flex space-x-2">
                <Button onClick={copySetupSQL} size="sm" className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Setup SQL
                </Button>
                <Button
                  onClick={() =>
                    window.open("https://app.supabase.com", "_blank")
                  }
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Supabase
                </Button>
              </div>
            </div>
          </div>
        )}

        {tableStatuses.length > 0 && (
          <div className="text-xs text-slate-500 space-y-1">
            <p>
              • <strong>Missing:</strong> Table doesn't exist in database
            </p>
            <p>
              • <strong>RLS Active:</strong> Row Level Security is enforcing
              access control
            </p>
            <p>
              • <strong>Ready:</strong> Table exists and is accessible
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
