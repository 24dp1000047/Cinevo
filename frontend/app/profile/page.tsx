'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Clock, Tv, Settings, Trash2, CheckCircle2 } from 'lucide-react';
import { useWatchlist, useHistory } from '../../hooks/useMedia';
import { guestStorage } from '../../lib/guestStorage';
import { useQueryClient } from '@tanstack/react-query';

export default function ProfilePage() {
  const { data: watchlist = [] } = useWatchlist();
  const { data: history = [] } = useHistory();
  const queryClient = useQueryClient();
  const [clearedMessage, setClearedMessage] = useState<string | null>(null);

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your entire watch history?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cinevo_guest_history');
        queryClient.invalidateQueries({ queryKey: ['history'] });
        setClearedMessage('Watch history cleared.');
        setTimeout(() => setClearedMessage(null), 3000);
      }
    }
  };

  const handleClearWatchlist = () => {
    if (confirm('Are you sure you want to clear all bookmarked titles in My List?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cinevo_guest_watchlist');
        queryClient.invalidateQueries({ queryKey: ['watchlist'] });
        setClearedMessage('My List cleared.');
        setTimeout(() => setClearedMessage(null), 3000);
      }
    }
  };

  return (
    <div className="pt-24 px-4 md:px-12 max-w-4xl mx-auto min-h-screen pb-20">
      <div className="pb-6 border-b border-white/10 mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-brand-red" />
          <span>Library & Preferences</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your local library, saved bookmarks, and streaming playback settings.
        </p>
      </div>

      {clearedMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>{clearedMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-brand-red/10 text-brand-red">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{watchlist.length}</div>
                <div className="text-xs text-zinc-400">Bookmarked Titles in My List</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <Link href="/my-list" className="text-xs text-brand-red font-semibold hover:underline">
                Open My List →
              </Link>
              {watchlist.length > 0 && (
                <button
                  onClick={handleClearWatchlist}
                  className="text-xs text-zinc-500 hover:text-red-400 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{history.length}</div>
                <div className="text-xs text-zinc-400">Streamed Titles in History</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <Link href="/history" className="text-xs text-indigo-400 font-semibold hover:underline">
                Open History →
              </Link>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-zinc-500 hover:text-red-400 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Playback Settings */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Tv className="w-5 h-5 text-zinc-400" />
            <span>Playback Preferences</span>
          </h3>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <div className="text-sm font-semibold text-white">Default Resolution</div>
                <div className="text-xs text-zinc-400">Preferred video quality for verified stream providers</div>
              </div>
              <span className="text-xs px-3 py-1 rounded bg-zinc-800 text-zinc-300 font-mono font-semibold">
                1080p HD (Auto)
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <div className="text-sm font-semibold text-white">Auto-Play Next Episode</div>
                <div className="text-xs text-zinc-400">Transition automatically when series episode finishes</div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                Enabled
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-semibold text-white">Audio & Subtitle Sync</div>
                <div className="text-xs text-zinc-400">Auto-load primary English subtitles track</div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 font-semibold">
                English (CC)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
