'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  AlertCircle, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

import CommandPalette from './CommandPalette';
import LoginForm from './LoginForm';
import TimetableHeader from './TimetableHeader';
import TimetableTable from './TimetableTable';

import { useAuth } from '@/lib/hooks/useAuth';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { useTimetable } from '@/lib/hooks/useTimetable';
import { SearchItem, FilterMode } from '@/lib/types';

interface ClientViewerProps {
  currentDateStr?: string;
}

export default function ClientViewer({ currentDateStr }: ClientViewerProps) {
  const router = useRouter();
  const { creds, isLogged, login, logout, isInitialized } = useAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { 
    data, 
    error, 
    isLoading, 
    filteredEntries, 
    filterMode, 
    setFilterMode, 
    selectedValue, 
    setSelectedValue 
  } = useTimetable(creds, currentDateStr);

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (item: SearchItem) => {
    setFilterMode(item.type);
    setSelectedValue(item.name);
  };

  const searchItems = useMemo(() => {
    if (!data) return [];
    const items: SearchItem[] = [];
    data.availableClasses.forEach(c => items.push({ id: c, name: c, type: 'class' }));
    data.availableRooms.forEach(r => items.push({ id: r, name: r, type: 'room' }));
    data.availableTeachers.forEach(t => items.push({ id: t, name: t, type: 'teacher' }));
    return items;
  }, [data]);

  const navigateDay = (offset: number) => {
    const dateToParse = currentDateStr || (new Date().toISOString().slice(0, 10).replace(/-/g, ''));
    const date = new Date(
      parseInt(dateToParse.slice(0, 4)), 
      parseInt(dateToParse.slice(4, 6)) - 1, 
      parseInt(dateToParse.slice(6, 8))
    );
    date.setDate(date.getDate() + offset);
    const nextDateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    router.push(`/?date=${nextDateStr}`);
  };

  if (!isInitialized) return null;

  if (!isLogged) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-700 pb-12">
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
        onSelect={handleSelect} 
        items={searchItems}
      />
      
      <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-900 shadow-2xl shadow-black/[0.05] overflow-hidden">
        <TimetableHeader 
          isLoading={isLoading}
          dateText={data?.date}
          onNavigate={navigateDay}
          onLogout={logout}
          filterMode={filterMode}
          selectedValue={selectedValue}
          onOpenPalette={() => setIsPaletteOpen(true)}
          isFavorite={isFavorite(filterMode, selectedValue)}
          onToggleFavorite={() => toggleFavorite(filterMode, selectedValue)}
          favorites={favorites}
          onSelectFavorite={(mode, value) => {
            setFilterMode(mode);
            setSelectedValue(value);
          }}
        />

        <div className="relative">
          {isLoading && !data ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <Loader2 className="w-12 h-12 text-zinc-200 dark:text-zinc-800 animate-spin" strokeWidth={1.5} />
              <p className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.5em] animate-pulse">Synchronisierung läuft</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
              <p className="text-black dark:text-white font-black mb-2 uppercase tracking-tight">{error.message}</p>
              <p className="text-xs text-zinc-400 font-medium">Plan existiert evtl. noch nicht oder Login-Daten sind abgelaufen.</p>
              <button 
                onClick={() => router.push('/')}
                className="mt-8 px-8 py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-black rounded-xl uppercase tracking-widest active:scale-95 transition-all shadow-lg"
              >
                Aktualisieren
              </button>
            </div>
          ) : data?.isWeekend || (data && data.entries.length === 0 && !data.dayNotes) ? (
            <div className="p-12 text-center animate-in fade-in duration-500">
              <div className="space-y-4">
                <div className="bg-zinc-100 dark:bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  {data.isWeekend ? <Calendar className="w-8 h-8 text-zinc-400" /> : <CheckCircle2 className="w-8 h-8 text-zinc-400" />}
                </div>
                <p className="text-xl font-black text-black dark:text-white uppercase tracking-tight">
                  {data.isWeekend ? 'Wochenende' : 'Keine Vertretungen'}
                </p>
                <p className="text-sm text-zinc-500 font-medium">
                  {data.isWeekend ? 'Genieß die freie Zeit! Es ist kein Plan verfügbar.' : 'Für heute liegen keine besonderen Änderungen vor.'}
                </p>
                <button 
                  onClick={() => router.push('/')}
                  className="mt-8 px-8 py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-black rounded-xl uppercase tracking-widest active:scale-95 transition-all shadow-lg mx-auto"
                >
                  Aktualisieren
                </button>
              </div>
            </div>
          ) : data ? (
            <TimetableTable 
              entries={filteredEntries} 
              showClassColumn={filterMode !== 'class'} 
            />
          ) : null}
        </div>

        {data?.dayNotes && data.dayNotes.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border-t-2 border-amber-100 dark:border-amber-900/50 p-6 sm:p-10 space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Besondere Hinweise</span>
            </div>
            <div className="space-y-2">
              {data.dayNotes.map((note, i) => (
                <p key={i} className="text-sm font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
                  {note}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
