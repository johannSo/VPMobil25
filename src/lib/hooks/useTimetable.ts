'use client';

import { useQuery } from '@tanstack/react-query';
import { Credentials, TimetableData, FilterMode, TimetableEntry } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { useBlacklist } from './useBlacklist';

const FETCH_KEY = 'timetable';

export function useTimetable(creds: Credentials | null, date?: string) {
  const [filterMode, setFilterMode] = useState<FilterMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('filterMode') as FilterMode) || 'class';
    }
    return 'class';
  });
  
  const [selectedValue, setSelectedValue] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('filterValue') || '';
    }
    return '';
  });

  const { currentBlacklist, addToBlacklist, removeFromBlacklist } = useBlacklist(selectedValue);

  const { data, error, isLoading, isFetching, refetch } = useQuery<TimetableData, Error>({
    queryKey: [FETCH_KEY, creds?.school, creds?.user, date],
    queryFn: async () => {
      if (!creds) throw new Error('No credentials');
      const res = await fetch('/api/stundenplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...creds, date }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fehler beim Laden der Daten.');
      return json;
    },
    enabled: !!creds,
  });

  // Automatically select first available value if none selected or current not available
  useEffect(() => {
    if (data) {
      const options = filterMode === 'class' ? data.availableClasses : 
                      filterMode === 'room' ? data.availableRooms : 
                      data.availableTeachers;
      
      if (!selectedValue && options.length > 0) {
        setSelectedValue(options[0]);
      }
    }
  }, [data, filterMode, selectedValue]);

  // Persist filter settings
  useEffect(() => {
    if (filterMode) localStorage.setItem('filterMode', filterMode);
    if (selectedValue) localStorage.setItem('filterValue', selectedValue);
  }, [filterMode, selectedValue]);

  const filteredEntries = useMemo(() => {
    if (!data || !selectedValue) return [];
    
    const filtered = data.entries.filter(e => {
      let isMatch = false;
      if (filterMode === 'class') isMatch = e.class === selectedValue;
      else if (filterMode === 'room') isMatch = e.room === selectedValue;
      else if (filterMode === 'teacher') isMatch = e.teacher === selectedValue;
      
      if (!isMatch) return false;
      if (currentBlacklist.includes(e.subject)) return false;
      return true;
    });

    return [...filtered].sort((a, b) => (parseInt(a.hour) || 0) - (parseInt(b.hour) || 0));
  }, [data, filterMode, selectedValue, currentBlacklist]);

  return {
    data,
    error,
    isLoading: isLoading || isFetching,
    filteredEntries,
    filterMode,
    setFilterMode,
    selectedValue,
    setSelectedValue,
    refetch,
    currentBlacklist,
    addToBlacklist,
    removeFromBlacklist
  };
}
