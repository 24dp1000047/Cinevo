export interface StreamServer {
  id: string;
  name: string;
  quality?: string;
  type: 'embed' | 'hls' | 'mp4';
  url: string;
  icon?: 'zap' | 'globe' | 'radio' | 'play' | 'layers' | 'sparkles' | 'server';
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
