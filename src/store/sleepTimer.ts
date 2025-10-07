import { useEffect, useState } from 'react';
import { create } from 'zustand';

type SleepState = {
  expiresAt: number | null; // epoch ms
  setTimer: (minutes: number) => void;
  clear: () => void;
};

export const useSleepTimerStore = create<SleepState>((set) => ({
  expiresAt: null,
  setTimer: (minutes: number) => set({ expiresAt: Date.now() + minutes * 60_000 }),
  clear: () => set({ expiresAt: null }),
}));

// Convenience hook to get remaining time (updates each second)
export function useSleepRemaining() {
  const expiresAt = useSleepTimerStore(s => s.expiresAt);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const ms = Math.max(0, expiresAt - now);
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { minutes: m, seconds: s, ms };
}
