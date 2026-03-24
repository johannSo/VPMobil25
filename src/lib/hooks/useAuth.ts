'use client';

import { useState, useEffect } from 'react';
import { Credentials } from '@/lib/types';

const STORAGE_KEY = 'school_creds';

export function useAuth() {
  const [creds, setCreds] = useState<Credentials | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCreds(parsed);
        setIsLogged(true);
      } catch (e) {
        console.error('Failed to parse saved credentials', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsInitialized(true);
  }, []);

  const login = (newCreds: Credentials) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCreds));
    setCreds(newCreds);
    setIsLogged(true);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCreds(null);
    setIsLogged(false);
  };

  return { creds, isLogged, login, logout, isInitialized };
}
