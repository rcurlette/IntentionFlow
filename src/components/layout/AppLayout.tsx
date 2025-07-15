import React from "react";
import { Navigation } from "@/components/app/Navigation";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title = "FlowTracker",
  description = "Intention-based productivity tracker",
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      <main className="pt-16">{children}</main>
    </div>
  );
};

export default AppLayout;
