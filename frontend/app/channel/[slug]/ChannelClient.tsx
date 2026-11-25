'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { getChannelBySlug } from '../../../lib/channels';
import { Movie, TVShow } from '../../../types';
import { MovieCard } from '../../../components/movie-card/MovieCard';
import { MovieCardSkeleton } from '../../../components/ui/Skeleton';

function ChannelLogo({ slug }: { slug: string }) {
  switch (slug) {
    case 'netflix':
      return <span className="text-2xl font-black text-[#e50914] tracking-tighter">N</span>;
    case 'prime-video':
      return (
        <div className="flex flex-col items-center leading-none">
          <span className="text-[10px] font-black tracking-tight text-[#00a8e1]">prime</span>
          <span className="text-[10px] font-black tracking-tight text-[#00a8e1]">video</span>
        </div>
      );
    case 'disney-plus':
      return <span className="text-xs font-extrabold tracking-tight text-white">Disney+</span>;
    case 'apple-tv':
      return <span className="text-sm font-bold tracking-tight text-white">tv</span>;
    case 'hulu':
      return <span className="text-sm font-black tracking-tight text-white">hulu</span>;
    case 'hbo-max':
      return (
        <div className="flex flex-col items-center leading-none text-white">
          <span className="text-[11px] font-black tracking-wider">HBO</span>
          <span className="text-[9px] font-bold">max</span>
        </div>
      );
    case 'paramount-plus':
      return <span className="text-[9px] font-extrabold italic text-white">Paramount+</span>;
    case 'peacock':
      return <span className="text-[10px] font-extrabold text-white">peacock</span>;
    case 'crunchyroll':
      return (
        <div className="w-6 h-6 rounded-full border-[3px] border-white flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-white translate-x-0.5" />
        </div>
      );
    case 'starz':
      return <span className="text-xs font-black tracking-widest text-amber-300">STARZ</span>;
    default:
      return <span className="text-sm font-black text-white">TV</span>;
  }
}

export default function ChannelClient({ slug }: { slug: string }) {
  const channel = getChannelBySlug(slug);

  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [items, setItems] = useState<(Movie | TVShow)[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setPage(1);

    const fetchFirstPage = async () => {
      try {
        const results = await api.getByWatchProvider(
          mediaType,
          channel.watchProviderId,
          1,
          channel.networkId
        );
        if (isMounted) {
          setItems(results);
          setHasMore(results.length >= 10);
        }
      } catch (err) {
        console.error('Failed to fetch channel catalog:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFirstPage();
    return () => {
      isMounted = false;
    };
  }, [mediaType, channel.watchProviderId, channel.networkId]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const nextResults = await api.getByWatchProvider(
        mediaType,
        channel.watchProviderId,
        nextPage,
        channel.networkId
      );
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
      console.error('Failed to load more channel titles:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, isLoading, page, mediaType, channel.watchProviderId, channel.networkId]);

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
    <div className={`min-h-screen bg-gradient-to-b ${channel.accentColor} via-[#09090b] to-[#09090b] pt-24 md:pt-10 pb-20 px-4 md:px-12`}>
      <div className="max-w-7xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Provider Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 ${channel.tileClass}`}
          >
            <ChannelLogo slug={channel.slug} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {channel.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              What&apos;s streaming on {channel.name} in the US
            </p>
            <div className="w-16 h-0.5 bg-sky-500 rounded-full mt-2.5" />
          </div>
        </div>

        {/* Segmented Movies / Series Switcher */}
        <div className="inline-flex items-center p-1 rounded-full bg-zinc-900/90 border border-white/10 mb-8">
          <button
            type="button"
            onClick={() => setMediaType('movie')}
            className={`px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mediaType === 'movie'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Movies
          </button>
          <button
            type="button"
            onClick={() => setMediaType('tv')}
            className={`px-5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              mediaType === 'tv'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Series
          </button>
        </div>

        {/* Full Catalog Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 18 }).map((_, idx) => (
              <MovieCardSkeleton key={idx} className="w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 text-zinc-400">
            <p className="text-lg font-semibold text-white mb-2">
              No {mediaType === 'movie' ? 'movies' : 'series'} found for {channel.name}
            </p>
            <p className="text-sm text-zinc-500">Try switching between Movies and Series above.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {items.map((item) => (
                <MovieCard
                  key={`${mediaType}-${item.id}`}
                  item={item}
                  mediaType={mediaType}
                  className="w-full"
                />
              ))}
            </div>

            <div ref={sentinelRef} className="py-10 flex justify-center">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
                  <span>Loading more titles...</span>
                </div>
              )}
              {!isLoadingMore && hasMore && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-zinc-200 transition cursor-pointer"
                >
                  Load More {mediaType === 'movie' ? 'Movies' : 'Series'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
