import { useEffect, useRef } from "react";
import { FocusTrack } from "@/hooks/use-music-player";

interface YouTubePlayerProps {
  track: FocusTrack | null;
  isPlaying: boolean;
  volume: number;
  onReady: (player: any) => void;
  onEnd: () => void;
  onStateChange?: (state: number) => void;
}

export function YouTubePlayer({
  track,
  isPlaying,
  volume,
  onReady,
  onEnd,
  onStateChange,
}: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!track?.youtubeId || !containerRef.current) return;

    // Clean up existing player
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    // Create new player
    const player = new (window as any).YT.Player(containerRef.current, {
      height: "200",
      width: "100%",
      videoId: track.youtubeId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: (event: any) => {
          playerRef.current = event.target;
          onReady(event.target);
        },
        onStateChange: (event: any) => {
          onStateChange?.(event.data);
          // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
          if (event.data === 0) {
            onEnd();
          }
        },
        onError: (event: any) => {
          console.error("YouTube player error:", event.data);
        },
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [track?.youtubeId]);

  // Handle play/pause
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (error) {
      console.error("Error controlling YouTube player:", error);
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      playerRef.current.setVolume(volume * 100);
    } catch (error) {
      console.error("Error setting YouTube player volume:", error);
    }
  }, [volume]);

  return (
    <div className="hidden">
      <div ref={containerRef} />
    </div>
  );
}
