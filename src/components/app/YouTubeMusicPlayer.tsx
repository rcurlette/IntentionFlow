import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  ExternalLink,
  Music,
} from "lucide-react";

interface YouTubeMusicPlayerProps {
  className?: string;
  autoPlay?: boolean;
}

export function YouTubeMusicPlayer({
  className,
  autoPlay = false,
}: YouTubeMusicPlayerProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState("");

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Load video
  const loadVideo = () => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setError("");
    setIsLoaded(true);
    setVideoTitle("Loading...");

    // Reset player state
    setIsPlaying(false);
  };

  // Play/Pause functionality
  const togglePlayPause = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      if (isPlaying) {
        // Send pause command
        iframe.contentWindow?.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          "*",
        );
      } else {
        // Send play command
        iframe.contentWindow?.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          "*",
        );
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (iframeRef.current) {
      const volumeLevel = newVolume[0];
      iframeRef.current.contentWindow?.postMessage(
        `{"event":"command","func":"setVolume","args":"${volumeLevel}"}`,
        "*",
      );
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (iframeRef.current) {
      if (isMuted) {
        iframeRef.current.contentWindow?.postMessage(
          '{"event":"command","func":"unMute","args":""}',
          "*",
        );
      } else {
        iframeRef.current.contentWindow?.postMessage(
          '{"event":"command","func":"mute","args":""}',
          "*",
        );
      }
      setIsMuted(!isMuted);
    }
  };

  // Restart video
  const restartVideo = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        '{"event":"command","func":"seekTo","args":"0"}',
        "*",
      );
      setIsPlaying(true);
    }
  };

  // Get embed URL
  const getEmbedUrl = () => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return "";

    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=${autoPlay ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0`;
  };

  // Popular focus music suggestions
  const suggestions = [
    {
      title: "Lofi Hip Hop Radio - beats to relax/study to",
      url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    },
    {
      title: "Deep Focus Music - Binaural Beats",
      url: "https://www.youtube.com/watch?v=WPni755-Krg",
    },
    {
      title: "Classical Music for Brain Power",
      url: "https://www.youtube.com/watch?v=O6txOvK-mAk",
    },
    {
      title: "Nature Sounds - Forest Rain",
      url: "https://www.youtube.com/watch?v=3sL0omwElxw",
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Music className="h-5 w-5" />
          <span>YouTube Music Player</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="youtube-url">YouTube URL</Label>
          <div className="flex space-x-2">
            <Input
              id="youtube-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1"
            />
            <Button onClick={loadVideo} size="sm">
              Load
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {/* Quick Suggestions */}
        <div className="space-y-2">
          <Label className="text-sm">Popular Focus Music:</Label>
          <div className="grid grid-cols-1 gap-1">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="justify-start text-left h-auto py-1"
                onClick={() => {
                  setVideoUrl(suggestion.url);
                  setError("");
                }}
              >
                <ExternalLink className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="text-xs truncate">{suggestion.title}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Video Player */}
        {isLoaded && videoUrl && (
          <div className="space-y-3">
            <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden">
              <iframe
                ref={iframeRef}
                src={getEmbedUrl()}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setVideoTitle("YouTube Video Loaded")}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={togglePlayPause}>
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={restartVideo}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2 flex-1 max-w-32 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="p-1"
                >
                  {isMuted || volume[0] === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Perfect for focus sessions and deep work! 🎵
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
