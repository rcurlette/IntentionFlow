import { useState } from "react";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { DEFAULT_PLAYLISTS } from "@/lib/focus-playlists";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MusicPlayerTest() {
  const { state, actions } = useMusicPlayer();
  const [showTest, setShowTest] = useState(false);

  if (!showTest) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTest(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        🎵 Test Music
      </Button>
    );
  }

  const handlePlayClassical = () => {
    const classicalPlaylist = DEFAULT_PLAYLISTS.find(
      (p) => p.id === "classical-focus",
    );
    if (classicalPlaylist && classicalPlaylist.tracks.length > 0) {
      actions.playTrack(classicalPlaylist.tracks[0], classicalPlaylist);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>Music Player Test</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTest(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">
          Player State: {state.isPlaying ? "Playing" : "Stopped"}
          <br />
          Current Track: {state.currentTrack?.title || "None"}
        </div>

        <div className="space-y-2">
          <Button
            size="sm"
            onClick={handlePlayClassical}
            className="w-full justify-start"
          >
            🎼 Play Classical (Satie)
          </Button>

          <Button
            size="sm"
            onClick={actions.togglePlaylist}
            variant="outline"
            className="w-full justify-start"
          >
            🎵 Open Playlist
          </Button>

          {state.currentTrack && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={
                  state.isPlaying ? actions.pauseTrack : actions.resumeTrack
                }
                variant="outline"
              >
                {state.isPlaying ? "⏸️" : "▶️"}
              </Button>
              <Button size="sm" onClick={actions.stopTrack} variant="outline">
                ⏹️
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
