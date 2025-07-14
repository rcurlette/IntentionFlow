import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-context";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
// Import pages that exist
import FlowDashboard from "./pages/FlowDashboard";
import FlowCoach from "./pages/FlowCoach";
import Debug from "./pages/Debug";

const queryClient = new QueryClient();

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
                <Route path="/flow" element={<FlowDashboard />} />
                <Route path="/coach" element={<FlowCoach />} />
                <Route path="/debug" element={<Debug />} />
                <Route path="*" element={<FlowDashboard />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
