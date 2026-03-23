'use client';

import { TimetableData, TimetableEntry } from '@/lib/stundenplan';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  LogOut, 
  User, 
  Users,
  Home,
  Lock, 
  School, 
  Loader2, 
  AlertCircle, 
  Calendar,
  Search,
  CheckCircle2,
  Command as CommandIcon
} from 'lucide-react';
import CommandPalette, { SearchItem } from './CommandPalette';

interface ClientViewerProps {
  currentDateStr?: string;
}

type FilterMode = 'class' | 'room' | 'teacher';

interface Favorite {
  mode: FilterMode;
  value: string;
}

interface Credentials {
  school: string;
  user: string;
  pass: string;
}

function isCancelledEntry(entry: TimetableEntry): boolean {
  const combinedText = `${entry.subject} ${entry.info} ${entry.teacher} ${entry.room}`.toLowerCase();
  return ['ausfall', 'entfall', 'fällt aus', 'faellt aus', 'cancel'].some(keyword =>
    combinedText.includes(keyword)
  );
}

export default function ClientViewer({ currentDateStr }: ClientViewerProps) {
  const router = useRouter();
  
  // Login / Credentials State
  const [creds, setCreds] = useState<Credentials | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [loginInput, setLoginInput] = useState<Credentials>({ school: '', user: '', pass: '' });
  
  // Data State
  const [data, setData] = useState<TimetableData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // UI / Filter State
  const [filterMode, setFilterMode] = useState<FilterMode>('class');
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [filteredEntries, setFilteredEntries] = useState<TimetableEntry[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // 1. Load credentials from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('school_creds');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCreds(parsed);
      setIsLogged(true);
    }

    const savedFavs = localStorage.getItem('favorites');
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
  }, []);

  // 2. Keyboard shortcut for Command Palette
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

  // 3. Data fetching function
  const fetchData = useCallback(async (c: Credentials, date?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stundenplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...c, date }),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fehler beim Laden der Daten.');
      
      setData(json);
      
      // Update filters based on new data
      const savedMode = localStorage.getItem('filterMode') as FilterMode;
      const savedValue = localStorage.getItem('filterValue');
      
      if (savedMode && ['class', 'room', 'teacher'].includes(savedMode)) {
        setFilterMode(savedMode);
        const options = savedMode === 'class' ? json.availableClasses : 
                        savedMode === 'room' ? json.availableRooms : 
                        json.availableTeachers;
        
        if (savedValue && options.includes(savedValue)) {
          setSelectedValue(savedValue);
        } else {
          setSelectedValue(options[0] || '');
        }
      } else {
        setSelectedValue(json.availableClasses[0] || '');
      }
      
    } catch (e: any) {
      setError(e.message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 4. Fetch data when logged in or date changes
  useEffect(() => {
    if (isLogged && creds) {
      fetchData(creds, currentDateStr);
    }
  }, [isLogged, creds, currentDateStr, fetchData]);

  // 5. Update filtering
  useEffect(() => {
    if (data && selectedValue) {
      let filtered: TimetableEntry[] = [];
      if (filterMode === 'class') {
        filtered = data.entries.filter(e => e.class === selectedValue);
      } else if (filterMode === 'room') {
        filtered = data.entries.filter(e => e.room === selectedValue);
      } else if (filterMode === 'teacher') {
        filtered = data.entries.filter(e => e.teacher === selectedValue);
      }
      
      filtered.sort((a, b) => (parseInt(a.hour) || 0) - (parseInt(b.hour) || 0));
      setFilteredEntries(filtered);
      localStorage.setItem('filterMode', filterMode);
      localStorage.setItem('filterValue', selectedValue);
    }
  }, [filterMode, selectedValue, data]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginInput.school && loginInput.user && loginInput.pass) {
      localStorage.setItem('school_creds', JSON.stringify(loginInput));
      setCreds(loginInput);
      setIsLogged(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('school_creds');
    setCreds(null);
    setIsLogged(false);
    setData(null);
    setError(null);
  };

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

  const toggleFavorite = () => {
    if (!selectedValue) return;
    const isFav = favorites.some(f => f.mode === filterMode && f.value === selectedValue);
    let newFavs: Favorite[];
    if (isFav) {
      newFavs = favorites.filter(f => !(f.mode === filterMode && f.value === selectedValue));
    } else {
      if (favorites.length >= 4) return alert('Max. 4 Favoriten.');
      newFavs = [...favorites, { mode: filterMode, value: selectedValue }];
    }
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  const navigateDay = (offset: number) => {
    const dateToParse = currentDateStr || (new Date().toISOString().slice(0, 10).replace(/-/g, ''));
    const date = new Date(parseInt(dateToParse.slice(0, 4)), parseInt(dateToParse.slice(4, 6)) - 1, parseInt(dateToParse.slice(6, 8)));
    date.setDate(date.getDate() + offset);
    const nextDateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    router.push(`/?date=${nextDateStr}`);
  };

  const isCurrentFavorite = favorites.some(f => f.mode === filterMode && f.value === selectedValue);
  const showClassColumn = filterMode !== 'class';

  // --- RENDERING ---

  if (!isLogged) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md bg-white dark:bg-black p-10 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <Image src="/pfp.png" alt="Logo" width={80} height={80} className="rounded-3xl shadow-lg" priority />
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-black dark:text-white">TimetableX</h2>
            <p className="text-zinc-500 text-sm font-medium">Anmeldung erforderlich</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                <School className="w-3 h-3" /> Schulnummer
              </label>
              <input 
                type="text" required 
                placeholder="z.B. 12345678"
                value={loginInput.school}
                onChange={e => setLoginInput({...loginInput, school: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white focus:border-black dark:focus:border-white outline-none transition-all font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                <User className="w-3 h-3" /> Benutzer
              </label>
              <input 
                type="text" required
                placeholder="Benutzername"
                value={loginInput.user}
                onChange={e => setLoginInput({...loginInput, user: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white focus:border-black dark:focus:border-white outline-none transition-all font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                <Lock className="w-3 h-3" /> Passwort
              </label>
              <input 
                type="password" required
                placeholder="••••••••"
                value={loginInput.pass}
                onChange={e => setLoginInput({...loginInput, pass: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white focus:border-black dark:focus:border-white outline-none transition-all font-bold" 
              />
            </div>
            <button type="submit" className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl transition-all shadow-xl shadow-black/10 dark:shadow-white/5 active:scale-95 text-lg uppercase tracking-widest">
              Anmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl animate-in fade-in duration-700">
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)} 
        onSelect={handleSelect} 
        items={searchItems}
      />
      
      <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border-2 border-zinc-100 dark:border-zinc-900 shadow-2xl shadow-black/[0.05] overflow-hidden">
        {/* Header & Nav Section */}
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
                  ) : data ? (
                    data.date
                  ) : error ? (
                    <span className="text-zinc-400">Verbindungsfehler</span>
                  ) : 'Bereit'}
                </p>
              </div>

              <div className="flex items-center gap-4">
                 <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-1.5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                   <button 
                      onClick={() => navigateDay(-1)} 
                      className="p-3 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-90"
                      title="Gestern"
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
                      onClick={() => navigateDay(1)} 
                      className="p-3 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-90"
                      title="Morgen"
                    >
                      <ChevronRight className="w-5 h-5 text-black dark:text-white" strokeWidth={3} />
                   </button>
                 </div>
                 <button 
                    onClick={handleLogout} 
                    className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all shadow-sm active:scale-90" 
                    title="Abmelden"
                  >
                   <LogOut className="w-5 h-5" strokeWidth={2.5} />
                 </button>
              </div>
            </div>

            {data && (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  {/* Current Selection */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <Search className="w-3 h-3" /> Aktuelle Auswahl
                    </span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsPaletteOpen(true)}
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
                        onClick={toggleFavorite} 
                        className={`p-4 rounded-2xl border-2 transition-all active:scale-90 h-[64px] w-[64px] flex items-center justify-center ${
                          isCurrentFavorite 
                          ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black shadow-lg shadow-black/10' 
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-300 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        <Star className="w-6 h-6" fill={isCurrentFavorite ? "currentColor" : "none"} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  {/* Favorites Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 lg:mt-[23px]">
                    {favorites.length > 0 ? (
                      favorites.map((f, i) => {
                        const isSelected = filterMode === f.mode && selectedValue === f.value;
                        return (
                          <button 
                            key={i} 
                            onClick={() => { setFilterMode(f.mode); setSelectedValue(f.value); }} 
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
            )}
          </header>
        </div>

        {/* Content Section */}
        <div className="relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <Loader2 className="w-12 h-12 text-zinc-200 dark:text-zinc-800 animate-spin" strokeWidth={1.5} />
              <p className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.5em] animate-pulse">Synchronisierung läuft</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
              <p className="text-black dark:text-white font-black mb-2 uppercase tracking-tight">{error}</p>
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-zinc-50 dark:divide-zinc-900">
                <tbody className="divide-y-2 divide-zinc-50 dark:divide-zinc-900 bg-white dark:bg-black">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={showClassColumn ? 6 : 5} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <CheckCircle2 className="w-8 h-8 text-zinc-100 dark:text-zinc-900" />
                          <p className="text-[11px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">Keine besonderen Vorkommnisse</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((e, i) => {
                      const isCancelled = isCancelledEntry(e);

                      return (
                        <tr
                          key={i}
                          className={`border-b last:border-0 ${
                            isCancelled
                              ? 'border-red-200 bg-red-50/90 dark:border-red-950/60 dark:bg-red-950/20'
                              : 'border-zinc-50 dark:border-zinc-900/50'
                          }`}
                        >
                          <td className={`px-3 sm:px-8 py-4 sm:py-6 text-sm font-black italic w-12 text-center ${
                            isCancelled ? 'text-red-700 dark:text-red-300' : 'text-black dark:text-white'
                          }`}>{e.hour}</td>
                          <td className={`px-3 sm:px-8 py-4 sm:py-6 text-base font-black tracking-tighter italic min-w-[100px] ${
                            isCancelled ? 'text-red-700 dark:text-red-300' : 'text-black dark:text-white'
                          }`}>{e.subject}</td>
                          {showClassColumn && (
                            <td className={`px-3 sm:px-8 py-4 sm:py-6 text-xs font-bold ${
                              isCancelled ? 'text-red-600 dark:text-red-300/90' : 'text-zinc-500 dark:text-zinc-400'
                            }`}>{e.class}</td>
                          )}
                          <td className={`px-3 sm:px-8 py-4 sm:py-6 text-xs font-bold ${
                            isCancelled ? 'text-red-600 dark:text-red-300/90' : 'text-zinc-500 dark:text-zinc-400'
                          }`}>{e.teacher}</td>
                          <td className={`px-3 sm:px-8 py-4 sm:py-6 text-sm font-black text-center ${
                            isCancelled
                              ? 'bg-red-100/80 text-red-700 dark:bg-red-950/40 dark:text-red-200'
                              : 'bg-zinc-50/30 text-black dark:bg-zinc-900/30 dark:text-white'
                          }`}>{e.room}</td>
                          <td className={`px-3 sm:px-8 py-4 sm:py-6 text-xs italic font-bold leading-relaxed ${
                            isCancelled ? 'text-red-600 dark:text-red-300/90' : 'text-zinc-400 dark:text-zinc-500'
                          }`}>{e.info}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        {/* Footer / Notes Section */}
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
