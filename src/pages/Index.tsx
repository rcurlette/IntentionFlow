import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard since this is now a fallback
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-focus/5">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-primary flex items-center justify-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-primary"
            viewBox="0 0 50 50"
          >
            <circle
              className="opacity-30"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
            />
            <circle
              className="text-primary"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
              strokeDasharray="100"
              strokeDashoffset="75"
            />
          </svg>
          Loading FlowTracker...
        </h1>
        <p className="mt-4 text-muted-foreground max-w-md">
          🚀 Redirecting to your productivity dashboard
        </p>
      </div>
    </div>
  );
};

export default Index;
