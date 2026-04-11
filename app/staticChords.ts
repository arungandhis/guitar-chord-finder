// app/staticChords.ts

export interface ChordEntry {
  name: string;
  timestamp: number;
}

export interface MelodyNote {
  string: number; // 1-6 (1 = high E, 6 = low E)
  fret: number;   // 0 = open string
  timestamp: number;
  duration?: number; // optional
}

interface StaticSong {
  keywords: string[];
  displayName: string;
  chords: ChordEntry[];
  melody?: MelodyNote[]; // optional melody tab
}

const STATIC_DATABASE: StaticSong[] = [
  {
    keywords: ['wonderwall', 'oasis'],
    displayName: 'Wonderwall - Oasis',
    chords: [
      { name: 'Em7', timestamp: 0 },
      { name: 'G', timestamp: 10 },
      { name: 'Dsus4', timestamp: 20 },
      { name: 'A7sus4', timestamp: 30 },
      { name: 'Em7', timestamp: 40 },
      { name: 'G', timestamp: 50 },
      { name: 'Dsus4', timestamp: 60 },
      { name: 'A7sus4', timestamp: 70 },
    ],
    melody: [
      { string: 2, fret: 3, timestamp: 0 },   // D
      { string: 1, fret: 3, timestamp: 2 },   // G
      { string: 2, fret: 3, timestamp: 4 },   // D
      { string: 3, fret: 2, timestamp: 6 },   // A
      { string: 2, fret: 3, timestamp: 8 },   // D
    ],
  },
  {
    keywords: ['perfect', 'ed sheeran'],
    displayName: 'Perfect - Ed Sheeran',
    chords: [
      { name: 'G', timestamp: 0 },
      { name: 'Em', timestamp: 10 },
      { name: 'C', timestamp: 20 },
      { name: 'D', timestamp: 30 },
    ],
    melody: [
      { string: 1, fret: 3, timestamp: 0 },
      { string: 1, fret: 0, timestamp: 2 },
      { string: 1, fret: 1, timestamp: 4 },
      { string: 1, fret: 3, timestamp: 6 },
    ],
  },
  {
    keywords: ['let it be', 'beatles'],
    displayName: 'Let It Be - The Beatles',
    chords: [
      { name: 'C', timestamp: 0 },
      { name: 'G', timestamp: 10 },
      { name: 'Am', timestamp: 20 },
      { name: 'F', timestamp: 30 },
    ],
    melody: [
      { string: 2, fret: 1, timestamp: 0 },
      { string: 2, fret: 3, timestamp: 3 },
      { string: 1, fret: 0, timestamp: 6 },
      { string: 1, fret: 1, timestamp: 9 },
    ],
  },
  // ... Add more songs with melody notes as desired
];

export function getStaticChords(title: string): { chords: ChordEntry[]; melody?: MelodyNote[] } | null {
  const lowerTitle = title.toLowerCase().replace(/[^\w\s]/g, '');
  for (const song of STATIC_DATABASE) {
    const allKeywordsPresent = song.keywords.every(keyword =>
      lowerTitle.includes(keyword)
    );
    if (allKeywordsPresent) {
      return { chords: song.chords, melody: song.melody };
    }
  }
  return null;
}

export function getAllStaticSongs(): { displayName: string; keywords: string[] }[] {
  return STATIC_DATABASE.map(song => ({
    displayName: song.displayName,
    keywords: song.keywords,
  }));
}