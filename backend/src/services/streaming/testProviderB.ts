import { StreamingProvider } from './provider.interface';
import { PlaybackResponse } from '../../types/streaming.types';

export class TestProviderB implements StreamingProvider {
  name = 'TestProviderB (Backup Open Streams)';

  async getMovieSource(tmdbId: number): Promise<PlaybackResponse | null> {
    return {
      tmdbId,
      title: `Movie ${tmdbId} (Backup Stream)`,
      mediaType: 'movie',
      servers: [
        {
          id: 'backup-sintel',
          name: '#1 Open Backup',
          quality: '1080p',
          type: 'mp4',
          icon: 'server',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        },
      ],
      sources: [
        {
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          type: 'mp4',
          quality: '1080p',
          server: 'Backup Cluster 2',
        },
      ],
      subtitles: [],
    };
  }

  async getEpisodeSource(tmdbId: number, season: number, episode: number): Promise<PlaybackResponse | null> {
    return {
      tmdbId,
      title: `TV ${tmdbId} S${season}E${episode} (Backup Stream)`,
      mediaType: 'tv',
      season,
      episode,
      servers: [
        {
          id: 'backup-blazes',
          name: '#1 Open Backup',
          quality: '720p',
          type: 'mp4',
          icon: 'server',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        },
      ],
      sources: [
        {
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          type: 'mp4',
          quality: '720p',
          server: 'Backup Cluster 2',
        },
      ],
      subtitles: [],
    };
  }
}
