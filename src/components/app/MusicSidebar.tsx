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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Repeat,
  Shuffle,
  Search,
  Music,
  Plus,
  ExternalLink,
} from "lucide-react";

export function MusicSidebar() {
  const { state, actions } = useMusicPlayer();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("playlists");

  if (!state.isPlaylistOpen) return null;

  const filteredPlaylists = DEFAULT_PLAYLISTS.filter(
    (playlist) =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playlist.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handlePlayPlaylist = (playlist: any) => {
    if (playlist.tracks.length > 0) {
      actions.playTrack(playlist.tracks[0], playlist);
    }
  };

  const handlePlayTrack = (track: any) => {
    actions.playTrack(track, state.currentPlaylist);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={actions.togglePlaylist}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l shadow-2xl z-50 transform transition-transform duration-300 ease-in-out",
          state.isPlaylistOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-focus/5">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-primary">Focus Music</h2>
              <Badge variant="outline" className="text-xs">
                Flow State
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.togglePlaylist}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Track Player */}
          {state.currentTrack && (
            <div className="p-4 border-b bg-muted/30">
              <div className="space-y-3">
                {/* Track Info */}
                <div className="flex items-start space-x-3">
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

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={actions.toggleShuffle}
                      className={cn(
                        "h-8 w-8 p-0",
                        state.isShuffling && "text-primary",
                      )}
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
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
                        state.isPlaying
                          ? actions.pauseTrack
                          : actions.resumeTrack
                      }
                      className="h-8 w-8 p-0"
                    >
                      {state.isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={actions.toggleLoop}
                      className={cn(
                        "h-8 w-8 p-0",
                        state.isLooping && "text-primary",
                      )}
                    >
                      <Repeat className="h-4 w-4" />
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
              </div>
            </div>
          )}

          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search playlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="h-full"
            >
              <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
                <TabsTrigger value="playlists">Playlists</TabsTrigger>
                <TabsTrigger value="queue">Queue</TabsTrigger>
              </TabsList>

              <TabsContent value="playlists" className="p-4 space-y-4">
                {filteredPlaylists.map((playlist) => (
                  <Card key={playlist.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {getCategoryIcon(playlist.category)}
                          </span>
                          <span>{playlist.name}</span>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: playlist.color }}
                          >
                            {playlist.tracks.length} tracks
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePlayPlaylist(playlist)}
                          className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-3">
                        {playlist.description}
                      </p>
                      <div className="space-y-2">
                        {playlist.tracks.map((track) => (
                          <div
                            key={track.id}
                            className={cn(
                              "flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors group",
                              state.currentTrack?.id === track.id &&
                                "bg-primary/10",
                            )}
                            onClick={() => handlePlayTrack(track)}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">
                                {track.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {track.artist} •{" "}
                                {formatDuration(track.duration)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add Custom Playlist */}
                <Card className="border-dashed border-2 border-muted-foreground/30">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium text-sm mb-1">
                      Add Custom Playlist
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Create your own focus music collection
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="queue" className="p-4">
                {state.currentPlaylist ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">Current Queue</h3>
                      <Badge variant="outline" className="text-xs">
                        {state.currentPlaylist.tracks.length} tracks
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {state.currentPlaylist.tracks.map((track, index) => (
                        <div
                          key={track.id}
                          className={cn(
                            "flex items-center space-x-3 p-2 rounded transition-colors",
                            state.currentTrack?.id === track.id
                              ? "bg-primary/10"
                              : "hover:bg-muted/50",
                          )}
                        >
                          <span className="text-xs text-muted-foreground w-6">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {track.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {track.artist}
                            </p>
                          </div>
                          {state.currentTrack?.id === track.id &&
                            state.isPlaying && (
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
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium text-sm mb-2">
                      No Active Queue
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Select a playlist to start listening
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
