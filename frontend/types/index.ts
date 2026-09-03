export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  media_type?: 'movie';
}

export interface TVShow {
  id: number;
  name: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
  seasons?: SeasonSummary[];
  media_type?: 'tv';
}

export interface SeasonSummary {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  episode_number: number;
  season_number: number;
  vote_average: number;
  runtime?: number;
}

export interface SeasonDetails {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string;
  episodes: Episode[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface MediaCredits {
  id: number;
  cast: CastMember[];
}

export interface StreamSource {
  url: string;
  type: 'hls' | 'mp4' | 'dash';
  quality: '1080p' | '720p' | '480p' | '360p' | 'auto';
  server?: string;
}

export interface SubtitleTrack {
  label: string;
  lang: string;
  url: string;
  default?: boolean;
}

export interface StreamServer {
  id: string;
  name: string;
  quality?: string;
  features?: string;
  type: 'embed' | 'hls' | 'mp4';
  url: string;
  icon?: 'zap' | 'globe' | 'radio' | 'play' | 'layers' | 'sparkles' | 'server' | 'monitor' | 'flame';
}

export interface PlaybackResponse {
  tmdbId: number;
  title: string;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  servers: StreamServer[];
  sources: StreamSource[];
  subtitles: SubtitleTrack[];
}

export interface WatchlistItem {
  id: string;
  userId?: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  voteAverage?: number;
  createdAt: string;
}

export interface WatchHistoryItem {
  id?: string;
  userId?: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  season?: number | null;
  episode?: number | null;
  progress: number;
  duration: number;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  preference?: {
    language: string;
    autoplay: boolean;
    defaultQuality: string;
    enableSubtitles: boolean;
  };
}
