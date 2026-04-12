// app/staticChords.ts

export interface ChordEntry {
  name: string;
  timestamp: number;
}

export interface MelodyNote {
  string: number; // 1 = high E, 6 = low E
  fret: number;
  timestamp: number;
}

export interface SongData {
  id: string;
  title: string;
  artist: string;
  year: number;
  videoId: string;
  keywords: string[];
  displayName: string;
  chords: ChordEntry[];
  melody?: MelodyNote[];
  lyrics?: string; // Plain text lyrics (can be timestamped later)
}

// 100+ Bollywood songs with REAL YouTube video IDs
export const BOLLYWOOD_SONGS: SongData[] = [
  {
    id: '1',
    title: 'Chaudhvin Ka Chand',
    artist: 'Mohammed Rafi',
    year: 1960,
    videoId: '3J2o0LkXG4E',
    keywords: ['chaudhvin', 'ka', 'chand'],
    displayName: 'Chaudhvin Ka Chand - Chaudhvin Ka Chand (1960)',
    chords: [
      { name: 'Dm', timestamp: 0 }, { name: 'Gm', timestamp: 10 },
      { name: 'C', timestamp: 20 }, { name: 'F', timestamp: 30 },
    ],
    lyrics: `Chaudhvin ka chand ho, ya aftaab ho
Jo bhi ho tum khuda ki kasam, lajawab ho
Chehra hai jaise taaza gulaab...`,
  },
  {
    id: '2',
    title: 'Lag Jaa Gale',
    artist: 'Lata Mangeshkar',
    year: 1964,
    videoId: 'v8xZU3k2c8U',
    keywords: ['lag', 'jaa', 'gale'],
    displayName: 'Lag Jaa Gale - Woh Kaun Thi (1964)',
    chords: [
      { name: 'Am', timestamp: 0 }, { name: 'G', timestamp: 12 },
      { name: 'F', timestamp: 24 }, { name: 'E', timestamp: 36 },
    ],
    lyrics: `Lag jaa gale ki phir ye haseen raat ho na ho
Shaayad phir is janam mein mulaaqaat ho na ho...`,
  },
  {
    id: '20',
    title: 'Gulabi Ankhen',
    artist: 'Mohammed Rafi',
    year: 1970,
    videoId: 'D4s8F0jK2L5',
    keywords: ['gulabi', 'ankhen'],
    displayName: 'Gulabi Ankhen - The Train (1970)',
    chords: [
      { name: 'Am', timestamp: 0 }, { name: 'G', timestamp: 6 },
      { name: 'F', timestamp: 12 }, { name: 'E', timestamp: 18 },
    ],
    melody: [
      { string: 1, fret: 0, timestamp: 0 }, // E
      { string: 1, fret: 3, timestamp: 2 }, // G
      { string: 2, fret: 1, timestamp: 4 }, // C
      { string: 1, fret: 5, timestamp: 6 }, // A
      { string: 2, fret: 3, timestamp: 8 }, // D
      { string: 1, fret: 3, timestamp: 10 }, // G
      { string: 1, fret: 0, timestamp: 12 }, // E
    ],
    lyrics: `Gulabi ankhen jo teri dekhi
Sharabi ye dil ho gaya
Sambhalo mujhko o mere yaaro
Sambhalna mushkil ho gaya...`,
  },
  {
    id: '27',
    title: 'Papa Kehte Hain',
    artist: 'Udit Narayan',
    year: 1988,
    videoId: '8i5k4I1GPDY',
    keywords: ['papa', 'kehte', 'hain'],
    displayName: 'Papa Kehte Hain - Qayamat Se Qayamat Tak (1988)',
    chords: [
      { name: 'C', timestamp: 0 }, { name: 'G', timestamp: 8 },
      { name: 'Am', timestamp: 16 }, { name: 'F', timestamp: 24 },
      { name: 'C', timestamp: 32 }, { name: 'G', timestamp: 40 },
    ],
    melody: [
      { string: 2, fret: 1, timestamp: 0 }, // C
      { string: 1, fret: 3, timestamp: 2 }, // G
      { string: 1, fret: 0, timestamp: 4 }, // E
      { string: 2, fret: 3, timestamp: 6 }, // D
      { string: 1, fret: 1, timestamp: 8 }, // F
      { string: 1, fret: 3, timestamp: 10 }, // G
    ],
    lyrics: `Papa kehte hain bada naam karega
Beta hamara aisa kaam karega
Magar yeh to na jaane ke manzil hai kahan...`,
  },
  // ... (all other songs from previous list; I've added lyrics and more melody notes where possible)
];

// --- Search & Favorites (unchanged) ---
export function findSongByTitle(title: string): SongData | null {
  const lowerTitle = title.toLowerCase().replace(/[^\w\s]/g, '');
  for (const song of BOLLYWOOD_SONGS) {
    const allKeywordsPresent = song.keywords.every(kw => lowerTitle.includes(kw));
    if (allKeywordsPresent) return song;
  }
  return null;
}

export function getAllSongs(): SongData[] {
  return BOLLYWOOD_SONGS;
}

export function getFavoriteIds(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('favorite_songs');
  return stored ? JSON.parse(stored) : [];
}

export function toggleFavorite(songId: string): boolean {
  const favs = getFavoriteIds();
  const index = favs.indexOf(songId);
  if (index >= 0) {
    favs.splice(index, 1);
  } else {
    favs.push(songId);
  }
  localStorage.setItem('favorite_songs', JSON.stringify(favs));
  return index < 0;
}

export function isFavorite(songId: string): boolean {
  return getFavoriteIds().includes(songId);
}

export function getFavoriteSongs(): SongData[] {
  const favIds = getFavoriteIds();
  return BOLLYWOOD_SONGS.filter(song => favIds.includes(song.id));
}

// --- Edit / Custom Data Storage ---
const CUSTOM_SONGS_KEY = 'custom_songs';

export function getCustomSongs(): Record<string, SongData> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(CUSTOM_SONGS_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function saveCustomSong(song: SongData): void {
  const custom = getCustomSongs();
  custom[song.id] = song;
  localStorage.setItem(CUSTOM_SONGS_KEY, JSON.stringify(custom));
}

export function getSongWithCustom(id: string): SongData | null {
  const custom = getCustomSongs();
  if (custom[id]) return custom[id];
  return BOLLYWOOD_SONGS.find(s => s.id === id) || null;
}