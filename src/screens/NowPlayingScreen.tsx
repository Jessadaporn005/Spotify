// src/screens/NowPlayingScreen.tsx
import { useAudio } from '@/src/context/AudioContext';
import { getTrack } from '@/src/data/tracks';
import { useFavorites } from '@/src/store/favorites';
import { usePlaylists } from '@/src/store/playlists';
import { Feather, Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const wantedId = params.id ? (params.id as string) : 'T1';

  // เพลงที่ถูกส่งมาจาก route (ตอนเปิดครั้งแรก)
  const routeTrack = useMemo(() => {
    const trackId = wantedId.startsWith('T') ? wantedId : `T${wantedId}`; // ตรวจสอบและแปลง id
    const track = getTrack(trackId as `T${number}`); // ใช้ as เพื่อบังคับชนิด
    if (!track) {
      console.warn(`Track not found for id: ${trackId}`);
    }
    return track ?? null; // กำหนดค่าเริ่มต้นเป็น null หากไม่พบ track
  }, [wantedId]);

  const {
    currentTrack, play, toggle, isPlaying,
    position, duration, seekTo, next, previous,
    shuffle, repeatMode, toggleShuffle, cycleRepeat, volume, setVolume,
  } = useAudio();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { playlists, order, addTrack, createPlaylist, hasTrack } = usePlaylists();
  const [showPicker, setShowPicker] = useState(false);
  const [newPlName, setNewPlName] = useState('');

  // เพลงที่จะแสดง ใช้ currentTrack ก่อนเสมอ (sync กับของจริง)
  const display = currentTrack ?? routeTrack;

  // เปิดเพลงตาม id เมื่อเข้าหน้า
  useEffect(() => {
    if (routeTrack && (!currentTrack || currentTrack.id !== routeTrack.id)) {
      play(routeTrack);
    }
  }, [routeTrack, currentTrack, play]);

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
          key={`art-${display.id ?? 'default'}`}         // รี-mount เมื่อเปลี่ยนเพลงให้ภาพอัปเดตชัวร์
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
          <Ionicons
            name={isFavorite(display.id as any) ? 'heart' : 'heart-outline'}
            size={30}
            color={isFavorite(display.id as any) ? '#1ED760' : '#fff'}
            style={{ marginRight: 18 }}
            onPress={() => toggleFavorite(display.id as any)}
          />
          <Feather name="plus-circle" size={28} color="#fff" onPress={() => setShowPicker(true)} />
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
        <TouchableOpacity onPress={toggleShuffle} activeOpacity={0.7}>
          <Feather name="shuffle" size={22} color={shuffle ? '#1ED760' : '#fff'} />
        </TouchableOpacity>
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
        <TouchableOpacity onPress={cycleRepeat} activeOpacity={0.7}>
          <Ionicons name="repeat" size={26} color={repeatMode !== 'off' ? '#1ED760' : '#fff'} />
          {repeatMode === 'one' && (
            <View style={{ position:'absolute', right:-2, bottom:-2 }}>
              <Text style={{ color:'#1ED760', fontSize:10, fontWeight:'700' }}>1</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* quick actions */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24, marginTop: 16 }}>
        <TouchableOpacity onPress={() => router.push('/queue' as any)} style={{ alignItems: 'center' }}>
          <Ionicons name="list" size={24} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>คิว</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/settings' as any)} style={{ alignItems: 'center' }}>
          <Ionicons name="settings" size={24} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>ตั้งค่า</Text>
        </TouchableOpacity>
      </View>

      {/* volume */}
      <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
        <Slider
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={volume}
          onValueChange={(v) => setVolume(v)}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="rgba(255,255,255,0.3)"
          thumbTintColor="#fff"
        />
        <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
          <Text style={{ color:'#cfcfcf', fontSize:12 }}>Volume</Text>
          <Text style={{ color:'#cfcfcf', fontSize:12 }}>{Math.round(volume*100)}%</Text>
        </View>
      </View>

      {showPicker && (
        <View style={{ position:'absolute', left:0, right:0, top:0, bottom:0, backgroundColor:'rgba(0,0,0,0.75)', justifyContent:'flex-end' }}>
          <View style={{ backgroundColor:'#1e1e1e', padding:16, borderTopLeftRadius:20, borderTopRightRadius:20, maxHeight:'70%' }}>
            <Text style={{ color:'#fff', fontSize:18, fontWeight:'800', marginBottom:12 }}>เพิ่มลงเพลย์ลิสต์</Text>
            <View style={{ flexDirection:'row', marginBottom:12, gap:8 }}>
              <View style={{ flex:1, backgroundColor:'#2a2a2a', borderRadius:8 }}>
                <TextInput
                  value={newPlName}
                  onChangeText={setNewPlName}
                  placeholder="สร้างเพลย์ลิสต์ใหม่"
                  placeholderTextColor="#666"
                  style={{ paddingHorizontal:10, paddingVertical:8, color:'#fff' }}
                />
              </View>
              <TouchableOpacity
                onPress={() => { if (newPlName.trim()) { createPlaylist(newPlName.trim()); setNewPlName(''); } }}
                style={{ backgroundColor:'#1ED760', borderRadius:8, paddingHorizontal:14, justifyContent:'center' }}
              >
                <Text style={{ fontWeight:'700' }}>เพิ่ม</Text>
              </TouchableOpacity>
            </View>
            <View style={{ marginBottom:8 }}>
              <Text style={{ color:'#aaa', fontSize:12 }}>เลือกเพลย์ลิสต์</Text>
            </View>
            <View style={{ maxHeight:260 }}>
              <View>
                {order.map(pid => {
                  const pl = playlists[pid];
                  const included = hasTrack(pl.id, display.id as any);
                  return (
                    <TouchableOpacity
                      key={pl.id}
                      onPress={() => { if (!included) addTrack(pl.id, display.id as any); setShowPicker(false); }}
                      style={{ paddingVertical:10, flexDirection:'row', alignItems:'center' }}
                    >
                      <Text style={{ color:'#fff', fontWeight:'600', flex:1 }}>{pl.name}</Text>
                      <Text style={{ color: included ? '#1ED760' : '#888', fontSize:12 }}>{included ? '✓' : '+'}</Text>
                    </TouchableOpacity>
                  );
                })}
                {order.length === 0 && (
                  <Text style={{ color:'#555', fontSize:12 }}>ยังไม่มีเพลย์ลิสต์ ลองสร้างด้านบน</Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowPicker(false)} style={{ marginTop:16, alignSelf:'center' }}>
              <Text style={{ color:'#fff', fontSize:16 }}>ปิด</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

  <View style={{ height: 120 }} />
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
