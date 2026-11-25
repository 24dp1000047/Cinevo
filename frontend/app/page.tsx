'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Flame, Sparkles, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import {
  useTrendingMovies,
  usePopularMovies,
  useTopRatedMovies,
  useNowPlayingMovies,
  usePopularTV,
  useTopRatedTV,
  useMoviesByGenre,
  useTVByNetwork,
  useHistory,
} from '../hooks/useMedia';
import { HeroBanner } from '../components/hero/HeroBanner';
import { MovieRow } from '../components/movie-row/MovieRow';
import { MovieCard } from '../components/movie-card/MovieCard';
import { HeroSkeleton, MovieRowSkeleton } from '../components/ui/Skeleton';
import { getTmdbImageUrl } from '../lib/utils';

const MOOD_TABS = [
  { id: 'trending', emoji: '🔥', label: 'All Trending', genreId: 0 },
  { id: 'action', emoji: '💥', label: 'Action & Rush', genreId: 28 },
  { id: 'comedy', emoji: '😂', label: 'Laugh Out Loud', genreId: 35 },
  { id: 'scifi', emoji: '🧠', label: 'Sci-Fi & Cosmic', genreId: 878 },
  { id: 'horror', emoji: '💀', label: 'Spooky & Horror', genreId: 27 },
  { id: 'drama', emoji: '🎭', label: 'Gripping Drama', genreId: 18 },
  { id: 'mystery', emoji: '🕵️', label: 'Mystery & Thrill', genreId: 9648 },
  { id: 'fantasy', emoji: '🔮', label: 'Magic & Fantasy', genreId: 14 },
];

