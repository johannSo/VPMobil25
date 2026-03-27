'use client';

import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Loader2,
  Search,
  Users,
  MapPin,
  User,
  Star,
  CalendarDays,
  ShieldBan,
} from 'lucide-react';
import { Favorite, FilterMode } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface TimetableHeaderProps {
  isLoading: boolean;
  dateText?: string;
  onNavigate: (offset: number) => void;
  onLogout: () => void;
  filterMode: FilterMode;
  selectedValue: string;
  onOpenPalette: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  favorites: Favorite[];
  isToday: boolean;
  onSelectFavorite: (mode: FilterMode, value: string) => void;
  onOpenBlacklist: () => void;
}

const modeLabel: Record<FilterMode, string> = {
  class: 'Klasse',
  room: 'Raum',
  teacher: 'Lehrer',
};

const ModeIcon = ({ mode, size = 16 }: { mode: FilterMode; size?: number }) => {
  const props = { width: size, height: size, strokeWidth: 1.75 };
  if (mode === 'class') return <Users {...props} />;
  if (mode === 'room') return <MapPin {...props} />;
  return <User {...props} />;
};

export default function TimetableHeader({
  isLoading,
  dateText,
  onNavigate,
  onLogout,
  filterMode,
  selectedValue,
  onOpenPalette,
  isFavorite,
  onToggleFavorite,
  favorites,
  isToday,
  onSelectFavorite,
  onOpenBlacklist,
}: TimetableHeaderProps) {
  const router = useRouter();
  const cleanDate = dateText ? dateText.replace(/\s*\(Aktualisiert:.*\)\s*$/u, '') : '';

  return (
    <div className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 sm:px-8 sm:py-5">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/pfp.png"
            alt="TimetableX Logo"
            width={44}
            height={44}
            className="rounded-[10px] flex-shrink-0"
          />
          <div className="min-w-0">
            <h1
              className="text-lg font-bold leading-tight tracking-tight truncate display"
              style={{ color: 'var(--color-text)' }}
            >
              TimetableX
            </h1>
            <p
              className="text-sm leading-tight flex items-center gap-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                  <span>Aktualisiere…</span>
                </>
              ) : (
                <>
                  <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{cleanDate || 'Stundenplan'}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          {/* Day navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(-1)}
              aria-label="Vorheriger Tag"
              className="icon-btn"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            </button>

            <button
              onClick={() => router.push('/')}
              aria-label="Heute"
              className={`btn ${isToday ? 'btn-primary' : 'btn-ghost'} text-sm`}
              style={{ height: 48, padding: '0 0.9rem' }}
            >
              Heute
            </button>

            <button
              onClick={() => onNavigate(1)}
              aria-label="Nächster Tag"
              className="icon-btn"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            aria-label="Abmelden"
            className="icon-btn icon-btn-danger"
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Filter & Favorites bar */}
      <div className="px-5 pb-5 sm:px-8 sm:pb-6 space-y-4" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        <div className="pt-4 flex flex-row items-stretch gap-3 flex-nowrap">
          {/* Current selection button */}
          <button
            onClick={onOpenPalette}
            aria-label="Klasse, Raum oder Lehrer suchen"
            className="search-trigger flex-1 min-w-0 active:scale-[0.99]"
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
              }}
            >
              <ModeIcon mode={filterMode} size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                {modeLabel[filterMode]}
              </p>
              <p className="text-base font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {selectedValue || '—'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <kbd
                className="hidden sm:flex kbd"
              >
                ⌘K
              </kbd>
              <Search className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          </button>

          {/* Blacklist toggle */}
          <button
            onClick={onOpenBlacklist}
            aria-label="Fächer verbergen"
            className="favorite-btn"
            style={{ flexShrink: 0 }}
          >
            <ShieldBan className="w-5 h-5 block" strokeWidth={2} />
          </button>

          {/* Favorite toggle */}
          <button
            onClick={onToggleFavorite}
            aria-label={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            aria-pressed={isFavorite}
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            style={{ flexShrink: 0 }}
          >
            <Star
              className="w-5 h-5 block"
              fill={isFavorite ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {favorites.map((f, i) => {
              const isSelected = filterMode === f.mode && selectedValue === f.value;
              return (
                <button
                  key={i}
                  onClick={() => onSelectFavorite(f.mode, f.value)}
                  className={`chip active:scale-[0.97] ${isSelected ? 'chip-active' : ''}`}
                >
                  <ModeIcon mode={f.mode} size={14} />
                  <span>{f.value}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
