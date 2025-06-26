import { Playlist, FocusTrack } from "@/hooks/use-music-player";

export const DEFAULT_FOCUS_TRACKS: FocusTrack[] = [
  // Classical Focus
  {
    id: "classical-1",
    title: "Gymnopédie No. 1",
    artist: "Erik Satie",
    duration: 210,
    youtubeId: "S-Xm7s9eGM8",
    genre: "classical",
    description:
      "Peaceful and contemplative piano piece perfect for deep focus",
    thumbnail: "https://img.youtube.com/vi/S-Xm7s9eGM8/maxresdefault.jpg",
  },
  {
    id: "classical-2",
    title: "Canon in D",
    artist: "Johann Pachelbel",
    duration: 360,
    youtubeId: "NlprozGcs80",
    genre: "classical",
    description: "Timeless baroque masterpiece for sustained concentration",
    thumbnail: "https://img.youtube.com/vi/NlprozGcs80/maxresdefault.jpg",
  },
  {
    id: "classical-3",
    title: "Clair de Lune",
    artist: "Claude Debussy",
    duration: 300,
    youtubeId: "CvFH_6DNRCY",
    genre: "classical",
    description: "Dreamy impressionist piano for creative flow",
    thumbnail: "https://img.youtube.com/vi/CvFH_6DNRCY/maxresdefault.jpg",
  },

  // Ambient & Nature
  {
    id: "ambient-1",
    title: "Forest Rain Ambience",
    artist: "Nature Sounds",
    duration: 3600,
    youtubeId: "nDq6TstdEi8",
    genre: "nature",
    description: "Gentle rain sounds for deep concentration",
    thumbnail: "https://img.youtube.com/vi/nDq6TstdEi8/maxresdefault.jpg",
  },
  {
    id: "ambient-2",
    title: "Ocean Waves",
    artist: "Nature Sounds",
    duration: 3600,
    youtubeId: "WHPEKLQID4U",
    genre: "nature",
    description: "Calming ocean waves for stress relief",
    thumbnail: "https://img.youtube.com/vi/WHPEKLQID4U/maxresdefault.jpg",
  },
  {
    id: "ambient-3",
    title: "Deep Space Ambient",
    artist: "Ambient Music",
    duration: 3600,
    youtubeId: "1KaOrSuWZeM",
    genre: "ambient",
    description: "Expansive soundscapes for deep thinking",
    thumbnail: "https://img.youtube.com/vi/1KaOrSuWZeM/maxresdefault.jpg",
  },

  // Lo-Fi & Study Music
  {
    id: "lofi-1",
    title: "Lofi Hip Hop Study Mix",
    artist: "ChilledCow",
    duration: 3600,
    youtubeId: "5qap5aO4i9A",
    genre: "lofi",
    description: "Chill beats for focused study sessions",
    thumbnail: "https://img.youtube.com/vi/5qap5aO4i9A/maxresdefault.jpg",
  },
  {
    id: "lofi-2",
    title: "Coffee Shop Jazz",
    artist: "Smooth Jazz",
    duration: 3600,
    youtubeId: "bR7rZnCn2GU",
    genre: "lofi",
    description: "Relaxed jazz for productive work",
    thumbnail: "https://img.youtube.com/vi/bR7rZnCn2GU/maxresdefault.jpg",
  },

  // Binaural Beats
  {
    id: "binaural-1",
    title: "40Hz Gamma Waves - Focus",
    artist: "Binaural Beats",
    duration: 3600,
    youtubeId: "bOA8VdqBEUs",
    genre: "binaural",
    description: "Gamma waves for enhanced focus and concentration",
    thumbnail: "https://img.youtube.com/vi/bOA8VdqBEUs/maxresdefault.jpg",
  },
  {
    id: "binaural-2",
    title: "8Hz Alpha Waves - Creativity",
    artist: "Binaural Beats",
    duration: 3600,
    youtubeId: "WPni755-Krg",
    genre: "binaural",
    description: "Alpha waves for creative thinking and flow",
    thumbnail: "https://img.youtube.com/vi/WPni755-Krg/maxresdefault.jpg",
  },
];

export const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: "classical-focus",
    name: "Classical Focus",
    description: "Timeless classical pieces proven to enhance concentration",
    category: "focus",
    color: "rgb(102, 153, 255)",
    tracks: DEFAULT_FOCUS_TRACKS.filter((track) => track.genre === "classical"),
  },
  {
    id: "nature-sounds",
    name: "Nature & Ambient",
    description: "Natural soundscapes and ambient music for deep work",
    category: "relaxation",
    color: "rgb(34, 197, 94)",
    tracks: DEFAULT_FOCUS_TRACKS.filter(
      (track) => track.genre === "nature" || track.genre === "ambient",
    ),
  },
  {
    id: "study-vibes",
    name: "Study Vibes",
    description: "Lo-fi and chill beats for productive study sessions",
    category: "focus",
    color: "rgb(168, 85, 247)",
    tracks: DEFAULT_FOCUS_TRACKS.filter((track) => track.genre === "lofi"),
  },
  {
    id: "brain-waves",
    name: "Brainwave Enhancement",
    description: "Binaural beats for cognitive enhancement and focus",
    category: "deep-work",
    color: "rgb(251, 152, 81)",
    tracks: DEFAULT_FOCUS_TRACKS.filter((track) => track.genre === "binaural"),
  },
  {
    id: "ultimate-focus",
    name: "Ultimate Focus Mix",
    description: "The best tracks from all categories for maximum productivity",
    category: "focus",
    color: "rgb(239, 68, 68)",
    tracks: [
      DEFAULT_FOCUS_TRACKS[0], // Gymnopédie
      DEFAULT_FOCUS_TRACKS[3], // Forest Rain
      DEFAULT_FOCUS_TRACKS[6], // Lofi Study
      DEFAULT_FOCUS_TRACKS[8], // Gamma Waves
      DEFAULT_FOCUS_TRACKS[2], // Clair de Lune
    ],
  },
];

export function getPlaylistById(id: string): Playlist | undefined {
  return DEFAULT_PLAYLISTS.find((playlist) => playlist.id === id);
}

export function getTrackById(id: string): FocusTrack | undefined {
  return DEFAULT_FOCUS_TRACKS.find((track) => track.id === id);
}

export function getGenreColor(genre: FocusTrack["genre"]): string {
  switch (genre) {
    case "classical":
      return "rgb(102, 153, 255)";
    case "ambient":
      return "rgb(34, 197, 94)";
    case "nature":
      return "rgb(16, 185, 129)";
    case "binaural":
      return "rgb(251, 152, 81)";
    case "lofi":
      return "rgb(168, 85, 247)";
    case "instrumental":
      return "rgb(59, 130, 246)";
    default:
      return "rgb(156, 163, 175)";
  }
}

export function getCategoryIcon(category: Playlist["category"]): string {
  switch (category) {
    case "focus":
      return "🎯";
    case "creativity":
      return "🎨";
    case "deep-work":
      return "🧠";
    case "relaxation":
      return "🌿";
    case "custom":
      return "⭐";
    default:
      return "🎵";
  }
}

export function formatDuration(seconds: number): string {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}:00`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }
}
