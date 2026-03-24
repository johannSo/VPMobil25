'use client';

import Image from 'next/image';
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Loader2, 
  Search, 
  Users, 
  Home, 
  User, 
  Star,
  Command as CommandIcon
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
  onSelectFavorite
}: TimetableHeaderProps) {
  const router = useRouter();

  return (
    <div className="p-6 sm:p-10 border-b-2 border-zinc-50 dark:border-zinc-900/50">
      <header className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Image src="/pfp.png" alt="Logo" width={48} height={48} className="rounded-xl shadow-sm" />
              <h1 className="text-4xl font-black tracking-tighter text-black dark:text-white">TimetableX</h1>
            </div>
            <p className="text-lg font-bold text-zinc-400 dark:text-zinc-500 tracking-tight">
              {isLoading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Aktualisiere...</span>
              ) : dateText || 'Stundenplan'}
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-1.5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
               <button 
                  onClick={() => onNavigate(-1)} 
                  className="p-3 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5 text-black dark:text-white" strokeWidth={3} />
               </button>
               <button 
                  onClick={() => router.push('/')} 
                  className="px-6 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  Heute
                </button>
               <button 
                  onClick={() => onNavigate(1)} 
                  className="p-3 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-90"
                >
                  <ChevronRight className="w-5 h-5 text-black dark:text-white" strokeWidth={3} />
               </button>
             </div>
             <button 
                onClick={onLogout} 
                className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all shadow-sm active:scale-90" 
              >
               <LogOut className="w-5 h-5" strokeWidth={2.5} />
             </button>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                <Search className="w-3 h-3" /> Aktuelle Auswahl
              </span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={onOpenPalette}
                  className="flex-grow relative flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 border-2 border-transparent hover:border-black dark:hover:border-white rounded-2xl py-2.5 px-6 transition-all group min-h-[64px]"
                >
                  <div className="absolute left-6 p-1.5 bg-white dark:bg-zinc-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center">
                    {filterMode === 'class' ? <Users className="w-4 h-4" /> : filterMode === 'room' ? <Home className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-0.5">
                      {filterMode === 'class' ? 'Klasse' : filterMode === 'room' ? 'Raum' : 'Lehrer'}
                    </p>
                    <p className="text-xl font-black text-black dark:text-white tracking-tighter leading-none">
                      {selectedValue}
                    </p>
                  </div>

                  <div className="absolute right-6 flex items-center gap-2.5 text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                    <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-black shadow-sm">
                      <CommandIcon className="w-2.5 h-2.5" /> K
                    </kbd>
                    <Search className="w-4 h-4" />
                  </div>
                </button>

                <button 
                  onClick={onToggleFavorite} 
                  className={`p-4 rounded-2xl border-2 transition-all active:scale-90 h-[64px] w-[64px] flex items-center justify-center ${
                    isFavorite 
                    ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black shadow-lg shadow-black/10' 
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-300 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Star className="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 lg:mt-[23px]">
              {favorites.length > 0 ? (
                favorites.map((f, i) => {
                  const isSelected = filterMode === f.mode && selectedValue === f.value;
                  return (
                    <button 
                      key={i} 
                      onClick={() => onSelectFavorite(f.mode, f.value)} 
                      className={`relative flex items-center justify-center px-5 py-2.5 rounded-2xl border-2 transition-all min-h-[64px] ${
                        isSelected 
                        ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black shadow-lg' 
                        : 'bg-zinc-100 dark:bg-zinc-900 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className={`absolute left-5 p-1.5 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-white dark:bg-zinc-800 shadow-sm'}`}>
                        {f.mode === 'class' ? <Users className="w-3.5 h-3.5" /> : f.mode === 'room' ? <Home className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>
                      <div className="text-center">
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${isSelected ? 'text-white/60 dark:text-black/60' : 'text-zinc-400'}`}>
                          {f.mode === 'class' ? 'Klasse' : f.mode === 'room' ? 'Raum' : 'Lehrer'}
                        </p>
                        <p className="text-base font-black tracking-tight leading-none">
                          {f.value}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full py-4 px-6 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-900 flex items-center justify-center h-[64px]">
                  <p className="text-[9px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest italic">Keine Favoriten</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
