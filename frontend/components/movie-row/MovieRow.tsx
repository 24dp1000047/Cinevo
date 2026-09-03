'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie, TVShow } from '../../types';
import { MovieCard } from '../movie-card/MovieCard';
import { MovieRowSkeleton } from '../ui/Skeleton';

interface MovieRowProps {
  title: string;
  items?: (Movie | TVShow)[];
  mediaType?: 'movie' | 'tv';
  isLoading?: boolean;
}

export function MovieRow({ title, items = [], mediaType, isLoading = false }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = window.innerWidth * 0.7;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return <MovieRowSkeleton />;
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="relative group/row my-8 px-4 md:px-12">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-4 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-brand-red rounded-full inline-block"></span>
        {title}
      </h2>

      <div className="relative">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-14 bg-black/60 hover:bg-black/90 text-white rounded-r-lg backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all flex items-center justify-center -ml-4 md:-ml-12 shadow-xl hover:scale-105"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Horizontal Carousel */}
        <div
          ref={rowRef}
          className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1"
        >
          {items.map((item) => (
            <MovieCard key={item.id} item={item} mediaType={mediaType} />
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-14 bg-black/60 hover:bg-black/90 text-white rounded-l-lg backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all flex items-center justify-center -mr-4 md:-mr-12 shadow-xl hover:scale-105"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
