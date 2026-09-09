'use client';

import React, { useState } from 'react';
import {
  Film,
  Tv,
  Star,
  Calendar,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
  Flame,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Filter,
} from 'lucide-react';
import { DiscoverFilters, DiscoverSortOption, Genre } from '../../types';
import { MOVIE_GENRES, TV_GENRES, DISCOVER_PRESETS, MoodPreset } from '../../lib/api';

interface DiscoverFiltersProps {
  filters: DiscoverFilters;
  onChange: (updated: Partial<DiscoverFilters>) => void;
  onReset: () => void;
  isCustomized: boolean;
}

const SORT_OPTIONS: { label: string; value: DiscoverSortOption }[] = [
  { label: 'Most Popular', value: 'popularity.desc' },
  { label: 'Highest Rated', value: 'vote_average.desc' },
  { label: 'Newest Releases', value: 'primary_release_date.desc' },
  { label: 'Box Office Hits', value: 'revenue.desc' },
];

const RATING_OPTIONS: { label: string; value: number }[] = [
  { label: 'All Ratings', value: 0 },
  { label: '6.0+ ★', value: 6 },
  { label: '7.0+ ★', value: 7 },
  { label: '7.5+ ★', value: 7.5 },
  { label: '8.0+ ★', value: 8 },
  { label: '8.5+ ★', value: 8.5 },
];

const ERA_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Eras', value: 'all' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '2022', value: '2022' },
  { label: '2020s', value: '2020s' },
  { label: '2010s', value: '2010s' },
  { label: '2000s', value: '2000s' },
  { label: '90s Classics', value: '1990s' },
  { label: 'Golden Classics (Pre-90)', value: 'classic' },
];

