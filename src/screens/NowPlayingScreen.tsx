// src/screens/NowPlayingScreen.tsx
import { useAudio } from '@/src/context/AudioContext';
import { getTrack } from '@/src/data/tracks';
import { Feather, Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width } = Dimensions.get('window');

const ART_MARGIN = 16;            // ระยะขอบซ้าย/ขวา
const ART_SIZE = width - ART_MARGIN * 2;  // ขนาดสี่เหลี่ยมจัตุรัสตรงกลาง


// แปลง "มิลลิวินาที" -> "m:ss"
const fmt = (ms: number) => {
  const totalSec = Math.max(0, Math.floor((ms ?? 0) / 1000));
  const m = Math.floor(totalSec / 60).toString();
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function NowPlayingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const wantedId = (params.id as string) ?? 'T1';

  // เพลงที่ถูกส่งมาจาก route (ตอนเปิดครั้งแรก)
  const routeTrack = useMemo(() => getTrack(wantedId), [wantedId]);

  const {
    currentTrack, play, toggle, isPlaying,
    position, duration, seekTo, next, previous,
  } = useAudio();

  // เพลงที่จะแสดง ใช้ currentTrack ก่อนเสมอ (sync กับของจริง)
  const display = currentTrack ?? routeTrack;

  // เปิดเพลงตาม id เมื่อเข้าหน้า
  useEffect(() => {
    if (routeTrack && (!currentTrack || currentTrack.id !== routeTrack.id)) {
      play(routeTrack);
    }
  }, [routeTrack?.id]);

  // --- Scrub logic: ตอนลากใช้ค่า drag, ปกติใช้ position ---
  const [scrubbing, setScrubbing] = useState(false);
  const [dragMs, setDragMs] = useState<number | null>(null);
  const progressMs = scrubbing && dragMs != null ? dragMs : position;

  // เปลี่ยนเพลงเมื่อไหร่ รีเซ็ต state ลาก
  useEffect(() => {
    setScrubbing(false);
    setDragMs(null);
  }, [display?.id]);

  if (!display) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text>ไม่พบเพลง</Text>
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
          <Text style={styles.playlistName} numberOfLines={1}></Text>
        </View>
        <Feather name="more-vertical" size={22} color="#d1ead6" />
      </View>

      {/* artwork */}
      <View style={{ padding: 60, paddingTop: 24 }}>
        <Image
          key={`art-${display.id}`}         // รี-mount เมื่อเปลี่ยนเพลงให้ภาพอัปเดตชัวร์
          source={display.artwork}
          style={{ width: '100%', aspectRatio: 1, borderRadius: 16 }}
        />
      </View>

      {/* title + actions */}
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
          minimumValue={0}
          maximumValue={Math.max(duration, 1)}  // กัน duration=0 ชั่วคราว
          value={progressMs}
          onSlidingStart={() => {
            setScrubbing(true);
            setDragMs(position);               // เริ่มลากจากตำแหน่งปัจจุบัน
          }}
          onValueChange={(v) => {
            if (scrubbing) setDragMs(v);       // อัปเดตเฉพาะตอนลาก
          }}
          onSlidingComplete={(v) => {
            setScrubbing(false);
            setDragMs(null);
            seekTo(v);                          // กระโดดไปตำแหน่งที่ปล่อย
          }}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="rgba(255,255,255,0.3)"
          thumbTintColor="#fff"
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{fmt(progressMs)}</Text>
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

      <View style={{ height: 24 }} />
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
