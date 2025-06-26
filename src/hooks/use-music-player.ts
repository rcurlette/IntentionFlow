import { useState, useEffect, useRef } from "react";

export interface FocusTrack {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  youtubeId?: string;
  spotifyId?: string;
  genre:
    | "classical"
    | "ambient"
    | "nature"
    | "binaural"
    | "lofi"
    | "instrumental";
  description?: string;
  thumbnail?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: FocusTrack[];
  category: "focus" | "creativity" | "deep-work" | "relaxation" | "custom";
  color: string;
}

interface MusicPlayerState {
  isPlaying: boolean;
  currentTrack: FocusTrack | null;
  currentPlaylist: Playlist | null;
  volume: number;
  isLooping: boolean;
  isShuffling: boolean;
  currentTime: number;
  isPlayerVisible: boolean;
  isPlaylistOpen: boolean;
}

export function useMusicPlayer() {
  const [state, setState] = useState<MusicPlayerState>({
    isPlaying: false,
    currentTrack: null,
    currentPlaylist: null,
    volume: 0.7,
    isLooping: false,
    isShuffling: false,
    currentTime: 0,
    isPlayerVisible: false,
    isPlaylistOpen: false,
  });

  const youtubePlayerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("flowtracker-music-player");
    if (saved) {
      try {
        const savedState = JSON.parse(saved);
        setState((prev) => ({
          ...prev,
          volume: savedState.volume || 0.7,
          isLooping: savedState.isLooping || false,
          isShuffling: savedState.isShuffling || false,
          isPlayerVisible: savedState.isPlayerVisible || false,
        }));
      } catch (error) {
        console.error("Failed to load music player state:", error);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const stateToSave = {
      volume: state.volume,
      isLooping: state.isLooping,
      isShuffling: state.isShuffling,
      isPlayerVisible: state.isPlayerVisible,
    };
    localStorage.setItem(
      "flowtracker-music-player",
      JSON.stringify(stateToSave),
    );
  }, [state.volume, state.isLooping, state.isShuffling, state.isPlayerVisible]);

  // Initialize YouTube API
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(script);

    (window as any).onYouTubeIframeAPIReady = () => {
      console.log("YouTube API ready");
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Progress tracking
  useEffect(() => {
    if (state.isPlaying && youtubePlayerRef.current) {
      intervalRef.current = setInterval(() => {
        try {
          const currentTime = youtubePlayerRef.current?.getCurrentTime() || 0;
          setState((prev) => ({ ...prev, currentTime }));
        } catch (error) {
          // Player not ready
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isPlaying]);

  const playTrack = (track: FocusTrack, playlist?: Playlist) => {
    setState((prev) => ({
      ...prev,
      currentTrack: track,
      currentPlaylist: playlist || prev.currentPlaylist,
      isPlaying: true,
      currentTime: 0,
    }));
  };

  const pauseTrack = () => {
    setState((prev) => ({ ...prev, isPlaying: false }));
  };

  const resumeTrack = () => {
    setState((prev) => ({ ...prev, isPlaying: true }));
  };

  const stopTrack = () => {
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      currentTrack: null,
      currentTime: 0,
    }));
  };

  const nextTrack = () => {
    if (!state.currentPlaylist || !state.currentTrack) return;

    const currentIndex = state.currentPlaylist.tracks.findIndex(
      (track) => track.id === state.currentTrack!.id,
    );

    let nextIndex;
    if (state.isShuffling) {
      nextIndex = Math.floor(
        Math.random() * state.currentPlaylist.tracks.length,
      );
    } else {
      nextIndex = (currentIndex + 1) % state.currentPlaylist.tracks.length;
    }

    const nextTrack = state.currentPlaylist.tracks[nextIndex];
    if (nextTrack) {
      playTrack(nextTrack, state.currentPlaylist);
    }
  };

  const previousTrack = () => {
    if (!state.currentPlaylist || !state.currentTrack) return;

    const currentIndex = state.currentPlaylist.tracks.findIndex(
      (track) => track.id === state.currentTrack!.id,
    );

    const prevIndex =
      currentIndex === 0
        ? state.currentPlaylist.tracks.length - 1
        : currentIndex - 1;

    const prevTrack = state.currentPlaylist.tracks[prevIndex];
    if (prevTrack) {
      playTrack(prevTrack, state.currentPlaylist);
    }
  };

  const setVolume = (volume: number) => {
    setState((prev) => ({ ...prev, volume }));
  };

  const toggleLoop = () => {
    setState((prev) => ({ ...prev, isLooping: !prev.isLooping }));
  };

  const toggleShuffle = () => {
    setState((prev) => ({ ...prev, isShuffling: !prev.isShuffling }));
  };

  const togglePlayerVisibility = () => {
    setState((prev) => ({ ...prev, isPlayerVisible: !prev.isPlayerVisible }));
  };

  const togglePlaylist = () => {
    setState((prev) => ({ ...prev, isPlaylistOpen: !prev.isPlaylistOpen }));
  };

  const onTrackEnd = () => {
    if (state.isLooping && state.currentTrack) {
      // Restart current track
      setState((prev) => ({ ...prev, currentTime: 0 }));
    } else {
      // Move to next track
      nextTrack();
    }
  };

  return {
    state,
    actions: {
      playTrack,
      pauseTrack,
      resumeTrack,
      stopTrack,
      nextTrack,
      previousTrack,
      setVolume,
      toggleLoop,
      toggleShuffle,
      togglePlayerVisibility,
      togglePlaylist,
      onTrackEnd,
    },
    refs: {
      youtubePlayerRef,
    },
  };
}
