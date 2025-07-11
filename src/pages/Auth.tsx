import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Sparkles,
  Brain,
  Zap,
  Target,
  AlertCircle,
  Mail,
  Lock,
  User,
} from "lucide-react";
import { adminEmail } from "@/lib/supabase";

export default function Auth() {
  const {
    user,
    loading,
    authError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    clearError,
  } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Clear error when component mounts
    clearError();
  }, [clearError]);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const { error } = await signInWithGoogle();
    if (error) {
      console.error("Error signing in:", error.message);
    }
    setIsSubmitting(false);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const { error } = await signInWithEmail(email, password);
    if (error) {
      console.error("Error signing in:", error.message);
    }
    setIsSubmitting(false);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const { error } = await signUpWithEmail(email, password);
    if (error) {
      console.error("Error signing up:", error.message);
    }
    setIsSubmitting(false);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Brain className="h-12 w-12 text-blue-400" />
              <Sparkles className="h-6 w-6 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            FlowTracker
          </h1>
          <p className="text-slate-300 mt-2">
            Transform into a flow practitioner
          </p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-slate-100">
              Welcome to Your Flow Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auth Error */}
            {authError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {/* Features Preview */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-slate-300">
                <Brain className="h-5 w-5 text-blue-400" />
                <span className="text-sm">Morning flow rituals & coaching</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Zap className="h-5 w-5 text-green-400" />
                <span className="text-sm">2-minute flow actions</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Target className="h-5 w-5 text-purple-400" />
                <span className="text-sm">66-day transformation journey</span>
              </div>
            </div>

            {/* Authentication Tabs */}
            <Tabs defaultValue="oauth" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                <TabsTrigger value="oauth" className="text-xs">
                  OAuth
                </TabsTrigger>
                <TabsTrigger value="email" className="text-xs">
                  Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="oauth" className="space-y-4 mt-6">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 font-medium"
                  size="lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  ) : (
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </TabsContent>

              <TabsContent value="email" className="space-y-4 mt-6">
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                    <TabsTrigger value="signin" className="text-xs">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="text-xs">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form
                      onSubmit={handleEmailSignIn}
                      className="space-y-4 mt-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-200">
                          <Mail className="h-4 w-4 inline mr-2" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-slate-100"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-200">
                          <Lock className="h-4 w-4 inline mr-2" />
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-slate-100"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting || !email || !password}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <User className="h-4 w-4 mr-2" />
                        )}
                        Sign In
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form
                      onSubmit={handleEmailSignUp}
                      className="space-y-4 mt-4"
                    >
                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-email"
                          className="text-slate-200"
                        >
                          <Mail className="h-4 w-4 inline mr-2" />
                          Email
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-slate-100"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-password"
                          className="text-slate-200"
                        >
                          <Lock className="h-4 w-4 inline mr-2" />
                          Password
                        </Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-slate-100"
                          minLength={6}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting || !email || !password}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <User className="h-4 w-4 mr-2" />
                        )}
                        Create Account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>

            <p className="text-xs text-slate-400 text-center">
              By signing in, you agree to our terms of service and privacy
              policy.
            </p>
          </CardContent>
        </Card>

        {/* Admin Info & Additional Info */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-slate-500">
            Join thousands of people transforming their productivity through
            flow states
          </p>
          <p className="text-xs text-slate-600">Admin: {adminEmail}</p>
        </div>
      </div>
    </div>
  );
}
