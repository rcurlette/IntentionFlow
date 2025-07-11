import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface ConnectionTestProps {
  className?: string;
}

export function ConnectionTest({ className }: ConnectionTestProps) {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);

  const runConnectionTests = async () => {
    setIsRunning(true);
    const results: Record<string, any> = {};

    // Test 1: Environment Variables
    results.envVars = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      adminEmail: import.meta.env.VITE_ADMIN_EMAIL,
      appUrl: import.meta.env.VITE_APP_URL,
    };

    // Test 2: Basic Network Connectivity
    try {
      const response = await fetch("https://httpbin.org/json");
      results.networkTest = {
        success: response.ok,
        status: response.status,
      };
    } catch (error) {
      results.networkTest = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Test 3: Supabase URL Connectivity
    if (results.envVars.supabaseUrl) {
      try {
        const supabaseResponse = await fetch(
          `${results.envVars.supabaseUrl}/rest/v1/`,
        );
        results.supabaseConnectivity = {
          success:
            supabaseResponse.status === 200 || supabaseResponse.status === 404, // 404 is normal for base URL
          status: supabaseResponse.status,
          statusText: supabaseResponse.statusText,
        };
      } catch (error) {
        results.supabaseConnectivity = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    // Test 4: Supabase Auth Endpoint
    if (results.envVars.supabaseUrl && results.envVars.hasAnonKey) {
      try {
        const authResponse = await fetch(
          `${results.envVars.supabaseUrl}/auth/v1/settings`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          },
        );
        results.supabaseAuth = {
          success: authResponse.ok,
          status: authResponse.status,
          statusText: authResponse.statusText,
        };
      } catch (error) {
        results.supabaseAuth = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    // Test 5: CORS Test
    try {
      const corsResponse = await fetch(
        `${results.envVars.supabaseUrl}/rest/v1/`,
        {
          method: "OPTIONS",
        },
      );
      results.corsTest = {
        success: corsResponse.ok || corsResponse.status === 204,
        status: corsResponse.status,
        headers: Object.fromEntries(corsResponse.headers.entries()),
      };
    } catch (error) {
      results.corsTest = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (success: boolean | undefined) => {
    if (success === undefined)
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean | undefined) => {
    if (success === undefined)
      return <Badge variant="secondary">Not Tested</Badge>;
    return success ? (
      <Badge variant="default" className="bg-green-600">
        Pass
      </Badge>
    ) : (
      <Badge variant="destructive">Fail</Badge>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Connection Diagnostics</span>
          <Button
            onClick={runConnectionTests}
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testing...
              </>
            ) : (
              "Run Tests"
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.keys(testResults).length === 0 && !isRunning && (
          <p className="text-sm text-muted-foreground">
            Click "Run Tests" to diagnose connection issues
          </p>
        )}

        {testResults.envVars && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Environment Variables</span>
              {getStatusBadge(
                !!testResults.envVars.supabaseUrl &&
                  testResults.envVars.hasAnonKey,
              )}
            </div>
            <div className="text-xs space-y-1 bg-muted p-2 rounded">
              <div>
                Supabase URL: {testResults.envVars.supabaseUrl || "Missing"}
              </div>
              <div>
                Has Anon Key: {testResults.envVars.hasAnonKey ? "Yes" : "No"}
              </div>
              <div>
                Admin Email: {testResults.envVars.adminEmail || "Not Set"}
              </div>
              <div>App URL: {testResults.envVars.appUrl || "Not Set"}</div>
            </div>
          </div>
        )}

        {testResults.networkTest && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Basic Network</span>
              {getStatusIcon(testResults.networkTest.success)}
              {getStatusBadge(testResults.networkTest.success)}
            </div>
            <div className="text-xs bg-muted p-2 rounded">
              {testResults.networkTest.success
                ? `HTTP ${testResults.networkTest.status} - Network OK`
                : `Error: ${testResults.networkTest.error}`}
            </div>
          </div>
        )}

        {testResults.supabaseConnectivity && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Supabase Connectivity</span>
              {getStatusIcon(testResults.supabaseConnectivity.success)}
              {getStatusBadge(testResults.supabaseConnectivity.success)}
            </div>
            <div className="text-xs bg-muted p-2 rounded">
              {testResults.supabaseConnectivity.success
                ? `HTTP ${testResults.supabaseConnectivity.status} - Supabase reachable`
                : `Error: ${testResults.supabaseConnectivity.error}`}
            </div>
          </div>
        )}

        {testResults.supabaseAuth && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Supabase Auth Service</span>
              {getStatusIcon(testResults.supabaseAuth.success)}
              {getStatusBadge(testResults.supabaseAuth.success)}
            </div>
            <div className="text-xs bg-muted p-2 rounded">
              {testResults.supabaseAuth.success
                ? `HTTP ${testResults.supabaseAuth.status} - Auth service OK`
                : `HTTP ${testResults.supabaseAuth.status} - ${testResults.supabaseAuth.error || testResults.supabaseAuth.statusText}`}
            </div>
          </div>
        )}

        {testResults.corsTest && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CORS Configuration</span>
              {getStatusIcon(testResults.corsTest.success)}
              {getStatusBadge(testResults.corsTest.success)}
            </div>
            <div className="text-xs bg-muted p-2 rounded">
              {testResults.corsTest.success
                ? `CORS headers OK`
                : `CORS Error: ${testResults.corsTest.error}`}
            </div>
          </div>
        )}

        {Object.keys(testResults).length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded border">
            <h4 className="text-sm font-medium mb-2">Troubleshooting Tips:</h4>
            <ul className="text-xs space-y-1">
              <li>
                • If env vars are missing, check your .env file and restart the
                dev server
              </li>
              <li>
                • If Supabase is unreachable, verify your VITE_SUPABASE_URL is
                correct
              </li>
              <li>
                • If auth service fails, check your API key and Supabase project
                status
              </li>
              <li>
                • If CORS fails, check your Supabase project's allowed origins
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
