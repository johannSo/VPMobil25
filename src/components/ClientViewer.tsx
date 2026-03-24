'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Calendar, CheckCircle2, RefreshCw } from 'lucide-react';

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
    setSelectedValue,
  } = useTimetable(creds, currentDateStr);

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

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
    const next = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    router.push(`/?date=${next}`);
  };

  if (!isInitialized) return null;
  if (!isLogged) return <LoginForm onLogin={login} />;

  const isEmptyDay =
    data?.isWeekend || (data && data.entries.length === 0 && !data.dayNotes?.length);

  return (
    <div className="mx-auto max-w-5xl">
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSelect={handleSelect}
        items={searchItems}
      />

      {/* Main card */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
        }}
      >
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
                className="text-sm font-medium"
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
                className="flex items-center gap-2 text-sm font-semibold cursor-pointer transition-all active:scale-[0.97]"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
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
                  {data?.isWeekend ? 'Wochenende' : 'Keine Vertretungen'}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {data?.isWeekend
                    ? 'Genieß die freie Zeit! Es ist kein Plan verfügbar.'
                    : 'Für heute liegen keine besonderen Änderungen vor.'}
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-sm font-medium cursor-pointer transition-all active:scale-[0.97]"
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.background = 'var(--color-primary-light)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                  e.currentTarget.style.background = 'var(--color-bg)';
                }}
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
          <div
            style={{
              borderTop: '1px solid var(--color-warning-border)',
              background: 'var(--color-warning-bg)',
              padding: '1.25rem 1.5rem',
            }}
          >
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
