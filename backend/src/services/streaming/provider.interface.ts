import { PlaybackResponse } from '../../types/streaming.types';

export interface StreamingProvider {
  name: string;
  getMovieSource(tmdbId: number): Promise<PlaybackResponse | null>;
  getEpisodeSource(tmdbId: number, season: number, episode: number): Promise<PlaybackResponse | null>;
}
