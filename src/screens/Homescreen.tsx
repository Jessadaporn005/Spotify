import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LISTS, mapListToTracks } from '../data/tracks'; // ← ใช้ลิสต์แยกชุด


const { width } = Dimensions.get('window');
const CARD = 150;
const SPACING = 16;
const GREEN = '#1ED760';
const BG = '#121212';
const SURFACE = '#1E1E1E';
const TEXT = '#FFFFFF';
const SUB = '#B3B3B3';

const filters = ['ทั้งหมด', 'เพลง', 'พอดแคสต์'];


export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [active, setActive] = useState('ทั้งหมด');

  // ดึง “ชุดเพลง” สำหรับแต่ละเซกชัน
  const quick    = mapListToTracks(LISTS.quickPicks);
  const albums   = mapListToTracks(LISTS.albums);
  const stations = mapListToTracks(LISTS.stations);
  const lastlist = mapListToTracks(LISTS.lastlist);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      {/* row ฟิลเตอร์ */}
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

      {/* แถวการ์ดบนแบบ Spotify (quick picks) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING }}
      >
        {quick.map((t) => (
          <TouchableOpacity
            key={t.listItemId}
            style={styles.quickCard}
            activeOpacity={0.85}
            onPress={() =>
              router.push({ pathname: '/now-playing', params: { id: t.id } })
            }
          >
            <Image source={t.artwork} style={styles.quickThumb} />
            <Text style={styles.quickTitle} numberOfLines={2}>
              {t.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* อัลบั้มและซิงเกิลยอดนิยม */}
      <SectionHeader title="อัลบั้มและซิงเกิลยอดนิยม" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING }}
      >
        {albums.map((t) => (
          <TouchableOpacity
            key={t.listItemId}
            style={styles.card}
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

      {/* สถานีวิทยุยอดนิยม */}
      <SectionHeader title="สถานีวิทยุยอดนิยม" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING }}
      >
        {stations.map((t) => (
          <TouchableOpacity
            key={t.listItemId}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              router.push({ pathname: '/now-playing', params: { id: t.id } })
            }
          >
            <Image source={t.artwork} style={styles.art} />
            <Text style={styles.cardTitle} numberOfLines={1}>{t.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ฟังล่าสุด */}
      <SectionHeader title="ฟังล่าสุด" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING }}
      >
        {lastlist.map((t) => (
          <TouchableOpacity
            key={t.listItemId}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              router.push({ pathname: '/now-playing', params: { id: t.id } })
            }
          >
            <Image source={t.artwork} style={styles.art} />
            <Text style={styles.cardTitle} numberOfLines={1}>{t.title}</Text>
          </TouchableOpacity>
        ))}
        
      </ScrollView>

      {/* เผื่อพื้นที่ MiniPlayer */}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: SPACING,
    marginTop: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 999,
  },
  chipActive: { backgroundColor: GREEN },
  chipText: { color: TEXT, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: '#000' },

  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    marginRight: 12,
    padding: 8,
    width: width * 0.7,
  },
  quickThumb: { width: 52, height: 52, borderRadius: 8, marginRight: 10 },
  quickTitle: { color: TEXT, fontWeight: '700', fontSize: 16, flex: 1 },

  sectionTitle: {
    color: TEXT,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 22,
    marginBottom: 8,
    paddingHorizontal: SPACING,
  },

  card: { width: CARD, marginRight: 16 },
  art: { width: CARD, height: CARD, borderRadius: 12 },
  cardTitle: { color: TEXT, fontSize: 16, fontWeight: '800', marginTop: 8 },
  cardSubtitle: { color: SUB, fontSize: 12, marginTop: 2 },
});
