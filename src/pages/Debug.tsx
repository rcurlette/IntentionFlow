import { ConnectionTest } from "@/components/debug/ConnectionTest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Bug, Shield, Database, Network } from "lucide-react";

export default function Debug() {
  const envInfo = {
    nodeEnv: import.meta.env.MODE,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    adminEmail: import.meta.env.VITE_ADMIN_EMAIL,
    appUrl: import.meta.env.VITE_APP_URL,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/auth" className="text-slate-400 hover:text-slate-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
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
              Diagnose and fix authentication and connection issues
            </p>
          </div>
        </div>

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
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Environment:</span>
                  <Badge variant="outline" className="ml-2">
                    {envInfo.nodeEnv}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-400">Supabase Configured:</span>
                  <Badge
                    variant={
                      envInfo.supabaseUrl && envInfo.hasSupabaseKey
                        ? "default"
                        : "destructive"
                    }
                    className="ml-2"
                  >
                    {envInfo.supabaseUrl && envInfo.hasSupabaseKey
                      ? "Yes"
                      : "No"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Supabase URL:</span>
                  <span className="text-green-400 font-mono text-xs break-all">
                    {envInfo.supabaseUrl || "Not Set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Has API Key:</span>
                  <span
                    className={`${envInfo.hasSupabaseKey ? "text-green-400" : "text-red-400"}`}
                  >
                    {envInfo.hasSupabaseKey ? "✓ Set" : "✗ Missing"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Admin Email:</span>
                  <span className="text-blue-400 font-mono text-xs">
                    {envInfo.adminEmail || "Not Set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">App URL:</span>
                  <span className="text-purple-400 font-mono text-xs">
                    {envInfo.appUrl || window.location.origin}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Info */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5 text-red-400" />
                <span>Current Issues</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded">
                <h4 className="text-red-400 font-medium mb-2">
                  Authentication Error
                </h4>
                <p className="text-sm text-slate-300 mb-2">
                  <code className="bg-slate-700 px-2 py-1 rounded text-xs">
                    TypeError: Failed to fetch
                  </code>
                </p>
                <p className="text-xs text-slate-400">
                  This usually indicates a network connectivity issue or CORS
                  problem with Supabase.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">
                  Possible Causes:
                </h4>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• Network connectivity issues</li>
                  <li>• Incorrect Supabase URL or API key</li>
                  <li>• CORS configuration problems</li>
                  <li>• Supabase service temporarily unavailable</li>
                  <li>• Environment variables not loaded correctly</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Connection Test */}
          <div className="lg:col-span-2">
            <ConnectionTest />
          </div>

          {/* Quick Fixes */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-green-400" />
                <span>Quick Fixes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-300">
                    Environment Variables
                  </h4>
                  <div className="bg-slate-700/30 p-3 rounded border border-slate-600">
                    <p className="text-xs text-slate-400 mb-2">
                      Add these to your <code>.env</code> file:
                    </p>
                    <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap">
                      {`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ADMIN_EMAIL=robert.curlette@gmail.com`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-slate-300">
                    Supabase Configuration
                  </h4>
                  <div className="bg-slate-700/30 p-3 rounded border border-slate-600">
                    <p className="text-xs text-slate-400 mb-2">
                      Check your Supabase project:
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1">
                      <li>• Project is not paused</li>
                      <li>• URL and API key are correct</li>
                      <li>• Authentication is enabled</li>
                      <li>• Site URL includes your domain</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
