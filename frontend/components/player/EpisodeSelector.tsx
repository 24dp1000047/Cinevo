'use client';

import React from 'react';
import Image from 'next/image';
import { Play, CheckCircle2 } from 'lucide-react';
import { SeasonDetails, Episode } from '../../types';
import { getTmdbImageUrl } from '../../lib/utils';

interface EpisodeSelectorProps {
  seasonDetails?: SeasonDetails | null;
  currentEpisode: number;
  onSelectEpisode: (ep: Episode) => void;
  totalSeasons?: number;
  currentSeason: number;
  onSelectSeason: (seasonNumber: number) => void;
}

export function EpisodeSelector({
  seasonDetails,
  currentEpisode,
  onSelectEpisode,
  totalSeasons = 1,
  currentSeason,
  onSelectSeason,
}: EpisodeSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Season Picker Tabs / Dropdown */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-lg font-bold text-white">Episodes</h3>
        <select
          value={currentSeason}
          onChange={(e) => onSelectSeason(Number(e.target.value))}
          className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-1.5 border border-white/10 focus:outline-none focus:border-brand-red cursor-pointer"
        >
          {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
            <option key={s} value={s}>
              Season {s}
            </option>
          ))}
        </select>
      </div>

      {/* Episode Cards Grid / List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {seasonDetails?.episodes.map((ep) => {
          const isSelected = ep.episode_number === currentEpisode;
          const thumbnail = getTmdbImageUrl(ep.still_path, 'w500');

          return (
            <div
              key={ep.id}
              onClick={() => onSelectEpisode(ep)}
              className={`group flex items-start gap-4 p-3 rounded-xl cursor-pointer transition border ${
                isSelected
                  ? 'bg-brand-red/15 border-brand-red text-white'
                  : 'bg-zinc-900/60 border-white/5 hover:bg-zinc-800/80 hover:border-white/20 text-zinc-300'
              }`}
            >
              <div className="relative flex-shrink-0 w-28 aspect-video rounded-lg overflow-hidden bg-zinc-800">
                <Image
                  src={thumbnail}
                  alt={ep.name}
                  fill
                  sizes="112px"
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Play className="w-6 h-6 text-white fill-current" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold truncate group-hover:text-white transition">
                    {ep.episode_number}. {ep.name}
                  </h4>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-red flex-shrink-0" />}
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2">{ep.overview}</p>
                <div className="text-[11px] text-zinc-500 mt-1 font-medium">
                  {ep.runtime ? `${ep.runtime} min` : '45 min'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
