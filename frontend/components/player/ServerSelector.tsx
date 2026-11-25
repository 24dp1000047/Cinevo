'use client';

import React from 'react';
import { Server, Check } from 'lucide-react';
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

  return (
    <div className="w-full rounded-2xl bg-[#0e1015] border border-white/10 p-4 select-none">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-bold text-zinc-400 tracking-[0.14em] uppercase">
            SELECT SOURCE SERVER
          </span>
        </div>
        <span className="text-[11px] font-medium text-zinc-500">
          {servers.length} servers
        </span>
      </div>

      {/* Wrapped Pill Server Grid */}
      <div className="flex flex-wrap items-center gap-2">
        {servers.map((server) => {
          const isActive = server.id === activeServerId;

          return (
            <button
              key={server.id}
              onClick={() => onSelectServer(server)}
              title={server.features ? `${server.name} — ${server.features}` : server.name}
              className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/25 font-bold'
                  : 'bg-[#1a1d24] hover:bg-[#242833] text-zinc-200 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              <span>{server.name}</span>
              {isActive && <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[2.5]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
