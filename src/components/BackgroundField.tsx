'use client';

import { useEffect } from 'react';

export default function BackgroundField() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return;

    const handleMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 40;
      const y = (event.clientY / window.innerHeight - 0.5) * 40;
      document.documentElement.style.setProperty('--pointer-x', `${x.toFixed(2)}`);
      document.documentElement.style.setProperty('--pointer-y', `${y.toFixed(2)}`);
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <div className="bg-field" aria-hidden="true">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />
      <div className="bg-grid" />
      <div className="bg-noise" />
    </div>
  );
}
