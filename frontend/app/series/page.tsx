'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../lib/api';
import { TVShow } from '../../types';
import { MovieCard } from '../../components/movie-card/MovieCard';
import { MovieCardSkeleton } from '../../components/ui/Skeleton';
import { Tv, Loader2 } from 'lucide-react';

export default function SeriesPage() {
  const [tab, setTab] = useState<'popular' | 'topRated'>('popular');
  const [page, setPage] = useState<number>(1);
  const [items, setItems] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fetch initial page on tab change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setPage(1);

    const fetchFirstPage = async () => {
      try {
        const results = tab === 'popular' ? await api.getPopularTV(1) : await api.getTopRatedTV(1);
        if (isMounted) {
          setItems(results);
          setHasMore(results.length > 0);
        }
      } catch (err) {
        console.error('Failed to fetch series:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFirstPage();
    return () => {
      isMounted = false;
    };
  }, [tab]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const nextResults = tab === 'popular' ? await api.getPopularTV(nextPage) : await api.getTopRatedTV(nextPage);
      if (nextResults.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const uniqueNew = nextResults.filter((s) => !existingIds.has(s.id));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Failed to load more series:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, isLoading, page, tab]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: '400px' }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [handleLoadMore]);

  return (
    <div className="pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Tv className="w-8 h-8 text-indigo-500" />
            <span>TV Series</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Discover multi-season sagas, serialized drama, and binge-worthy television.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-xl border border-white/10 self-start">
          <button
            onClick={() => setTab('popular')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              tab === 'popular' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Popular Series
          </button>
          <button
            onClick={() => setTab('topRated')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              tab === 'topRated' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Top Rated
          </button>
        </div>
      </div>

      {/* Series Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map((tv) => (
              <MovieCard key={tv.id} item={tv} mediaType="tv" />
            ))}
          </div>

          {/* Infinite Scroll Sentinel & Loading Indicator */}
          {hasMore && (
            <div ref={sentinelRef} className="mt-12 flex justify-center pb-8 min-h-[60px]">
              {isLoadingMore && (
                <div className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-zinc-900/90 border border-white/10 text-zinc-300 text-sm font-medium shadow-xl backdrop-blur-md">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span>Loading more series...</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
