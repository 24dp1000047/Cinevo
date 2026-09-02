'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Plus, Check, Star } from 'lucide-react';
import { Movie, TVShow } from '../../types';
import { getTmdbImageUrl, formatScore, formatReleaseYear } from '../../lib/utils';
import { useWatchlist } from '../../hooks/useMedia';

interface MovieCardProps {
  item: Movie | TVShow;
  mediaType?: 'movie' | 'tv';
  priority?: boolean;
}

export function MovieCard({ item, mediaType, priority = false }: MovieCardProps) {
  const type =
    mediaType ||
    (item as any).media_type ||
    ((item as Movie).title !== undefined ? 'movie' : 'tv');
  const title = (item as Movie).title || (item as TVShow).name || 'Untitled';
  const releaseDate = (item as Movie).release_date || (item as TVShow).first_air_date;
  const posterUrl = getTmdbImageUrl(item.poster_path, 'w500');

  const { data: watchlist = [], toggleWatchlist } = useWatchlist();
  const isBookmarked = watchlist.some(
    (w) => w.tmdbId === item.id && w.mediaType === type
  );

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist({
      tmdbId: item.id,
      mediaType: type,
      title,
      posterPath: item.poster_path,
      voteAverage: item.vote_average,
    });
  };

  const detailsUrl = `/${type}/${item.id}`;
  const watchUrl = `/watch/${type}/${item.id}`;

  return (
    <div className="group relative flex-shrink-0 w-40 sm:w-48 md:w-52 select-none transition-all duration-300 hover:scale-[1.04] hover:z-20">
      {/* Poster Media Box */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-zinc-900 shadow-lg border border-white/5 group-hover:border-red-500/30 transition-colors">
        <Link href={detailsUrl} className="absolute inset-0 z-0" aria-label={title}>
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 208px"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none z-10">
          <div className="flex items-center gap-2 mb-2 pointer-events-auto">
            <Link
              href={watchUrl}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-red text-white hover:bg-red-700 transition shadow-lg shadow-red-900/40"
              title="Watch Now"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </Link>

            <button
              onClick={handleToggleWatchlist}
              className={`flex items-center justify-center w-9 h-9 rounded-full border transition backdrop-blur-md ${
                isBookmarked
                  ? 'bg-zinc-800/80 border-emerald-500/60 text-emerald-400'
                  : 'bg-zinc-800/80 border-white/20 text-white hover:border-white/60'
              }`}
              title={isBookmarked ? 'In Watchlist' : 'Add to Watchlist'}
            >
              {isBookmarked ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          <Link href={detailsUrl} className="pointer-events-auto flex items-center gap-2 text-xs text-zinc-300">
            <span className="flex items-center gap-1 font-semibold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              {formatScore(item.vote_average)}
            </span>
            <span>•</span>
            <span>{formatReleaseYear(releaseDate)}</span>
          </Link>
        </div>
      </div>

      <div className="mt-2 px-1">
        <Link href={detailsUrl} className="block font-medium text-sm text-zinc-200 truncate group-hover:text-white transition">
          {title}
        </Link>
        <div className="flex items-center justify-between text-xs text-zinc-400 mt-0.5">
          <span>{formatReleaseYear(releaseDate)}</span>
          <span className="capitalize text-[11px] px-1.5 py-0.5 rounded bg-zinc-800/70 border border-white/5">
            {type === 'movie' ? 'Movie' : 'Series'}
          </span>
        </div>
      </div>
    </div>
  );
}
