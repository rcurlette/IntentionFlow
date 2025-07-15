import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const Loading: React.FC<LoadingProps> = ({
  message = "Loading...",
  className,
  size = "md",
}) => {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="flex items-center space-x-2 text-slate-300">
        <Loader2 className={cn("animate-spin", sizeMap[size])} />
        <span>{message}</span>
      </div>
    </div>
  );
};

export const PageLoading: React.FC<LoadingProps> = ({
  message = "Loading your flow journey...",
  className,
}) => {
  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center",
        className,
      )}
    >
      <Loading message={message} size="lg" />
    </div>
  );
};
