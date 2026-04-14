export interface ChordEntry {
  name: string;
  timestamp: number;
}

export interface MelodyNote {
  string: number;
  fret: number;
  timestamp: number;
  duration?: number;
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
  lyrics?: string;
}

// Base Bollywood songs (sample – expand as needed)
export const BOLLYWOOD_SONGS: SongData[] = [
  {
    id: '1',
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
      { string: 2, fret: 1, timestamp: 0 },
      { string: 1, fret: 3, timestamp: 2 },
      { string: 1, fret: 0, timestamp: 4 },
    ],
    lyrics: `Papa kehte hain bada naam karega...`,
  },
  // ... add all other base songs here (I'll provide a full list separately)
];

// Custom songs storage key
const CUSTOM_SONGS_KEY = 'guitar_chord_finder_custom_songs';

// Get all custom songs from localStorage
export function getCustomSongs(): Record<string, SongData> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(CUSTOM_SONGS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Save a single custom song (merges with existing)
export function saveCustomSong(song: SongData): void {
  const custom = getCustomSongs();
  custom[song.id] = song;
  localStorage.setItem(CUSTOM_SONGS_KEY, JSON.stringify(custom));
}

// Delete a custom song (revert to base version)
export function deleteCustomSong(songId: string): void {
  const custom = getCustomSongs();
  delete custom[songId];
  localStorage.setItem(CUSTOM_SONGS_KEY, JSON.stringify(custom));
}

// Get a song by ID, preferring custom version over base
export function getSongById(id: string): SongData | null {
  const custom = getCustomSongs();
  if (custom[id]) return custom[id];
  return BOLLYWOOD_SONGS.find(s => s.id === id) || null;
}

// Get all songs (base + custom, with custom overriding base)
export function getAllSongs(): SongData[] {
  const custom = getCustomSongs();
  const baseMap = new Map<string, SongData>();
  BOLLYWOOD_SONGS.forEach(s => baseMap.set(s.id, s));
  
  // Override base with custom
  Object.values(custom).forEach(c => baseMap.set(c.id, c));
  
  return Array.from(baseMap.values());
}

// Search by title (for matching YouTube videos)
export function findSongByTitle(title: string): SongData | null {
  const lowerTitle = title.toLowerCase().replace(/[^\w\s]/g, '');
  const allSongs = getAllSongs();
  for (const song of allSongs) {
    const allKeywordsPresent = song.keywords.every(kw => lowerTitle.includes(kw));
    if (allKeywordsPresent) return song;
  }
  return null;
}

// Favorites management
const FAVORITES_KEY = 'guitar_chord_finder_favorites';

export function getFavoriteIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(songId: string): boolean {
  const favs = getFavoriteIds();
  const index = favs.indexOf(songId);
  if (index >= 0) {
    favs.splice(index, 1);
  } else {
    favs.push(songId);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return index < 0;
}

export function isFavorite(songId: string): boolean {
  return getFavoriteIds().includes(songId);
}

export function getFavoriteSongs(): SongData[] {
  const favIds = getFavoriteIds();
  return getAllSongs().filter(s => favIds.includes(s.id));
}

// Export / Import
export function exportDatabase(): string {
  const allSongs = getAllSongs();
  return JSON.stringify(allSongs, null, 2);
}

export function importDatabase(jsonString: string): void {
  try {
    const imported = JSON.parse(jsonString) as SongData[];
    const custom: Record<string, SongData> = {};
    imported.forEach(song => { custom[song.id] = song; });
    localStorage.setItem(CUSTOM_SONGS_KEY, JSON.stringify(custom));
  } catch (e) {
    console.error('Invalid import file', e);
  }
}