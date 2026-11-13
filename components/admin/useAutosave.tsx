'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Debounced autosave of a working copy. `save` should only write the DRAFT —
 * autosave never publishes. Returns the save state for a small indicator.
 */
export function useAutosave<T>(value: T, save: (v: T) => Promise<boolean>, opts: { delay?: number; enabled?: boolean } = {}) {
  const { delay = 2500, enabled = true } = opts;
  const [state, setState] = useState<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle');
  const first = useRef(true);
  const latest = useRef(value);
  latest.current = value;
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!enabled) return;
    setState('dirty');
    const t = setTimeout(async () => {
      setState('saving');
      const ok = await saveRef.current(latest.current);
      setState(ok ? 'saved' : 'error');
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay, enabled]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state === 'dirty' || state === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [state]);

  return { state, markSaved: () => setState('saved') };
}

export function AutosaveLabel({ state }: { state: string }) {
  const text: Record<string, string> = {
    idle: '',
    dirty: 'Ada perubahan…',
    saving: 'Menyimpan draf…',
    saved: 'Draf tersimpan otomatis ✓',
    error: 'Draf tersimpan dengan catatan — lihat pesan',
  };
  return <span className="text-xs text-stone-500" aria-live="polite">{text[state]}</span>;
}
