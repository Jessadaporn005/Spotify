import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AudioProvider } from '../src/context/AudioContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AudioProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AudioProvider>
    </SafeAreaProvider>
  );
}
