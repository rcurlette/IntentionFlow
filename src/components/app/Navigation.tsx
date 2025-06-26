import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { NowPlaying } from "./NowPlaying";
import { useMusicPlayer } from "@/hooks/use-music-player";
import {
  Home,
  Target,
  Clock,
  BarChart3,
  Settings,
  Brain,
  Zap,
  Music,
} from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: Home,
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
    href: "/analytics",
    label: "Progress",
    icon: BarChart3,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function Navigation() {
  const location = useLocation();
  const { actions } = useMusicPlayer();

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

          <div className="flex items-center space-x-3">
            {/* Now Playing */}
            <NowPlaying />

            {/* Music Playlist Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.togglePlaylist}
              className="text-muted-foreground hover:text-foreground"
            >
              <Music className="h-4 w-4" />
            </Button>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center space-x-1">
              <ThemeSwitcher />
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
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
