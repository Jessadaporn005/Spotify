import { TRACKS } from '@/src/data/tracks';
import { usePlaylists } from '@/src/store/playlists';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Create() {
  const { createPlaylist, addTrack, removeTrack, playlists, order, renamePlaylist, deletePlaylist } = usePlaylists();
  const [name, setName] = useState('');
  const params = useLocalSearchParams<{ open?: string }>();
  const [openId, setOpenId] = useState<string>((params.open as string) || order[0]);

  const openPlaylist = openId ? playlists[openId] : undefined;

  const handleCreate = () => {
    if (!name.trim()) return;
  createPlaylist(name.trim());
  setName('');
  };

  return (
    <View style={{ flex:1, backgroundColor:'#121212', paddingTop:50 }}>
      <Text style={{ color:'#fff', fontSize:24, fontWeight:'800', paddingHorizontal:16 }}>สร้างเพลย์ลิสต์</Text>
      <View style={{ flexDirection:'row', paddingHorizontal:16, marginTop:12, gap:8 }}>
        <TextInput
          value={name}
            onChangeText={setName}
            placeholder="ตั้งชื่อเพลย์ลิสต์"
            placeholderTextColor="#666"
            style={{ flex:1, backgroundColor:'#1e1e1e', borderRadius:10, paddingHorizontal:12, paddingVertical:10, color:'#fff' }}
        />
        <TouchableOpacity onPress={handleCreate} style={{ backgroundColor:'#1ED760', paddingHorizontal:16, borderRadius:10, alignItems:'center', justifyContent:'center' }}>
          <Text style={{ fontWeight:'700' }}>เพิ่ม</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={order.map(id => playlists[id])}
        keyExtractor={p => p.id}
        style={{ marginTop:18, maxHeight:60 }}
        contentContainerStyle={{ paddingHorizontal:16, gap:10, alignItems:'center' }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setOpenId(item.id)}>
            <View style={{ paddingHorizontal:14, paddingVertical:8, borderRadius:999, backgroundColor: item.id === openId ? '#1ED760' : '#1e1e1e' }}>
              <Text style={{ color: item.id === openId ? '#000' : '#fff', fontWeight:'600' }}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      {openPlaylist ? (
        <View style={{ flex:1 }}>
          <Text style={{ color:'#fff', fontSize:18, fontWeight:'700', marginTop:20, paddingHorizontal:16 }}>แก้ไข “{openPlaylist.name}”</Text>
          <View style={{ flexDirection:'row', paddingHorizontal:16, marginTop:8, gap:8 }}>
            <TextInput
              value={openPlaylist.name}
              onChangeText={(t) => renamePlaylist(openPlaylist.id, t)}
              style={{ flex:1, backgroundColor:'#1e1e1e', borderRadius:8, paddingHorizontal:10, color:'#fff' }}
            />
            <TouchableOpacity onPress={() => { deletePlaylist(openPlaylist.id); setOpenId(order.filter(i=>i!==openPlaylist.id)[0] || ''); }} style={{ backgroundColor:'#ff4d4f', borderRadius:8, paddingHorizontal:12, justifyContent:'center' }}>
              <Text style={{ color:'#fff', fontWeight:'700' }}>ลบ</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={TRACKS}
            keyExtractor={i => i.id}
            style={{ marginTop:8 }}
            renderItem={({ item }) => {
              const included = openPlaylist.trackIds.includes(item.id as any);
              return (
                <TouchableOpacity
                  onPress={() => { if (!included) addTrack(openPlaylist.id, item.id as any); else removeTrack(openPlaylist.id, item.id as any); }}
                  style={{ flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingVertical:10 }}
                >
                  <Image source={item.artwork} style={{ width:50, height:50, borderRadius:8, marginRight:12 }} />
                  <View style={{ flex:1 }}>
                    <Text style={{ color:'#fff', fontWeight:'700' }}>{item.title}</Text>
                    <Text style={{ color:'#888', fontSize:12 }}>{item.artist}</Text>
                  </View>
                  <Text style={{ color: included ? '#ff6767' : '#1ED760', fontSize:12 }}>{included ? 'ลบ' : 'เพิ่ม'}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : (
        <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
          <Text style={{ color:'#555' }}>ยังไม่มีเพลย์ลิสต์ – สร้างด้านบน</Text>
        </View>
      )}
    </View>
  );
}
