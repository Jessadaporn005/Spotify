import { useAudio } from '@/src/context/AudioContext';
import { useSleepRemaining, useSleepTimerStore } from '@/src/store/sleepTimer';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { volume, setVolume, toggleMute } = useAudio();
  const { setTimer, clear, expiresAt } = useSleepTimerStore();
  const remaining = useSleepRemaining();
  const [mins, setMins] = useState('15');

  return (
    <View style={{ flex:1, backgroundColor:'#121212', padding:20 }}>
      <Text style={{ color:'#fff', fontSize:28, fontWeight:'800', marginBottom:20 }}>การตั้งค่า</Text>
      <View style={{ marginBottom:28 }}>
        <Text style={{ color:'#fff', fontSize:18, fontWeight:'600' }}>เสียง</Text>
        <Text style={{ color:'#aaa', marginTop:4 }}>ระดับเสียงปัจจุบัน: {Math.round(volume*100)}%</Text>
        <View style={{ flexDirection:'row', marginTop:10, gap:10 }}>
          {[0.25,0.5,0.75,1].map(v => (
            <TouchableOpacity key={v} onPress={() => setVolume(v)} style={{ backgroundColor: Math.abs(volume - v) < 0.01 ? '#1ED760' : '#1e1e1e', paddingHorizontal:14, paddingVertical:8, borderRadius:8 }}>
              <Text style={{ color: Math.abs(volume - v) < 0.01 ? '#000':'#fff', fontWeight:'600' }}>{Math.round(v*100)}%</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={toggleMute} style={{ backgroundColor:'#2a2a2a', paddingHorizontal:14, paddingVertical:8, borderRadius:8 }}>
            <Text style={{ color:'#fff' }}>Mute</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ marginBottom:32 }}>
        <Text style={{ color:'#fff', fontSize:18, fontWeight:'600' }}>Sleep Timer</Text>
        {remaining ? (
          <Text style={{ color:'#1ED760', marginTop:6 }}>จะหยุดใน {remaining.minutes}:{String(remaining.seconds).padStart(2,'0')}</Text>
        ) : (
          <Text style={{ color:'#aaa', marginTop:6 }}>ยังไม่ได้ตั้งค่า</Text>
        )}
        <View style={{ flexDirection:'row', marginTop:12, alignItems:'center', gap:10 }}>
          <TextInput value={mins} onChangeText={setMins} keyboardType='numeric' placeholder='นาที' placeholderTextColor='#666' style={{ backgroundColor:'#1e1e1e', color:'#fff', paddingHorizontal:12, paddingVertical:8, borderRadius:8, width:80 }} />
          <TouchableOpacity onPress={() => { const m = parseInt(mins,10); if (m>0) setTimer(m); }} style={{ backgroundColor:'#1ED760', paddingHorizontal:18, paddingVertical:10, borderRadius:8 }}>
            <Text style={{ fontWeight:'700' }}>ตั้ง</Text>
          </TouchableOpacity>
          {expiresAt && (
            <TouchableOpacity onPress={clear} style={{ backgroundColor:'#ff4d4f', paddingHorizontal:18, paddingVertical:10, borderRadius:8 }}>
              <Text style={{ fontWeight:'700', color:'#fff' }}>ยกเลิก</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flexDirection:'row', gap:8, marginTop:16 }}>
          {[10,15,30,45,60].map(m => (
            <TouchableOpacity key={m} onPress={() => setTimer(m)} style={{ backgroundColor:'#1e1e1e', paddingHorizontal:14, paddingVertical:8, borderRadius:8 }}>
              <Text style={{ color:'#fff' }}>{m} นาที</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Text style={{ color:'#555', fontSize:12 }}>เวอร์ชันเดโม่ – ฟีเจอร์อื่นๆ เช่น EQ, Streaming ยังไม่ได้เปิดใช้</Text>
    </View>
  );
}
