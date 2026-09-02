'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Movie } from '../../types';
import { MovieCard } from '../../components/movie-card/MovieCard';
import { MovieCardSkeleton } from '../../components/ui/Skeleton';
import { Film, Loader2, ChevronDown } from 'lucide-react';

export default function MoviesPage() {
  const [tab, setTab] = useState<'popular' | 'topRated' | 'trending'>('popular');
  const [page, setPage] = useState<number>(1);
  const [items, setItems] = useState<Movie[]>([]);
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
        let results: Movie[] = [];
        if (tab === 'popular') results = await api.getPopularMovies(1);
        else if (tab === 'topRated') results = await api.getTopRatedMovies(1);
        else results = await api.getTrendingMovies(1);

        if (isMounted) {
          setItems(results);
          setHasMore(results.length > 0);
        }
      } catch (err) {
        console.error('Failed to fetch movies:', err);
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
      let nextResults: Movie[] = [];
      if (tab === 'popular') nextResults = await api.getPopularMovies(nextPage);
      else if (tab === 'topRated') nextResults = await api.getTopRatedMovies(nextPage);
      else nextResults = await api.getTrendingMovies(nextPage);

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
      console.error('Failed to load more movies:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Film className="w-8 h-8 text-brand-red" />
            <span>Movies</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse feature films, box office hits, and critically acclaimed cinema.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-xl border border-white/10 self-start">
          <button
            onClick={() => setTab('popular')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              tab === 'popular' ? 'bg-brand-red text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => setTab('topRated')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              tab === 'topRated' ? 'bg-brand-red text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Top Rated
          </button>
          <button
            onClick={() => setTab('trending')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              tab === 'trending' ? 'bg-brand-red text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Trending
          </button>
        </div>
      </div>

      {/* Movie Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map((movie) => (
              <MovieCard key={movie.id} item={movie} mediaType="movie" />
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
                    <Loader2 className="w-5 h-5 animate-spin text-brand-red" />
                    <span>Loading more movies...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Movies</span>
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
