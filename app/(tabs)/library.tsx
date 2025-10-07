import { useAudio } from '@/src/context/AudioContext';
import { useFavorites } from '@/src/store/favorites';
import { usePlaylists } from '@/src/store/playlists';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Library() {
  const { getAll, isFavorite } = useFavorites();
  const favTracks = getAll();
  const { recent } = useAudio();
  const { playlists, order } = usePlaylists();
  const router = useRouter();

  return (
    <View style={{ flex:1, backgroundColor:'#121212', paddingTop: 40 }}>
      <Section title="รายการโปรด" empty="ยังไม่มีเพลงที่กดหัวใจ">
        {favTracks.map(t => (
          <Row key={t.id} title={t.title} subtitle={t.artist} onPress={() => router.push({ pathname:'/now-playing', params:{ id: t.id } })} active={isFavorite(t.id as any)} />
        ))}
      </Section>
      <Section title="เพิ่งเล่นล่าสุด" empty="ยังไม่มีประวัติ">
        {recent.map(t => (
          <Row key={t.id} title={t.title} subtitle={t.artist} onPress={() => router.push({ pathname:'/now-playing', params:{ id: t.id } })} />
        ))}
      </Section>
      <Section title="เพลย์ลิสต์ของฉัน" empty="ยังไม่มีเพลย์ลิสต์">
        {order.map(pid => {
          const pl = playlists[pid];
          return (
            <Row key={pl.id} title={pl.name} subtitle={`${pl.trackIds.length} เพลง`} onPress={() => router.push({ pathname:'/create', params:{ open: pl.id } })} />
          );
        })}
      </Section>
    </View>
  );
}

function Section({ title, children, empty }: { title: string; children: React.ReactNode; empty: string }) {
  const count = React.Children.count(children);
  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={{ color:'#fff', fontSize:22, fontWeight:'800', paddingHorizontal:16, marginBottom:10 }}>{title}</Text>
      {count === 0 ? <Text style={{ color:'#666', paddingHorizontal:16 }}>{empty}</Text> : children}
    </View>
  );
}

function Row({ title, subtitle, onPress, active }: { title: string; subtitle?: string; onPress?: () => void; active?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ paddingHorizontal:16, paddingVertical:10, flexDirection:'row', alignItems:'center' }}>
      <View style={{ flex:1 }}>
        <Text style={{ color:'#fff', fontWeight:'700' }}>{title}</Text>
        {subtitle ? <Text style={{ color:'#9a9a9a', fontSize:12 }}>{subtitle}</Text>: null}
      </View>
      {active ? <Text style={{ color:'#1ED760', fontSize:12 }}>♥</Text> : null}
    </TouchableOpacity>
  );
}