export function DiscoverFiltersPanel({
  filters,
  onChange,
  onReset,
  isCustomized,
}: DiscoverFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeGenres = filters.genres || [];
  const currentGenreList: Genre[] = filters.mediaType === 'tv' ? TV_GENRES : MOVIE_GENRES;

  const handleMediaTypeChange = (type: 'movie' | 'tv') => {
    if (type === filters.mediaType) return;
    // Map common genres or clear incompatible ones
    const newGenreList = type === 'tv' ? TV_GENRES : MOVIE_GENRES;
    const validGenreIds = new Set(newGenreList.map((g) => g.id));
    const filteredGenres = activeGenres.filter((id) => validGenreIds.has(id));

    onChange({
      mediaType: type,
      genres: filteredGenres,
      page: 1,
    });
  };

  const handleToggleGenre = (genreId: number) => {
    let nextGenres: number[];
    if (activeGenres.includes(genreId)) {
      nextGenres = activeGenres.filter((id) => id !== genreId);
    } else {
      nextGenres = [...activeGenres, genreId];
    }
    onChange({ genres: nextGenres, page: 1 });
  };

  const handleClearGenres = () => {
    onChange({ genres: [], page: 1 });
  };

  const handleApplyPreset = (preset: MoodPreset) => {
    onChange({
      mediaType: preset.mediaType,
      genres: preset.genres,
      minRating: preset.minRating || 0,
      sortBy: preset.sortBy || 'popularity.desc',
      yearRange: 'all',
      page: 1,
    });
  };

  const renderPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy':
        return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      case 'sparkles':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
      case 'zap':
        return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
      case 'tv':
        return <Tv className="w-3.5 h-3.5 text-purple-400" />;
      case 'film':
        return <Film className="w-3.5 h-3.5 text-emerald-400" />;
      case 'flame':
        return <Flame className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-brand-red" />;
    }
  };

  return (
    <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-xl shadow-2xl transition-all mb-8">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        {/* Media Type Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-black/40 border border-white/10">
          <button
            type="button"
            onClick={() => handleMediaTypeChange('movie')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
              filters.mediaType === 'movie'
                ? 'bg-brand-red text-white shadow-lg shadow-red-900/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Movies</span>
          </button>
          <button
            type="button"
            onClick={() => handleMediaTypeChange('tv')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
              filters.mediaType === 'tv'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>TV Shows</span>
          </button>
        </div>

        {/* Action Controls: Collapse Toggle & Reset */}
        <div className="flex items-center gap-3">
          {isCustomized && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition border border-white/10"
              title="Reset all filters to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition"
          >
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span>{isExpanded ? 'Hide Filters' : 'Show Filters'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 ml-0.5" /> : <ChevronDown className="w-4 h-4 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Mood Presets Carousel */}
      <div className="pt-4 pb-2">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-brand-red" />
          <span>Curated Moods</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1">
          {DISCOVER_PRESETS.map((preset) => {
            const isSelected =
              filters.mediaType === preset.mediaType &&
              preset.genres.every((g) => activeGenres.includes(g)) &&
              activeGenres.length === preset.genres.length;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`flex items-center gap-2 flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-brand-red/20 border-brand-red text-white shadow-md'
                    : 'bg-zinc-800/60 hover:bg-zinc-800 border-white/5 hover:border-white/20 text-zinc-300'
                }`}
              >
                {renderPresetIcon(preset.icon)}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Filter Body */}
      {isExpanded && (
        <div className="pt-4 space-y-6 animate-fade-in">
          {/* Genre Pills */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                <span>Genres</span>
                {activeGenres.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-brand-red text-[10px] font-bold text-white">
                    {activeGenres.length} selected
                  </span>
                )}
              </div>
              {activeGenres.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearGenres}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition"
                >
                  Clear genres
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleClearGenres}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeGenres.length === 0
                    ? 'bg-white text-zinc-950 border-white shadow'
                    : 'bg-zinc-800/70 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                All Genres
              </button>
              {currentGenreList.map((genre) => {
                const isSelected = activeGenres.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => handleToggleGenre(genre.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-red-950/50 scale-[1.02]'
                        : 'bg-zinc-800/70 border-white/5 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-white/20'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{genre.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Controls: Sort, Rating, Era */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-white/5">
            {/* Sort Order */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Sort Order
              </label>
              <div className="relative">
                <select
                  value={filters.sortBy || 'popularity.desc'}
                  onChange={(e) =>
                    onChange({
                      sortBy: e.target.value as DiscoverSortOption,
                      page: 1,
                    })
                  }
                  className="w-full appearance-none bg-zinc-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-medium text-white focus:outline-none focus:border-brand-red transition cursor-pointer pr-10"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Minimum Rating</span>
              </div>
              <div className="relative">
                <select
                  value={filters.minRating || 0}
                  onChange={(e) =>
                    onChange({
                      minRating: parseFloat(e.target.value),
                      page: 1,
                    })
                  }
                  className="w-full appearance-none bg-zinc-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-medium text-white focus:outline-none focus:border-brand-red transition cursor-pointer pr-10"
                >
                  {RATING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Release Era / Year */}
            <div>
              <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Release Era</span>
              </div>
              <div className="relative">
                <select
                  value={filters.yearRange || 'all'}
                  onChange={(e) =>
                    onChange({
                      yearRange: e.target.value,
                      page: 1,
                    })
                  }
                  className="w-full appearance-none bg-zinc-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-medium text-white focus:outline-none focus:border-brand-red transition cursor-pointer pr-10"
                >
                  {ERA_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          {isCustomized && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-xs text-zinc-400">Active Filters:</span>

              {filters.mediaType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 text-[11px] text-zinc-300 border border-white/10 font-medium">
                  {filters.mediaType === 'tv' ? 'TV Series' : 'Movies'}
                </span>
              )}

              {activeGenres.map((id) => {
                const genre = currentGenreList.find((g) => g.id === id);
                if (!genre) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleToggleGenre(id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-red/20 text-brand-red border border-brand-red/30 text-[11px] font-semibold hover:bg-brand-red/30 transition"
                  >
                    <span>{genre.name}</span>
                    <X className="w-3 h-3" />
                  </button>
                );
              })}

              {filters.minRating && filters.minRating > 0 ? (
                <button
                  type="button"
                  onClick={() => onChange({ minRating: 0, page: 1 })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold hover:bg-amber-500/30 transition"
                >
                  <span>{filters.minRating}+ ★</span>
                  <X className="w-3 h-3" />
                </button>
              ) : null}

              {filters.yearRange && filters.yearRange !== 'all' ? (
                <button
                  type="button"
                  onClick={() => onChange({ yearRange: 'all', page: 1 })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold hover:bg-indigo-500/30 transition"
                >
                  <span>{ERA_OPTIONS.find((o) => o.value === filters.yearRange)?.label}</span>
                  <X className="w-3 h-3" />
                </button>
              ) : null}

              {filters.sortBy && filters.sortBy !== 'popularity.desc' ? (
                <button
                  type="button"
                  onClick={() => onChange({ sortBy: 'popularity.desc', page: 1 })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-semibold hover:bg-purple-500/30 transition"
                >
                  <span>{SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label}</span>
                  <X className="w-3 h-3" />
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
