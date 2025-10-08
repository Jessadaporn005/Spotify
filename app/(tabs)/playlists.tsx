import { TRACKS } from '@/src/data/tracks';
import { usePlaylists } from '@/src/store/playlists';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
// Playlists screen (replaces old corrupted create.tsx)
import React, { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GREEN = '#1ED760';
const PURPLE = '#9D4EDD';
const PINK = '#E85D75';

export default function PlaylistsScreen() {
  const insets = useSafeAreaInsets();
  const { createPlaylist, addTrack, removeTrack, playlists, order, renamePlaylist, deletePlaylist } = usePlaylists();
  const params = useLocalSearchParams<{ open?: string }>();
  const [newName, setNewName] = useState('');
  const [openId, setOpenId] = useState<string>((params.open as string) || order[0]);

  const openPlaylist = openId ? playlists[openId] : undefined;
  const orderedPlaylists = useMemo(() => order.map(id => playlists[id]).filter(Boolean), [order, playlists]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createPlaylist(newName.trim());
    setNewName('');
    setOpenId(id);
  };

  return (
    <LinearGradient colors={['#141414', '#0D1117']} style={[styles.container, { paddingTop: insets.top + 4 }]}>      
      <View style={styles.header}>        
        <Text style={styles.title}>เพลย์ลิสต์</Text>
        <Ionicons name="musical-notes" size={26} color={GREEN} />
      </View>

      <View style={styles.createWrapper}>        
        <LinearGradient colors={[PURPLE, PINK]} style={styles.banner}>          
          <Ionicons name="add" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.bannerText}>สร้างเพลย์ลิสต์ใหม่</Text>
        </LinearGradient>
        <View style={styles.inputRow}>          
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="ชื่อเพลย์ลิสต์"
            placeholderTextColor="#666"
            style={styles.input}
          />
          <TouchableOpacity style={[styles.confirmBtn, { opacity: newName.trim() ? 1 : 0.4 }]} disabled={!newName.trim()} onPress={handleCreate}>
            <LinearGradient colors={[GREEN, '#32E875']} style={styles.confirmGradient}>
              <Ionicons name="checkmark" size={18} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        horizontal
        data={orderedPlaylists}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.tabs}
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 58 }}
        renderItem={({ item }) => {
          const active = item.id === openId;
          const Comp: any = active ? LinearGradient : View;
          return (
            <TouchableOpacity onPress={() => setOpenId(item.id)}>
              <Comp {...(active ? { colors: [GREEN, '#32E875'], style: styles.activeTab } : { style: styles.inactiveTab })}>
                <Text style={active ? styles.activeTabText : styles.inactiveTabText}>{item.name}</Text>
              </Comp>
            </TouchableOpacity>
          );
        }}
      />

      {openPlaylist ? (
        <View style={styles.body}>          
          <LinearGradient colors={[PURPLE, PINK]} style={styles.editHeader}>
            <Ionicons name="create" size={18} color="#fff" />
            <Text style={styles.editHeaderText}>แก้ไข: {openPlaylist.name}</Text>
          </LinearGradient>

          <View style={styles.renameRow}>            
            <TextInput
              value={openPlaylist.name}
              onChangeText={(t) => renamePlaylist(openPlaylist.id, t)}
              style={styles.renameInput}
            />
            <TouchableOpacity onPress={() => { deletePlaylist(openPlaylist.id); setOpenId(order.filter(i => i !== openPlaylist.id)[0] || ''); }}>
              <LinearGradient colors={['#FF6B6B', '#FF3B30']} style={styles.deleteBtn}>                
                <Ionicons name="trash" color="#fff" size={16} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <FlatList
            data={TRACKS}
            keyExtractor={t => t.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const included = openPlaylist.trackIds.includes(item.id as any);
              return (
                <TouchableOpacity onPress={() => included ? removeTrack(openPlaylist.id, item.id as any) : addTrack(openPlaylist.id, item.id as any)} style={styles.trackRow}>
                  <LinearGradient colors={['#222', '#151515']} style={styles.artWrapper}>
                    <Image source={item.artwork} style={styles.art} />
                  </LinearGradient>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
                  </View>
                  <View style={[styles.addChip, { backgroundColor: included ? '#FF4D61' : GREEN }]}>                    
                    <Text style={styles.addChipText}>{included ? 'ลบ' : 'เพิ่ม'}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : (
        <View style={styles.empty}>          
          <Text style={styles.emptyText}>ยังไม่มีเพลย์ลิสต์</Text>
          <Text style={styles.emptySub}>สร้างอันแรกด้านบนเลย</Text>
        </View>
      )}

      <View style={{ height: 90 }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 10 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800' },
  createWrapper: { paddingHorizontal: 18, marginBottom: 16 },
  banner: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width:0, height:4 }, shadowOpacity:0.3, shadowRadius:8 },
  bannerText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  inputRow: { flexDirection: 'row', gap: 12 },
  input: { flex: 1, backgroundColor: '#1e1e1e', borderRadius: 14, paddingHorizontal: 16, color: '#fff', fontSize: 16 },
  confirmBtn: { borderRadius: 14, overflow: 'hidden' },
  confirmGradient: { paddingHorizontal: 18, paddingVertical: 12, justifyContent: 'center', alignItems: 'center' },
  tabs: { paddingHorizontal: 16, paddingVertical: 6, gap: 10, alignItems: 'center' },
  activeTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  inactiveTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: '#1f1f1f' },
  activeTabText: { color: '#000', fontWeight: '700' },
  inactiveTabText: { color: '#fff', fontWeight: '600' },
  body: { flex: 1, paddingTop: 10 },
  editHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 16, borderRadius: 14, marginBottom: 12 },
  editHeaderText: { color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 6 },
  renameRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  renameInput: { flex: 1, backgroundColor: '#1e1e1e', borderRadius: 10, paddingHorizontal: 12, color: '#fff' },
  deleteBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  trackRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  artWrapper: { width: 54, height: 54, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  art: { width: 52, height: 52, borderRadius: 11 },
  trackTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  trackArtist: { color: '#888', fontSize: 12, marginTop: 2 },
  addChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  addChipText: { color: '#000', fontWeight: '700', fontSize: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 18, fontWeight: '700' },
  emptySub: { color: '#444', fontSize: 14, marginTop: 4 },
});