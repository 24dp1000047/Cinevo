import { StreamingProvider } from './provider.interface';
import { PlaybackResponse, StreamServer, StreamSource } from '../../types/streaming.types';
import axios from 'axios';
import { ENV } from '../../config/env';

export class TestProviderA implements StreamingProvider {
  name = 'TestProviderA (Multi-Server & HLS)';

  private generateServers(tmdbId: number, season?: number, episode?: number): StreamServer[] {
    const isTV = Boolean(season && episode);
    const s = season || 1;
    const e = episode || 1;

    return [
      {
        id: 'vidlink',
        name: '#1 VidLink Pro',
        quality: '1080p HD',
        type: 'embed',
        icon: 'zap',
        url: isTV
          ? `https://vidlink.pro/tv/${tmdbId}/${s}/${e}`
          : `https://vidlink.pro/movie/${tmdbId}`,
      },
      {
        id: 'vidsrc-su',
        name: '#2 VidSrc.su',
        quality: '1080p Ultra',
        type: 'embed',
        icon: 'globe',
        url: isTV
          ? `https://vidsrc.su/embed/tv/${tmdbId}/${s}/${e}`
          : `https://vidsrc.su/embed/movie/${tmdbId}`,
      },
      {
        id: 'autoembed',
        name: '#3 AutoEmbed.co',
        quality: '1080p HD',
        type: 'embed',
        icon: 'radio',
        url: isTV
          ? `https://player.autoembed.cc/embed/tv/${tmdbId}/${s}/${e}`
          : `https://player.autoembed.cc/embed/movie/${tmdbId}`,
      },
      {
        id: 'vidsrc-me',
        name: '#4 VidSrc.me',
        quality: '1080p HD',
        type: 'embed',
        icon: 'play',
        url: isTV
          ? `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${s}&episode=${e}`
          : `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
      },
      {
        id: 'smashy',
        name: '#5 SmashyStream',
        quality: '1080p HD',
        type: 'embed',
        icon: 'layers',
        url: isTV
          ? `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${s}&episode=${e}`
          : `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
      },
      {
        id: 'embed-su',
        name: '#6 Embed.su',
        quality: '1080p HD',
        type: 'embed',
        icon: 'sparkles',
        url: isTV
          ? `https://embed.su/embed/tv/${tmdbId}/${s}/${e}`
          : `https://embed.su/embed/movie/${tmdbId}`,
      },
      {
        id: 'native-hls',
        name: '#7 Cinevo Direct',
        quality: 'Direct HLS',
        type: 'hls',
        icon: 'server',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      },
    ];
  }

  async getMovieSource(tmdbId: number): Promise<PlaybackResponse | null> {
    // If a custom external test stream API is configured, attempt query
    if (ENV.TEST_STREAM_API_URL) {
      try {
        const res = await axios.get(`${ENV.TEST_STREAM_API_URL}/movie/${tmdbId}`, {
          headers: ENV.TEST_STREAM_API_KEY ? { Authorization: `Bearer ${ENV.TEST_STREAM_API_KEY}` } : {},
          timeout: 4000,
        });
        if (res.data && res.data.sources) {
          return {
            ...res.data,
            servers: res.data.servers || this.generateServers(tmdbId),
          };
        }
      } catch (err) {
        console.warn('[TestProviderA] Custom endpoint error, falling back to verified test streams');
      }
    }

    const servers = this.generateServers(tmdbId);
    const sources: StreamSource[] = [
      {
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        type: 'hls',
        quality: 'auto',
        server: 'Primary HLS Edge',
      },
      {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'mp4',
        quality: '1080p',
        server: 'Direct CDN Fallback',
      },
    ];

    return {
      tmdbId,
      title: `Authorized Stream - Movie ${tmdbId}`,
      mediaType: 'movie',
      servers,
      sources,
      subtitles: [
        {
          label: 'English',
          lang: 'en',
          url: 'https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles/subtitles-en.vtt',
          default: true,
        },
        {
          label: 'Spanish',
          lang: 'es',
          url: 'https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles/subtitles-es.vtt',
        },
      ],
    };
  }

  async getEpisodeSource(tmdbId: number, season: number, episode: number): Promise<PlaybackResponse | null> {
    if (ENV.TEST_STREAM_API_URL) {
      try {
        const res = await axios.get(`${ENV.TEST_STREAM_API_URL}/tv/${tmdbId}/${season}/${episode}`, {
          headers: ENV.TEST_STREAM_API_KEY ? { Authorization: `Bearer ${ENV.TEST_STREAM_API_KEY}` } : {},
          timeout: 4000,
        });
        if (res.data && res.data.sources) {
          return {
            ...res.data,
            servers: res.data.servers || this.generateServers(tmdbId, season, episode),
          };
        }
      } catch (err) {
        console.warn('[TestProviderA] Custom endpoint error, falling back to verified test streams');
      }
    }

    const servers = this.generateServers(tmdbId, season, episode);
    const sources: StreamSource[] = [
      {
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        type: 'hls',
        quality: 'auto',
        server: 'Primary HLS Edge',
      },
      {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        type: 'mp4',
        quality: '1080p',
        server: 'Direct CDN Backup',
      },
    ];

    return {
      tmdbId,
      title: `TV ${tmdbId} S${season}E${episode}`,
      mediaType: 'tv',
      season,
      episode,
      servers,
      sources,
      subtitles: [
        {
          label: 'English',
          lang: 'en',
          url: 'https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles/subtitles-en.vtt',
          default: true,
        },
      ],
    };
  }
}
