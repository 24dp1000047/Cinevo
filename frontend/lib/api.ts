import axios from 'axios';
import {
  Movie,
  TVShow,
  SeasonDetails,
  MediaCredits,
  PlaybackResponse,
  WatchlistItem,
  WatchHistoryItem,
  StreamServer,
  StreamSource,
  Genre,
  DiscoverFilters,
  DiscoverSortOption,
  VideoResult,
} from '../types';
import { guestStorage } from './guestStorage';

export const MOVIE_GENRES: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

export const TV_GENRES: Genre[] = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
];

export interface MoodPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  mediaType: 'movie' | 'tv';
  genres: number[];
  minRating?: number;
  sortBy?: DiscoverSortOption;
}

export const DISCOVER_PRESETS: MoodPreset[] = [
  {
    id: 'critically-acclaimed',
    name: 'Top Masterpieces',
    description: 'Universally acclaimed cinema rated 8.0+ ★',
    icon: 'trophy',
    mediaType: 'movie',
    genres: [],
    minRating: 8.0,
    sortBy: 'vote_average.desc',
  },
  {
    id: 'cyberpunk-scifi',
    name: 'Sci-Fi & Cosmic',
    description: 'Mind-bending journeys & cosmic worlds',
    icon: 'sparkles',
    mediaType: 'movie',
    genres: [878],
    minRating: 7.0,
    sortBy: 'popularity.desc',
  },
  {
    id: 'adrenaline-action',
    name: 'Pure Adrenaline',
    description: 'High-octane blockbusters & thrilling chases',
    icon: 'zap',
    mediaType: 'movie',
    genres: [28, 53],
    sortBy: 'popularity.desc',
  },
  {
    id: 'binge-series',
    name: 'Binge-Worthy TV',
    description: 'Captivating serialized television drama',
    icon: 'tv',
    mediaType: 'tv',
    genres: [18, 9648],
    minRating: 7.5,
    sortBy: 'popularity.desc',
  },
  {
    id: 'animation-magic',
    name: 'Anime & Animation',
    description: 'Visually stunning animated spectacles',
    icon: 'film',
    mediaType: 'movie',
    genres: [16],
    minRating: 7.0,
    sortBy: 'popularity.desc',
  },
  {
    id: 'midnight-horror',
    name: 'Horror & Thrills',
    description: 'Supernatural chills & tension',
    icon: 'flame',
    mediaType: 'movie',
    genres: [27, 53],
    sortBy: 'popularity.desc',
  },
];

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || 'a9747fa4c63043ac63a74fbb0c0000ae';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

const VIDKING_BASE = 'https://www.vidking.net/embed';

