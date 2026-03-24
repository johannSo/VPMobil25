'use client';

import { useState } from 'react';
import Image from 'next/image';
import { School, User, Lock } from 'lucide-react';
import { Credentials } from '@/lib/types';

interface LoginFormProps {
  onLogin: (creds: Credentials) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [input, setInput] = useState<Credentials>({ school: '', user: '', pass: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.school && input.user && input.pass) {
      onLogin(input);
    }
  };

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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
              <School className="w-3 h-3" /> Schulnummer
            </label>
            <input 
              type="text" required 
              placeholder="z.B. 12345678"
              value={input.school}
              onChange={e => setInput({...input, school: e.target.value})}
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
              value={input.user}
              onChange={e => setInput({...input, user: e.target.value})}
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
              value={input.pass}
              onChange={e => setInput({...input, pass: e.target.value})}
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
