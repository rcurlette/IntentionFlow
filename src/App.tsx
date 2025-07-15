import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-context";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Import pages
import FlowDashboard from "./pages/FlowDashboard";
import FlowCoach from "./pages/FlowCoach";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Pomodoro from "./pages/Pomodoro";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import AIFeatures from "./pages/AIFeatures";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Debug from "./pages/Debug";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<FlowDashboard />} />
                <Route path="/flow-coach" element={<FlowCoach />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/pomodoro" element={<Pomodoro />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/ai-features" element={<AIFeatures />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
                <Route path="/debug" element={<Debug />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
