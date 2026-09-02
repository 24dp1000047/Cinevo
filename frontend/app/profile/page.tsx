'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Bookmark, Clock, ShieldCheck, Tv } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { useWatchlist, useHistory } from '../../hooks/useMedia';

export default function ProfilePage() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { data: watchlist = [] } = useWatchlist();
  const { data: history = [] } = useHistory();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="pt-32 flex justify-center items-center text-zinc-400">
        <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="pt-32 text-center text-zinc-400 max-w-md mx-auto px-4">
        <ShieldCheck className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Guest Session</h2>
        <p className="text-sm mb-6 text-zinc-400">
          You are currently browsing as a guest. All streaming features are unlocked. Sign in to sync your bookmarks across other screens.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-xl bg-brand-red text-white font-semibold hover:bg-red-700 transition"
        >
          Sign In / Create Account
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="pt-24 px-4 md:px-12 max-w-4xl mx-auto min-h-screen">
      <div className="pb-6 border-b border-white/10 mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <User className="w-8 h-8 text-brand-red" />
          <span>Account & Preferences</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your profile and playback configuration.</p>
      </div>

      <div className="space-y-6">
        {/* User Card */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-red text-white flex items-center justify-center font-black text-2xl uppercase shadow-lg shadow-red-900/40">
              {user.name ? user.name.charAt(0) : user.email.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{user.name || 'Cinevo Member'}</h3>
              <p className="text-sm text-zinc-400">{user.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 text-[11px] rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Active Member
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition self-start sm:self-center"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/my-list"
            className="p-5 rounded-2xl bg-zinc-900/80 border border-white/5 hover:border-white/20 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-brand-red/10 text-brand-red">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{watchlist.length}</div>
                <div className="text-xs text-zinc-400">Bookmarked Titles</div>
              </div>
            </div>
            <span className="text-xs text-brand-red group-hover:underline">View My List →</span>
          </Link>

          <Link
            href="/history"
            className="p-5 rounded-2xl bg-zinc-900/80 border border-white/5 hover:border-white/20 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{history.length}</div>
                <div className="text-xs text-zinc-400">Streamed Titles</div>
              </div>
            </div>
            <span className="text-xs text-indigo-400 group-hover:underline">View History →</span>
          </Link>
        </div>

        {/* Playback Settings */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Tv className="w-5 h-5 text-zinc-400" />
            <span>Playback Preferences</span>
          </h3>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <div className="text-sm font-semibold text-white">Default Quality</div>
                <div className="text-xs text-zinc-400">Preferred video resolution for test streams</div>
              </div>
              <span className="text-xs px-3 py-1 rounded bg-zinc-800 text-zinc-300 font-mono">
                1080p (Auto)
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <div className="text-sm font-semibold text-white">Auto-Play Next Episode</div>
                <div className="text-xs text-zinc-400">Prompt and transition automatically when series episode finishes</div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                Enabled
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-semibold text-white">Audio & Subtitle Sync</div>
                <div className="text-xs text-zinc-400">Automatically sync preferred subtitle track</div>
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
