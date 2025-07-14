import React, { ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="h-6 w-6" />
                <span>Something went wrong</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-slate-300">
                <p className="mb-3">
                  An unexpected error occurred in the FlowTracker app. This is
                  likely a temporary issue.
                </p>

                {this.state.error && (
                  <div className="bg-slate-700/30 p-3 rounded border border-slate-600">
                    <p className="text-xs font-mono text-red-400 mb-2">
                      Error: {this.state.error.message}
                    </p>
                    {process.env.NODE_ENV === "development" && (
                      <details className="text-xs text-slate-400">
                        <summary className="cursor-pointer hover:text-slate-300">
                          Technical details
                        </summary>
                        <pre className="mt-2 whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">
                  What you can try:
                </h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Refresh the page to reload the app</li>
                  <li>• Try again - the issue might be temporary</li>
                  <li>• Check your internet connection</li>
                  <li>• Clear your browser cache if the problem persists</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Reload App
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-slate-500">
                  FlowTracker Admin Mode - Your data is safe in localStorage
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode,
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
