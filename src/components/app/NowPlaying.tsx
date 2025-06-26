import { useState } from "react";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Music,
  Headphones,
} from "lucide-react";

export function NowPlaying() {
  const { state, actions } = useMusicPlayer();
  const [isHovered, setIsHovered] = useState(false);

  if (!state.currentTrack) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={actions.togglePlayerVisibility}
        className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
      >
        <Headphones className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">Focus Music</span>
      </Button>
    );
  }

  return (
    <div
      className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={actions.togglePlayerVisibility}
    >
      {/* Genre indicator */}
      <div
        className="w-2 h-2 rounded-full animate-pulse"
        style={{
          backgroundColor:
            state.currentTrack.genre === "classical"
              ? "rgb(102, 153, 255)"
              : state.currentTrack.genre === "ambient" ||
                  state.currentTrack.genre === "nature"
                ? "rgb(34, 197, 94)"
                : state.currentTrack.genre === "lofi"
                  ? "rgb(168, 85, 247)"
                  : "rgb(251, 152, 81)",
        }}
      />

      {/* Track info */}
      <div className="flex items-center space-x-2 min-w-0">
        <Music className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate max-w-32 sm:max-w-48">
            {state.currentTrack.title}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-32 sm:max-w-48">
            {state.currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Quick controls (show on hover) */}
      <div
        className={cn(
          "flex items-center space-x-1 transition-all duration-200",
          isHovered
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2 pointer-events-none",
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            actions.previousTrack();
          }}
        >
          <SkipBack className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            state.isPlaying ? actions.pauseTrack() : actions.resumeTrack();
          }}
        >
          {state.isPlaying ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            actions.nextTrack();
          }}
        >
          <SkipForward className="h-3 w-3" />
        </Button>
      </div>

      {/* Playing indicator */}
      {state.isPlaying && (
        <div className="flex items-center space-x-1">
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-3 bg-primary animate-pulse rounded-full" />
            <div
              className="w-0.5 h-2 bg-primary animate-pulse rounded-full"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-0.5 h-4 bg-primary animate-pulse rounded-full"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
