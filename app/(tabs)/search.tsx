import { TRACKS } from '@/src/data/tracks';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Search() {
  const [q, setQ] = useState('');
  const router = useRouter();
  const data = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return TRACKS;
    return TRACKS.filter(t => t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query));
  }, [q]);
  return (
    <View style={{ flex:1, backgroundColor:'#121212', paddingTop: 50 }}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="ค้นหาเพลงหรือศิลปิน"
        placeholderTextColor="#666"
        style={{ backgroundColor:'#1e1e1e', marginHorizontal:16, borderRadius:12, paddingHorizontal:14, paddingVertical:12, color:'#fff', fontSize:16 }}
      />
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname:'/now-playing', params:{ id: item.id } })}
            style={{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingVertical:10 }}
            activeOpacity={0.8}
          >
            <Image source={item.artwork} style={{ width:54, height:54, borderRadius:8, marginRight:12 }} />
            <View style={{ flex:1 }}>
              <Text style={{ color:'#fff', fontWeight:'700' }}>{item.title}</Text>
              <Text style={{ color:'#999', fontSize:12 }}>{item.artist}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height:4 }} />}
        style={{ marginTop:18 }}
      />
    </View>
  );
}