export const getEmbedUrl = (
  selectedServer: string,
  params: {
    tmdbId: number;
    season?: number;
    episode?: number;
    startSec?: number;
    autoPlay?: boolean;
    color?: string;
  }
): string => {
  const { tmdbId, season = 1, episode = 1, startSec = 0, autoPlay = true, color = 'e50914' } = params;
  const isTV = Boolean(params.season && params.episode);
  const timeParamVidKing = startSec > 0 ? `&t=${startSec}` : '';

  switch (selectedServer) {
    case 'cinezo':
      return isTV
        ? `https://cinezo.st/tv/${tmdbId}/${season}/${episode}`
        : `https://cinezo.st/movie/${tmdbId}`;

    case 'cinesrc':
      return isTV
        ? `https://cinesrc.st/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://cinesrc.st/embed/movie/${tmdbId}`;

    case 'peestream':
      return isTV
        ? `https://pstream.mov/embed/tmdb-tv-${tmdbId}/${season}/${episode}`
        : `https://pstream.mov/embed/tmdb-movie-${tmdbId}`;

    case 'flaxmovies':
      return isTV
        ? `https://flaxmovies.xyz/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://flaxmovies.xyz/embed/movie/${tmdbId}`;

    case 'moviesapi':
      return isTV
        ? `https://moviesapi.club/tv/${tmdbId}-${season}-${episode}`
        : `https://moviesapi.club/movie/${tmdbId}`;

    case 'vidlink':
      return isTV
        ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=${color}&autoplay=true&nextbutton=true${startSec > 0 ? `&start=${startSec}` : ''}`
        : `https://vidlink.pro/movie/${tmdbId}?primaryColor=${color}&autoplay=true${startSec > 0 ? `&start=${startSec}` : ''}`;

    case 'vidsrc-embed':
      return isTV
        ? `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.xyz/embed/movie/${tmdbId}`;

    case 'videasy':
      return isTV
        ? `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}?color=${color}`
        : `https://player.videasy.net/movie/${tmdbId}?color=${color}`;

    case '111movies':
      return isTV
        ? `https://111movies.com/tv/${tmdbId}/${season}/${episode}`
        : `https://111movies.com/movie/${tmdbId}`;

    case 'vidzee':
      return isTV
        ? `https://player.vidzee.wtf/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://player.vidzee.wtf/embed/movie/${tmdbId}`;

    case 'vidsrc':
      return isTV
        ? `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.to/embed/movie/${tmdbId}`;

    case '2embed':
      return isTV
        ? `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`
        : `https://www.2embed.cc/embed/${tmdbId}`;

    case 'mapple':
      return isTV
        ? `https://mapple.fun/watch/tv/${tmdbId}-${season}-${episode}`
        : `https://mapple.fun/watch/movie/${tmdbId}`;

    case 'primesrc':
      return isTV
        ? `https://primesrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`
        : `https://primesrc.me/embed/movie?tmdb=${tmdbId}`;

    case 'multiembed':
      return isTV
        ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;

    case 'autoembed':
      return isTV
        ? `https://autoembed.me/tv/tmdb/${tmdbId}-${season}-${episode}`
        : `https://autoembed.me/movie/tmdb/${tmdbId}`;

    case 'vixsrc':
      return isTV
        ? `https://vixsrc.to/tv/${tmdbId}/${season}/${episode}`
        : `https://vixsrc.to/movie/${tmdbId}`;

    case 'vidlove':
      return isTV
        ? `https://vidlove.to/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidlove.to/embed/movie/${tmdbId}`;

    case 'vidfast':
      return isTV
        ? `https://vidfast.vc/tv/${tmdbId}/${season}/${episode}?autoPlay=true`
        : `https://vidfast.vc/movie/${tmdbId}?autoPlay=true`;

    case 'filmu':
      return isTV
        ? `https://filmu.in/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://filmu.in/embed/movie/${tmdbId}`;

    case 'vidcore':
      return isTV
        ? `https://vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidcore.org/embed/movie/${tmdbId}`;

    case 'vaplayer':
      return isTV
        ? `https://vaplayer.ru/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vaplayer.ru/embed/movie/${tmdbId}`;

    case 'vares':
      return isTV
        ? `https://vares.me/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vares.me/embed/movie/${tmdbId}`;

    case 'vidking':
      return isTV
        ? `${VIDKING_BASE}/tv/${tmdbId}/${season}/${episode}?color=${color}&autoPlay=${autoPlay}&nextEpisode=true&episodeSelector=true${timeParamVidKing}`
        : `${VIDKING_BASE}/movie/${tmdbId}?color=${color}&autoPlay=${autoPlay}${timeParamVidKing}`;

    case 'vidbolt':
      return isTV
        ? `https://vidbolt.net/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidbolt.net/embed/movie/${tmdbId}`;

    case 'vidnest':
      return isTV
        ? `https://vidnest.fun/tv/${tmdbId}/${season}/${episode}`
        : `https://vidnest.fun/movie/${tmdbId}`;

    case 'vidsrcsu':
      return isTV
        ? `https://vidsrc.su/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.su/embed/movie/${tmdbId}`;

    case 'vidgod':
      return isTV
        ? `https://vidgod.com/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidgod.com/embed/movie/${tmdbId}`;

    case 'vidsrcme':
      return isTV
        ? `https://vidsrcme.ru/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrcme.ru/embed/movie/${tmdbId}`;

    case '1embed':
      return isTV
        ? `https://1embed.net/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://1embed.net/embed/movie/${tmdbId}`;

    default:
      return isTV
        ? `https://cinezo.st/tv/${tmdbId}/${season}/${episode}`
        : `https://cinezo.st/movie/${tmdbId}`;
  }
};

