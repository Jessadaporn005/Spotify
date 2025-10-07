import { TrackId, TRACKS_BY_ID } from '@/src/data/tracks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type FavoritesState = {
  favorites: Set<TrackId>;
  loaded: boolean;
  isFavorite: (id: TrackId) => boolean;
  toggleFavorite: (id: TrackId) => void;
  getAll: () => { id: TrackId; title: string; artist: string; artwork: any }[];
};

const STORAGE_KEY = 'fav:v1';

export const useFavorites = create<FavoritesState>((set, get) => ({
  favorites: new Set<TrackId>(),
  loaded: false,
  isFavorite: (id) => get().favorites.has(id),
  toggleFavorite: (id) => {
    const fav = new Set(get().favorites);
    fav.has(id) ? fav.delete(id) : fav.add(id);
    set({ favorites: fav });
    // persist
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...fav])).catch(() => {});
  },
  getAll: () => [...get().favorites].map(id => TRACKS_BY_ID[id]).filter(Boolean),
}));

// Load once
AsyncStorage.getItem(STORAGE_KEY).then(raw => {
  if (!raw) return;
  try {
    const arr: TrackId[] = JSON.parse(raw);
    useFavorites.setState({ favorites: new Set(arr), loaded: true });
  } catch {}
}).finally(() => {
  useFavorites.setState({ loaded: true });
});
