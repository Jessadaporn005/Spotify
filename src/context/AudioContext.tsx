// src/context/AudioContext.tsx
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import type { Track } from '../data/tracks';
import { TRACKS } from '../data/tracks';

type Ctx = {
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number;   // ms
  duration: number;   // ms
  volume: number;
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

const Context = createContext<Ctx>({
  currentTrack: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  volume: 1,
  queue: [],
  index: 0,
  play: async () => {},
  pause: async () => {},
  toggle: async () => {},
  seekTo: async () => {},
  next: async () => {},
  previous: async () => {},
  setQueue: async () => {},
});

export const useAudio = () => useContext(Context);

export const AudioProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const soundRef = useRef<Audio.Sound | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume] = useState(1);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [index, setIndex] = useState(0);

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

  const handleStatus = useCallback((st: any) => {
  if (!st || !st.isLoaded) return;
  setIsPlaying(!!st.isPlaying);
  setPosition(st.positionMillis ?? 0);
  setDuration(st.durationMillis ?? 0);
  // ถ้าจบเพลงแล้วให้เล่นถัดไป (อยากได้แบบ Spotify)
  // if (st.didJustFinish) next();
}, []);


  const unload = useCallback(async () => {
    if (soundRef.current) {
      try { await soundRef.current.unloadAsync(); } catch {}
      soundRef.current.setOnPlaybackStatusUpdate(null);
      soundRef.current = null;
    }
  }, []);

  const loadAndPlay = useCallback(async (track: Track) => {
  // รีเซ็ต UI ให้ไม่ค้างค่าเพลงเก่า
  setCurrentTrack(track);
  setPosition(0);
  setDuration(0);

  await unload();

  const { sound, status } = await Audio.Sound.createAsync(
    track.uri,
    {
      shouldPlay: true,
      volume,
      progressUpdateIntervalMillis: 250,
    },
    handleStatus // สมัคร callback ตั้งแต่ 'สร้าง'
  );

  soundRef.current = sound;
   handleStatus(status);
    try {
      await sound.setOnPlaybackStatusUpdate(handleStatus);
      await sound.setProgressUpdateIntervalAsync(250);
      // บางเครื่องจะไม่เริ่มถ้าตั้ง callback ทีหลัง — call play ซ้ำอีกรอบเป็น safe-guard
      await sound.playAsync();
    } catch {}
  }, [handleStatus, unload, volume]);

  const setQueue = useCallback(async (tracks: Track[], startIndex: number = 0) => {
    setQueueState(tracks);
    setIndex(startIndex);
    const t = tracks[startIndex];
    if (t) await loadAndPlay(t);
  }, [loadAndPlay]);

  const play = useCallback(async (track?: Track) => {
    if (track) {
      const list = queue.length ? queue : TRACKS;
      const i = list.findIndex(t => t.id === track.id);
      if (i >= 0) {
        setIndex(i);
        await loadAndPlay(list[i]);
      } else {
        await setQueue([track], 0);
      }
      return;
    }
    if (soundRef.current) await soundRef.current.playAsync();
    else if (currentTrack) await loadAndPlay(currentTrack);
  }, [currentTrack, queue, loadAndPlay, setQueue]);

  const pause = useCallback(async () => {
    if (soundRef.current) await soundRef.current.pauseAsync();
  }, []);

  const toggle = useCallback(async () => {
    if (!soundRef.current) {
      if (currentTrack) await loadAndPlay(currentTrack);
      return;
    }
    const st = await soundRef.current.getStatusAsync();
    if (st.isLoaded) {
      if (st.isPlaying) await soundRef.current.pauseAsync();
      else await soundRef.current.playAsync();
    }
  }, [currentTrack, loadAndPlay]);

  const seekTo = useCallback(async (ms: number) => {
    if (soundRef.current) await soundRef.current.setPositionAsync(ms);
  }, []);

  const next = useCallback(async () => {
    const list = queue.length ? queue : TRACKS;
    const ni = (index + 1) % list.length;
    setIndex(ni);
    await loadAndPlay(list[ni]);
  }, [index, queue, loadAndPlay]);

  const previous = useCallback(async () => {
    if (position > 3000 && soundRef.current) {
      await soundRef.current.setPositionAsync(0);
      return;
    }
    const list = queue.length ? queue : TRACKS;
    const pi = (index - 1 + list.length) % list.length;
    setIndex(pi);
    await loadAndPlay(list[pi]);
  }, [index, queue, position, loadAndPlay]);

  useEffect(() => () => { unload(); }, [unload]);

  return (
    <Context.Provider
      value={{
        currentTrack, isPlaying, position, duration, volume,
        queue, index,
        play, pause, toggle, seekTo, next, previous, setQueue,
      }}
    >
      {children}
    </Context.Provider>
  );
};
