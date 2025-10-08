import MiniPlayer from '@/src/components/MiniPlayer';
import { AudioProvider, __AUDIO_CTX_DEBUG_ID } from '@/src/context/AudioContext';
import { ToastProvider } from '@/src/context/ToastContext';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
console.log('[Layout] provider from', __AUDIO_CTX_DEBUG_ID);
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AudioProvider>
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <MiniPlayer/>
        </ToastProvider>
      </AudioProvider>
    </SafeAreaProvider>
  );
}
