'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Play, Trash2, Film, Tv } from 'lucide-react';
import { useHistory } from '../../hooks/useMedia';
import { getTmdbImageUrl } from '../../lib/utils';
import { guestStorage } from '../../lib/guestStorage';
import { useQueryClient } from '@tanstack/react-query';

export default function HistoryPage() {
  const { data: history = [], isLoading } = useHistory();
  const queryClient = useQueryClient();

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your watch history?')) {
      guestStorage.clearGuestData();
      queryClient.invalidateQueries({ queryKey: ['history'] });
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Clock className="w-8 h-8 text-brand-red" />
            <span>Watch History</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Pick up right where you left off.
          </p>
        </div>

        <div className="flex items-center gap-3">

          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-white/10 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400">
          <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mr-3" />
          <span>Loading watch history...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-24 text-zinc-500">
          <Clock className="w-16 h-16 mx-auto mb-4 text-zinc-700 stroke-1" />
          <h3 className="text-xl font-bold text-zinc-300 mb-2">No Playback History</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
            Whenever you stream a movie or television episode, your progress will automatically save here.
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-brand-red hover:bg-red-700 text-white font-semibold transition"
          >
            Start Watching
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {history.map((item, idx) => {
            const watchUrl =
              item.mediaType === 'movie'
                ? `/watch/movie/${item.tmdbId}`
                : `/watch/tv/${item.tmdbId}?season=${item.season || 1}&episode=${item.episode || 1}`;

            const percent = Math.min(
              100,
              Math.max(1, Math.round((item.progress / (item.duration || 1)) * 100))
            );

            return (
              <div
                key={`${item.tmdbId}-${item.mediaType}-${idx}`}
                className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-brand-red/50 transition-all shadow-xl"
              >
                <div className="relative aspect-video w-full bg-zinc-800">
                  <Image
                    src={getTmdbImageUrl(item.posterPath, 'w500')}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 300px, 350px"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Link
                      href={watchUrl}
                      className="w-12 h-12 rounded-full bg-brand-red text-white flex items-center justify-center shadow-xl hover:scale-110 transition"
                      title="Resume Playback"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </Link>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-800 h-1.5">
                  <div className="bg-brand-red h-full transition-all" style={{ width: `${percent}%` }} />
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span className="flex items-center gap-1">
                      {item.mediaType === 'movie' ? (
                        <Film className="w-3 h-3 text-red-400" />
                      ) : (
                        <Tv className="w-3 h-3 text-indigo-400" />
                      )}
                      <span className="capitalize">{item.mediaType}</span>
                    </span>
                    <span className="text-zinc-500 font-medium">
                      {Math.floor(item.progress / 60)}m left
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white truncate mb-1">
                    {item.title}
                  </h3>

                  {item.mediaType === 'tv' && (
                    <p className="text-xs text-zinc-400 mb-3">
                      Season {item.season} • Episode {item.episode}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs">
                    <span className="text-zinc-500">{percent}% completed</span>
                    <Link
                      href={watchUrl}
                      className="text-brand-red hover:underline font-semibold flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" /> Resume
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
