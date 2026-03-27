'use client';

import { useQuery } from '@tanstack/react-query';
import { Credentials, FilterMode } from '@/lib/types';

export function useAvailableSubjects(
  creds: Credentials | null,
  filterMode: FilterMode,
  selectedValue: string
) {
  const { data, isLoading, isFetching } = useQuery<{ subjects: string[] }, Error>({
    queryKey: ['availableSubjects', creds?.school, creds?.user, filterMode, selectedValue],
    queryFn: async () => {
      if (!creds || !selectedValue) throw new Error('No credentials or selection');
      
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...creds, filterMode, selectedValue }),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fehler beim Laden der Fächer.');
      return json;
    },
    enabled: !!creds && !!selectedValue,
    // Keep it fresh for a while so opening/closing the modal is quick
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    availableSubjects: data?.subjects || [],
    isLoadingSubjects: isLoading || isFetching,
  };
}
