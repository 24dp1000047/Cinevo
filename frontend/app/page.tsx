'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play } from 'lucide-react';
import {
  useTrendingMovies,
  usePopularMovies,
  useTopRatedMovies,
  usePopularTV,
  useTopRatedTV,
  useMoviesByGenre,
  useHistory,
} from '../hooks/useMedia';
import { HeroBanner } from '../components/hero/HeroBanner';
import { MovieRow } from '../components/movie-row/MovieRow';
import { HeroSkeleton } from '../components/ui/Skeleton';
import { getTmdbImageUrl } from '../lib/utils';

export default function HomePage() {
  const { data: trending = [], isLoading: isTrendingLoading } = useTrendingMovies();
  const { data: popularMovies = [], isLoading: isPopMoviesLoading } = usePopularMovies();
  const { data: topRatedMovies = [], isLoading: isTopMoviesLoading } = useTopRatedMovies();
  const { data: popularTV = [], isLoading: isPopTVLoading } = usePopularTV();
  const { data: topRatedTV = [], isLoading: isTopTVLoading } = useTopRatedTV();
  const { data: actionMovies = [], isLoading: isActionLoading } = useMoviesByGenre(28);
  const { data: scifiMovies = [], isLoading: isScifiLoading } = useMoviesByGenre(878);
  const { data: comedyMovies = [], isLoading: isComedyLoading } = useMoviesByGenre(35);
  const { data: history = [] } = useHistory();

  const heroItem = trending[0] || popularMovies[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {isTrendingLoading ? <HeroSkeleton /> : <HeroBanner item={heroItem} />}

      {/* Continue Watching Section (Active guest/user progress) */}
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

                  {/* Progress bar */}
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

      {/* Rows */}
      <div className="-mt-12 md:-mt-20 relative z-20 space-y-4 pb-4">
        <MovieRow
          title="Trending Now"
          items={trending}
          isLoading={isTrendingLoading}
        />

        <MovieRow
          title="Popular Movies"
          items={popularMovies}
          mediaType="movie"
          isLoading={isPopMoviesLoading}
        />

        <MovieRow
          title="Binge-Worthy TV Series"
          items={popularTV}
          mediaType="tv"
          isLoading={isPopTVLoading}
        />

        <MovieRow
          title="Critically Acclaimed Movies"
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
