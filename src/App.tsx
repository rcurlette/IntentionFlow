import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-context";
import { MusicPlayerProvider } from "@/components/app/MusicPlayerProvider";
import { FlowTrackingPrompt } from "@/components/app/FlowTrackingPrompt";
import { useFlowTracking } from "@/hooks/use-flow-tracking";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Pomodoro from "./pages/Pomodoro";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function FlowTracker() {
  const { isPromptOpen, hidePrompt, submitFlowEntry, isSubmitting } =
    useFlowTracking();

  return (
    <FlowTrackingPrompt
      isOpen={isPromptOpen}
      onClose={hidePrompt}
      onSubmit={submitFlowEntry}
      isSubmitting={isSubmitting}
    />
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <MusicPlayerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <FlowTracker />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/pomodoro" element={<Pomodoro />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MusicPlayerProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
