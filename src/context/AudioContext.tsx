import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Track } from '../data/tracks';
import { TRACKS } from '../data/tracks';

export const __AUDIO_CTX_DEBUG_ID = Math.random().toString(36).slice(2,8);
console.log('[AudioContext] loaded', __AUDIO_CTX_DEBUG_ID);

type Ctx = {
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number;   // ms
  duration: number;   // ms
  queue: Track[];
  index: number;
  play: (track?: Track) => Promise<void>;
  pause: () => Promise<void>;
  toggle: () => Promise<void>;
  seekTo: (ms: number) => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  setQueue: (tracks: Track[], startIndex?: number) => Promise<void>;
};

const Ctx = createContext<Ctx>({} as any);
export const useAudio = () => useContext(Ctx);

const toSource = (input: any) => (typeof input === 'string' ? { uri: input } : input);

export const AudioProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  console.log('[AudioContext] loaded', __AUDIO_CTX_DEBUG_ID);

  const soundRef = useRef<Audio.Sound | null>(null);
  const pollRef = useRef<NodeJS.Timer | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [position, setPosition]     = useState(0);
  const [duration, setDuration]     = useState(0);
  const [queue, setQueueState]      = useState<Track[]>(TRACKS);
  const [index, setIndex]           = useState(0);

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

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  const handleStatus = useCallback((st: any) => {
    if (!st || !st.isLoaded) return;
    setIsPlaying(!!st.isPlaying);
    setPosition(st.positionMillis ?? 0);
    setDuration(st.durationMillis ?? 0);
    if ((st as any).didJustFinish) next();
    // console.log('[AV]', st.positionMillis, st.durationMillis, st.isPlaying);
  }, []);

  const unload = useCallback(async () => {
    stopPolling();
    if (soundRef.current) {
      try { await soundRef.current.unloadAsync(); } catch {}
      soundRef.current.setOnPlaybackStatusUpdate(null);
      soundRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      if (!soundRef.current) return;
      try {
        const st = await soundRef.current.getStatusAsync();
        handleStatus(st);
      } catch {}
    }, 250);
  }, [handleStatus]);

  const loadAndPlay = useCallback(async (track: Track) => {
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

    // ดันสถานะแรกเข้าเลย กัน 0:00 ค้าง
    handleStatus(status);

    startPolling();
    try { await sound.playAsync(); } catch {}
  }, [handleStatus, startPolling, unload]);

  const setQueue = useCallback(async (tracks: Track[], startIndex: number = 0) => {
    setQueueState(tracks);
    setIndex(startIndex);
    if (tracks[startIndex]) await loadAndPlay(tracks[startIndex]);
  }, [loadAndPlay]);

  const play = useCallback(async (track?: Track) => {
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

  const pause = useCallback(async () => { if (soundRef.current) await soundRef.current.pauseAsync(); }, []);
  const toggle = useCallback(async () => {
    if (!soundRef.current) { if (currentTrack) await loadAndPlay(currentTrack); return; }
    const st = await soundRef.current.getStatusAsync();
    if (st.isLoaded) st.isPlaying ? await soundRef.current.pauseAsync() : await soundRef.current.playAsync();
  }, [currentTrack, loadAndPlay]);

  const seekTo = useCallback(async (ms: number) => { if (soundRef.current) await soundRef.current.setPositionAsync(ms); }, []);
  const next = useCallback(async () => {
    const list = queue.length ? queue : TRACKS;
    const ni = (index + 1) % list.length;
    setIndex(ni); await loadAndPlay(list[ni]);
  }, [index, queue, loadAndPlay]);
  const previous = useCallback(async () => {
    if (position > 3000 && soundRef.current) { await soundRef.current.setPositionAsync(0); return; }
    const list = queue.length ? queue : TRACKS;
    const pi = (index - 1 + list.length) % list.length;
    setIndex(pi); await loadAndPlay(list[pi]);
  }, [index, queue, position, loadAndPlay]);

  useEffect(() => () => { unload(); }, [unload]);

  return (
    <Ctx.Provider value={{ currentTrack, isPlaying, position, duration, queue, index,
      play, pause, toggle, seekTo, next, previous, setQueue }}>
      {children}
    </Ctx.Provider>
  );
};
