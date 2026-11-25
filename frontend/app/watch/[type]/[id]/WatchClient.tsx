'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Loader2, Maximize2, Minimize2, RefreshCw, ShieldCheck } from 'lucide-react';
import { usePlayback, useMovieDetails, useTVDetails, useTVSeason, useHistory } from '../../../../hooks/useMedia';
import { VideoPlayer } from '../../../../components/player/VideoPlayer';
import { EpisodeSelector } from '../../../../components/player/EpisodeSelector';
import { ServerSelector } from '../../../../components/player/ServerSelector';
import { StreamServer } from '../../../../types';

export default function WatchClient({
  type,
  id: propId,
}: {
  type?: string;
  id?: string;
}) {
  const clientParams = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Route parameters with Cloudflare Pages SPA rewrite fallback (synchronous check)
  const [resolvedType, setResolvedType] = useState<'movie' | 'tv'>(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/watch\/(movie|tv)\/([^/?#]+)/);
      if (match) return match[1] as 'movie' | 'tv';
    }
    const rawType = type || (clientParams?.type as string) || 'movie';
    return rawType === 'tv' ? 'tv' : 'movie';
  });

  const [resolvedId, setResolvedId] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/watch\/(movie|tv)\/([^/?#]+)/);
      if (match) {
        const parsed = parseInt(match[2], 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    const rawId = propId || (clientParams?.id as string);
    const parsed = rawId ? parseInt(rawId, 10) : 550;
    return !isNaN(parsed) && parsed > 0 ? parsed : 550;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/watch\/(movie|tv)\/([^/?#]+)/);
      if (match) {
        const parsed = parseInt(match[2], 10);
        if (!isNaN(parsed) && parsed > 0) {
          setResolvedType(match[1] as 'movie' | 'tv');
          setResolvedId(parsed);
        }
      }
    }
  }, [pathname, type, propId]);

  const mediaType = resolvedType;
  const id = resolvedId;

  const seasonNumber = parseInt(searchParams.get('season') || '1', 10);
  const episodeNumber = parseInt(searchParams.get('episode') || '1', 10);

  // Metadata queries
  const { data: movie } = useMovieDetails(mediaType === 'movie' ? id : 0);
  const { data: tv } = useTVDetails(mediaType === 'tv' ? id : 0);
  const { data: seasonDetails } = useTVSeason(mediaType === 'tv' ? id : 0, seasonNumber);

  // Playback stream query
  const {
    data: playback,
    isLoading: isStreamLoading,
    isError: isStreamError,
  } = usePlayback(mediaType, id, seasonNumber, episodeNumber);

  // Watch history tracking
  const { saveProgress } = useHistory();

  // Active Server State (persisted preference, default Cinezo No Ads)
  const [activeServerId, setActiveServerId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cinevo_preferred_server') || 'cinezo';
    }
    return 'cinezo';
  });
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  const [hasIframeLoaded, setHasIframeLoaded] = useState<boolean>(false);
  const [autoFailover, setAutoFailover] = useState<boolean>(true);
  const [failoverNotice, setFailoverNotice] = useState<string | null>(null);
  const [autoSwitchCount, setAutoSwitchCount] = useState<number>(0);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);

  const selectServer = useCallback((serverId: string, isAuto = false) => {
    setIsIframeLoading(true);
    setHasIframeLoaded(false);
    setActiveServerId(serverId);
    if (!isAuto) {
      setAutoSwitchCount(0);
      setFailoverNotice(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cinevo_preferred_server', serverId);
      }
    }
  }, []);

  // Auto-record progress to localStorage history so "Continue Watching" works on any server
  useEffect(() => {
    if (!id || id <= 0) return;
    const mediaTitle =
      mediaType === 'movie'
        ? movie?.title
        : tv?.name;

    const poster = mediaType === 'movie' ? movie?.poster_path : tv?.poster_path;

    if (mediaTitle) {
      saveProgress({
        tmdbId: id,
        mediaType,
        title: mediaTitle,
        posterPath: poster || null,
        season: mediaType === 'tv' ? seasonNumber : undefined,
        episode: mediaType === 'tv' ? episodeNumber : undefined,
        progress: 1, // Marks as initiated
        duration: 100,
      });
    }
  }, [id, mediaType, movie, tv, seasonNumber, episodeNumber, saveProgress]);

  useEffect(() => {
    setIsIframeLoading(true);
    setHasIframeLoaded(false);
    const spinnerTimer = setTimeout(() => setIsIframeLoading(false), 3000);
    return () => clearTimeout(spinnerTimer);
  }, [activeServerId, id, seasonNumber, episodeNumber]);

  // Auto-failover if embed iframe does not trigger onLoad within 8s
  useEffect(() => {
    if (!autoFailover || hasIframeLoaded || !playback?.servers?.length || autoSwitchCount >= 3) {
      return;
    }
    const failoverTimer = setTimeout(() => {
      const currentIndex = playback.servers.findIndex((s) => s.id === activeServerId);
      const nextServer = playback.servers[(currentIndex + 1) % playback.servers.length];
      if (nextServer && nextServer.id !== activeServerId) {
        setAutoSwitchCount((c) => c + 1);
        setFailoverNotice(`Auto-switched to ${nextServer.name} (previous server timed out)`);
        selectServer(nextServer.id, true);
      }
    }, 8000);
    return () => clearTimeout(failoverTimer);
  }, [autoFailover, hasIframeLoaded, playback, activeServerId, autoSwitchCount, selectServer]);

  // Keyboard shortcuts: T for Theater Mode, N for Next Server
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key.toLowerCase() === 't') {
        setIsTheaterMode((prev) => !prev);
      } else if (e.key.toLowerCase() === 'n' && playback?.servers?.length) {
        const currentIndex = playback.servers.findIndex((s) => s.id === activeServerId);
        const nextServer = playback.servers[(currentIndex + 1) % playback.servers.length];
        if (nextServer) selectServer(nextServer.id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playback, activeServerId, selectServer]);

  useEffect(() => {
    if (playback?.servers && playback.servers.length > 0) {
      if (!playback.servers.some((s) => s.id === activeServerId)) {
        setActiveServerId(playback.servers[0].id);
      }
    }
  }, [playback, activeServerId]);

  const activeServer: StreamServer | undefined =
    playback?.servers?.find((s) => s.id === activeServerId) || playback?.servers?.[0];

  const title =
    mediaType === 'movie'
      ? movie?.title || `Movie ${id}`
      : tv?.name || `TV Series ${id}`;

  const posterPath =
    mediaType === 'movie' ? movie?.poster_path : tv?.poster_path;

  const currentEp = seasonDetails?.episodes.find(
    (e) => e.episode_number === episodeNumber
  );

  const hasNextEpisode =
    mediaType === 'tv' &&
    seasonDetails !== undefined &&
    seasonDetails.episodes.some((e) => e.episode_number === episodeNumber + 1);

  const handleNextEpisode = () => {
    if (hasNextEpisode) {
      router.push(`/watch/tv/${id}?season=${seasonNumber}&episode=${episodeNumber + 1}`);
    }
  };

  const backUrl = mediaType === 'movie' ? `/movie/${id}` : `/tv/${id}`;

  return (
    <div className={`min-h-screen flex flex-col pt-16 md:pt-6 pb-20 transition-colors duration-300 ${isTheaterMode ? 'bg-[#030305]' : 'bg-[#070709]'}`}>
      {/* Main Cinema Player Container */}
      <div className={`w-full mx-auto transition-all duration-300 ${isTheaterMode ? 'max-w-none px-0 md:px-3' : 'max-w-7xl px-0 md:px-6'}`}>
        {isStreamLoading ? (
          <div className="w-full aspect-video max-h-[85vh] bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3 border border-white/5 md:rounded-2xl overflow-hidden">
            <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Resolving streaming servers...</p>
          </div>
        ) : isStreamError || !playback ? (
          <div className="w-full aspect-video max-h-[85vh] bg-zinc-950 flex flex-col items-center justify-center text-zinc-300 p-8 border border-white/5 md:rounded-2xl">
            <AlertCircle className="w-16 h-16 text-brand-red mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Playback Temporarily Unavailable</h2>
            <p className="text-sm text-zinc-400 max-w-md text-center mb-6">
              The streaming source for this title could not be established. Please verify server connectivity and try again.
            </p>
            <Link
              href={backUrl}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Details</span>
            </Link>
          </div>
        ) : (
          <div className="w-full md:rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black relative">
            {/* Embed Player vs Native HLS Player */}
            {activeServer && activeServer.type === 'embed' ? (
              <div className="relative w-full aspect-video max-h-[85vh] bg-black">
                {/* Header Back & Info Bar */}
                <div className="absolute top-0 left-0 right-0 p-3.5 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-20 pointer-events-none">
                  <div className="flex items-center gap-3 pointer-events-auto">
                    <Link
                      href={backUrl}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-white/20 text-white backdrop-blur-md transition"
                      title="Back"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <span className="text-xs md:text-sm font-bold text-white drop-shadow">
                      {currentEp ? `${title}: ${currentEp.name}` : title}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-zinc-300 backdrop-blur-md">
                    {activeServer.name}
                  </span>
                </div>

                {isIframeLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                    <Loader2 className="w-10 h-10 text-brand-red animate-spin" />
                  </div>
                )}

                <iframe
                  key={`${activeServer.id}-${id}-${seasonNumber}-${episodeNumber}`}
                  src={activeServer.url}
                  title={title}
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write; screen-wake-lock"
                  referrerPolicy="no-referrer"
                  onLoad={() => {
                    setIsIframeLoading(false);
                    setHasIframeLoaded(true);
                  }}
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <VideoPlayer
                playback={playback}
                title={currentEp ? `${title}: ${currentEp.name}` : title}
                posterUrl={posterPath || undefined}
                backUrl={backUrl}
                onNextEpisode={handleNextEpisode}
                hasNextEpisode={hasNextEpisode}
              />
            )}
          </div>
        )}

        {/* Server Selector Bar & Quick Failover Helper */}
        {playback?.servers && playback.servers.length > 0 && (
          <div className={`mt-3 px-3 md:px-0 space-y-2 ${isTheaterMode ? 'max-w-7xl mx-auto' : ''}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-zinc-900/60 rounded-xl border border-white/5 text-xs text-zinc-400">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Playing on <strong className="text-zinc-200">{activeServer?.name}</strong></span>
                {failoverNotice && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25">
                    {failoverNotice}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoFailover((prev) => !prev)}
                  title="Automatically switch servers if current one times out"
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                    autoFailover
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-zinc-800/80 text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Auto-Failover</span>
                </button>

                <button
                  onClick={() => setIsTheaterMode((prev) => !prev)}
                  title="Toggle Theater Mode (T)"
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                    isTheaterMode
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-zinc-800/80 text-zinc-300 border-white/10 hover:text-white'
                  }`}
                >
                  {isTheaterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isTheaterMode ? 'Exit Theater' : 'Theater'}</span>
                </button>

                <button
                  onClick={() => {
                    const currentIndex = playback.servers.findIndex((s) => s.id === activeServerId);
                    const nextServer = playback.servers[(currentIndex + 1) % playback.servers.length];
                    if (nextServer) {
                      selectServer(nextServer.id);
                    }
                  }}
                  title="Switch to next server (N)"
                  className="px-2.5 py-1 rounded-lg bg-red-600/20 text-brand-red border border-red-500/30 font-bold hover:bg-brand-red hover:text-white transition flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Next Server</span>
                </button>
              </div>
            </div>

            <ServerSelector
              servers={playback.servers}
              activeServerId={activeServerId}
              onSelectServer={(s) => selectServer(s.id)}
            />
          </div>
        )}
      </div>

      {/* Media Details & Series Episode Drawer Below Player */}
      <div className={`max-w-7xl w-full mx-auto px-4 md:px-6 py-6 transition-opacity duration-300 ${isTheaterMode ? 'opacity-35 hover:opacity-100' : ''}`}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 text-xs text-zinc-400 mb-2">
              <span className="uppercase font-bold text-brand-red tracking-wider">
                Now Streaming
              </span>
              <span>•</span>
              <span className="capitalize">{mediaType}</span>
              {mediaType === 'tv' && (
                <>
                  <span>•</span>
                  <span>Season {seasonNumber}</span>
                  <span>•</span>
                  <span>Episode {episodeNumber}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              {title}
            </h1>

            {currentEp && (
              <h3 className="text-lg font-semibold text-zinc-300 mb-3">
                {currentEp.episode_number}. {currentEp.name}
              </h3>
            )}

            <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
              {currentEp?.overview || movie?.overview || tv?.overview}
            </p>
          </div>

          {/* Series Episode Selector (if TV) */}
          {mediaType === 'tv' && (
            <div className="w-full lg:w-96 bg-zinc-900/60 p-5 rounded-2xl border border-white/10">
              <EpisodeSelector
                seasonDetails={seasonDetails}
                currentSeason={seasonNumber}
                currentEpisode={episodeNumber}
                totalSeasons={tv?.number_of_seasons || 1}
                onSelectSeason={(s) => {
                  router.push(`/watch/tv/${id}?season=${s}&episode=1`);
                }}
                onSelectEpisode={(ep) => {
                  router.push(`/watch/tv/${id}?season=${ep.season_number}&episode=${ep.episode_number}`);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
