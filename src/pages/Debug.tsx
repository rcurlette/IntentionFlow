import { ConnectionTest } from "@/components/debug/ConnectionTest";
import { SupabaseTestPanel } from "@/components/debug/SupabaseTestPanel";
import { DatabaseSetupChecker } from "@/components/debug/DatabaseSetupChecker";
import { StorageManager } from "@/components/admin/StorageManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { config, getConfigStatus } from "@/lib/config";
import { getCurrentStorageMode } from "@/lib/storage-manager";
import {
  ArrowLeft,
  Bug,
  Shield,
  Database,
  Network,
  Settings,
  Activity,
  HardDrive,
  Zap,
  TestTube,
  AlertTriangle,
  RefreshCw,
  Trash2,
} from "lucide-react";

export default function Debug() {
  const envInfo = {
    nodeEnv: import.meta.env.MODE,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    adminEmail: import.meta.env.VITE_ADMIN_EMAIL,
    appUrl: import.meta.env.VITE_APP_URL,
    storageMode: getCurrentStorageMode(),
    configStatus: getConfigStatus(),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/" className="text-slate-400 hover:text-slate-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Bug className="h-12 w-12 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Debug Dashboard
            </h1>
            <p className="text-slate-400">
              Database testing, storage management, and system diagnostics
            </p>
          </div>
        </div>

        {/* System Status Overview */}
        <Card className="mb-6 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {envInfo.nodeEnv.toUpperCase()}
                </div>
                <div className="text-xs text-slate-400">Environment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">
                  <Badge
                    variant={envInfo.hasSupabaseKey ? "default" : "destructive"}
                  >
                    {envInfo.hasSupabaseKey ? "✓" : "✗"}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400">Database</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">
                  <Badge
                    variant={
                      envInfo.configStatus.valid ? "default" : "destructive"
                    }
                  >
                    {envInfo.configStatus.valid ? "✓" : "✗"}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400">Configuration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">
                  <Badge variant="outline" className="capitalize">
                    {envInfo.storageMode}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400">Storage Mode</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Issues Alert */}
        {!envInfo.configStatus.valid && (
          <Card className="mb-6 bg-red-500/10 border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <h3 className="text-red-400 font-medium mb-2">
                    Configuration Issues Detected
                  </h3>
                  <ul className="text-sm text-slate-300 space-y-1">
                    {envInfo.configStatus.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Debug Interface */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
            <TabsTrigger
              value="overview"
              className="flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="database"
              className="flex items-center space-x-2"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Database</span>
            </TabsTrigger>
            <TabsTrigger
              value="storage"
              className="flex items-center space-x-2"
            >
              <HardDrive className="h-4 w-4" />
              <span className="hidden sm:inline">Storage</span>
            </TabsTrigger>
            <TabsTrigger
              value="testing"
              className="flex items-center space-x-2"
            >
              <TestTube className="h-4 w-4" />
              <span className="hidden sm:inline">Testing</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Environment Info */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    <span>Environment Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Environment:</span>
                      <Badge variant="outline">{envInfo.nodeEnv}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Storage Mode:</span>
                      <Badge variant="outline" className="capitalize">
                        {envInfo.storageMode}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Supabase URL:</span>
                      <span className="text-green-400 font-mono text-xs break-all">
                        {envInfo.supabaseUrl ? "✓ Configured" : "✗ Not Set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">API Key:</span>
                      <span
                        className={`${envInfo.hasSupabaseKey ? "text-green-400" : "text-red-400"}`}
                      >
                        {envInfo.hasSupabaseKey ? "✓ Set" : "✗ Missing"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Admin Email:</span>
                      <span className="text-blue-400 font-mono text-xs">
                        {envInfo.adminEmail || "robert.curlette@gmail.com"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Page
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (
                          confirm(
                            "This will clear all local storage data. Continue?",
                          )
                        ) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Local Storage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Connection Test */}
            <ConnectionTest />

            {/* Recent Issues */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Network className="h-5 w-5 text-amber-400" />
                  <span>Common Issues & Solutions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">
                      Database Connection Issues
                    </h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>• Check Supabase project status</li>
                      <li>• Verify URL and API key</li>
                      <li>• Ensure project is not paused</li>
                      <li>• Check network connectivity</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-300 mb-2">
                      Storage Mode Issues
                    </h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>• Use localStorage for testing</li>
                      <li>• Enable fallback mode</li>
                      <li>• Check configuration settings</li>
                      <li>• Validate environment variables</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <DatabaseSetupChecker />
            <SupabaseTestPanel />
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="space-y-6">
            <StorageManager />
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            {/* Enhanced API Testing Panel */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5 text-purple-400" />
                  <span>API & Edge Function Testing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-slate-700/30 rounded">
                    <Database className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                    <h4 className="font-medium text-white">Database API</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Test CRUD operations
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-700/30 rounded">
                    <Network className="h-8 w-8 mx-auto mb-2 text-green-400" />
                    <h4 className="font-medium text-white">Edge Functions</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Test serverless functions
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-700/30 rounded">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                    <h4 className="font-medium text-white">Authentication</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Test auth flows
                    </p>
                  </div>
                </div>

                <div className="text-center py-8 text-slate-400">
                  <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">
                    Enhanced API testing tools coming soon!
                  </p>
                  <p className="text-sm">
                    Test your edge functions, database operations, and
                    authentication flows.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-400" />
                  <span>Configuration Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-300 mb-3">
                      Environment Variables
                    </h4>
                    <div className="bg-slate-700/30 p-3 rounded border border-slate-600">
                      <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap">
                        {`# Required Environment Variables
VITE_SUPABASE_URL=${envInfo.supabaseUrl || "your-supabase-url"}
VITE_SUPABASE_ANON_KEY=${envInfo.hasSupabaseKey ? "***configured***" : "your-anon-key"}
VITE_ADMIN_EMAIL=${envInfo.adminEmail || "robert.curlette@gmail.com"}

# Storage Configuration
VITE_FLOWTRACKER_STORAGE_MODE=${config.storageMode}
VITE_FLOWTRACKER_ENABLE_FALLBACK=${config.enableFallback}
VITE_FLOWTRACKER_DEBUG_STORAGE=${config.debugStorage}
VITE_FLOWTRACKER_FORCE_ADMIN_MODE=${config.forceAdminMode}`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-300 mb-3">
                      Current Configuration
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Storage Mode:</span>
                        <Badge variant="outline">{config.storageMode}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Enable Database:</span>
                        <Badge
                          variant={
                            config.enableDatabase ? "default" : "destructive"
                          }
                        >
                          {config.enableDatabase ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Enable Fallback:</span>
                        <Badge
                          variant={
                            config.enableFallback ? "default" : "secondary"
                          }
                        >
                          {config.enableFallback ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Debug Storage:</span>
                        <Badge
                          variant={
                            config.debugStorage ? "default" : "secondary"
                          }
                        >
                          {config.debugStorage ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Admin Mode:</span>
                        <Badge
                          variant={
                            config.forceAdminMode ? "default" : "secondary"
                          }
                        >
                          {config.forceAdminMode ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Development:</span>
                        <Badge
                          variant={
                            config.isDevelopment ? "default" : "secondary"
                          }
                        >
                          {config.isDevelopment ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Flags */}
                <div className="mt-6">
                  <h4 className="font-medium text-slate-300 mb-3">
                    Feature Flags
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(config.features).map(
                      ([feature, enabled]) => (
                        <div key={feature} className="text-center">
                          <Badge
                            variant={enabled ? "default" : "secondary"}
                            className="w-full"
                          >
                            {feature}
                          </Badge>
                          <div className="text-xs text-slate-400 mt-1">
                            {enabled ? "Enabled" : "Disabled"}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Schema Information */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-green-400" />
                  <span>Database Schema Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
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
                  ].map((table) => (
                    <div
                      key={table}
                      className="text-center p-3 bg-slate-700/30 rounded"
                    >
                      <div className="text-sm font-medium text-white">
                        {table}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Table</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-400 mt-4">
                  These are the required database tables for full functionality.
                  Use the Database tab to check if they exist and create them if
                  needed.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
