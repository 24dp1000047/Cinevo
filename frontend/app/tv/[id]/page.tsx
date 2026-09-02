'use client';

import React, { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Check, Star, Calendar, ArrowLeft } from 'lucide-react';
import { useTVDetails, useTVSeason, useTVCredits, useWatchlist } from '../../../hooks/useMedia';
import { getTmdbImageUrl, formatReleaseYear, formatScore } from '../../../lib/utils';
import { EpisodeSelector } from '../../../components/player/EpisodeSelector';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useRouter } from 'next/navigation';

export default function TVDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tvId = parseInt(resolvedParams.id, 10);
  const router = useRouter();

  const [selectedSeason, setSelectedSeason] = useState(1);

  const { data: tv, isLoading: isTvLoading } = useTVDetails(tvId);
  const { data: seasonDetails } = useTVSeason(tvId, selectedSeason);
  const { data: credits } = useTVCredits(tvId);
  const { data: watchlist = [], toggleWatchlist } = useWatchlist();

  if (isTvLoading) {
    return (
      <div className="pt-24 px-6 md:px-16 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-[60vh] w-full rounded-2xl" />
        <Skeleton className="h-10 w-1/3 rounded-lg" />
        <Skeleton className="h-24 w-2/3 rounded-lg" />
      </div>
    );
  }

  if (!tv) {
    return (
      <div className="pt-32 text-center text-zinc-400">
        <h2 className="text-2xl font-bold text-white mb-2">Series Not Found</h2>
        <p className="mb-6">The television show you requested could not be located.</p>
        <Link href="/" className="px-6 py-2.5 rounded-xl bg-brand-red text-white font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  const isBookmarked = watchlist.some((w) => w.tmdbId === tv.id && w.mediaType === 'tv');
  const backdropUrl = getTmdbImageUrl(tv.backdrop_path, 'original');
  const posterUrl = getTmdbImageUrl(tv.poster_path, 'w500');

  const handleToggle = () => {
    toggleWatchlist({
      tmdbId: tv.id,
      mediaType: 'tv',
      title: tv.name,
      posterPath: tv.poster_path,
      voteAverage: tv.vote_average,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Backdrop Header */}
      <div className="relative w-full h-[65vh] md:h-[75vh] overflow-hidden">
        <Image
          src={backdropUrl}
          alt={tv.name}
          fill
          priority
          className="object-cover object-top opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />

        <div className="absolute top-20 left-6 md:left-16 z-20">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 hover:bg-black/80 text-zinc-300 hover:text-white backdrop-blur-md text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse</span>
          </Link>
        </div>
      </div>

      {/* Details Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 -mt-48 relative z-20">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Poster */}
          <div className="relative flex-shrink-0 w-56 sm:w-64 md:w-72 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900 mx-auto md:mx-0">
            <Image src={posterUrl} alt={tv.name} fill priority className="object-cover" />
          </div>

          {/* Info */}
          <div className="flex-1 text-left">
            <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                <Star className="w-4 h-4 fill-current" />
                {formatScore(tv.vote_average)}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                <Calendar className="w-4 h-4 text-zinc-500" />
                {formatReleaseYear(tv.first_air_date)}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300 font-medium">
                {tv.number_of_seasons || 1} Season{(tv.number_of_seasons || 1) > 1 ? 's' : ''}
              </span>
              <span className="px-2 py-0.5 text-xs rounded bg-white/10 text-zinc-300 uppercase tracking-wider">
                Ultra HD
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
              {tv.name}
            </h1>

            {tv.tagline && (
              <p className="text-base sm:text-lg italic text-zinc-400 mb-4 font-normal">
                &ldquo;{tv.tagline}&rdquo;
              </p>
            )}

            <div className="mb-8">
              <h3 className="text-sm uppercase tracking-wider text-zinc-400 font-bold mb-2">Overview</h3>
              <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-normal max-w-3xl">
                {tv.overview}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link
                href={`/watch/tv/${tv.id}?season=1&episode=1`}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-brand-red hover:bg-red-700 text-white font-semibold transition shadow-xl shadow-red-900/30 hover:scale-105"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Watch Episode 1</span>
              </Link>

              <button
                onClick={handleToggle}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium border backdrop-blur-md transition hover:scale-105 ${
                  isBookmarked
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                {isBookmarked ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
                <span>{isBookmarked ? 'In Watchlist' : 'Add to List'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Seasons & Episodes Section */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <EpisodeSelector
            seasonDetails={seasonDetails}
            currentSeason={selectedSeason}
            currentEpisode={1}
            totalSeasons={tv.number_of_seasons || 1}
            onSelectSeason={(s) => setSelectedSeason(s)}
            onSelectEpisode={(ep) => {
              router.push(`/watch/tv/${tv.id}?season=${ep.season_number}&episode=${ep.episode_number}`);
            }}
          />
        </div>

        {/* Cast Section */}
        {credits && credits.cast && credits.cast.length > 0 && (
          <div className="mt-16 pt-8 border-t border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Series Cast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {credits.cast.slice(0, 6).map((actor) => (
                <div key={actor.id} className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/60 border border-white/5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                    <Image
                      src={getTmdbImageUrl(actor.profile_path, 'w500')}
                      alt={actor.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{actor.name}</h4>
                    <p className="text-[11px] text-zinc-400 truncate">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
