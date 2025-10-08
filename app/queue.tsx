import { useAudio } from '@/src/context/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function QueueScreen() {
  const router = useRouter();
  const { queue, index, currentTrack, play, setQueue } = useAudio();

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newQueue = [...queue];
    const [moved] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, moved);
    
    // ปรับ index ตำแหน่งเพลงปัจจุบัน
    let newIndex = index;
    if (fromIndex === index) newIndex = toIndex;
    else if (fromIndex < index && toIndex >= index) newIndex--;
    else if (fromIndex > index && toIndex <= index) newIndex++;
    
    setQueue(newQueue, newIndex);
  };

  const clearQueue = () => {
    Alert.alert(
      'ล้างคิว',
      'ต้องการล้างคิวเพลงทั้งหมดหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ล้าง', style: 'destructive', onPress: () => setQueue([], 0) }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', flex: 1 }}>คิวเพลง</Text>
        {queue.length > 0 && (
          <TouchableOpacity onPress={clearQueue}>
            <Ionicons name="trash" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        )}
      </View>

      {currentTrack && (
        <View style={{ backgroundColor: '#1a1a1a', marginHorizontal: 16, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ color: '#1ED760', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>กำลังเล่น</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{currentTrack.title}</Text>
              <Text style={{ color: '#aaa', fontSize: 14 }}>{currentTrack.artist}</Text>
            </View>
            <Ionicons name="musical-notes" size={20} color="#1ED760" />
          </View>
        </View>
      )}

      <ScrollView style={{ flex: 1 }}>
        {queue.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
            <Ionicons name="musical-notes-outline" size={64} color="#333" />
            <Text style={{ color: '#666', fontSize: 18, fontWeight: '600', marginTop: 16 }}>ไม่มีเพลงในคิว</Text>
            <Text style={{ color: '#666', fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }}>
              เพลงที่คุณเลือกจะแสดงที่นี่
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ color: '#aaa', fontSize: 14, marginBottom: 12 }}>ถัดไป ({queue.length - index - 1} เพลง)</Text>
            {queue.slice(index + 1).map((track, i) => {
              const actualIndex = index + 1 + i;
              return (
                <TouchableOpacity
                  key={`${track.id}-${actualIndex}`}
                  onPress={() => play(track)}
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#222'
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{track.title}</Text>
                    <Text style={{ color: '#aaa', fontSize: 14 }}>{track.artist}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity 
                      onPress={() => handleReorder(actualIndex, actualIndex - 1)}
                      disabled={actualIndex <= index + 1}
                      style={{ padding: 8, opacity: actualIndex <= index + 1 ? 0.3 : 1 }}
                    >
                      <Ionicons name="chevron-up" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleReorder(actualIndex, actualIndex + 1)}
                      disabled={actualIndex >= queue.length - 1}
                      style={{ padding: 8, opacity: actualIndex >= queue.length - 1 ? 0.3 : 1 }}
                    >
                      <Ionicons name="chevron-down" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}