const STREAMING_PROVIDERS = [
  { id: 213, name: 'Netflix', badge: 'N', badgeBg: 'bg-red-600 text-white' },
  { id: 1024, name: 'Prime Video', badge: 'P', badgeBg: 'bg-sky-500 text-white' },
  { id: 49, name: 'Max', badge: 'M', badgeBg: 'bg-zinc-800 text-white border border-white/20' },
  { id: 2739, name: 'Disney+', badge: 'D+', badgeBg: 'bg-blue-700 text-white' },
  { id: 2552, name: 'Apple TV+', badge: 'tv', badgeBg: 'bg-zinc-900 text-white border border-white/20' },
  { id: 4330, name: 'Paramount+', badge: 'P+', badgeBg: 'bg-blue-600 text-white' },
  { id: 453, name: 'Hulu', badge: 'H', badgeBg: 'bg-emerald-500 text-zinc-950' },
];

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState(MOOD_TABS[0]);
  const [selectedProvider, setSelectedProvider] = useState(STREAMING_PROVIDERS[0]);
  const [isProviderOpen, setIsProviderOpen] = useState(false);

  const providerDropdownRef = useRef<HTMLDivElement>(null);
  const providerRowRef = useRef<HTMLDivElement>(null);
  const theatreRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(e.target as Node)) {
        setIsProviderOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: trending = [], isLoading: isTrendingLoading } = useTrendingMovies();
  const { data: moodGenreMovies = [], isLoading: isMoodGenreLoading } = useMoviesByGenre(selectedMood.genreId);
  const { data: nowPlaying = [], isLoading: isNowPlayingLoading } = useNowPlayingMovies();
  const { data: providerShows = [], isLoading: isProviderLoading } = useTVByNetwork(selectedProvider.id);

  const { data: popularMovies = [], isLoading: isPopMoviesLoading } = usePopularMovies();
  const { data: topRatedMovies = [], isLoading: isTopMoviesLoading } = useTopRatedMovies();
  const { data: popularTV = [], isLoading: isPopTVLoading } = usePopularTV();
  const { data: topRatedTV = [], isLoading: isTopTVLoading } = useTopRatedTV();
  const { data: actionMovies = [], isLoading: isActionLoading } = useMoviesByGenre(28);
  const { data: scifiMovies = [], isLoading: isScifiLoading } = useMoviesByGenre(878);
  const { data: comedyMovies = [], isLoading: isComedyLoading } = useMoviesByGenre(35);
  const { data: history = [] } = useHistory();

  const heroItem = trending[0] || popularMovies[0];
  const moodItems = selectedMood.genreId === 0 ? trending : moodGenreMovies;
  const isMoodLoading = selectedMood.genreId === 0 ? isTrendingLoading : isMoodGenreLoading;

  const scrollRow = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (ref.current) {
      const amount = window.innerWidth * 0.7;
      ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {isTrendingLoading ? (
        <HeroSkeleton />
      ) : (
        <HeroBanner
          items={trending.length > 0 ? trending.slice(0, 5) : popularMovies.slice(0, 5)}
          item={heroItem}
        />
      )}

      {/* Continue Watching Section */}
      {history.length > 0 && (
        <div className="px-4 md:px-12 mt-8 mb-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand-red rounded-full inline-block" />
            Continue Watching
          </h2>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2">
            {history.slice(0, 10).map((item, idx) => {
              const watchUrl =
                item.mediaType === 'movie'
                  ? `/watch/movie/${item.tmdbId}`
                  : `/watch/tv/${item.tmdbId}?season=${item.season || 1}&episode=${item.episode || 1}`;
              const percent = Math.min(100, Math.round((item.progress / (item.duration || 1)) * 100));

              return (
                <div
                  key={`${item.tmdbId}-${item.mediaType}-${idx}`}
                  className="group relative flex-shrink-0 w-64 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-brand-red/50 transition duration-300"
                >
                  <Link href={watchUrl} className="block relative aspect-video w-full bg-zinc-800">
                    <Image
                      src={getTmdbImageUrl(item.posterPath, 'w500')}
                      alt={item.title}
                      fill
                      sizes="256px"
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </Link>

                  <div className="w-full bg-zinc-800 h-1">
                    <div className="bg-brand-red h-full" style={{ width: `${percent}%` }} />
                  </div>

                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {item.mediaType === 'tv' ? `S${item.season} E${item.episode} • ` : ''}
                      {percent}% watched
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Rows */}
      <div className="-mt-12 md:-mt-20 relative z-20 space-y-6 pb-8">
        {/* 1. Explore by Mood & Genre */}
        <section className="pt-4">
          <div className="px-4 md:px-12 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 mb-3">
              <Flame className="w-4 h-4 text-brand-red" />
              <span>EXPLORE BY MOOD &amp; GENRE</span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {MOOD_TABS.map((mood) => {
                const isActive = mood.id === selectedMood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMood(mood)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold flex-shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-red text-white shadow-lg shadow-red-900/40'
                        : 'bg-[#12141a] hover:bg-[#1a1d26] text-zinc-200 border border-white/10'
                    }`}
                  >
                    <span>{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <MovieRow
            title={selectedMood.genreId === 0 ? 'Trending Now' : `${selectedMood.emoji} ${selectedMood.label}`}
            items={moodItems}
            mediaType={selectedMood.genreId === 0 ? undefined : 'movie'}
            isLoading={isMoodLoading}
          />
        </section>

        {/* 2. Only on [Streaming Provider] */}
        <section className="relative group/row my-8 px-4 md:px-12">
          <div className="flex items-center gap-3 mb-4 relative z-30">
            <span className="w-1.5 h-6 bg-brand-red rounded-full inline-block" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Only on</h2>

            <div ref={providerDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsProviderOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-brand-red font-bold text-base md:text-lg transition cursor-pointer"
              >
                <span>{selectedProvider.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isProviderOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProviderOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-[#111318] border border-white/15 shadow-2xl overflow-hidden z-50 animate-scale-in">
                  <div className="px-4 py-2.5 border-b border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                      SELECT STREAMING PROVIDER
                    </span>
                  </div>
                  <div className="py-1.5">
                    {STREAMING_PROVIDERS.map((prov) => {
                      const isActive = prov.id === selectedProvider.id;
                      return (
                        <button
                          key={prov.id}
                          type="button"
                          onClick={() => {
                            setSelectedProvider(prov);
                            setIsProviderOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
                            isActive ? 'bg-white/10 text-white' : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${prov.badgeBg}`}
                            >
                              {prov.badge}
                            </span>
                            <span>{prov.name}</span>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-brand-red" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {isProviderLoading ? (
            <MovieRowSkeleton />
          ) : (
            <div className="relative">
              <button
                onClick={() => scrollRow(providerRowRef, 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-14 bg-black/60 hover:bg-black/90 text-white rounded-r-lg backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all flex items-center justify-center -ml-4 md:-ml-12 shadow-xl hover:scale-105"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div
                ref={providerRowRef}
                className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1"
              >
                {providerShows.map((item) => (
                  <MovieCard key={item.id} item={item} mediaType="tv" />
                ))}
              </div>
              <button
                onClick={() => scrollRow(providerRowRef, 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-14 bg-black/60 hover:bg-black/90 text-white rounded-l-lg backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all flex items-center justify-center -mr-4 md:-mr-12 shadow-xl hover:scale-105"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </section>

        {/* 3. In Theatres Spotlight */}
        <section className="relative group/row my-8 px-4 md:px-12">
          <div className="mb-4">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-red" />
              <span>🌟 In Theatres Spotlight</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Currently playing in theatres &amp; exclusive early streaming releases
            </p>
          </div>

          {isNowPlayingLoading ? (
            <MovieRowSkeleton />
          ) : (
            <div className="relative">
              <button
                onClick={() => scrollRow(theatreRowRef, 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-14 bg-black/60 hover:bg-black/90 text-white rounded-r-lg backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all flex items-center justify-center -ml-4 md:-ml-12 shadow-xl hover:scale-105"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div
                ref={theatreRowRef}
                className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1"
              >
                {nowPlaying.map((item) => (
                  <MovieCard key={item.id} item={item} mediaType="movie" />
                ))}
              </div>
              <button
                onClick={() => scrollRow(theatreRowRef, 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-14 bg-black/60 hover:bg-black/90 text-white rounded-l-lg backdrop-blur-md opacity-0 group-hover/row:opacity-100 transition-all flex items-center justify-center -mr-4 md:-mr-12 shadow-xl hover:scale-105"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </section>

        <MovieRow
          title="Popular Movies"
          items={popularMovies}
          mediaType="movie"
          isLoading={isPopMoviesLoading}
        />

        <MovieRow
          title="✨ Trending TV Shows"
          items={popularTV}
          mediaType="tv"
          isLoading={isPopTVLoading}
        />

        <MovieRow
          title="⭐ Top Rated Masterpieces"
          items={topRatedMovies}
          mediaType="movie"
          isLoading={isTopMoviesLoading}
        />

        <MovieRow
          title="Top Rated TV Shows"
          items={topRatedTV}
          mediaType="tv"
          isLoading={isTopTVLoading}
        />

        <MovieRow
          title="High-Octane Action & Adventure"
          items={actionMovies}
          mediaType="movie"
          isLoading={isActionLoading}
        />

        <MovieRow
          title="Sci-Fi & Cosmic Worlds"
          items={scifiMovies}
          mediaType="movie"
          isLoading={isScifiLoading}
        />

        <MovieRow
          title="Feel-Good Comedies"
          items={comedyMovies}
          mediaType="movie"
          isLoading={isComedyLoading}
        />
      </div>
    </div>
  );
}
