'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Plus, Check, Star, Film } from 'lucide-react';
import { Movie, TVShow } from '../../types';
import { getTmdbImageUrl, formatScore, formatReleaseYear, cn } from '../../lib/utils';
import { useWatchlist } from '../../hooks/useMedia';
import { TrailerModal } from '../trailer/TrailerModal';

interface MovieCardProps {
  item: Movie | TVShow;
  mediaType?: 'movie' | 'tv';
  priority?: boolean;
  className?: string;
}

export function MovieCard({ item, mediaType, priority = false, className }: MovieCardProps) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

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
    <>
      <div
        className={cn(
          'group/card relative flex-shrink-0 select-none transition-all duration-300 hover:scale-[1.04] hover:z-20',
          className || 'w-40 sm:w-48 md:w-52'
        )}
      >
        {/* Poster Media Box */}
        <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-zinc-900 shadow-lg border border-white/5 group-hover/card:border-red-500/30 transition-colors">
          <Link href={detailsUrl} className="absolute inset-0 z-0" aria-label={title}>
            <Image
              src={posterUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 208px"
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover/card:scale-105"
            />
          </Link>

          {/* Top Badges (Type & Rating) */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-zinc-200">
              {type === 'movie' ? 'MOVIE' : 'TV SERIES'}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600/85 backdrop-blur-md text-white text-[11px] font-bold shadow">
              <Star className="w-3 h-3 fill-current" />
              {formatScore(item.vote_average)}
            </span>
          </div>

          {/* Bottom Title & Metadata Inside Poster */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 pt-10 z-10 pointer-events-none">
            <h3 className="text-sm font-bold text-white truncate drop-shadow">{title}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 mt-0.5 font-medium">
              <span>{formatReleaseYear(releaseDate) || '—'}</span>
              <span>•</span>
              <span className="px-1 py-0.2 rounded bg-white/10 text-[10px] font-semibold tracking-wide text-zinc-200">
                4K
              </span>
              <span className="text-[10px] font-semibold text-zinc-400">HD</span>
            </div>
          </div>

          {/* Hover Action Overlay */}
          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3 pointer-events-none z-20">
            <div className="flex items-center gap-2.5 pointer-events-auto">
              <Link
                href={watchUrl}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-red text-white hover:bg-red-700 transition shadow-lg shadow-red-900/40 hover:scale-110"
                title="Watch Now"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </Link>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsTrailerOpen(true);
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900/90 border border-white/20 text-zinc-200 hover:border-red-500/60 hover:text-white transition backdrop-blur-md hover:scale-110"
                title="Preview Trailer"
              >
                <Film className="w-4 h-4 text-brand-red" />
              </button>

              <button
                onClick={handleToggleWatchlist}
                className={`flex items-center justify-center w-10 h-10 rounded-full border transition backdrop-blur-md hover:scale-110 ${
                  isBookmarked
                    ? 'bg-zinc-900/90 border-emerald-500/60 text-emerald-400'
                    : 'bg-zinc-900/90 border-white/20 text-white hover:border-white/60'
                }`}
                title={isBookmarked ? 'In Watchlist' : 'Add to Watchlist'}
              >
                {isBookmarked ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        mediaType={type}
        tmdbId={item.id}
        title={title}
      />
    </>
  );
}
