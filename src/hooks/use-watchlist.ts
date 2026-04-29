'use client';

import { useState, useEffect } from 'react';

const WATCHLIST_KEY = 'stock-screener-watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch {
        setWatchlist([]);
      }
    }
  }, []);

  const saveWatchlist = (newList: string[]) => {
    setWatchlist(newList);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newList));
  };

  const addToWatchlist = (ticker: string) => {
    if (!watchlist.includes(ticker)) {
      saveWatchlist([...watchlist, ticker]);
    }
  };

  const removeFromWatchlist = (ticker: string) => {
    saveWatchlist(watchlist.filter(t => t !== ticker));
  };

  const isInWatchlist = (ticker: string) => watchlist.includes(ticker);

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist };
}
