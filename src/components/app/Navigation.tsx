import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  Home,
  Target,
  Clock,
  BarChart3,
  Settings,
  Brain,
  Zap,
  BookOpen,
  Sparkles,
  Calendar,
  User,
  LogOut,
  CreditCard,
} from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Flow",
    icon: Brain,
  },
  {
    href: "/flow-coach",
    label: "Coach",
    icon: Sparkles,
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: Target,
  },
  {
    href: "/pomodoro",
    label: "Focus",
    icon: Clock,
  },
  {
    href: "/dashboard",
    label: "Analytics",
    icon: Home,
  },
  {
    href: "/analytics",
    label: "Progress",
    icon: BarChart3,
  },
  {
    href: "/ai-features",
    label: "AI Features",
    icon: Sparkles,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
  {
    href: "/about",
    label: "About",
    icon: BookOpen,
  },
];

export function Navigation() {
  const location = useLocation();
  const { user, userProfile, signOut } = useAdminAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Brain className="h-8 w-8 text-primary animate-pulse-soft" />
                <Zap className="absolute -top-1 -right-1 h-4 w-4 text-energy animate-wiggle" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-focus to-energy bg-clip-text text-transparent">
                  FlowTracker
                </h1>
                <p className="text-xs text-muted-foreground">
                  Intention-based productivity
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "relative",
                    isActive &&
                      "bg-primary text-primary-foreground shadow-lg animate-pulse-soft",
                  )}
                >
                  <Link to={item.href}>
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{item.label}</span>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-energy rounded-full animate-pulse" />
                    )}
                  </Link>
                </Button>
              );
            })}

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-8 w-8 rounded-full ml-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        userProfile?.avatar_url ||
                        user?.user_metadata?.avatar_url
                      }
                      alt={userProfile?.full_name || user?.email || "User"}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(userProfile?.full_name || user?.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-slate-800 border-slate-700"
                align="end"
              >
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        userProfile?.avatar_url ||
                        user?.user_metadata?.avatar_url
                      }
                      alt={userProfile?.full_name || user?.email || "User"}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(userProfile?.full_name || user?.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-slate-200">
                      {userProfile?.full_name || "FlowTracker User"}
                    </p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-slate-600" />
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="text-slate-200 focus:bg-slate-700"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/billing"
                    className="text-slate-200 focus:bg-slate-700"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing & Costs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings"
                    className="text-slate-200 focus:bg-slate-700"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-600" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-400 focus:bg-slate-700 focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
