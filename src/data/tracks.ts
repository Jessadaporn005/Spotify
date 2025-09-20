// ── Types ─────────────────────────────────────────────────────────────────────
export type TrackId = `T${number}`;
export type ListId  = `${'A'|'S'|'Q'|'L'}${number}`;

export type Track = {
  id: TrackId;
  title: string;
  artist: string;
  artwork: any; // require('../assets/images/xxx.jpg')
  uri: any;     // require('../assets/Music/xxx.mp3')
};

export type ListItem = { id: ListId; trackId: TrackId };

// ── เพลงหลัก: 9 เพลง (แก้รูป/ไฟล์ที่นี่) ───────────────────────────────────
export const TRACKS_BY_ID: Record<TrackId, Track> = {
  T1: { id: 'T1', title: 'SICK OF YOU', artist: 'FRANK',
        artwork: require('../assets/images/Sick3.jpg'),
        uri: require('../assets/Music/FRANK - Sick Of Yourself (Official Music Video).mp3') },
  T2: { id: 'T2', title: 'DAYONE', artist: 'PUN',
        artwork: require('../assets/images/day4.jpg'),
        uri: require('../assets/Music/PUN - DAY ONE.mp3') },
  T3: { id: 'T3', title: 'อยากกอดเธอ นานๆ', artist: 'BLVCKHEART',
        artwork: require('../assets/images/อยากกอด.jpeg'),
        uri: require('../assets/Music/track1.mp3') },

  T4: { id: 'T4', title: 'Look After You', artist: 'The Fray',
        artwork: require('../assets/images/LookAfter you.jpg'),
        uri: require('../assets/Music/Look After You - Sped Up (Tiktok Version).mp3') },
  T5: { id: 'T5', title: 'Numb', artist: 'Linkin Park',
        artwork: require('../assets/images/numb.jpg'),
        uri: require('../assets/Music/Numb (Official Music Video) [4K UPGRADE] – Linkin Park.mp3') },
  T6: { id: 'T6', title: 'The Scientist', artist: 'Coldplay',
        artwork: require('../assets/images/TheScientist.jpg'),
        uri: require('../assets/Music/Coldplay - The Scientist (Official 4K Video).mp3') },

  T7: { id: 'T7', title: 'Shape of You', artist: 'Ed Sheeran',
        artwork: require('../assets/images/Shape-of-You-.jpg'),
        uri: require('../assets/Music/Ed Sheeran - Shape of You (Official Music Video).mp3') },
  T8: { id: 'T8', title: 'Someone You Loved', artist: 'Lewis Capaldi',
        artwork: require('../assets/images/Someone.jpg'),
        uri: require('../assets/Music/Lewis Capaldi - Someone You Loved.mp3') },
  T9: { id: 'T9', title: 'Blinding Lights', artist: 'The Weeknd',
        artwork: require('../assets/images/Weeknd.jpg'),
        uri: require('../assets/Music/The Weeknd - Blinding Lights (Official Audio).mp3') },
};

// ── ลิสต์ (คนละชุดกันชัดเจน) ────────────────────────────────────────────────
export const LISTS = {
  albums:   [ { id: 'A1', trackId: 'T1' }, { id: 'A2', trackId: 'T2' }, { id: 'A3', trackId: 'T3' } ] as const,
  stations: [ { id: 'S1', trackId: 'T4' }, { id: 'S2', trackId: 'T5' }, { id: 'S3', trackId: 'T6' } ] as const,
  lastlist: [ { id: 'L1', trackId: 'T7' }, { id: 'L2', trackId: 'T8' }, { id: 'L3', trackId: 'T9' } ] as const,
  // quick picks ถ้าอยากใช้:
  quickPicks: [ { id: 'Q1', trackId: 'T2' }, { id: 'Q2', trackId: 'T5' }, { id: 'Q3', trackId: 'T8' } ] as const,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export const getTrack = (id: TrackId) => TRACKS_BY_ID[id];

export const mapListToTracks = (items: readonly ListItem[]) =>
  items.map(({ id, trackId }) => ({
    listItemId: id,               // A1 / S2 / L3 / ...
    ...TRACKS_BY_ID[trackId],     // รวมข้อมูลเพลงมาใช้ตรง ๆ
  }));

export const TRACKS = Object.values(TRACKS_BY_ID);
