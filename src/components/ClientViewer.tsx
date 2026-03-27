'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';

import CommandPalette from './CommandPalette';
import LoginForm from './LoginForm';
import TimetableHeader from './TimetableHeader';
import TimetableTable from './TimetableTable';
import BlacklistModal from './BlacklistModal';

import { useAuth } from '@/lib/hooks/useAuth';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { useTimetable } from '@/lib/hooks/useTimetable';
import { useAvailableSubjects } from '@/lib/hooks/useAvailableSubjects';
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
    setSelectedValue,
    currentBlacklist,
    addToBlacklist,
    removeFromBlacklist
  } = useTimetable(creds, currentDateStr);

  const { availableSubjects, isLoadingSubjects } = useAvailableSubjects(
    creds,
    filterMode,
    selectedValue
  );

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isBlacklistOpen, setIsBlacklistOpen] = useState(false);

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
    setFilterMode(item.type as FilterMode);
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
    const base = currentDateStr || new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const d = new Date(
      parseInt(base.slice(0, 4)),
      parseInt(base.slice(4, 6)) - 1,
      parseInt(base.slice(6, 8))
    );
    d.setDate(d.getDate() + offset);

    // Wochenende überspringen
    if (offset > 0) {
      if (d.getDay() === 6) d.setDate(d.getDate() + 2); // Samstag zu Montag
      else if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Sonntag zu Montag
    } else if (offset < 0) {
      if (d.getDay() === 0) d.setDate(d.getDate() - 2); // Sonntag zu Freitag
      else if (d.getDay() === 6) d.setDate(d.getDate() - 1); // Samstag zu Freitag
    }

    const next = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    router.push(`/?date=${next}`);
  };

  if (!isInitialized) return null;
  if (!isLogged) return <LoginForm onLogin={login} />;

  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const isToday = !currentDateStr || currentDateStr === todayStr;

  const isEmptyDay =
    data?.isWeekend || (data && data.entries.length === 0 && !data.dayNotes?.length);

  return (
    <div className="w-full">
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSelect={handleSelect}
        items={searchItems}
      />
      <BlacklistModal
        isOpen={isBlacklistOpen}
        onClose={() => setIsBlacklistOpen(false)}
        currentEntity={selectedValue}
        availableSubjects={availableSubjects}
        isLoadingSubjects={isLoadingSubjects}
        currentBlacklist={currentBlacklist}
        addToBlacklist={addToBlacklist}
        removeFromBlacklist={removeFromBlacklist}
      />

      {/* Main card */}
      <div className="panel panel-flat">
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
          isToday={isToday}
          onSelectFavorite={(mode, value) => {
            setFilterMode(mode);
            setSelectedValue(value);
          }}
          onOpenBlacklist={() => setIsBlacklistOpen(true)}
        />

        {/* Content area */}
        <div>
          {isLoading && !data ? (
            /* Loading skeleton */
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <Loader2
                className="w-10 h-10 animate-spin"
                style={{ color: 'var(--color-primary)' }}
                strokeWidth={1.75}
              />
              <p
                className="text-base font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Daten werden geladen…
              </p>
            </div>
          ) : error ? (
            /* Error state */
            <div className="flex flex-col items-center justify-center py-20 px-6 gap-5 text-center">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                }}
              >
                <AlertCircle className="w-7 h-7" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-base font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                  {error.message}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Der Plan existiert möglicherweise noch nicht oder die Anmeldedaten sind abgelaufen.
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="btn btn-primary text-sm"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                <RefreshCw className="w-4 h-4" strokeWidth={2} />
                Erneut versuchen
              </button>
            </div>
          ) : isEmptyDay ? (
            /* Empty / weekend state */
            <div className="flex flex-col items-center justify-center py-20 px-6 gap-5 text-center">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                }}
              >
                {data?.isWeekend
                  ? <Calendar className="w-7 h-7" strokeWidth={1.75} />
                  : <CheckCircle2 className="w-7 h-7" strokeWidth={1.75} />
                }
              </div>
              <div>
                <p className="text-base font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                  {data?.isWeekend ? 'Wochenende' : 'Kein Unterricht'}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {data?.isWeekend
                    ? 'Genieß die freie Zeit! Es ist kein Plan verfügbar.'
                    : 'An diesem Tag findet kein Unterricht statt oder der Plan ist noch nicht verfügbar.'}
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="btn btn-outline text-sm"
                style={{ padding: '0.625rem 1.25rem' }}
              >
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                Aktualisieren
              </button>
            </div>
          ) : data ? (
            <TimetableTable
              entries={filteredEntries}
              showClassColumn={filterMode !== 'class'}
            />
          ) : null}
        </div>

        {/* Day notes */}
        {data?.dayNotes && data.dayNotes.length > 0 && (
          <div className="day-notes">
            <div
              className="flex items-center gap-2 mb-3"
              style={{ color: 'var(--color-warning)' }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
              <span className="text-sm font-semibold">Besondere Hinweise</span>
            </div>
            <div className="space-y-1.5">
              {data.dayNotes.map((note, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text)' }}
                >
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
