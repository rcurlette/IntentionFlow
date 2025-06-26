import { useState } from "react";
import { useMusicPlayer } from "@/hooks/use-music-player";
import {
  DEFAULT_PLAYLISTS,
  getCategoryIcon,
  formatDuration,
} from "@/lib/focus-playlists";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Repeat,
  Shuffle,
  Music,
  Headphones,
  ExternalLink,
} from "lucide-react";

interface FocusMusicSelectorProps {
  isTimerRunning?: boolean;
  onMusicStart?: () => void;
}

export function FocusMusicSelector({
  isTimerRunning = false,
  onMusicStart,
}: FocusMusicSelectorProps) {
  const { state, actions } = useMusicPlayer();
  const [selectedTab, setSelectedTab] = useState("select");

  const handlePlayPlaylist = (playlist: any) => {
    if (playlist.tracks.length > 0) {
      actions.playTrack(playlist.tracks[0], playlist);
      onMusicStart?.();
    }
  };

  const handlePlayTrack = (track: any) => {
    actions.playTrack(track, state.currentPlaylist);
    onMusicStart?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Headphones className="h-5 w-5" />
          <span>Focus Music</span>
          {state.currentTrack && (
            <Badge variant="outline" className="text-xs">
              Playing
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Select Music</TabsTrigger>
            <TabsTrigger value="player" disabled={!state.currentTrack}>
              Now Playing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="space-y-4 mt-4">
            {!state.currentTrack ? (
              <div className="text-center py-6">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium text-sm mb-2">Enhance Your Focus</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Select scientifically-curated music to enter flow state
                </p>
              </div>
            ) : (
              <div className="text-center py-4 bg-primary/5 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Music Active</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {state.currentTrack.title} by {state.currentTrack.artist}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {DEFAULT_PLAYLISTS.slice(0, 4).map((playlist) => (
                <div
                  key={playlist.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer",
                    state.currentPlaylist?.id === playlist.id &&
                      "border-primary bg-primary/5",
                  )}
                  onClick={() => handlePlayPlaylist(playlist)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {getCategoryIcon(playlist.category)}
                    </span>
                    <div>
                      <h4 className="text-sm font-medium">{playlist.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {playlist.tracks.length} tracks • {playlist.category}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPlaylist(playlist);
                    }}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                🎵 Music scientifically proven to enhance focus and productivity
              </p>
            </div>
          </TabsContent>

          <TabsContent value="player" className="space-y-4 mt-4">
            {state.currentTrack ? (
              <div className="space-y-4">
                {/* Current Track Info */}
                <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                  {state.currentTrack.thumbnail && (
                    <img
                      src={state.currentTrack.thumbnail}
                      alt={state.currentTrack.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {state.currentTrack.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {state.currentTrack.artist}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor:
                            state.currentTrack.genre === "classical"
                              ? "rgb(102, 153, 255)"
                              : state.currentTrack.genre === "ambient"
                                ? "rgb(34, 197, 94)"
                                : "rgb(168, 85, 247)",
                        }}
                      >
                        {state.currentTrack.genre}
                      </Badge>
                      {state.currentTrack.youtubeId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            window.open(
                              `https://youtube.com/watch?v=${state.currentTrack!.youtubeId}`,
                              "_blank",
                            )
                          }
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDuration(Math.floor(state.currentTime))}</span>
                    <span>{formatDuration(state.currentTrack.duration)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div
                      className="bg-primary h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (state.currentTime / state.currentTrack.duration) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={actions.previousTrack}
                    className="h-8 w-8 p-0"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={
                      state.isPlaying ? actions.pauseTrack : actions.resumeTrack
                    }
                    className="h-10 w-10 p-0"
                  >
                    {state.isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={actions.nextTrack}
                    className="h-8 w-8 p-0"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={actions.toggleShuffle}
                      className={cn(
                        "h-7 w-7 p-0",
                        state.isShuffling && "text-primary",
                      )}
                    >
                      <Shuffle className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={actions.toggleLoop}
                      className={cn(
                        "h-7 w-7 p-0",
                        state.isLooping && "text-primary",
                      )}
                    >
                      <Repeat className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Volume */}
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={[state.volume]}
                      onValueChange={([value]) => actions.setVolume(value)}
                      max={1}
                      step={0.1}
                      className="w-16"
                    />
                  </div>
                </div>

                {/* Queue Info */}
                {state.currentPlaylist && (
                  <div className="text-center py-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Playing from{" "}
                      <span className="font-medium">
                        {state.currentPlaylist.name}
                      </span>
                      <br />
                      {state.currentPlaylist.tracks.length} tracks in queue
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium text-sm mb-2">No Music Selected</h3>
                <p className="text-xs text-muted-foreground">
                  Go to "Select Music" to choose a focus playlist
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
