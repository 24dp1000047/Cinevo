'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Subtitles,
  SkipForward,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { PlaybackResponse } from '../../types';
import { useHistory } from '../../hooks/useMedia';

interface VideoPlayerProps {
  playback: PlaybackResponse;
  title: string;
  posterUrl?: string;
  backUrl?: string;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
}

export function VideoPlayer({
  playback,
  title,
  posterUrl,
  backUrl = '/',
  onNextEpisode,
  hasNextEpisode = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');
  const [showNextPrompt, setShowNextPrompt] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: history = [], saveProgress } = useHistory();

  // Find resume point from history
  useEffect(() => {
    if (!history || history.length === 0) return;
    const match = history.find(
      (h) =>
        h.tmdbId === playback.tmdbId &&
        h.mediaType === playback.mediaType &&
        (playback.mediaType === 'tv'
          ? h.season === playback.season && h.episode === playback.episode
          : true)
    );

    if (match && match.progress > 5 && match.progress < (match.duration - 15)) {
      if (videoRef.current && videoRef.current.currentTime === 0) {
        videoRef.current.currentTime = match.progress;
      }
    }
  }, [history, playback]);

  // Load Stream with HLS or Native
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playback.sources || playback.sources.length === 0) return;

    // Pick source (prefer HLS if available)
    const primarySource =
      playback.sources.find((s) => s.type === 'hls') || playback.sources[0];

    if (primarySource.type === 'hls' && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(primarySource.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = primarySource.url;
    } else {
      video.src = primarySource.url;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playback]);

  // Hide Controls on Inactivity
  const triggerControlsActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettings(false);
      }
    }, 2800);
  }, [isPlaying]);

  // Play / Pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    triggerControlsActivity();
  };

  // Skip 10 seconds
  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
    triggerControlsActivity();
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'KeyK'].includes(e.code)) {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skip(-10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skip(10);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, duration]);

  // Sync Video Time & Auto-Save Progress
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);

    // Show next episode prompt near end
    if (hasNextEpisode && video.duration > 0) {
      const remaining = video.duration - video.currentTime;
      if (remaining < 40 || video.currentTime / video.duration > 0.92) {
        setShowNextPrompt(true);
      } else {
        setShowNextPrompt(false);
      }
    }

    // Save progress periodically every 10 seconds
    if (Math.floor(video.currentTime) % 10 === 0 && video.duration > 0) {
      saveProgress({
        tmdbId: playback.tmdbId,
        mediaType: playback.mediaType,
        title,
        posterPath: posterUrl || null,
        season: playback.season || null,
        episode: playback.episode || null,
        progress: Math.floor(video.currentTime),
        duration: Math.floor(video.duration),
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const target = parseFloat(e.target.value);
    video.currentTime = target;
    setCurrentTime(target);
    triggerControlsActivity();
  };

  const formatPlayerTime = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerControlsActivity}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video max-h-[88vh] bg-black overflow-hidden select-none group font-sans"
    >
      {/* Native Video Element */}
      <video
        ref={videoRef}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onLoadedMetadata={(e) => {
          setDuration((e.target as HTMLVideoElement).duration);
          setIsBuffering(false);
        }}
        onTimeUpdate={handleTimeUpdate}
        muted={isMuted}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <Loader2 className="w-14 h-14 text-brand-red animate-spin" />
        </div>
      )}

      {/* Top Header Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 flex items-center justify-between z-30 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <Link
            href={backUrl}
            className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white backdrop-blur-md transition"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-sm md:text-base font-bold text-white tracking-wide">{title}</h2>
            {playback.mediaType === 'tv' && (
              <p className="text-xs text-zinc-400">
                Season {playback.season} • Episode {playback.episode}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-zinc-800/80 text-xs font-semibold text-zinc-300 border border-white/10">
            Authorized Test Stream
          </span>
        </div>
      </div>

      {/* Next Episode Prompt Overlay */}
      {showNextPrompt && hasNextEpisode && (
        <div className="absolute bottom-24 right-6 z-40 bg-zinc-900/90 border border-brand-red/40 p-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-scale-in flex items-center gap-4">
          <div>
            <div className="text-xs text-zinc-400 font-semibold uppercase">Up Next</div>
            <div className="text-sm font-bold text-white">Next Episode</div>
          </div>
          <button
            onClick={onNextEpisode}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-red hover:bg-red-700 text-white font-semibold text-sm transition shadow-lg shadow-red-900/40"
          >
            <SkipForward className="w-4 h-4 fill-current" />
            <span>Play Now</span>
          </button>
        </div>
      )}

      {/* Bottom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 flex flex-col gap-2 z-30 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Scrub Bar */}
        <div className="relative w-full flex items-center group/scrubber cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 hover:h-2.5 rounded-lg appearance-none bg-zinc-700 accent-brand-red cursor-pointer transition-all"
          />
        </div>

        {/* Buttons & Time Row */}
        <div className="flex items-center justify-between mt-1">
          {/* Left Buttons: Play, Skip, Volume, Time */}
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={togglePlay}
              className="text-white hover:text-brand-red transition p-1 hover:scale-110"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>

            <button
              onClick={() => skip(-10)}
              className="text-zinc-300 hover:text-white transition p-1"
              title="Rewind 10s (Left Arrow)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => skip(10)}
              className="text-zinc-300 hover:text-white transition p-1"
              title="Forward 10s (Right Arrow)"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-zinc-300 hover:text-white transition"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  setIsMuted(val === 0);
                  if (videoRef.current) videoRef.current.volume = val;
                }}
                className="w-16 h-1 bg-zinc-700 accent-white rounded appearance-none cursor-pointer"
              />
            </div>

            {/* Timestamp */}
            <div className="text-xs md:text-sm font-medium text-zinc-300">
              <span>{formatPlayerTime(currentTime)}</span>
              <span className="text-zinc-500 mx-1">/</span>
              <span className="text-zinc-400">{formatPlayerTime(duration)}</span>
            </div>
          </div>

          {/* Right Buttons: Next Ep, Settings, Subtitles, Fullscreen */}
          <div className="flex items-center gap-3 md:gap-4 relative">
            {hasNextEpisode && (
              <button
                onClick={onNextEpisode}
                className="text-zinc-300 hover:text-white transition flex items-center gap-1 text-sm font-semibold"
                title="Next Episode"
              >
                <SkipForward className="w-5 h-5" />
                <span className="hidden sm:inline">Next</span>
              </button>
            )}

            {/* Settings Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1 text-zinc-300 hover:text-white transition ${showSettings ? 'text-brand-red' : ''}`}
                title="Quality Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Settings Dropdown */}
              {showSettings && (
                <div className="absolute right-0 bottom-10 w-44 p-2 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl backdrop-blur-xl text-xs z-50">
                  <div className="font-semibold text-zinc-400 px-2 py-1 mb-1 border-b border-white/5">
                    Resolution
                  </div>
                  {['auto', '1080p', '720p', '480p'].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setCurrentQuality(q);
                        setShowSettings(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-md uppercase font-medium flex items-center justify-between ${
                        currentQuality === q
                          ? 'bg-brand-red text-white'
                          : 'text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{q}</span>
                      {currentQuality === q && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subtitles Toggle */}
            {playback.subtitles && playback.subtitles.length > 0 && (
              <button
                onClick={() => setSelectedSubtitle(selectedSubtitle === 'off' ? 'en' : 'off')}
                className={`p-1 transition ${selectedSubtitle !== 'off' ? 'text-brand-red' : 'text-zinc-300 hover:text-white'}`}
                title="Subtitles"
              >
                <Subtitles className="w-5 h-5" />
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="text-zinc-300 hover:text-white transition p-1"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
