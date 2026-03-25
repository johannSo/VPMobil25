'use client';

import { useEffect } from 'react';
import { WebHaptics } from 'web-haptics';

const isMobilePointer = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
    navigator.maxTouchPoints > 0);

const isInteractive = (el: Element | null) => {
  if (!el) return false;
  const target = el.closest(
    'button, [role="button"], a[href], input[type="button"], input[type="submit"], input[type="reset"]'
  ) as HTMLElement | null;
  if (!target) return false;
  if ('disabled' in target && (target as HTMLButtonElement).disabled) return false;
  if (target.getAttribute('aria-disabled') === 'true') return false;
  return true;
};

export default function HapticsProvider() {
  useEffect(() => {
    if (!isMobilePointer()) return;

    const haptics = new WebHaptics();

    const handlePointerDown = (event: PointerEvent) => {
      if (!isMobilePointer()) return;
      if (event.pointerType !== 'touch') return;
      if (!isInteractive(event.target as Element | null)) return;
      haptics.trigger([
        { duration: 8 },
      ], { intensity: 1 }
      );
    };

    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      haptics.destroy();
    };
  }, []);

  return null;
}
