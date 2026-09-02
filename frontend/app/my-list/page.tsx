'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Play, Trash2, Film, Tv } from 'lucide-react';
import { useWatchlist } from '../../hooks/useMedia';
import { getTmdbImageUrl } from '../../lib/utils';

export default function MyListPage() {
  const { data: watchlist = [], isLoading, toggleWatchlist } = useWatchlist();

  return (
    <div className="pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-brand-red" />
            <span>My List</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Your saved movies and series ready for streaming.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400">
          <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mr-3" />
          <span>Loading your collection...</span>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="text-center py-24 text-zinc-500">
          <Bookmark className="w-16 h-16 mx-auto mb-4 text-zinc-700 stroke-1" />
          <h3 className="text-xl font-bold text-zinc-300 mb-2">Your List is Empty</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
            Explore movies and series, then click the &quot;+ My List&quot; button to bookmark them here.
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-brand-red hover:bg-red-700 text-white font-semibold transition"
          >
            Explore Library
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {watchlist.map((item) => {
            const watchUrl = `/watch/${item.mediaType}/${item.tmdbId}`;
            const detailsUrl = `/${item.mediaType}/${item.tmdbId}`;

            return (
              <div
                key={`${item.mediaType}-${item.tmdbId}`}
                className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-brand-red/50 transition-all hover:scale-[1.03]"
              >
                <div className="relative aspect-[2/3] w-full">
                  <Link href={detailsUrl} className="absolute inset-0 z-0" aria-label={item.title}>
                    <Image
                      src={getTmdbImageUrl(item.posterPath, 'w500')}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 150px, 200px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 pointer-events-none z-10">
                    <Link
                      href={watchUrl}
                      className="pointer-events-auto w-10 h-10 rounded-full bg-brand-red flex items-center justify-center text-white shadow-lg mb-2 hover:scale-110 transition"
                      title="Watch Now"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </Link>
                    <Link href={detailsUrl} className="pointer-events-auto text-xs text-white font-semibold line-clamp-1 hover:underline">
                      {item.title}
                    </Link>
                  </div>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1 mr-2">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 mb-0.5">
                      {item.mediaType === 'movie' ? (
                        <Film className="w-3 h-3 text-red-400" />
                      ) : (
                        <Tv className="w-3 h-3 text-indigo-400" />
                      )}
                      <span className="capitalize">{item.mediaType}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                  </div>

                  <button
                    onClick={() =>
                      toggleWatchlist({
                        tmdbId: item.tmdbId,
                        mediaType: item.mediaType,
                        title: item.title,
                        posterPath: item.posterPath,
                      })
                    }
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Remove from List"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
