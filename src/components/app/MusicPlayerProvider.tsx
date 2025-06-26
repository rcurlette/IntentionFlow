import { useMusicPlayer } from "@/hooks/use-music-player";
import { YouTubePlayer } from "./YouTubePlayer";
import { MusicSidebar } from "./MusicSidebar";

export function MusicPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state, actions, refs } = useMusicPlayer();

  return (
    <>
      {children}

      {/* Hidden YouTube Player */}
      <YouTubePlayer
        track={state.currentTrack}
        isPlaying={state.isPlaying}
        volume={state.volume}
        onReady={(player) => {
          refs.youtubePlayerRef.current = player;
        }}
        onEnd={actions.onTrackEnd}
        onStateChange={(playerState) => {
          // Handle YouTube player state changes if needed
          console.log("YouTube player state:", playerState);
        }}
      />

      {/* Music Sidebar */}
      <MusicSidebar />
    </>
  );
}
