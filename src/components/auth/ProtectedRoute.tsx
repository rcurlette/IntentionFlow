import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "./LoginForm";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isConfigured } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Brain className="h-12 w-12 text-purple-400 animate-pulse" />
              <Loader2 className="h-6 w-6 text-yellow-300 absolute -top-1 -right-1 animate-spin" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-200 mb-2">
                Initializing FlowTracker
              </h3>
              <p className="text-slate-400">
                Preparing your flow environment...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If Supabase is not configured, show configuration message
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="relative">
              <Brain className="h-12 w-12 text-purple-400 mx-auto" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">
                Supabase Configuration Required
              </h3>
              <p className="text-slate-400 mb-4">
                Please configure your Supabase credentials to enable
                authentication.
              </p>
              <div className="bg-slate-700/30 p-4 rounded border border-slate-600 text-left">
                <p className="text-sm text-slate-300 mb-2">
                  Add to your .env file:
                </p>
                <pre className="text-xs text-green-400 font-mono">
                  {`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />;
  }

  // User is authenticated, show protected content
  return <>{children}</>;
}
