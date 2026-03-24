'use client';

import { useState, useEffect, useCallback } from 'react';
import { Favorite, FilterMode } from '@/lib/types';

const STORAGE_KEY = 'favorites';
const MAX_FAVORITES = 4;

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    const savedFavs = localStorage.getItem(STORAGE_KEY);
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error('Failed to parse favorites', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const toggleFavorite = useCallback((mode: FilterMode, value: string) => {
    setFavorites(prev => {
      const isFav = prev.some(f => f.mode === mode && f.value === value);
      let nextFavs: Favorite[];
      
      if (isFav) {
        nextFavs = prev.filter(f => !(f.mode === mode && f.value === value));
      } else {
        if (prev.length >= MAX_FAVORITES) {
          alert(`Maximal ${MAX_FAVORITES} Favoriten möglich.`);
          return prev;
        }
        nextFavs = [...prev, { mode, value }];
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextFavs));
      return nextFavs;
    });
  }, []);

  const isFavorite = useCallback((mode: FilterMode, value: string) => {
    return favorites.some(f => f.mode === mode && f.value === value);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
