'use client';

import React, { use, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { usePlayback, useMovieDetails, useTVDetails, useTVSeason } from '../../../../hooks/useMedia';
import { VideoPlayer } from '../../../../components/player/VideoPlayer';
import { EpisodeSelector } from '../../../../components/player/EpisodeSelector';
import { ServerSelector } from '../../../../components/player/ServerSelector';
import { StreamServer } from '../../../../types';

export default function WatchPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const resolvedParams = use(params);
  const mediaType = resolvedParams.type === 'tv' ? 'tv' : 'movie';
  const id = parseInt(resolvedParams.id, 10);

  const searchParams = useSearchParams();
  const router = useRouter();

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

  // Active Server State
  const [activeServerId, setActiveServerId] = useState<string>('vidlink');
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsIframeLoading(true);
    const timer = setTimeout(() => setIsIframeLoading(false), 3000);
    return () => clearTimeout(timer);
  }, [activeServerId, id, seasonNumber, episodeNumber]);

  useEffect(() => {
    if (playback?.servers && playback.servers.length > 0) {
      // If current server is not in available servers, select first
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
    <div className="min-h-screen bg-[#070709] flex flex-col pt-16 pb-20">
      {/* Main Cinema Player Container */}
      <div className="w-full max-w-7xl mx-auto px-0 md:px-6">
        {isStreamLoading ? (
          <div className="w-full aspect-video max-h-[85vh] bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3 border border-white/5 md:rounded-2xl overflow-hidden">
            <div className="w-12 h-12 border-3 border-brand-red border-t-transparent rounded-full animate-spin" />
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
                <div className="absolute top-0 left-0 right-0 p-3.5 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-20 pointer-events-auto">
                  <div className="flex items-center gap-3">
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
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  referrerPolicy="origin"
                  onLoad={() => setIsIframeLoading(false)}
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

        {/* Server Selector Bar matching screenshot reference */}
        {playback?.servers && playback.servers.length > 0 && (
          <div className="mt-3 px-3 md:px-0">
            <ServerSelector
              servers={playback.servers}
              activeServerId={activeServerId}
              onSelectServer={(s) => {
                setIsIframeLoading(true);
                setActiveServerId(s.id);
              }}
            />
          </div>
        )}
      </div>

      {/* Media Details & Series Episode Drawer Below Player */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6">
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
