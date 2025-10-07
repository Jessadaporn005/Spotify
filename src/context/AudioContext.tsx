import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Track } from '../data/tracks';
import { TRACKS } from '../data/tracks';
import { useSleepTimerStore } from '../store/sleepTimer';

export const __AUDIO_CTX_DEBUG_ID = Math.random().toString(36).slice(2,8);
console.log('[AudioContext] loaded', __AUDIO_CTX_DEBUG_ID);

type Ctx = {
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number;   // ms
  duration: number;   // ms
  queue: Track[];
  index: number;
  recent: Track[]; // recently played (most recent first)
  shuffle: boolean;
  repeatMode: 'off' | 'one' | 'all';
  volume: number;
  play: (track?: Track) => Promise<void>;
  pause: () => Promise<void>;
  toggle: () => Promise<void>;
  seekTo: (ms: number) => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  setQueue: (tracks: Track[], startIndex?: number) => Promise<void>;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVolume: (v: number) => Promise<void>;
  toggleMute: () => Promise<void>;
};

const AudioCtxInternal = createContext<Ctx>({} as any);
export const useAudio = () => useContext(AudioCtxInternal);

const toSource = (input: any) => (typeof input === 'string' ? { uri: input } : input);

export const AudioProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  console.log('[AudioContext] loaded', __AUDIO_CTX_DEBUG_ID);

  const soundRef = useRef<Audio.Sound | null>(null);
  const pollRef = useRef<number | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [position, setPosition]     = useState(0);
  const [duration, setDuration]     = useState(0);
  const [queue, setQueueState]      = useState<Track[]>(TRACKS);
  const [index, setIndex]           = useState(0);
  const [recentIds, setRecentIds]   = useState<string[]>([]);
  const recent: Track[] = recentIds.map(id => TRACKS.find(t => t.id === id)!).filter(Boolean);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off'|'one'|'all'>('all');
  const [volume, setVolumeState] = useState(1);

  const lastSaveRef = useRef<number>(0);
  const expiresAt = useSleepTimerStore(s => s.expiresAt);

  // Load persisted last session (track + position + recent)
  // --- Callbacks (declare before effects that depend on them) ---
  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  const nextRef = useRef<() => void>(() => {});
  const handleStatus = useCallback((st: any): void => {
    if (!st || !st.isLoaded) return;
    setIsPlaying(!!st.isPlaying);
    const pos = st.positionMillis ?? 0;
    setPosition(pos);
    setDuration(st.durationMillis ?? 0);
    if ((st as any).didJustFinish) {
      // call via ref to avoid dependency on next
      nextRef.current();
    }
    const now = Date.now();
    if (now - (lastSaveRef.current || 0) > 5000) {
      lastSaveRef.current = now;
      AsyncStorage.setItem('player:lastPos', String(pos)).catch(() => {});
    }
  }, []);

  const unload = useCallback(async (): Promise<void> => {
    stopPolling();
    if (soundRef.current) {
      try { await soundRef.current.unloadAsync(); } catch {}
      soundRef.current.setOnPlaybackStatusUpdate(null);
      soundRef.current = null;
    }
  }, []);

  const startPolling = useCallback((): void => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      if (!soundRef.current) return;
      try { const st = await soundRef.current.getStatusAsync(); handleStatus(st); } catch {}
    }, 250) as any;
  }, [handleStatus]);

  const loadAndPlay = useCallback(async (track: Track): Promise<void> => {
    setCurrentTrack(track);
    setPosition(0);
    setDuration(0);
    await unload();
    const { sound, status } = await Audio.Sound.createAsync(
      toSource(track.uri),
      { shouldPlay: true, progressUpdateIntervalMillis: 250 }
    );
    soundRef.current = sound;
    sound.setOnPlaybackStatusUpdate(handleStatus);
    handleStatus(status);
    startPolling();
  try { await sound.playAsync(); } catch {}
  try { await sound.setVolumeAsync(volume); } catch {}
    AsyncStorage.setItem('player:lastTrack', track.id).catch(() => {});
    setRecentIds(ids => {
      const filtered = ids.filter(i => i !== track.id);
      const updated = [track.id, ...filtered].slice(0, 50);
      AsyncStorage.setItem('player:recent', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, [handleStatus, startPolling, unload, volume]);

  const setQueue = useCallback(async (tracks: Track[], startIndex: number = 0): Promise<void> => {
    setQueueState(tracks);
    setIndex(startIndex);
    if (tracks[startIndex]) await loadAndPlay(tracks[startIndex]);
  }, [loadAndPlay]);

  const play = useCallback(async (track?: Track): Promise<void> => {
    if (track) {
      const list = queue.length ? queue : TRACKS;
      const i = list.findIndex(t => t.id === track.id);
      if (i >= 0) { setIndex(i); await loadAndPlay(list[i]); }
      else { await setQueue([track], 0); }
      return;
    }
    if (soundRef.current) await soundRef.current.playAsync();
    else if (currentTrack) await loadAndPlay(currentTrack);
  }, [currentTrack, queue, loadAndPlay, setQueue]);

  const pause = useCallback(async (): Promise<void> => { if (soundRef.current) await soundRef.current.pauseAsync(); }, []);

  const previous = useCallback(async (): Promise<void> => {
    if (position > 3000 && soundRef.current) { await soundRef.current.setPositionAsync(0); return; }
    const list = queue.length ? queue : TRACKS;
    const pi = (index - 1 + list.length) % list.length;
    setIndex(pi); await loadAndPlay(list[pi]);
  }, [index, queue, position, loadAndPlay]);

  const next = useCallback(async (): Promise<void> => {
    const list = queue.length ? queue : TRACKS;
    if (repeatMode === 'one') {
      if (soundRef.current) { try { await soundRef.current.setPositionAsync(0); await soundRef.current.playAsync(); } catch {} }
      else if (currentTrack) { await loadAndPlay(currentTrack); }
      return;
    }
    if (shuffle && list.length > 1) {
      let ri = index;
      for (let i=0;i<6 && ri===index;i++) ri = Math.floor(Math.random()*list.length);
      setIndex(ri); await loadAndPlay(list[ri]); return;
    }
    const isLast = index === list.length - 1;
    if (isLast && repeatMode === 'off') {
      if (soundRef.current) { try { await soundRef.current.pauseAsync(); } catch {} }
      return;
    }
    const ni = (index + 1) % list.length;
    setIndex(ni); await loadAndPlay(list[ni]);
  }, [index, queue, loadAndPlay, shuffle, repeatMode, currentTrack]);

  // keep ref updated
  useEffect(() => { nextRef.current = () => { next(); }; }, [next]);

  const toggle = useCallback(async (): Promise<void> => {
    if (!soundRef.current) { if (currentTrack) await loadAndPlay(currentTrack); return; }
    const st = await soundRef.current.getStatusAsync();
    if (st.isLoaded) {
      if (st.isPlaying) await soundRef.current.pauseAsync();
      else await soundRef.current.playAsync();
    }
  }, [currentTrack, loadAndPlay]);

  const seekTo = useCallback(async (ms: number): Promise<void> => { if (soundRef.current) await soundRef.current.setPositionAsync(ms); }, []);
  const toggleShuffle = () => setShuffle(s => !s);
  const cycleRepeat = () => setRepeatMode(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off');
  const setVolume = useCallback(async (v: number) => {
    const nv = Math.min(1, Math.max(0, v));
    setVolumeState(nv);
    if (soundRef.current) { try { await soundRef.current.setVolumeAsync(nv); } catch {} }
    AsyncStorage.setItem('player:vol', String(nv)).catch(() => {});
  }, []);
  const toggleMute = useCallback(async () => { if (volume > 0) await setVolume(0); else await setVolume(1); }, [volume, setVolume]);

  // Now that callbacks exist, effect to preload last session:
  useEffect(() => {
    (async () => {
      try {
        const [lastId, lastPos, recentRaw, volRaw] = await Promise.all([
          AsyncStorage.getItem('player:lastTrack'),
          AsyncStorage.getItem('player:lastPos'),
          AsyncStorage.getItem('player:recent'),
          AsyncStorage.getItem('player:vol')
        ]);
        if (recentRaw) { try { setRecentIds(JSON.parse(recentRaw)); } catch {} }
        if (volRaw) { const vv = parseFloat(volRaw); if (!isNaN(vv)) setVolumeState(Math.min(1, Math.max(0, vv))); }
        if (lastId) {
          const tr = TRACKS.find(t => t.id === lastId);
          if (tr) {
            await unload();
            const { sound, status } = await Audio.Sound.createAsync(
              toSource(tr.uri),
              { shouldPlay: false, progressUpdateIntervalMillis: 250 }
            );
            soundRef.current = sound;
            sound.setOnPlaybackStatusUpdate(handleStatus);
            handleStatus(status);
            setCurrentTrack(tr);
            try { await sound.setVolumeAsync(volume); } catch {}
            if (lastPos) {
              const posNum = parseInt(lastPos, 10);
              if (!isNaN(posNum)) { try { await sound.setPositionAsync(posNum); } catch {} }
            }
          }
        }
      } catch {}
    })();
  }, [handleStatus, unload, volume]);

  // Sleep timer effect
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(async () => {
      if (expiresAt && Date.now() >= expiresAt) {
        try { await pause(); } catch {}
        useSleepTimerStore.getState().clear();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, pause]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      playThroughEarpieceAndroid: false,
    }).catch(() => {});
  }, []);

  useEffect(() => () => { unload(); }, [unload]);

  return (
    <AudioCtxInternal.Provider value={{ currentTrack, isPlaying, position, duration, queue, index, recent, shuffle, repeatMode, volume,
      play, pause, toggle, seekTo, next, previous, setQueue, toggleShuffle, cycleRepeat, setVolume, toggleMute }}>
      {children}
    </AudioCtxInternal.Provider>
  );
};
