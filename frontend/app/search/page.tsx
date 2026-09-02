'use client';

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Film, Tv, Star, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearch } from '../../hooks/useMedia';
import { getTmdbImageUrl, formatScore, formatReleaseYear } from '../../lib/utils';
import { Movie, TVShow } from '../../types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  const { data: results = [], isLoading } = useSearch(debouncedQuery);

  return (
    <div className="pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto min-h-screen">
      {/* Search Input Hero */}
      <div className="max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-extrabold text-white text-center mb-6">Search Cinevo</h1>
        <div className="relative flex items-center bg-zinc-900 border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-brand-red transition">
          <SearchIcon className="w-6 h-6 text-zinc-400 ml-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, series, characters..."
            className="w-full bg-transparent px-4 py-2.5 text-lg text-white placeholder-zinc-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-2 text-zinc-400 hover:text-white mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Status & Results */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-zinc-400">
          <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mr-3" />
          <span>Searching cinema database...</span>
        </div>
      )}

      {!isLoading && debouncedQuery && results.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-xl">No titles found for &ldquo;{debouncedQuery}&rdquo;</p>
          <p className="text-sm mt-2 text-zinc-600">Try searching for &apos;Interstellar&apos;, &apos;Breaking Bad&apos;, or &apos;Fight Club&apos;</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {results.map((item) => {
          const isMovie = (item as Movie).title !== undefined;
          const type = isMovie ? 'movie' : 'tv';
          const title = (item as Movie).title || (item as TVShow).name || 'Untitled';
          const date = (item as Movie).release_date || (item as TVShow).first_air_date;
          const posterUrl = getTmdbImageUrl(item.poster_path, 'w500');

          return (
            <div
              key={`${type}-${item.id}`}
              className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-brand-red/50 transition-all hover:scale-[1.03]"
            >
              <div className="relative aspect-[2/3] w-full">
                <Link href={`/${type}/${item.id}`} className="absolute inset-0 z-0" aria-label={title}>
                  <Image
                    src={posterUrl}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 150px, 200px"
                    className="object-cover"
                  />
                </Link>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 pointer-events-none z-10">
                  <Link
                    href={`/watch/${type}/${item.id}`}
                    className="pointer-events-auto w-10 h-10 rounded-full bg-brand-red flex items-center justify-center text-white shadow-lg mb-2 hover:scale-110 transition"
                    title="Watch Now"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </Link>
                  <Link href={`/${type}/${item.id}`} className="pointer-events-auto text-xs text-white font-semibold line-clamp-1 hover:underline">
                    {title}
                  </Link>
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span className="flex items-center gap-1">
                    {type === 'movie' ? <Film className="w-3 h-3 text-red-400" /> : <Tv className="w-3 h-3 text-indigo-400" />}
                    <span className="capitalize">{type}</span>
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3 h-3 fill-current" />
                    {formatScore(item.vote_average)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{formatReleaseYear(date)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
