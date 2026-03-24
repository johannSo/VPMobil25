'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Users, Home, User, Command, X, ChevronRight } from 'lucide-react';
import { SearchItem } from '@/lib/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: SearchItem) => void;
  items: SearchItem[];
}


export default function CommandPalette({ isOpen, onClose, onSelect, items }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    const searchLower = search.toLowerCase();
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      item.type.toLowerCase().includes(searchLower)
    );

    // Sort: exact matches first, then starts with, then includes
    return filtered.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      if (aName === searchLower) return -1;
      if (bName === searchLower) return 1;
      
      if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
      if (!aName.startsWith(searchLower) && bName.startsWith(searchLower)) return 1;
      
      return a.name.localeCompare(b.name);
    }).slice(0, 15);
  }, [items, search]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelect(filteredItems[selectedIndex]);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    const activeItem = document.getElementById(`item-${selectedIndex}`);
    if (activeItem && scrollRef.current) {
      const container = scrollRef.current;
      const itemTop = activeItem.offsetTop;
      const itemHeight = activeItem.offsetHeight;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.offsetHeight;

      if (itemTop < containerScrollTop) {
        container.scrollTop = itemTop - 10;
      } else if (itemTop + itemHeight > containerScrollTop + containerHeight) {
        container.scrollTop = itemTop + itemHeight - containerHeight + 10;
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const getTypeIcon = (type: SearchItem['type']) => {
    switch (type) {
      case 'class': return <Users className="w-4 h-4" />;
      case 'room': return <Home className="w-4 h-4" />;
      case 'teacher': return <User className="w-4 h-4" />;
    }
  };

  const getTypeText = (type: SearchItem['type']) => {
    switch (type) {
      case 'class': return 'Klasse';
      case 'room': return 'Raum';
      case 'teacher': return 'Lehrer';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/30 dark:bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
      
      <div 
        className="w-full max-w-2xl bg-white/95 dark:bg-black/90 backdrop-blur-2xl rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.35)] border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300 relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60">
          <Search className="w-6 h-6 text-zinc-500 dark:text-zinc-400 mr-4" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Suchen nach Klassen, Räumen oder Lehrern..."
            className="flex-grow bg-transparent border-none outline-none text-2xl font-medium text-black dark:text-white placeholder:text-zinc-400 tracking-tight"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="max-h-[55vh] overflow-y-auto overflow-x-hidden scrollbar-none custom-scrollbar" ref={scrollRef}>
          {filteredItems.length > 0 ? (
            <div className="p-2 space-y-0.5">
              {filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const isFirstOfGroup = index === 0 || filteredItems[index - 1].type !== item.type;
                
                return (
                  <React.Fragment key={`${item.type}-${item.id}`}>
                    {isFirstOfGroup && (
                      <div className="px-4 pt-4 pb-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400/80">
                          {getTypeText(item.type)}n
                        </p>
                      </div>
                    )}
                    <button
                      id={`item-${index}`}
                      className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isSelected 
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/15 dark:shadow-white/10' 
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${
                          isSelected 
                          ? 'bg-white/15 text-white dark:bg-zinc-100 dark:text-black' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700'
                        }`}>
                          {getTypeIcon(item.type)}
                        </div>
                        <div className="text-left">
                          <p className={`text-base font-bold tracking-tight ${isSelected ? 'text-white dark:text-black' : 'text-zinc-900 dark:text-zinc-100'}`}>
                            {item.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isSelected && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/15 text-white/90 dark:bg-zinc-100 dark:text-black">
                            <span className="text-[10px] font-black tracking-widest uppercase">Auswählen</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="inline-flex p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50">
                <Search className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
              </div>
              <div>
                <p className="text-zinc-900 dark:text-zinc-100 font-bold text-lg tracking-tight">Keine Treffer</p>
                <p className="text-zinc-400 text-sm">Versuchen Sie es mit einem anderen Suchbegriff.</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-zinc-50/80 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400 tracking-tight">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <span className="flex items-center justify-center w-5 h-5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[10px] shadow-sm italic">↑↓</span>
               <span>Navigieren</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="flex items-center justify-center h-5 px-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[10px] shadow-sm italic">Enter</span>
               <span>Auswählen</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="flex items-center justify-center h-5 px-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[10px] shadow-sm italic">ESC</span>
               <span>Schließen</span>
             </div>
          </div>
          <div className="flex items-center gap-1 opacity-50">
            <Command className="w-3 h-3" />
            <span className="font-black uppercase tracking-widest text-[9px]">TimetableX</span>
          </div>
        </div>
      </div>
    </div>
  );
}
