'use client';

import React from 'react';
import {
  Server,
  Zap,
  Globe,
  Radio,
  Play,
  Layers,
  Sparkles,
  Check,
  Film,
  Monitor,
  Flame,
} from 'lucide-react';
import { StreamServer } from '../../types';

interface ServerSelectorProps {
  servers: StreamServer[];
  activeServerId: string;
  onSelectServer: (server: StreamServer) => void;
}

export function ServerSelector({
  servers,
  activeServerId,
  onSelectServer,
}: ServerSelectorProps) {
  if (!servers || servers.length === 0) return null;

  const renderIcon = (iconName?: string, isActive = false) => {
    const iconClass = `w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`;
    switch (iconName) {
      case 'zap':
        return <Zap className={iconClass} />;
      case 'globe':
        return <Globe className={iconClass} />;
      case 'radio':
        return <Radio className={iconClass} />;
      case 'play':
        return <Play className={iconClass} />;
      case 'layers':
        return <Layers className={iconClass} />;
      case 'sparkles':
        return <Sparkles className={iconClass} />;
      case 'monitor':
        return <Monitor className={iconClass} />;
      case 'flame':
        return <Flame className={iconClass} />;
      case 'server':
      default:
        return <Film className={iconClass} />;
    }
  };

  return (
    <div className="w-full flex items-center gap-3 overflow-x-auto no-scrollbar py-3 px-1 select-none">
      {/* Label with red icon */}
      <div className="flex items-center gap-2 flex-shrink-0 pr-1">
        <Server className="w-4 h-4 text-brand-red" />
        <span className="text-xs md:text-sm font-extrabold text-white tracking-wider uppercase">
          SERVERS:
        </span>
      </div>

      {/* Pill Server Buttons */}
      <div className="flex items-center gap-2">
        {servers.map((server) => {
          const isActive = server.id === activeServerId;

          return (
            <button
              key={server.id}
              onClick={() => onSelectServer(server)}
              title={server.features ? `${server.name} — ${server.features}` : server.name}
              className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-brand-red text-white shadow-lg shadow-red-900/40 scale-[1.02]'
                  : 'bg-[#121620] hover:bg-[#1a2030] text-zinc-300 hover:text-white border border-white/5 hover:border-white/15'
              }`}
            >
              {/* Server Icon */}
              {renderIcon(server.icon, isActive)}

              {/* Server Name */}
              <span className="tracking-tight">{server.name}</span>

              {/* Quality Badge or Checkmark */}
              {isActive ? (
                <Check className="w-3.5 h-3.5 ml-0.5 text-white" />
              ) : (
                server.quality && (
                  <span className="text-[10px] text-zinc-400 font-normal group-hover:text-zinc-300 transition-colors">
                    {server.quality}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
