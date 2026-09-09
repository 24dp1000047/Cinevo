'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Compass, Sparkles, Loader2, Film, RotateCcw } from 'lucide-react';
import { api, MOVIE_GENRES, TV_GENRES } from '../../lib/api';
import { DiscoverFilters, Movie, TVShow } from '../../types';
import { DiscoverFiltersPanel } from '../../components/discover/DiscoverFilters';
import { MovieCard } from '../../components/movie-card/MovieCard';
import { MovieCardSkeleton } from '../../components/ui/Skeleton';

const DEFAULT_FILTERS: DiscoverFilters = {
  mediaType: 'movie',
  genres: [],
  sortBy: 'popularity.desc',
  yearRange: 'all',
  minRating: 0,
  page: 1,
};

export default function DiscoverClient() {
  const searchParams = useSearchParams();

  // Initialize filters from URL search params if present
  const initialMediaType = (searchParams.get('type') === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv';
  const initialGenreParam = searchParams.get('genre');
  const initialGenres = initialGenreParam
    ? initialGenreParam
        .split(',')
        .map((g) => parseInt(g.trim(), 10))
        .filter((n) => !isNaN(n))
    : [];

  const [filters, setFilters] = useState<DiscoverFilters>({
    ...DEFAULT_FILTERS,
    mediaType: initialMediaType,
    genres: initialGenres,
  });

  const [items, setItems] = useState<(Movie | TVShow)[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Check if any filter is customized away from defaults
  const isCustomized =
    filters.mediaType !== 'movie' ||
    (filters.genres && filters.genres.length > 0) ||
    filters.sortBy !== 'popularity.desc' ||
    (filters.yearRange && filters.yearRange !== 'all') ||
    Boolean(filters.minRating && filters.minRating > 0);

  // Handle filter changes from the panel
  const handleFilterChange = (updated: Partial<DiscoverFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Fetch initial results whenever primary filter criteria change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setPage(1);

    const fetchFirstPage = async () => {
      try {
        const results = await api.discoverMedia({
          ...filters,
          page: 1,
        });

        if (isMounted) {
          setItems(results);
          setHasMore(results.length >= 10);
        }
      } catch (err) {
        console.error('Failed to discover media:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFirstPage();

    return () => {
      isMounted = false;
    };
  }, [
    filters.mediaType,
    filters.sortBy,
    filters.yearRange,
    filters.minRating,
    // JSON stringify genre array so dependency comparison works cleanly
    JSON.stringify(filters.genres),
  ]);

  // Load more pages when infinite scroll sentinel is reached
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const nextResults = await api.discoverMedia({
        ...filters,
        page: nextPage,
      });

      if (nextResults.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const uniqueNew = nextResults.filter((m) => !existingIds.has(m.id));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Failed to load more discover items:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, isLoading, page, filters]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: '450px' }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [handleLoadMore]);

  // Dynamic header badge text
  const currentGenreList = filters.mediaType === 'tv' ? TV_GENRES : MOVIE_GENRES;
  const activeGenreNames = (filters.genres || [])
    .map((id) => currentGenreList.find((g) => g.id === id)?.name)
    .filter(Boolean);

  let filterSummary = filters.mediaType === 'tv' ? 'All TV Series' : 'All Movies';
  if (activeGenreNames.length > 0) {
    filterSummary = `${activeGenreNames.join(' & ')} ${filters.mediaType === 'tv' ? 'Series' : 'Movies'}`;
  }
  if (filters.minRating && filters.minRating > 0) {
    filterSummary += ` • ${filters.minRating}+ ★`;
  }
  if (filters.yearRange && filters.yearRange !== 'all') {
    filterSummary += ` • ${filters.yearRange}`;
  }

  return (
    <div className="pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-red via-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-900/40 text-white">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <span>Discover & Genre Explorer</span>
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Explore Cinevo&apos;s deep catalog with curated moods, genres, eras, and rating thresholds.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Filter Pill Badge */}
        <div className="self-start md:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-xs font-semibold text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-brand-red" />
          <span className="truncate max-w-[240px] sm:max-w-xs">{filterSummary}</span>
          {!isLoading && (
            <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] text-zinc-400">
              {items.length}+
            </span>
          )}
        </div>
      </div>

      {/* Filter Control Studio */}
      <DiscoverFiltersPanel
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        isCustomized={isCustomized}
      />

      {/* Results Section */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <MovieCardSkeleton key={i} className="w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="py-24 text-center rounded-3xl bg-zinc-900/40 border border-white/5 p-8 max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-400 mx-auto mb-4">
            <Film className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Titles Found</h3>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            No {filters.mediaType === 'tv' ? 'television shows' : 'movies'} match this exact
            combination of genres, rating, and era.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-red hover:bg-red-700 text-white text-xs md:text-sm font-semibold transition shadow-lg shadow-red-900/40"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        /* Results Grid */
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {items.map((item, idx) => (
              <MovieCard
                key={`${item.id}-${idx}`}
                item={item}
                mediaType={filters.mediaType}
                className="w-full"
              />
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="mt-14 flex justify-center pb-8 min-h-[60px]">
              {isLoadingMore && (
                <div className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-zinc-900/90 border border-white/10 text-zinc-300 text-sm font-medium shadow-xl backdrop-blur-md">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-red" />
                  <span>Loading more curated titles...</span>
                </div>
              )}
            </div>
          )}

          {!hasMore && items.length > 0 && (
            <div className="text-center text-xs text-zinc-500 py-12 border-t border-white/5 mt-12">
              You&apos;ve reached the end of this collection • {items.length} titles discovered
            </div>
          )}
        </>
      )}
    </div>
  );
}
