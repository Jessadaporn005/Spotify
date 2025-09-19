import { useAudio } from '@/src/context/AudioContext';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, toggle, next } = useAudio();
  const router = useRouter();
  if (!currentTrack) return null;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/now-playing', params: { id: currentTrack.id } })}
      style={{
        position: 'absolute', left: 12, right: 12, bottom: 40,
        backgroundColor: '#070707ff', borderRadius: 12, padding: 10,
        flexDirection: 'row', alignItems: 'center', gap: 10
      }}
    >
      <Image source={currentTrack.artwork} style={{ width: 44, height: 44, borderRadius: 8 }} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ color: '#fff', fontWeight: '700' }}>{currentTrack.title}</Text>
        <Text numberOfLines={1} style={{ color: '#b3b3b3', fontSize: 12 }}>{currentTrack.artist}</Text>
      </View>
      <Pressable onPress={(e) => { e.stopPropagation(); toggle(); }} style={{ padding: 8 }}>
        <Feather name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
      </Pressable>
      <Pressable onPress={(e) => { e.stopPropagation(); next(); }} style={{ padding: 8 }}>
        <Feather name="skip-forward" size={22} color="#fff" />
      </Pressable>
    </Pressable>
  );
}