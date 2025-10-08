import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function Premium() {
  return (
    <LinearGradient colors={['#FF6B00', '#FF8E00', '#FFA500']} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, paddingTop: 50, paddingHorizontal: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Ionicons name="diamond" size={80} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 16 }}>
            Spotify Premium
          </Text>
          <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', opacity: 0.9, marginTop: 8 }}>
            ฟังเพลงโดยไม่มีโฆษณา แบบ Offline และคุณภาพสูง
          </Text>
        </View>

        <View style={{ marginBottom: 24 }}>
          {[
            { icon: 'volume-off', title: 'ไม่มีโฆษณา', desc: 'ฟังเพลงได้อย่างต่อเนื่อง' },
            { icon: 'cloud-download', title: 'ดาวน์โหลด', desc: 'ฟังแบบ Offline ได้' },
            { icon: 'shuffle', title: 'เล่นแบบสุ่ม', desc: 'เล่นเพลงในลำดับที่ต้องการ' },
            { icon: 'musical-notes', title: 'คุณภาพสูง', desc: 'เสียงคมชัด 320 kbps' },
            { icon: 'phone-portrait', title: 'ข้ามเพลง', desc: 'ข้ามได้ไม่จำกัด' },
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16 }}>
              <Ionicons name={item.icon as any} size={24} color="#fff" />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{item.title}</Text>
                <Text style={{ color: '#fff', opacity: 0.8, fontSize: 14 }}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>
            เริ่มต้นฟรี 1 เดือน
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 16 }}>
            หลังจากนั้น ฿149/เดือน
          </Text>
          <TouchableOpacity style={{ backgroundColor: '#1ED760', paddingVertical: 16, borderRadius: 25, marginBottom: 12 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
              เริ่มต้นใช้งาน Premium
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#999' }}>
            ยกเลิกได้ตลอดเวลา • เป็นเดโม่เท่านั้น
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}
