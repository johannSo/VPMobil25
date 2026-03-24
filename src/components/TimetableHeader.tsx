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
  onSelectFavorite: (mode: FilterMode, value: string) => void;
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
  onSelectFavorite,
}: TimetableHeaderProps) {
  const router = useRouter();

  return (
    <div
      style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8 sm:py-5">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/pfp.png"
            alt="TimetableX Logo"
            width={40}
            height={40}
            className="rounded-xl flex-shrink-0"
          />
          <div className="min-w-0">
            <h1
              className="text-lg font-bold leading-tight tracking-tight truncate"
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
                  <span className="truncate">{dateText || 'Stundenplan'}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Day navigation */}
          <div
            className="flex items-center"
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: 'var(--color-bg)',
            }}
          >
            <button
              onClick={() => onNavigate(-1)}
              aria-label="Vorheriger Tag"
              className="flex items-center justify-center cursor-pointer transition-colors"
              style={{
                width: 44,
                height: 44,
                color: 'var(--color-text)',
                background: 'transparent',
                border: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border-subtle)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            </button>

            <button
              onClick={() => router.push('/')}
              aria-label="Heute"
              className="text-sm font-medium cursor-pointer transition-colors px-3"
              style={{
                height: 44,
                color: 'var(--color-text-secondary)',
                background: 'transparent',
                border: 'none',
                borderLeft: '1px solid var(--color-border)',
                borderRight: '1px solid var(--color-border)',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--color-text)';
                e.currentTarget.style.background = 'var(--color-border-subtle)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Heute
            </button>

            <button
              onClick={() => onNavigate(1)}
              aria-label="Nächster Tag"
              className="flex items-center justify-center cursor-pointer transition-colors"
              style={{
                width: 44,
                height: 44,
                color: 'var(--color-text)',
                background: 'transparent',
                border: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border-subtle)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            aria-label="Abmelden"
            className="flex items-center justify-center cursor-pointer transition-colors"
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--color-danger)';
              e.currentTarget.style.borderColor = 'var(--color-danger-border)';
              e.currentTarget.style.background = 'var(--color-danger-bg)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.background = 'var(--color-bg)';
            }}
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Filter & Favorites bar */}
      <div
        className="px-5 pb-5 sm:px-8 sm:pb-6 space-y-4"
        style={{ borderTop: '1px solid var(--color-border-subtle)' }}
      >
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          {/* Current selection button */}
          <button
            onClick={onOpenPalette}
            aria-label="Klasse, Raum oder Lehrer suchen"
            className="flex items-center gap-3 cursor-pointer transition-all active:scale-[0.99] flex-1"
            style={{
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-bg)',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.background = 'var(--color-primary-light)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.background = 'var(--color-bg)';
            }}
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
                className="hidden sm:flex items-center gap-1 text-xs font-medium px-2 py-1"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-muted)',
                }}
              >
                ⌘K
              </kbd>
              <Search className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          </button>

          {/* Favorite toggle */}
          <button
            onClick={onToggleFavorite}
            aria-label={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            aria-pressed={isFavorite}
            className="flex items-center justify-center cursor-pointer transition-all active:scale-[0.96]"
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              border: isFavorite ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
              background: isFavorite ? 'var(--color-primary)' : 'var(--color-bg)',
              color: isFavorite ? '#ffffff' : 'var(--color-text-muted)',
              flexShrink: 0,
            }}
          >
            <Star
              className="w-5 h-5"
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
                  className="flex items-center gap-2 text-sm font-medium cursor-pointer transition-all active:scale-[0.97]"
                  style={{
                    padding: '0.5rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected
                      ? '1.5px solid var(--color-primary)'
                      : '1.5px solid var(--color-border)',
                    background: isSelected ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'var(--color-primary)';
                      e.currentTarget.style.background = 'var(--color-primary-light)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                      e.currentTarget.style.background = 'var(--color-bg)';
                    }
                  }}
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
