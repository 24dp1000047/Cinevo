'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Film, Tv, Star, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearch } from '../../hooks/useMedia';
import { getTmdbImageUrl, formatScore, formatReleaseYear } from '../../lib/utils';
import { Movie, TVShow } from '../../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setDebouncedQuery('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const { data: results = [], isLoading } = useSearch(debouncedQuery);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col p-4 md:p-8 animate-fade-in">
      {/* Header Search Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3 flex-1">
          <SearchIcon className="w-6 h-6 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV shows, actors..."
            className="w-full bg-transparent text-xl md:text-2xl text-white placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition"
        >
          Close [Esc]
        </button>
      </div>

      {/* Results Container */}
      <div className="max-w-4xl w-full mx-auto flex-1 overflow-y-auto mt-6 pr-2">
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-zinc-400">
            <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mr-3" />
            <span>Searching cinematic library...</span>
          </div>
        )}

        {!isLoading && debouncedQuery && results.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg">No results found for &ldquo;{debouncedQuery}&rdquo;</p>
            <p className="text-sm mt-1 text-zinc-600">Try searching with another title or genre keyword</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                  <Link href={`/${type}/${item.id}`} onClick={onClose} className="absolute inset-0 z-0" aria-label={title}>
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
                      onClick={onClose}
                      className="pointer-events-auto w-10 h-10 rounded-full bg-brand-red flex items-center justify-center text-white shadow-lg mb-2 hover:scale-110 transition"
                      title="Watch Now"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </Link>
                    <Link href={`/${type}/${item.id}`} onClick={onClose} className="pointer-events-auto text-xs text-white font-semibold line-clamp-1 hover:underline">
                      {title}
                    </Link>
                  </div>
                </div>

                <div className="p-2.5">
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
                  <h3 className="text-sm font-medium text-white truncate">{title}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{formatReleaseYear(date)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
