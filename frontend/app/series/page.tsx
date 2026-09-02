'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { TVShow } from '../../types';
import { MovieCard } from '../../components/movie-card/MovieCard';
import { MovieCardSkeleton } from '../../components/ui/Skeleton';
import { Tv, Loader2, ChevronDown } from 'lucide-react';

export default function SeriesPage() {
  const [tab, setTab] = useState<'popular' | 'topRated'>('popular');
  const [page, setPage] = useState<number>(1);
  const [items, setItems] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

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

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
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
  };

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

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-12 flex justify-center pb-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-white font-medium border border-white/10 hover:border-white/20 transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                    <span>Loading more series...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Series</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
