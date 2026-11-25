'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, X, Film, Tv, Star, Play } from 'lucide-react';
import { useSearch } from '../../hooks/useMedia';
import { getTmdbImageUrl, formatScore, formatReleaseYear } from '../../lib/utils';
import { Movie, TVShow } from '../../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery('');
      setDebouncedQuery('');
      setActiveIndex(-1);
    }
  }, [isOpen]);

  const { data: results = [], isLoading } = useSearch(debouncedQuery);
  const suggestions = results.slice(0, 8);

  const openFullSearch = () => {
    const target = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search';
    onClose();
    router.push(target);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown' && suggestions.length > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp' && suggestions.length > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          const item = suggestions[activeIndex];
          const type = (item as Movie).title !== undefined ? 'movie' : 'tv';
          onClose();
          router.push(`/${type}/${item.id}`);
        } else {
          openFullSearch();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, suggestions, activeIndex, query, router]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#0d0e12] border border-white/15 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <SearchIcon className="w-5 h-5 text-brand-red flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            placeholder="Search movies, series, franchises..."
            className="w-full bg-transparent text-base sm:text-lg text-white placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setDebouncedQuery('');
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-[11px] font-bold tracking-wider rounded-md bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 border border-white/10 transition"
          >
            ESC
          </button>
        </div>

        {/* Suggestions List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5">
          {query.trim().length === 0 ? (
            <div className="p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2.5">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {['Avatar', 'John Wick', 'Inception', 'Interstellar', 'The Dark Knight', 'Breaking Bad', 'Dune'].map(
                  (term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        setDebouncedQuery(term);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 border border-white/10 transition cursor-pointer"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-10 text-zinc-400 text-sm">
              <div className="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin mr-2.5" />
              <span>Searching...</span>
            </div>
          ) : suggestions.length === 0 && debouncedQuery ? (
            <div className="text-center py-10 text-zinc-500 text-sm">
              No results found for &ldquo;{debouncedQuery}&rdquo;
            </div>
          ) : (
            suggestions.map((item, idx) => {
              const isMovie = (item as Movie).title !== undefined;
              const type = isMovie ? 'movie' : 'tv';
              const title = (item as Movie).title || (item as TVShow).name || 'Untitled';
              const date = (item as Movie).release_date || (item as TVShow).first_air_date;
              const posterUrl = getTmdbImageUrl(item.poster_path, 'w500');
              const isHighlighted = idx === activeIndex;

              return (
                <div
                  key={`${type}-${item.id}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-4 py-2.5 transition-colors ${
                    isHighlighted ? 'bg-white/10' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <Link
                    href={`/${type}/${item.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3.5 flex-1 min-w-0"
                  >
                    <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/10">
                      <Image
                        src={posterUrl}
                        alt={title}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{title}</p>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                        <span className="flex items-center gap-1">
                          {type === 'movie' ? (
                            <Film className="w-3.5 h-3.5 text-brand-red" />
                          ) : (
                            <Tv className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                          <span>{type === 'movie' ? 'Movie' : 'Tv'}</span>
                        </span>
                        {date && (
                          <>
                            <span>•</span>
                            <span>{formatReleaseYear(date)}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {formatScore(item.vote_average)}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href={`/watch/${type}/${item.id}`}
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-red/15 hover:bg-brand-red text-zinc-200 hover:text-white border border-brand-red/30 text-xs font-semibold transition flex-shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play</span>
                  </Link>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Footer Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10 bg-[#090a0d] text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/10 text-[11px] font-mono">
              ↵ Enter
            </kbd>
            <span>to open full search page</span>
          </div>

          <button
            type="button"
            onClick={openFullSearch}
            className="text-brand-red hover:text-red-400 font-bold transition cursor-pointer"
          >
            Full Search →
          </button>
        </div>
      </div>
    </div>
  );
}
