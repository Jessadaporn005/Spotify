# Spotify Clone (Expo + TypeScript)

แอปตัวอย่างคล้าย Spotify พร้อมระบบเล่นเพลงพื้นฐาน คิวเพลง มินิเพลเยอร์ รายการโปรด (Favorites) เพลย์ลิสต์ (สร้างเอง) รายการเล่นล่าสุด (Recently Played) และค้นหาเพลงในเครื่อง

## ฟีเจอร์หลัก

- เล่น / หยุด / ข้ามเพลง ด้วย `expo-av`
- คิวเพลง และติดตามสถานะ (เวลา ปัจจุบัน / ทั้งหมด)
- Mini Player แสดงเพลงที่กำลังเล่นด้านล่างทุกหน้า
- Recently Played (บันทึกย้อนหลังสูงสุด 50 เพลง)
- Favorites (กดหัวใจได้ และบันทึกลง AsyncStorage)
- สร้างเพลย์ลิสต์ + เพิ่มเพลงลงเพลย์ลิสต์
- Library แสดง Favorites / Recently Played / เพลย์ลิสต์ที่สร้าง
- Search ค้นหาชื่อเพลงหรือศิลปินแบบ local
- Persistence: เปิดแอปมา โหลดเพลงล่าสุดและตำแหน่งที่เล่นค้างไว้ (ไม่ auto play)

## โครงสร้างสำคัญ

```
src/
  context/AudioContext.tsx        ตัวจัดการเล่นเพลง + recent + persistence
  data/tracks.ts                  แหล่งข้อมูลเพลงและ helper
  store/favorites.ts              Zustand store สำหรับ favorites
  store/playlists.ts              Zustand store สำหรับเพลย์ลิสต์
  components/MiniPlayer.tsx       มินิเพลเยอร์
  screens/Homescreen.tsx          หน้า Home (section ต่าง ๆ)
  screens/NowPlayingScreen.tsx    หน้า Now Playing (ควบคุม เล่น/ลากแถบเวลา)
```

## การเริ่มต้น

```bash
npm install
npx expo start
```

เปิดด้วย: แอป Expo Go / Emulator / Development Build ตามต้องการ

## เพิ่มเพลงใหม่
1. วางไฟล์รูปใน `src/assets/images/`
2. วางไฟล์เสียงใน `src/assets/Music/`
3. เพิ่ม entry ใหม่ใน `TRACKS_BY_ID` (ดูตัวอย่างเดิม)

## การสร้างเพลย์ลิสต์
ไปที่แท็บ สร้าง → ตั้งชื่อ → เพิ่มเพลง (กดรายการเพลง)

## รายการโปรด
ไปที่หน้า Now Playing → กดไอคอนหัวใจ หรือหน้า Library

## ปรับปรุงต่อได้
- ระบบดาวน์โหลด / Offline
- Equalizer / Sleep Timer
- การสตรีมจาก API จริง
- ระบบบัญชีผู้ใช้ / Sync Cloud

## เทคโนโลยี
- Expo Router 5
- React Native 0.79
- Zustand + AsyncStorage
- expo-av (เล่นเสียง)

## License
โค้ดนี้ใช้เพื่อการศึกษา / สร้างต้นแบบ สามารถนำไปต่อยอดได้

