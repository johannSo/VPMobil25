'use client';

import React, { useEffect } from 'react';
import { ShieldBan, X, Check, Loader2 } from 'lucide-react';

interface BlacklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEntity: string;
  availableSubjects: string[];
  isLoadingSubjects: boolean;
  currentBlacklist: string[];
  addToBlacklist: (subject: string) => void;
  removeFromBlacklist: (subject: string) => void;
}

export default function BlacklistModal({
  isOpen,
  onClose,
  currentEntity,
  availableSubjects,
  isLoadingSubjects,
  currentBlacklist,
  addToBlacklist,
  removeFromBlacklist,
}: BlacklistModalProps) {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Combine subjects from current timetable and already blacklisted ones
  const allSubjects = Array.from(new Set([...availableSubjects, ...currentBlacklist]))
    .filter(subject => subject !== '---')
    .sort();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Fächer verbergen"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 palette-backdrop"
        onClick={onClose}
        aria-hidden="true"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-md overflow-hidden palette-panel bg-white dark:bg-zinc-900 rounded-xl shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)' 
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 text-primary" style={{ color: 'var(--color-text)' }}>
            <ShieldBan className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-danger)' }} />
            <span className="font-semibold text-base">Fächer verbergen ({currentEntity})</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="icon-btn hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            style={{ width: 36, height: 36, background: 'var(--color-bg)' }}
          >
            <X className="w-4 h-4 mx-auto" style={{ color: 'var(--color-text-secondary)' }} strokeWidth={2} />
          </button>
        </div>

        {/* Description */}
        <div className="px-5 py-3 border-b bg-zinc-50 dark:bg-zinc-800/50" style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-bg)' }}>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Wähle die Fächer aus, die du ausklammern möchtest. Sie werden nicht im Vertretungsplan angezeigt.
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[50vh] p-3 space-y-1.5" style={{ background: 'var(--color-bg)' }}>
          {isLoadingSubjects ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} strokeWidth={1.5} />
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Lade Fächer der letzten 3 Wochen...</p>
            </div>
          ) : allSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ShieldBan className="w-8 h-8 opacity-20 mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Keine Fächer verfügbar</p>
              <p className="text-xs mt-1 max-w-[200px]" style={{ color: 'var(--color-text-muted)' }}>
                Für diesen Tag sind keine Fächer im Plan eingetragen.
              </p>
            </div>
          ) : (
            allSubjects.map((subject) => {
              const isBlacklisted = currentBlacklist.includes(subject);
              return (
                <button
                  key={subject}
                  onClick={() => isBlacklisted ? removeFromBlacklist(subject) : addToBlacklist(subject)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg group text-left transition-all active:scale-[0.98]"
                  style={{ 
                    background: isBlacklisted ? 'var(--color-danger-bg)' : 'var(--color-surface)',
                    border: isBlacklisted ? '1px solid var(--color-danger-border)' : '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{
                        border: isBlacklisted ? 'none' : '1px solid var(--color-text-muted)',
                        background: isBlacklisted ? 'var(--color-danger)' : 'transparent',
                      }}
                    >
                      {isBlacklisted && <Check className="w-3.5 h-3.5" style={{ color: 'white' }} strokeWidth={3} />}
                    </div>
                    <span 
                      className="text-sm font-medium truncate" 
                      style={{ 
                        color: isBlacklisted ? 'var(--color-danger)' : 'var(--color-text)',
                        textDecoration: isBlacklisted ? 'line-through' : 'none'
                      }}
                    >
                      {subject}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
