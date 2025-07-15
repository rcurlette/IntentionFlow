import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <AppLayout
      title="Page Not Found"
      description="The page you're looking for doesn't exist"
    >
      <div className="pt-4 pb-8 px-4 container mx-auto max-w-2xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
            <CardContent className="text-center p-8">
              <div className="mb-6">
                <AlertTriangle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">404</h1>
                <h2 className="text-xl text-slate-300 mb-4">Page Not Found</h2>
                <p className="text-slate-400">
                  The page you're looking for doesn't exist or has been moved.
                </p>
              </div>

              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link to="#" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
