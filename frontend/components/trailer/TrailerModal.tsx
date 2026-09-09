'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, Play, Film, AlertCircle, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { useMediaVideos } from '../../hooks/useMedia';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: 'movie' | 'tv';
  tmdbId: number;
  title: string;
}

export function TrailerModal({
  isOpen,
  onClose,
  mediaType,
  tmdbId,
  title,
}: TrailerModalProps) {
  const { data: videos = [], isLoading } = useMediaVideos(mediaType, isOpen ? tmdbId : 0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter for best YouTube trailer
  const ytVideos = videos.filter((v) => v.site === 'YouTube');
  const bestTrailer =
    ytVideos.find((v) => v.type === 'Trailer' && v.official) ||
    ytVideos.find((v) => v.type === 'Trailer') ||
    ytVideos.find((v) => v.type === 'Teaser') ||
    ytVideos[0];

  const watchUrl = `/watch/${mediaType}/${tmdbId}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/90 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-zinc-950 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-brand-red">
              <Film className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-xs sm:max-w-md">
                  {title}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-600/20 text-brand-red border border-red-500/30">
                  Trailer
                </span>
              </div>
              {bestTrailer?.name && (
                <p className="text-xs text-zinc-400 truncate max-w-xs sm:max-w-md mt-0.5">
                  {bestTrailer.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={watchUrl}
              onClick={onClose}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-red hover:bg-red-700 text-white text-xs font-semibold transition shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch Full {mediaType === 'movie' ? 'Movie' : 'Series'}</span>
            </Link>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Close trailer"
              title="Close [Esc]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-zinc-400 gap-3">
              <Loader2 className="w-10 h-10 text-brand-red animate-spin" />
              <p className="text-sm font-medium">Fetching official cinema trailer...</p>
            </div>
          ) : bestTrailer?.key ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${bestTrailer.key}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`}
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-400 max-w-md">
              <AlertCircle className="w-12 h-12 text-zinc-600 mb-3" />
              <h4 className="text-lg font-bold text-white mb-1">No Official Trailer Found</h4>
              <p className="text-xs text-zinc-400 mb-6">
                An embedded trailer is not currently listed in the TMDB catalog for this title, but the full title is available to stream immediately.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href={watchUrl}
                  onClick={onClose}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red text-white text-xs font-bold hover:bg-red-700 transition"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Streaming Now</span>
                </Link>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' official trailer')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 text-xs font-semibold hover:text-white hover:bg-zinc-800 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Search YouTube</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-5 py-3 bg-zinc-900/40 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full HD 1080p Preview</span>
            </span>
            {bestTrailer?.official && (
              <span className="hidden sm:inline text-zinc-500">• Official Studio Release</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Press</span>
            <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-white/10 text-[11px] font-mono text-zinc-300">
              Esc
            </kbd>
            <span className="text-zinc-500">to exit preview</span>
          </div>
        </div>
      </div>
    </div>
  );
}
