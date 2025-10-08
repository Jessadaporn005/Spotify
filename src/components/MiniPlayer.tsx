import { useAudio } from '@/src/context/AudioContext';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, toggle, next, position, duration } = useAudio();
  const router = useRouter();
  if (!currentTrack) return null;
  const progress = duration ? position / duration : 0;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/now-playing', params: { id: currentTrack.id } })}
      style={{ position: 'absolute', left: 12, right: 12, bottom: 40 }}
    >
      <LinearGradient
        colors={['#222222EE', '#111111EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 14, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}
      >
        <Image source={currentTrack.artwork} style={{ width: 48, height: 48, borderRadius: 8 }} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{currentTrack.title}</Text>
          <Text numberOfLines={1} style={{ color: '#b3b3b3', fontSize: 12 }}>{currentTrack.artist}</Text>
          <View style={{ height: 4, backgroundColor: '#333', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
            <View style={{ width: `${Math.min(100, progress * 100)}%`, backgroundColor: '#1ED760', height: '100%' }} />
          </View>
        </View>
        <Pressable onPress={(e) => { e.stopPropagation(); toggle(); }} style={{ padding: 8 }}>
          <Feather name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
        </Pressable>
        <Pressable onPress={(e) => { e.stopPropagation(); next(); }} style={{ padding: 8 }}>
          <Feather name="skip-forward" size={22} color="#fff" />
        </Pressable>
      </LinearGradient>
    </Pressable>
  );
}