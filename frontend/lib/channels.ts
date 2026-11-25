export interface ChannelConfig {
  slug: string;
  name: string;
  watchProviderId: number;
  networkId: number;
  tileClass: string;
  accentColor: string;
}

export const CHANNELS_LIST: ChannelConfig[] = [
  {
    slug: 'netflix',
    name: 'Netflix',
    watchProviderId: 8,
    networkId: 213,
    tileClass: 'bg-black border border-white/10',
    accentColor: 'from-red-950/30',
  },
  {
    slug: 'prime-video',
    name: 'Amazon Prime Video',
    watchProviderId: 9,
    networkId: 1024,
    tileClass: 'bg-white text-[#00a8e1]',
    accentColor: 'from-sky-950/30',
  },
  {
    slug: 'disney-plus',
    name: 'Disney Plus',
    watchProviderId: 337,
    networkId: 2739,
    tileClass: 'bg-gradient-to-b from-[#061830] via-[#0a365c] to-[#0c6978] border border-cyan-400/20',
    accentColor: 'from-cyan-950/30',
  },
  {
    slug: 'apple-tv',
    name: 'Apple TV+',
    watchProviderId: 350,
    networkId: 2552,
    tileClass: 'bg-[#09090b] border border-white/15',
    accentColor: 'from-zinc-900/40',
  },
  {
    slug: 'hulu',
    name: 'Hulu',
    watchProviderId: 15,
    networkId: 453,
    tileClass: 'bg-[#1ce783] text-white',
    accentColor: 'from-emerald-950/30',
  },
  {
    slug: 'hbo-max',
    name: 'HBO Max',
    watchProviderId: 1899,
    networkId: 49,
    tileClass: 'bg-black border border-white/15',
    accentColor: 'from-indigo-950/30',
  },
  {
    slug: 'paramount-plus',
    name: 'Paramount Plus',
    watchProviderId: 531,
    networkId: 4330,
    tileClass: 'bg-[#0064ff] text-white',
    accentColor: 'from-blue-950/30',
  },
  {
    slug: 'peacock',
    name: 'Peacock Premium',
    watchProviderId: 386,
    networkId: 3353,
    tileClass: 'bg-[#1f2024] border border-white/10 text-white',
    accentColor: 'from-amber-950/20',
  },
  {
    slug: 'crunchyroll',
    name: 'Crunchyroll',
    watchProviderId: 283,
    networkId: 1112,
    tileClass: 'bg-[#f47521] text-white',
    accentColor: 'from-orange-950/30',
  },
  {
    slug: 'starz',
    name: 'STARZ',
    watchProviderId: 43,
    networkId: 318,
    tileClass: 'bg-gradient-to-br from-[#0f292e] to-[#090d10] border border-white/15',
    accentColor: 'from-teal-950/30',
  },
];

export function getChannelBySlug(slug: string): ChannelConfig {
  return CHANNELS_LIST.find((c) => c.slug === slug) || CHANNELS_LIST[0];
}
