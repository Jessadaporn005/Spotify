import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type ThemeState = {
  theme: 'dark' | 'light' | 'auto';
  actualTheme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light' | 'auto') => void;
};

export const useTheme = create<ThemeState>((set, get) => ({
  theme: 'dark',
  actualTheme: 'dark',
  setTheme: (theme) => {
    const actualTheme = theme === 'auto' ? 'dark' : theme; // ในเดโม่ใช้ dark เป็นค่าเริ่มต้น
    set({ theme, actualTheme });
    AsyncStorage.setItem('theme', theme).catch(() => {});
  },
}));

// Load persisted theme
AsyncStorage.getItem('theme').then(theme => {
  if (theme === 'dark' || theme === 'light' || theme === 'auto') {
    useTheme.getState().setTheme(theme);
  }
}).catch(() => {});