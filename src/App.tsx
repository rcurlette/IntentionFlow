import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-context";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MusicPlayerProvider } from "@/components/app/MusicPlayerProvider";
import { FlowTrackingPrompt } from "@/components/app/FlowTrackingPrompt";
import { useFlowTracking } from "@/hooks/use-flow-tracking";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Loader2 } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Pomodoro from "./pages/Pomodoro";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import About from "./pages/About";
import ApiDemo from "./pages/ApiDemo";
import AIFeatures from "./pages/AIFeatures";
import Calendar from "./pages/Calendar";
import FlowDashboard from "./pages/FlowDashboard";
import FlowCoach from "./pages/FlowCoach";
import FlowTrackerPopupPage from "./pages/FlowTrackerPopupPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const {
    isPromptOpen,
    hidePrompt,
    submitFlowEntry,
    isSubmitting,
    triggerManualPrompt,
  } = useFlowTracking();

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onFlowTracker: triggerManualPrompt,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-slate-300">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <FlowTrackingPrompt
        isOpen={isPromptOpen}
        onClose={hidePrompt}
        onSubmit={submitFlowEntry}
        isSubmitting={isSubmitting}
      />
      <Routes>
        <Route path="/" element={<FlowDashboard />} />
        <Route path="/flow" element={<FlowDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="/ai-features" element={<AIFeatures />} />
        <Route path="/api-demo" element={<ApiDemo />} />
        <Route path="/flow-tracker-popup" element={<FlowTrackerPopupPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>

    <AuthProvider>
      <ThemeProvider>
        <MusicPlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/*" element={<ProtectedRoutes />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </MusicPlayerProvider>
      </ThemeProvider>
    </AuthProvider>

  </QueryClientProvider>
);

export default App;
