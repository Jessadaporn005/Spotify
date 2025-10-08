import { useAudio } from '@/src/context/AudioContext';
import { TRACKS } from '@/src/data/tracks';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Simple dynamic Daily Mixes concept (virtual auto playlists)
interface Mix { id: string; name: string; color: [string,string]; tracks: typeof TRACKS; }

export default function DailyMixesScreen() {
  const insets = useSafeAreaInsets();
  const { setQueue, play } = useAudio();

  const mixes = useMemo<Mix[]>(() => {
    const shuffled = [...TRACKS].sort(() => Math.random() - 0.5);
    const chunk = (arr: any[], size: number) => arr.reduce((acc, cur, i) => { const idx = Math.floor(i/size); acc[idx] = acc[idx] || []; acc[idx].push(cur); return acc; }, [] as any[][]);
    const groups = chunk(shuffled, Math.max(3, Math.ceil(TRACKS.length/3))).slice(0,3);
    const palettes: [string,string][] = [ ['#4ECDC4','#1A535C'], ['#9D4EDD','#3A0CA3'], ['#FF6B6B','#E85D75'] ];
    return groups.map((g: typeof TRACKS, i: number) => ({ id:'mix'+i, name:`Daily Mix ${i+1}`, color: palettes[i%palettes.length], tracks: g as any }));
  }, []);

  const handlePlay = async (mix: Mix) => { await setQueue(mix.tracks, 0); await play(mix.tracks[0]); };

  return (
    <LinearGradient colors={['#1A1A1A','#0D1117']} style={[styles.container,{ paddingTop: insets.top }]}> 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <Text style={styles.title}>Daily Mixes</Text>
        <Text style={styles.subtitle}>รวมเพลงอัตโนมัติจากคลังของคุณ เปลี่ยนใหม่ทุกครั้งที่เปิดหน้านี้</Text>
        <View style={styles.grid}>
          {mixes.map(mix => (
            <TouchableOpacity key={mix.id} style={styles.card} activeOpacity={0.85} onPress={() => handlePlay(mix)}>
              <LinearGradient colors={mix.color} style={styles.cardGradient}>
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap:4, marginBottom:12 }}>
                  {mix.tracks.slice(0,4).map(t => (
                    <Image key={t.id} source={t.artwork} style={styles.thumb} />
                  ))}
                </View>
                <Text style={styles.cardTitle}>{mix.name}</Text>
                <Text style={styles.count}>{mix.tracks.length} เพลง</Text>
                <View style={styles.playFab}><Ionicons name='play' size={16} color='#000' /></View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex:1 },
  title: { color:'#fff', fontSize:32, fontWeight:'800', paddingHorizontal:18, marginTop:8 },
  subtitle: { color:'#aaa', fontSize:14, paddingHorizontal:18, marginTop:4, marginBottom:16, lineHeight:20 },
  grid: { flexDirection:'row', flexWrap:'wrap', paddingHorizontal:14, gap:14 },
  card: { width:'46%', borderRadius:20, overflow:'hidden' },
  cardGradient: { padding:14, borderRadius:20, minHeight:190, justifyContent:'flex-start' },
  thumb: { width:48, height:48, borderRadius:8 },
  cardTitle: { color:'#fff', fontWeight:'700', fontSize:16 },
  count: { color:'#f1f1f1', opacity:0.85, fontSize:12, marginTop:4, marginBottom:10 },
  playFab: { position:'absolute', right:12, bottom:12, backgroundColor:'#1ED760', width:36, height:36, borderRadius:18, justifyContent:'center', alignItems:'center', elevation:4 }
});
