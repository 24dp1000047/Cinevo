'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Play,
  Plus,
  Check,
  Info,
  Star,
  Film,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { Movie, TVShow } from '../../types';
import { getTmdbImageUrl, formatScore, formatReleaseYear, formatMinutes } from '../../lib/utils';
import { useWatchlist } from '../../hooks/useMedia';
import { TrailerModal } from '../trailer/TrailerModal';

interface HeroBannerProps {
  item?: Movie | TVShow;
  items?: (Movie | TVShow)[];
}

const ROTATION_INTERVAL_MS = 7000;

export function HeroBanner({ item: singleItem, items: itemArray }: HeroBannerProps) {
  const activeItems = (itemArray && itemArray.length > 0)
    ? itemArray.slice(0, 5)
    : singleItem
    ? [singleItem]
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: watchlist = [], toggleWatchlist } = useWatchlist();

  const currentItem = activeItems[currentIndex] || activeItems[0];

  const handleNext = useCallback(() => {
    if (activeItems.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % activeItems.length);
  }, [activeItems.length]);

  const handlePrev = useCallback(() => {
    if (activeItems.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
  }, [activeItems.length]);

  // Auto-rotation timer
  useEffect(() => {
    if (activeItems.length <= 1 || isHovered || isTrailerOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, ROTATION_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeItems.length, isHovered, isTrailerOpen, handleNext, currentIndex]);

  if (!currentItem) return null;

  const isMovie = (currentItem as Movie).title !== undefined;
  const type = isMovie ? 'movie' : 'tv';
  const title = (currentItem as Movie).title || (currentItem as TVShow).name || 'Featured Title';
  const releaseDate = (currentItem as Movie).release_date || (currentItem as TVShow).first_air_date;
  const runtime = (currentItem as Movie).runtime;
  const seasonsCount = (currentItem as TVShow).number_of_seasons;
  const backdropUrl = getTmdbImageUrl(currentItem.backdrop_path, 'original');

  const isBookmarked = watchlist.some(
    (w) => w.tmdbId === currentItem.id && w.mediaType === type
  );

  const handleToggleWatchlist = () => {
    toggleWatchlist({
      tmdbId: currentItem.id,
      mediaType: type,
      title,
      posterPath: currentItem.poster_path,
      voteAverage: currentItem.vote_average,
    });
  };

  const watchUrl = `/watch/${type}/${currentItem.id}`;
  const detailsUrl = `/${type}/${currentItem.id}`;

  return (
    <>
      <div
        className="relative w-full h-[78vh] md:h-[86vh] overflow-hidden select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Backdrop Image Carousel Layer */}
        {activeItems.map((item, idx) => {
          const isActive = idx === currentIndex;
          const bgUrl = getTmdbImageUrl(item.backdrop_path, 'original');
          const itemTitle = (item as Movie).title || (item as TVShow).name || '';

          return (
            <div
              key={`${item.id}-${idx}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
              }`}
            >
              <Image
                src={bgUrl}
                alt={itemTitle}
                fill
                priority={idx === 0}
                className="object-cover object-top opacity-65 scale-105 transition-transform duration-1000"
              />
            </div>
          );
        })}

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/75 to-transparent z-10" />

        {/* Left / Right Arrow Carousel Buttons */}
        {activeItems.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 text-white backdrop-blur-md flex items-center justify-center opacity-0 md:group-hover:opacity-100 hover:scale-105 transition-all shadow-xl"
              aria-label="Previous featured title"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 text-white backdrop-blur-md flex items-center justify-center opacity-0 md:group-hover:opacity-100 hover:scale-105 transition-all shadow-xl"
              aria-label="Next featured title"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Content Box */}
        <div className="relative h-full flex flex-col justify-end px-6 md:px-16 pb-16 max-w-3xl z-20">
          {/* Badge & Metadata */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium mb-3">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/20 text-brand-red border border-red-500/30 font-bold uppercase tracking-wider text-[11px]">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>#{currentIndex + 1} Trending</span>
            </span>

            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{formatScore(currentItem.vote_average)}</span>
            </span>

            <span className="text-zinc-300 font-semibold">{formatReleaseYear(releaseDate)}</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-300">
              {isMovie ? formatMinutes(runtime) || 'Feature Film' : `${seasonsCount || 1} Season${(seasonsCount || 1) > 1 ? 's' : ''}`}
            </span>
            <span className="text-zinc-500">•</span>
            <span className="px-2 py-0.5 text-xs rounded bg-white/10 text-zinc-300 uppercase tracking-wider">
              Ultra HD 4K
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-3 drop-shadow-lg transition-all duration-300">
            {title}
          </h1>

          {/* Overview Synopsis */}
          <p className="text-sm md:text-base text-zinc-300 line-clamp-3 mb-6 font-normal leading-relaxed drop-shadow max-w-2xl">
            {currentItem.overview}
          </p>

          {/* CTAs Bar */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <Link
              href={watchUrl}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold transition shadow-xl shadow-red-900/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Now</span>
            </Link>

            <button
              onClick={() => setIsTrailerOpen(true)}
              className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold transition backdrop-blur-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <Film className="w-4 h-4 text-brand-red" />
              <span>Trailer</span>
            </button>

            <button
              onClick={handleToggleWatchlist}
              className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl font-semibold border backdrop-blur-md transition hover:scale-[1.02] active:scale-[0.98] ${
                isBookmarked
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-zinc-900/80 border-white/15 text-zinc-200 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {isBookmarked ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
              <span>{isBookmarked ? 'In Watchlist' : 'My List'}</span>
            </button>

            <Link
              href={detailsUrl}
              className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 font-medium transition backdrop-blur-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <Info className="w-4 h-4" />
              <span>Details</span>
            </Link>
          </div>

          {/* Carousel Pagination Progress Indicators */}
          {activeItems.length > 1 && (
            <div className="flex items-center gap-2 mt-8 z-20">
              {activeItems.map((_, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className="group relative py-2 focus:outline-none"
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden ${
                        isActive
                          ? 'w-10 bg-brand-red shadow-lg shadow-red-900/50'
                          : 'w-4 bg-white/20 group-hover:bg-white/40'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        mediaType={type}
        tmdbId={currentItem.id}
        title={title}
      />
    </>
  );
}
