import { useAudio } from '@/src/context/AudioContext';
import { useFavorites } from '@/src/store/favorites';
import { usePlaylists } from '@/src/store/playlists';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GREEN = '#1ED760';
const PURPLE = '#9D4EDD';
const PINK = '#E85D75';
const BLUE = '#4ECDC4';

export default function Library() {
  const { getAll, isFavorite } = useFavorites();
  const favTracks = getAll();
  const { recent } = useAudio();
  const { playlists, order } = usePlaylists();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={['#1A1A1A', '#0D1117']} style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>คอลเลกชัน</Text>
          <TouchableOpacity style={styles.profileButton}>
            <LinearGradient
              colors={[PURPLE, PINK]}
              style={styles.profileGradient}
            >
              <Ionicons name="person" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Access Cards */}
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => router.push('/playlists' as any)}
          >
            <LinearGradient
              colors={[GREEN, '#22C55E']}
              style={styles.quickAccessGradient}
            >
              <Ionicons name="add-circle" size={32} color="#fff" />
              <Text style={styles.quickAccessText}>สร้างเพลย์ลิสต์</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => {/* Navigate to downloaded music */}}
          >
            <LinearGradient
              colors={[BLUE, '#06B6D4']}
              style={styles.quickAccessGradient}
            >
              <Ionicons name="download" size={32} color="#fff" />
              <Text style={styles.quickAccessText}>เพลงดาวน์โหลด</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Section 
          title="รายการโปรด" 
          empty="ยังไม่มีเพลงที่กดหัวใจ"
          icon="heart"
          gradient={[PINK, '#FF6B9D']}
        >
          {favTracks.map(t => (
            <Row 
              key={t.id} 
              title={t.title} 
              subtitle={t.artist} 
              onPress={() => router.push({ pathname:'/now-playing', params:{ id: t.id } })} 
              active={isFavorite(t.id as any)}
              icon="musical-note"
            />
          ))}
        </Section>

        <Section 
          title="เพิ่งเล่นล่าสุด" 
          empty="ยังไม่มีประวัติ"
          icon="time"
          gradient={[PURPLE, '#A855F7']}
        >
          {recent.slice(0, 8).map(t => (
            <Row 
              key={t.id} 
              title={t.title} 
              subtitle={t.artist} 
              onPress={() => router.push({ pathname:'/now-playing', params:{ id: t.id } })}
              icon="musical-note"
            />
          ))}
        </Section>

        <Section 
          title="เพลย์ลิสต์ของฉัน" 
          empty="ยังไม่มีเพลย์ลิสต์"
          icon="list"
          gradient={[BLUE, '#06B6D4']}
        >
          {order.map(pid => {
            const pl = playlists[pid];
            return (
              <Row 
                key={pl.id} 
                title={pl.name} 
                subtitle={`${pl.trackIds.length} เพลง`} 
                onPress={() => router.push({ pathname: '/playlists', params: { open: pl.id } } as any)}
                icon="albums"
              />
            );
          })}
        </Section>

        {/* Space for MiniPlayer */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </LinearGradient>
  );
}

function Section({ 
  title, 
  children, 
  empty, 
  icon, 
  gradient 
}: { 
  title: string; 
  children: React.ReactNode; 
  empty: string;
  icon: string;
  gradient: readonly [string, string];
}) {
  const count = React.Children.count(children);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sectionHeaderGradient}
        >
          <Ionicons name={icon as any} size={20} color="#fff" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </LinearGradient>
      </View>
      
      {count === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={48} color="#333" />
          <Text style={styles.emptyText}>{empty}</Text>
        </View>
      ) : (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );
}

function Row({ 
  title, 
  subtitle, 
  onPress, 
  active, 
  icon 
}: { 
  title: string; 
  subtitle?: string; 
  onPress?: () => void; 
  active?: boolean;
  icon: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon as any} size={20} color="#fff" />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.rowSubtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
      <View style={styles.rowActions}>
        {active && <Ionicons name="heart" size={16} color={GREEN} />}
        <Ionicons name="chevron-forward" size={16} color="#666" style={{ marginLeft: 8 }} />
      </View>
    </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  profileButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  quickAccessCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  quickAccessGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickAccessText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionContent: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  rowSubtitle: {
    color: '#999',
    fontSize: 14,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
});
