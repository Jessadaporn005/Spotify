import { AudioProvider, __AUDIO_CTX_DEBUG_ID } from '@/src/context/AudioContext';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
console.log('[Layout] provider from', __AUDIO_CTX_DEBUG_ID);
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AudioProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AudioProvider>
    </SafeAreaProvider>
  );
}
