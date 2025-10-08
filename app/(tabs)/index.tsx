import { LISTS, mapListToTracks } from '@/src/data/tracks';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD = 150;
const SPACING = 16;
const GREEN = '#1ED760';
const SURFACE = '#1E1E1E';
const TEXT = '#FFFFFF';
const SUB = '#B3B3B3';

const filters = ['ทั้งหมด', 'เพลง', 'พอดแคสต์'];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState('ทั้งหมด');

  const quick = mapListToTracks(LISTS.quickPicks);
  const albums = mapListToTracks(LISTS.albums);
  const stations = mapListToTracks(LISTS.stations);
  const lastlist = mapListToTracks(LISTS.lastlist);

  return (
    <LinearGradient 
      colors={['#1A1A1A', '#0D1117']} 
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good evening</Text>
          <TouchableOpacity style={styles.profileButton}>
            <LinearGradient
              colors={['#9D4EDD', '#E85D75']}
              style={styles.profileGradient}
            >
              <Ionicons name="person" size={16} color={TEXT} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Filter Row */}
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, active === f && styles.chipActive]}
              onPress={() => setActive(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active === f && styles.chipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Picks */}
        <SectionHeader title="Quick Picks" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING }}
        >
          {quick.map((t, index) => (
            <TouchableOpacity
              key={t.listItemId}
              style={[styles.quickCard, { marginLeft: index === 0 ? 0 : 8 }]}
              activeOpacity={0.85}
              onPress={() =>
                router.push({ pathname: '/now-playing', params: { id: t.id } })
              }
            >
              <Image source={t.artwork} style={styles.quickThumb} />
              <Text style={styles.quickTitle} numberOfLines={2}>
                {t.title}
              </Text>
              <View style={styles.playButton}>
                <Ionicons name="play" size={12} color="#000" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Albums */}
        <SectionHeader title="อัลบั้มและซิงเกิลยอดนิยม" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING }}
        >
          {albums.map((t, index) => (
            <TouchableOpacity
              key={t.listItemId}
              style={[styles.card, { marginLeft: index === 0 ? 0 : 12 }]}
              activeOpacity={0.85}
              onPress={() =>
                router.push({ pathname: '/now-playing', params: { id: t.id } })
              }
            >
              <Image source={t.artwork} style={styles.art} />
              <Text style={styles.cardTitle} numberOfLines={1}>{t.title}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>{t.artist}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stations */}
        <SectionHeader title="สถานีวิทยุยอดนิยม" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING }}
        >
          {stations.map((t, index) => (
            <TouchableOpacity
              key={t.listItemId}
              style={[styles.card, { marginLeft: index === 0 ? 0 : 12 }]}
              activeOpacity={0.85}
              onPress={() =>
                router.push({ pathname: '/now-playing', params: { id: t.id } })
              }
            >
              <Image source={t.artwork} style={styles.art} />
              <Text style={styles.cardTitle} numberOfLines={1}>{t.title}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>{t.artist}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recently Played */}
        <SectionHeader title="เพิ่งฟัง" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING }}
        >
          {lastlist.map((t, index) => (
            <TouchableOpacity
              key={t.listItemId}
              style={[styles.card, { marginLeft: index === 0 ? 0 : 12 }]}
              activeOpacity={0.85}
              onPress={() =>
                router.push({ pathname: '/now-playing', params: { id: t.id } })
              }
            >
              <Image source={t.artwork} style={styles.art} />
              <Text style={styles.cardTitle} numberOfLines={1}>{t.title}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>{t.artist}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Space for MiniPlayer */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </LinearGradient>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeaderContainer}>
      <LinearGradient
        colors={['#9D4EDD', '#E85D75']}
        style={styles.sectionHeaderGradient}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileGradient: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING,
    paddingBottom: 24,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: '#333',
  },
  chipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  chipText: {
    color: SUB,
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  sectionHeaderContainer: {
    paddingHorizontal: SPACING,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionHeaderGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  quickCard: {
    width: CARD,
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 12,
    position: 'relative',
    marginRight: 8,
  },
  quickThumb: {
    width: CARD - 24,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
    lineHeight: 18,
  },
  playButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: CARD,
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
  },
  art: {
    width: CARD - 24,
    height: CARD - 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: SUB,
  },
});
