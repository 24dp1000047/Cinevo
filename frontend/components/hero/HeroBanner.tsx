'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Plus, Check, Info, Star } from 'lucide-react';
import { Movie, TVShow } from '../../types';
import { getTmdbImageUrl, formatScore, formatReleaseYear, formatMinutes } from '../../lib/utils';
import { useWatchlist } from '../../hooks/useMedia';

interface HeroBannerProps {
  item?: Movie | TVShow;
}

export function HeroBanner({ item }: HeroBannerProps) {
  const { data: watchlist = [], toggleWatchlist } = useWatchlist();

  if (!item) return null;

  const isMovie = (item as Movie).title !== undefined;
  const type = isMovie ? 'movie' : 'tv';
  const title = (item as Movie).title || (item as TVShow).name || 'Featured Title';
  const releaseDate = (item as Movie).release_date || (item as TVShow).first_air_date;
  const runtime = (item as Movie).runtime;
  const seasonsCount = (item as TVShow).number_of_seasons;
  const backdropUrl = getTmdbImageUrl(item.backdrop_path, 'original');

  const isBookmarked = watchlist.some(
    (w) => w.tmdbId === item.id && w.mediaType === type
  );

  const handleToggleWatchlist = () => {
    toggleWatchlist({
      tmdbId: item.id,
      mediaType: type,
      title,
      posterPath: item.poster_path,
      voteAverage: item.vote_average,
    });
  };

  const watchUrl = `/watch/${type}/${item.id}`;
  const detailsUrl = `/${type}/${item.id}`;

  return (
    <div className="relative w-full h-[75vh] md:h-[82vh] overflow-hidden select-none">
      {/* Backdrop Image */}
      <div className="absolute inset-0">
        <Image
          src={backdropUrl}
          alt={title}
          fill
          priority
          className="object-cover object-top opacity-65 scale-105 transition-transform duration-1000"
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end px-6 md:px-16 pb-16 max-w-3xl z-10">
        {/* Badge & Metadata */}
        <div className="flex items-center gap-3 text-sm font-medium mb-3">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Star className="w-4 h-4 fill-current" />
            {formatScore(item.vote_average)}
          </span>
          <span className="text-zinc-300 font-semibold">{formatReleaseYear(releaseDate)}</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-300">
            {isMovie ? formatMinutes(runtime) || 'Feature Film' : `${seasonsCount || 1} Season${(seasonsCount || 1) > 1 ? 's' : ''}`}
          </span>
          <span className="text-zinc-500">•</span>
          <span className="px-2 py-0.5 text-xs rounded bg-white/10 text-zinc-300 uppercase tracking-wider">
            Ultra HD
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-3 drop-shadow-md">
          {title}
        </h1>

        {/* Overview Synopsis */}
        <p className="text-sm md:text-base text-zinc-300 line-clamp-3 mb-6 font-normal leading-relaxed drop-shadow">
          {item.overview}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <Link
            href={watchUrl}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-red hover:bg-red-700 text-white font-semibold transition shadow-xl shadow-red-900/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Watch Now</span>
          </Link>

          <button
            onClick={handleToggleWatchlist}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium border backdrop-blur-md transition hover:scale-[1.02] active:scale-[0.98] ${
              isBookmarked
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
          >
            {isBookmarked ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
            <span>{isBookmarked ? 'In Watchlist' : 'My List'}</span>
          </button>

          <Link
            href={detailsUrl}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 font-medium transition backdrop-blur-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <Info className="w-5 h-5" />
            <span>Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
