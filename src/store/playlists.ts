import { TrackId, TRACKS_BY_ID } from '@/src/data/tracks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface Playlist {
  id: string;
  name: string;
  trackIds: TrackId[];
  createdAt: number;
}

interface PlaylistsState {
  playlists: Record<string, Playlist>;
  order: string[]; // ordering of playlist ids
  loaded: boolean;
  createPlaylist: (name: string) => string; // returns id
  addTrack: (playlistId: string, trackId: TrackId) => void;
  removeTrack: (playlistId: string, trackId: TrackId) => void;
  deletePlaylist: (playlistId: string) => void;
  getPlaylistTracks: (playlistId: string) => any[];
  renamePlaylist: (playlistId: string, name: string) => void;
  hasTrack: (playlistId: string, trackId: TrackId) => boolean;
}

const STORAGE_KEY = 'playlists:v1';

const persist = (state: PlaylistsState) => {
  const data = JSON.stringify({ playlists: state.playlists, order: state.order });
  AsyncStorage.setItem(STORAGE_KEY, data).catch(() => {});
};

export const usePlaylists = create<PlaylistsState>((set, get) => ({
  playlists: {},
  order: [],
  loaded: false,
  createPlaylist: (name) => {
    const id = 'pl_' + Math.random().toString(36).slice(2, 9);
    set(s => {
      const playlists = { ...s.playlists, [id]: { id, name, trackIds: [], createdAt: Date.now() } };
      const order = [id, ...s.order];
      const newState = { ...s, playlists, order } as PlaylistsState;
      persist(newState);
      return newState;
    });
    return id;
  },
  addTrack: (playlistId, trackId) => {
    set(s => {
      const pl = s.playlists[playlistId];
      if (!pl) return s;
      if (!pl.trackIds.includes(trackId)) pl.trackIds = [...pl.trackIds, trackId];
      const playlists = { ...s.playlists, [playlistId]: { ...pl } };
      const newState = { ...s, playlists } as PlaylistsState;
      persist(newState);
      return newState;
    });
  },
  removeTrack: (playlistId, trackId) => {
    set(s => {
      const pl = s.playlists[playlistId];
      if (!pl) return s;
      pl.trackIds = pl.trackIds.filter(id => id !== trackId);
      const playlists = { ...s.playlists, [playlistId]: { ...pl } };
      const newState = { ...s, playlists } as PlaylistsState;
      persist(newState);
      return newState;
    });
  },
  renamePlaylist: (playlistId, name) => {
    set(s => {
      const pl = s.playlists[playlistId]; if (!pl) return s;
      const playlists = { ...s.playlists, [playlistId]: { ...pl, name } };
      const newState = { ...s, playlists } as PlaylistsState; persist(newState); return newState;
    });
  },
  deletePlaylist: (playlistId) => {
    set(s => {
      if (!s.playlists[playlistId]) return s;
      const playlists = { ...s.playlists };
      delete playlists[playlistId];
      const order = s.order.filter(id => id !== playlistId);
      const newState = { ...s, playlists, order } as PlaylistsState;
      persist(newState);
      return newState;
    });
  },
  getPlaylistTracks: (playlistId) => {
    const pl = get().playlists[playlistId];
    if (!pl) return [];
    return pl.trackIds.map(id => TRACKS_BY_ID[id]).filter(Boolean);
  },
  hasTrack: (playlistId, trackId) => {
    const pl = get().playlists[playlistId];
    return !!pl && pl.trackIds.includes(trackId);
  },
}));

// Load persisted
AsyncStorage.getItem(STORAGE_KEY).then(raw => {
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    usePlaylists.setState({ playlists: parsed.playlists || {}, order: parsed.order || [], loaded: true });
  } catch {}
}).finally(() => usePlaylists.setState({ loaded: true }));
