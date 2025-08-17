import { Feather, Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAudio } from '../context/AudioContext';
import { getTrack } from '../data/tracks';

const fmt = (ms: number) => {
  const sec = Math.floor((ms ?? 0) / 1000);
  const m = Math.floor(sec / 60).toString();
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function NowPlayingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const wantedId = (params.id as string) ?? 'T1';

  // track จาก route (ใช้เปิดครั้งแรก)
  const tr = useMemo(() => getTrack(wantedId), [wantedId]);

  const {
    currentTrack,
    play, toggle, isPlaying,
    position, duration, seekTo,
    next, previous,
  } = useAudio();

  // ให้ UI อ้างอิงเพลงที่กำลังเล่นจริงก่อนเสมอ
  const display = currentTrack ?? tr;

  // เปิดเพลงตาม id เมื่อเข้าหน้า
  useEffect(() => {
    if (tr && (!currentTrack || currentTrack.id !== tr.id)) play(tr);
  }, [tr?.id]);

  // --- Slider state: ทำให้ลากลื่น และรีเซ็ตตอนเปลี่ยนเพลง ---
  const [drag, setDrag] = useState<number | null>(null);
  const progress = drag ?? position;
  useEffect(() => { setDrag(null); }, [display?.id]); // เปลี่ยนเพลงแล้วล้างค่า drag

  if (!display) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>ไม่พบเพลงที่ต้องการ</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#3b5746', '#121212']} style={styles.container}>
      {/* header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color="#d1ead6" />
        </TouchableOpacity>
        <View>
          <Text style={styles.subtle}>กำลังเล่นจากเพลย์ลิสต์</Text>
          <Text style={styles.playlistName} numberOfLines={1}>โหมดวิทยุ ใจเกเร</Text>
        </View>
        <Feather name="more-vertical" size={22} color="#d1ead6" />
      </View>

      {/* artwork */}
      <View style={{ padding: 16, paddingTop: 24 }}>
        <Image
          key={`art-${display.id}`} // รี-mount เมื่อเปลี่ยนเพลง
          source={display.artwork}
          style={{ width: '100%', aspectRatio: 1, borderRadius: 16 }}
        />
      </View>

      {/* song title + actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }} numberOfLines={1}>
            {display.title}
          </Text>
          <Text style={{ color: '#cfcfcf', fontSize: 16, marginTop: 2 }} numberOfLines={1}>
            {display.artist}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
          <Feather name="x" size={28} color="#fff" style={{ marginRight: 18 }} />
          <Feather name="plus-circle" size={28} color="#fff" />
        </View>
      </View>

      {/* progress */}
      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <Slider
          key={`slider-${display.id}`}           // รี-mount เมื่อเปลี่ยนเพลง
          minimumValue={0}
          maximumValue={Math.max(duration, 1)}   // กันกรณี duration=0 ชั่วคราว
          value={progress}
          onSlidingStart={() => setDrag(progress)}
          onValueChange={(v) => setDrag(v)}
          onSlidingComplete={(v) => { setDrag(null); seekTo(v); }}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="rgba(255,255,255,0.3)"
          thumbTintColor="#fff"
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{fmt(progress)}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{fmt(duration)}</Text>
        </View>
      </View>

      {/* controls */}
      <View style={{ marginTop: 8, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Feather name="shuffle" size={22} color="#1ED760" />
        <TouchableOpacity onPress={previous} activeOpacity={0.8}>
          <Feather name="skip-back" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggle}
          style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}
          activeOpacity={0.9}
        >
          <Feather name={isPlaying ? 'pause' : 'play'} size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={next} activeOpacity={0.8}>
          <Feather name="skip-forward" size={28} color="#fff" />
        </TouchableOpacity>
        <Feather name="clock" size={22} color="#fff" />
      </View>

      {/* bottom row */}
      <View style={{ marginTop: 10, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Feather name="cast" size={22} color="#d1ead6" />
        <Feather name="share-2" size={22} color="#d1ead6" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    marginTop: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtle: { color: '#d1ead6', opacity: 0.9, fontSize: 12, textAlign: 'center' },
  playlistName: { color: '#d1ead6', fontWeight: '800', fontSize: 16, textAlign: 'center' },
});
