'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, X } from 'lucide-react';
import { useSearch } from '../../hooks/useMedia';
import { getTmdbImageUrl, formatReleaseYear } from '../../lib/utils';
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
        } else if (query.trim()) {
          onClose();
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
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
        className="w-full max-w-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Box (Amber Focus Border) */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#121215] border border-amber-400/75 ring-2 ring-amber-400/20 shadow-2xl">
          <SearchIcon className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            placeholder="Search movies, series..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none"
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
              className="p-1 rounded-full text-zinc-500 hover:text-white transition"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Detached Minimal Suggestions Dropdown */}
        {query.trim().length > 0 && (
          <div className="mt-2.5 rounded-2xl bg-[#111215] border border-white/10 shadow-2xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center gap-3 px-4 py-4 text-xs text-zinc-400">
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </div>
            ) : suggestions.length === 0 && debouncedQuery ? (
              <div className="px-4 py-5 text-sm text-zinc-500 text-center">
                No results found for &ldquo;{debouncedQuery}&rdquo;
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto py-1.5">
                {suggestions.map((item, idx) => {
                  const isMovie = (item as Movie).title !== undefined;
                  const type = isMovie ? 'movie' : 'tv';
                  const title = (item as Movie).title || (item as TVShow).name || 'Untitled';
                  const date = (item as Movie).release_date || (item as TVShow).first_air_date;
                  const year = formatReleaseYear(date);
                  const posterUrl = getTmdbImageUrl(item.poster_path, 'w500');
                  const isHighlighted = idx === activeIndex;

                  return (
                    <Link
                      key={`${type}-${item.id}`}
                      href={`/${type}/${item.id}`}
                      onClick={onClose}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex items-center gap-3.5 px-4 py-2.5 transition-colors ${
                        isHighlighted ? 'bg-white/10' : 'hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
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
                        <p className="text-xs font-medium text-zinc-400 mt-0.5 uppercase tracking-wide">
                          {type === 'movie' ? 'MOVIE' : 'TV'}
                          {year ? ` · ${year}` : ''}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
