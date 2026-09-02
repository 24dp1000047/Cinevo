import { WatchHistoryItem, WatchlistItem } from '../types';

const HISTORY_KEY = 'cinevo_guest_history';
const WATCHLIST_KEY = 'cinevo_guest_watchlist';

export const guestStorage = {
  getHistory: (): WatchHistoryItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveHistory: (item: {
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    posterPath: string | null;
    season?: number | null;
    episode?: number | null;
    progress: number;
    duration: number;
  }): void => {
    if (typeof window === 'undefined') return;
    try {
      const history = guestStorage.getHistory();
      const existingIndex = history.findIndex(
        (h) =>
          h.tmdbId === item.tmdbId &&
          h.mediaType === item.mediaType &&
          (item.mediaType === 'tv' ? h.season === item.season && h.episode === item.episode : true)
      );

      const updatedItem: WatchHistoryItem = {
        ...item,
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        history[existingIndex] = updatedItem;
      } else {
        history.unshift(updatedItem);
      }

      // Limit guest history to 50 items
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to save guest history to localStorage:', e);
    }
  },

  getWatchlist: (): WatchlistItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(WATCHLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isWatchlisted: (tmdbId: number, mediaType: 'movie' | 'tv'): boolean => {
    const list = guestStorage.getWatchlist();
    return list.some((item) => item.tmdbId === tmdbId && item.mediaType === mediaType);
  },

  toggleWatchlist: (item: {
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    posterPath: string | null;
    voteAverage?: number;
  }): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const list = guestStorage.getWatchlist();
      const existingIndex = list.findIndex(
        (i) => i.tmdbId === item.tmdbId && i.mediaType === item.mediaType
      );

      if (existingIndex >= 0) {
        list.splice(existingIndex, 1);
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
        return false; // Removed
      } else {
        const newItem: WatchlistItem = {
          id: `guest_${Date.now()}_${item.tmdbId}`,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
          title: item.title,
          posterPath: item.posterPath,
          voteAverage: item.voteAverage,
          createdAt: new Date().toISOString(),
        };
        list.unshift(newItem);
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
        return true; // Added
      }
    } catch (e) {
      console.warn('Failed to toggle guest watchlist:', e);
      return false;
    }
  },

  clearGuestData: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(WATCHLIST_KEY);
  },
};