const SERVER_DEFINITIONS: Array<{
  id: string;
  name: string;
  features: string;
  icon: StreamServer['icon'];
}> = [
  { id: 'cinezo', name: 'Cinezo (No Ads)', features: 'Ad-free high-speed stream', icon: 'sparkles' },
  { id: 'cinesrc', name: 'CineSrc (No Ads)', features: 'Ad-free multi-server stream', icon: 'flame' },
  { id: 'peestream', name: 'PeeStream (No Ads)', features: 'Clean ad-free player', icon: 'zap' },
  { id: 'flaxmovies', name: 'FlaxMovies (No Ads)', features: 'Ad-free HD playback with subtitles', icon: 'play' },
  { id: 'moviesapi', name: 'MoviesAPI (No Ads)', features: 'Ad-free multi-quality HLS', icon: 'server' },
  { id: 'vidlink', name: 'VidLink', features: 'Ultra-fast CDN & instant seeking', icon: 'sparkles' },
  { id: 'vidsrc-embed', name: 'VidSrc Embed', features: 'Reliable primary embed mirror', icon: 'globe' },
  { id: 'videasy', name: 'VidEasy', features: 'Fast adaptive player', icon: 'zap' },
  { id: '111movies', name: '111Movies', features: 'Multi-source fallback mirror', icon: 'layers' },
  { id: 'vidzee', name: 'VidZee', features: 'High-bitrate HD stream', icon: 'flame' },
  { id: 'vidsrc', name: 'VidSrc', features: 'Classic multi-mirror source', icon: 'globe' },
  { id: '2embed', name: '2Embed', features: 'Wide catalog backup server', icon: 'layers' },
  { id: 'mapple', name: 'Mapple', features: 'Clean minimalist player', icon: 'play' },
  { id: 'primesrc', name: 'PrimeSrc', features: 'Multi-provider aggregator', icon: 'sparkles' },
  { id: 'multiembed', name: 'MultiEmbed', features: 'Deep archive & classic releases', icon: 'monitor' },
  { id: 'autoembed', name: 'AutoEmbed', features: 'Automated TMDB server routing', icon: 'radio' },
  { id: 'vixsrc', name: 'VixSrc', features: 'Fast direct HLS embed', icon: 'zap' },
  { id: 'vidlove', name: 'VidLove', features: 'HD backup streaming server', icon: 'play' },
  { id: 'vidfast', name: 'VidFast', features: 'Low-latency fast start player', icon: 'flame' },
  { id: 'filmu', name: 'Filmu', features: 'Alternative HD mirror', icon: 'server' },
  { id: 'vidcore', name: 'VidCore', features: 'Modern HTML5 stream engine', icon: 'sparkles' },
  { id: 'vaplayer', name: 'VAPlayer', features: 'International audio & subs', icon: 'globe' },
  { id: 'vares', name: 'Vares', features: 'Lightweight backup player', icon: 'radio' },
  { id: 'vidking', name: 'VidKing', features: '1080p bufferless player', icon: 'zap' },
  { id: 'vidbolt', name: 'VidBolt', features: 'High-speed CDN mirror', icon: 'flame' },
  { id: 'vidnest', name: 'VidNest', features: 'Multi-language subtitle support', icon: 'layers' },
  { id: 'vidsrcsu', name: 'VidSrc.su', features: 'Multi-audio & subtitle tracks', icon: 'globe' },
  { id: 'vidgod', name: 'VidGod', features: 'Backup HD embed source', icon: 'monitor' },
  { id: 'vidsrcme', name: 'VidSrc.me', features: 'Deep international archive', icon: 'play' },
  { id: '1embed', name: '1Embed', features: 'Universal fallback embed', icon: 'server' },
];

export const generateServers = (
  tmdbId: number,
  season?: number,
  episode?: number,
  options?: { startSec?: number; autoPlay?: boolean; color?: string }
): StreamServer[] => {
  const params = { tmdbId, season, episode, ...options };

  return SERVER_DEFINITIONS.map((srv) => ({
    id: srv.id,
    name: srv.name,
    features: srv.features,
    type: 'embed' as const,
    icon: srv.icon,
    url: getEmbedUrl(srv.id, params),
  }));
};

