import { TRACKS } from '@/src/data/tracks';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GREEN = '#1ED760';
const PURPLE = '#9D4EDD';
const PINK = '#E85D75';
const BLUE = '#4ECDC4';

export default function Search() {
  const [q, setQ] = useState('');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const data = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return TRACKS;
    return TRACKS.filter(t => t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query));
  }, [q]);

  const categories = [
    { title: 'Pop', color: [PINK, '#FF6B9D'] as const, icon: 'musical-notes' },
    { title: 'Rock', color: ['#FF4757', '#FF6B6B'] as const, icon: 'flash' },
    { title: 'Hip Hop', color: [PURPLE, '#A855F7'] as const, icon: 'disc' },
    { title: 'Electronic', color: [BLUE, '#00D9FF'] as const, icon: 'radio' },
    { title: 'Jazz', color: ['#F39C12', '#E67E22'] as const, icon: 'musical-note' },
    { title: 'Classical', color: ['#8E44AD', '#9B59B6'] as const, icon: 'library' },
  ];

  return (
    <LinearGradient colors={['#1A1A1A', '#0D1117']} style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ค้นหา</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="ค้นหาเพลงหรือศิลปิน"
            placeholderTextColor="#666"
            style={styles.searchInput}
          />
          {q.length > 0 && (
            <TouchableOpacity onPress={() => setQ('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!q.trim() ? (
        <View style={styles.content}>
          {/* Browse Categories */}
          <Text style={styles.sectionTitle}>เรียกดูตามประเภท</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.title}
                style={styles.categoryCard}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={category.color}
                  style={styles.categoryGradient}
                >
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <View style={styles.categoryIconContainer}>
                    <Ionicons name={category.icon as any} size={32} color="#fff" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname:'/now-playing', params:{ id: item.id } })}
              style={styles.resultItem}
              activeOpacity={0.8}
            >
              <View style={styles.albumArtContainer}>
                <Image source={item.artwork} style={styles.albumArt} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.albumArtOverlay}
                />
              </View>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={16} color="#000" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Space for MiniPlayer */}
      <View style={{ height: 100 }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchBar: {
    backgroundColor: '#1e1e1e',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  categoryGradient: {
    height: 120,
    padding: 16,
    justifyContent: 'space-between',
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  categoryIconContainer: {
    alignSelf: 'flex-end',
  },
  resultsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  albumArtContainer: {
    position: 'relative',
    marginRight: 16,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  albumArtOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  trackArtist: {
    color: '#999',
    fontSize: 14,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginLeft: 76,
    marginVertical: 4,
  },
});
