import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AudioProvider } from './src/context/AudioContext';
import NowPlayingScreen from './src/screens/NowPlayingScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AudioProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="NowPlaying" component={NowPlayingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AudioProvider>
  );
}