const defaultSources: StreamSource[] = [
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

const FALLBACK_MOVIES: Movie[] = [
  {
    id: 550,
    title: 'Fight Club',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    release_date: '1999-10-15',
    vote_average: 8.4,
    vote_count: 29000,
    popularity: 95.0,
    genre_ids: [18],
    runtime: 139,
    media_type: 'movie',
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 35000,
    popularity: 120.0,
    genre_ids: [12, 18, 878],
    runtime: 169,
    media_type: 'movie',
  },
  {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life.',
    poster_path: '/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    release_date: '2010-07-15',
    vote_average: 8.4,
    vote_count: 36000,
    popularity: 110.0,
    genre_ids: [28, 878, 12],
    runtime: 148,
    media_type: 'movie',
  },
];

const FALLBACK_TV: TVShow[] = [
  {
    id: 1399,
    name: 'Game of Thrones',
    overview: 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war.',
    poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    backdrop_path: '/zZqpAXxVSBtxV9qPBcscfXBcL2w.jpg',
    first_air_date: '2011-04-17',
    vote_average: 8.4,
    vote_count: 24000,
    popularity: 130.0,
    genre_ids: [10765, 18, 10759],
    number_of_seasons: 8,
    media_type: 'tv',
  },
  {
    id: 1396,
    name: 'Breaking Bad',
    overview: 'Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live.',
    poster_path: '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdrop_path: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    first_air_date: '2008-01-20',
    vote_average: 8.9,
    vote_count: 14000,
    popularity: 125.0,
    genre_ids: [18, 80],
    number_of_seasons: 5,
    media_type: 'tv',
  },
];

export const api = {
  // Movies
  getTrendingMovies: async (page = 1): Promise<Movie[]> => {
    try {
      const res = await tmdbClient.get('/trending/movie/week', { params: { page } });
      return res.data.results || [];
    } catch {
      return page === 1 ? FALLBACK_MOVIES : [];
    }
  },
  getPopularMovies: async (page = 1): Promise<Movie[]> => {
    try {
      const res = await tmdbClient.get('/movie/popular', { params: { page } });
      return res.data.results || [];
    } catch {
      return page === 1 ? FALLBACK_MOVIES : [];
    }
  },
  getTopRatedMovies: async (page = 1): Promise<Movie[]> => {
    try {
      const res = await tmdbClient.get('/movie/top_rated', { params: { page } });
      return res.data.results || [];
    } catch {
      return page === 1 ? FALLBACK_MOVIES : [];
    }
  },
  getMovieDetails: async (id: number): Promise<Movie> => {
    try {
      const res = await tmdbClient.get(`/movie/${id}`);
      return res.data;
    } catch {
      return (
        FALLBACK_MOVIES.find((m) => m.id === id) || {
          ...FALLBACK_MOVIES[0],
          id,
          title: `Movie #${id}`,
          overview: 'Metadata temporarily unavailable. You can still stream this title using the source servers.',
        }
      );
    }
  },
  getMovieCredits: async (id: number): Promise<MediaCredits> => {
    try {
      const res = await tmdbClient.get(`/movie/${id}/credits`);
      return res.data;
    } catch {
      return { id, cast: [] };
    }
  },
  getSimilarMovies: async (id: number): Promise<Movie[]> => {
    try {
      const res = await tmdbClient.get(`/movie/${id}/similar`);
      return res.data.results || [];
    } catch {
      return [];
    }
  },
  getMoviesByGenre: async (genreId: number, page = 1): Promise<Movie[]> => {
    try {
      const res = await tmdbClient.get('/discover/movie', {
        params: { with_genres: genreId, sort_by: 'popularity.desc', page },
      });
      return res.data.results || [];
    } catch {
      return page === 1 ? FALLBACK_MOVIES : [];
    }
  },

  // TV Shows
  getPopularTV: async (page = 1): Promise<TVShow[]> => {
    try {
      const res = await tmdbClient.get('/tv/popular', { params: { page } });
      return res.data.results || [];
    } catch {
      return page === 1 ? FALLBACK_TV : [];
    }
  },
  getTopRatedTV: async (page = 1): Promise<TVShow[]> => {
    try {
      const res = await tmdbClient.get('/tv/top_rated', { params: { page } });
      return res.data.results || [];
    } catch {
      return page === 1 ? FALLBACK_TV : [];
    }
  },
  getTVDetails: async (id: number): Promise<TVShow> => {
    try {
      const res = await tmdbClient.get(`/tv/${id}`);
      return res.data;
    } catch {
      return (
        FALLBACK_TV.find((t) => t.id === id) || {
          ...FALLBACK_TV[0],
          id,
          name: `Series #${id}`,
          overview: 'Metadata temporarily unavailable. You can still stream this series using the source servers.',
        }
      );
    }
  },
  getTVSeason: async (id: number, season: number): Promise<SeasonDetails> => {
    try {
      const res = await tmdbClient.get(`/tv/${id}/season/${season}`);
      return res.data;
    } catch {
      return {
        id: season,
        season_number: season,
        name: `Season ${season}`,
        overview: '',
        poster_path: null,
        air_date: '',
        episodes: Array.from({ length: 10 }, (_, idx) => ({
          id: season * 100 + idx + 1,
          name: `Episode ${idx + 1}`,
          overview: '',
          still_path: null,
          air_date: '',
          episode_number: idx + 1,
          season_number: season,
          vote_average: 0,
        })),
      };
    }
  },
  getTVCredits: async (id: number): Promise<MediaCredits> => {
    try {
      const res = await tmdbClient.get(`/tv/${id}/credits`);
      return res.data;
    } catch {
      return { id, cast: [] };
    }
  },

  // Search (with franchise collection expansion + chronological ordering)
  search: async (query: string, page = 1): Promise<(Movie | TVShow)[]> => {
    try {
      const res = await tmdbClient.get('/search/multi', { params: { query, page } });
      const rawResults: (Movie | TVShow)[] = (res.data.results || []).filter(
        (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
      );

      const getDateKey = (item: Movie | TVShow) =>
        (item as Movie).release_date || (item as TVShow).first_air_date || '9999-12-31';

      // On page 1, expand the top movie's TMDB collection so every part of the franchise is included
      if (page === 1) {
        const topMovie = rawResults.find((item) => item.media_type === 'movie');
        if (topMovie) {
          try {
            const detailsRes = await tmdbClient.get(`/movie/${topMovie.id}`);
            const collectionId = detailsRes.data?.belongs_to_collection?.id;
            if (collectionId) {
              const colRes = await tmdbClient.get(`/collection/${collectionId}`);
              const parts: Movie[] = (colRes.data?.parts || []).map((p: any) => ({
                ...p,
                media_type: 'movie' as const,
              }));

              const seen = new Set<string>();
              const sortedParts = [...parts]
                .sort((a, b) => getDateKey(a).localeCompare(getDateKey(b)))
                .filter((part) => {
                  const key = `movie-${part.id}`;
                  if (seen.has(key)) return false;
                  seen.add(key);
                  return true;
                });

              const remaining = rawResults
                .filter((item) => !seen.has(`${item.media_type}-${item.id}`))
                .sort((a, b) => getDateKey(a).localeCompare(getDateKey(b)));

              return [...sortedParts, ...remaining];
            }
          } catch {
            // Fall through to standard chronological sort
          }
        }
      }

      return [...rawResults].sort((a, b) => getDateKey(a).localeCompare(getDateKey(b)));
    } catch {
      return [];
    }
  },

  // Discover & Genre Explorer
  discoverMedia: async (filters: DiscoverFilters): Promise<(Movie | TVShow)[]> => {
    const {
      mediaType = 'movie',
      genres = [],
      sortBy = 'popularity.desc',
      year,
      yearRange,
      minRating,
      page = 1,
    } = filters;

    const endpoint = mediaType === 'tv' ? '/discover/tv' : '/discover/movie';
    const params: Record<string, any> = {
      page,
      sort_by: sortBy,
    };

    if (genres && genres.length > 0) {
      params.with_genres = genres.join(',');
    }

    if (minRating && minRating > 0) {
      params['vote_average.gte'] = minRating;
      params['vote_count.gte'] = 50;
    } else if (sortBy === 'vote_average.desc') {
      params['vote_count.gte'] = 100;
    }

    if (year) {
      if (mediaType === 'movie') {
        params.primary_release_year = year;
      } else {
        params.first_air_date_year = year;
      }
    } else if (yearRange && yearRange !== 'all') {
      const isMovie = mediaType === 'movie';
      const gteKey = isMovie ? 'primary_release_date.gte' : 'first_air_date.gte';
      const lteKey = isMovie ? 'primary_release_date.lte' : 'first_air_date.lte';

      switch (yearRange) {
        case '2025':
          if (isMovie) params.primary_release_year = 2025;
          else params.first_air_date_year = 2025;
          break;
        case '2024':
          if (isMovie) params.primary_release_year = 2024;
          else params.first_air_date_year = 2024;
          break;
        case '2023':
          if (isMovie) params.primary_release_year = 2023;
          else params.first_air_date_year = 2023;
          break;
        case '2022':
          if (isMovie) params.primary_release_year = 2022;
          else params.first_air_date_year = 2022;
          break;
        case '2020s':
          params[gteKey] = '2020-01-01';
          params[lteKey] = '2029-12-31';
          break;
        case '2010s':
          params[gteKey] = '2010-01-01';
          params[lteKey] = '2019-12-31';
          break;
        case '2000s':
          params[gteKey] = '2000-01-01';
          params[lteKey] = '2009-12-31';
          break;
        case '1990s':
          params[gteKey] = '1990-01-01';
          params[lteKey] = '1999-12-31';
          break;
        case 'classic':
          params[lteKey] = '1989-12-31';
          break;
      }
    }

    try {
      const res = await tmdbClient.get(endpoint, { params });
      const results = res.data.results || [];
      return results.map((item: any) => ({
        ...item,
        media_type: mediaType,
      }));
    } catch (err) {
      console.warn('TMDB Discover failed, falling back to popular list:', err);
      return mediaType === 'tv'
        ? await api.getPopularTV(page)
        : await api.getPopularMovies(page);
    }
  },

  // Trailers & Videos
  getMovieVideos: async (id: number): Promise<VideoResult[]> => {
    try {
      const res = await tmdbClient.get(`/movie/${id}/videos`);
      return res.data.results || [];
    } catch {
      return [];
    }
  },

  getTVVideos: async (id: number): Promise<VideoResult[]> => {
    try {
      const res = await tmdbClient.get(`/tv/${id}/videos`);
      return res.data.results || [];
    } catch {
      return [];
    }
  },

  // Playback Stream Generation (Client-Side)
  getMovieStream: async (
    id: number,
    options?: { startSec?: number; autoPlay?: boolean; color?: string }
  ): Promise<PlaybackResponse> => {
    const servers = generateServers(id, undefined, undefined, options);
    return {
      tmdbId: id,
      title: `Movie ${id}`,
      mediaType: 'movie',
      servers,
      sources: defaultSources,
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
  },

  getEpisodeStream: async (
    id: number,
    season: number,
    episode: number,
    options?: { startSec?: number; autoPlay?: boolean; color?: string }
  ): Promise<PlaybackResponse> => {
    const servers = generateServers(id, season, episode, options);
    return {
      tmdbId: id,
      title: `TV ${id} S${season}E${episode}`,
      mediaType: 'tv',
      season,
      episode,
      servers,
      sources: defaultSources,
      subtitles: [
        {
          label: 'English',
          lang: 'en',
          url: 'https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles/subtitles-en.vtt',
          default: true,
        },
      ],
    };
  },

  // Watchlist (localStorage)
  getWatchlist: async (): Promise<WatchlistItem[]> => {
    return guestStorage.getWatchlist();
  },
  addToWatchlist: async (item: { tmdbId: number; mediaType: 'movie' | 'tv'; title: string; posterPath: string | null; voteAverage?: number }): Promise<WatchlistItem> => {
    guestStorage.toggleWatchlist(item);
    return {
      id: `local_${item.tmdbId}`,
      tmdbId: item.tmdbId,
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath,
      voteAverage: item.voteAverage,
      createdAt: new Date().toISOString(),
    };
  },
  removeFromWatchlist: async (id: string): Promise<{ success: boolean }> => {
    const numericId = parseInt(id.replace('local_', '').replace('guest_', ''), 10);
    if (!isNaN(numericId)) {
      guestStorage.toggleWatchlist({ tmdbId: numericId, mediaType: 'movie', title: '', posterPath: null });
    }
    return { success: true };
  },
  syncWatchlist: async (items: any[]) => items,

  // History (localStorage)
  getHistory: async (): Promise<WatchHistoryItem[]> => {
    return guestStorage.getHistory();
  },
  updateHistory: async (item: {
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    posterPath: string | null;
    season?: number | null;
    episode?: number | null;
    progress: number;
    duration: number;
  }): Promise<WatchHistoryItem> => {
    guestStorage.saveHistory(item);
    return {
      ...item,
      updatedAt: new Date().toISOString(),
    };
  },
  deleteHistory: async (_id: string): Promise<{ success: boolean }> => {
    return { success: true };
  },
  syncHistory: async (items: any[]) => items,

  // Auth mock for graceful transition
  register: async () => ({ user: null, token: '' }),
  login: async () => ({ user: null, token: '' }),
  getProfile: async () => null,
};
