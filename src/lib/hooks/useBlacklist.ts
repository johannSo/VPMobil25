'use client';

import { useState, useEffect } from 'react';

// Maps an entity (e.g., class name, room name) to a list of blacklisted subjects
type BlacklistMap = Record<string, string[]>;

export function useBlacklist(currentEntity: string) {
  const [blacklistMap, setBlacklistMap] = useState<BlacklistMap>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('timetable_blacklist');
        if (stored) {
          setBlacklistMap(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load blacklist from local storage', e);
      }
      setIsInitialized(true);
    }
  }, []);

  const saveBlacklist = (newMap: BlacklistMap) => {
    setBlacklistMap(newMap);
    if (typeof window !== 'undefined') {
      localStorage.setItem('timetable_blacklist', JSON.stringify(newMap));
    }
  };

  const currentBlacklist = blacklistMap[currentEntity] || [];

  const addToBlacklist = (subject: string) => {
    if (!currentEntity || currentBlacklist.includes(subject)) return;
    saveBlacklist({
      ...blacklistMap,
      [currentEntity]: [...currentBlacklist, subject],
    });
  };

  const removeFromBlacklist = (subject: string) => {
    if (!currentEntity) return;
    saveBlacklist({
      ...blacklistMap,
      [currentEntity]: currentBlacklist.filter((s) => s !== subject),
    });
  };

  const isBlacklisted = (subject: string) => {
    return currentBlacklist.includes(subject);
  };

  return {
    currentBlacklist,
    addToBlacklist,
    removeFromBlacklist,
    isBlacklisted,
    isInitialized,
  };
}
