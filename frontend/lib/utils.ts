import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutes(minutes?: number): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function formatReleaseYear(dateStr?: string): string {
  if (!dateStr) return '';
  return dateStr.split('-')[0];
}

export function formatScore(score?: number): string {
  if (!score) return '0.0';
  return score.toFixed(1);
}

export function getTmdbImageUrl(path: string | null | undefined, size: 'w500' | 'original' = 'w500'): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop';
  }
  if (path.startsWith('http')) {
    return path;
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
