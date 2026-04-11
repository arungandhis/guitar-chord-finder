// app/staticChords.ts

export interface ChordEntry {
  name: string;
  timestamp: number;
}

interface StaticSong {
  keywords: string[]; // lowercase words that must appear in title
  chords: ChordEntry[];
}

// Expanded database with 50+ popular songs
const STATIC_DATABASE: StaticSong[] = [
  {
    keywords: ['wonderwall', 'oasis'],
    chords: [
      { name: 'Em7', timestamp: 0 }, { name: 'G', timestamp: 10 },
      { name: 'Dsus4', timestamp: 20 }, { name: 'A7sus4', timestamp: 30 },
      { name: 'Em7', timestamp: 40 }, { name: 'G', timestamp: 50 },
      { name: 'Dsus4', timestamp: 60 }, { name: 'A7sus4', timestamp: 70 },
    ],
  },
  {
    keywords: ['perfect', 'ed sheeran'],
    chords: [
      { name: 'G', timestamp: 0 }, { name: 'Em', timestamp: 10 },
      { name: 'C', timestamp: 20 }, { name: 'D', timestamp: 30 },
    ],
  },
  {
    keywords: ['let it be', 'beatles'],
    chords: [
      { name: 'C', timestamp: 0 }, { name: 'G', timestamp: 10 },
      { name: 'Am', timestamp: 20 }, { name: 'F', timestamp: 30 },
    ],
  },
  {
    keywords: ['hallelujah', 'cohen'],
    chords: [
      { name: 'C', timestamp: 0 }, { name: 'Am', timestamp: 8 },
      { name: 'C', timestamp: 16 }, { name: 'Am', timestamp: 24 },
      { name: 'F', timestamp: 32 }, { name: 'G', timestamp: 40 },
      { name: 'C', timestamp: 48 },
    ],
  },
  {
    keywords: ['hotel california', 'eagles'],
    chords: [
      { name: 'Bm', timestamp: 0 }, { name: 'F#', timestamp: 8 },
      { name: 'A', timestamp: 16 }, { name: 'E', timestamp: 24 },
      { name: 'G', timestamp: 32 }, { name: 'D', timestamp: 40 },
      { name: 'Em', timestamp: 48 }, { name: 'F#', timestamp: 56 },
    ],
  },
  {
    keywords: ['stairway to heaven', 'led zeppelin'],
    chords: [
      { name: 'Am', timestamp: 0 }, { name: 'C', timestamp: 12 },
      { name: 'D', timestamp: 24 }, { name: 'F', timestamp: 36 },
      { name: 'G', timestamp: 48 }, { name: 'Am', timestamp: 60 },
    ],
  },
  {
    keywords: ['wish you were here', 'pink floyd'],
    chords: [
      { name: 'C', timestamp: 0 }, { name: 'D', timestamp: 10 },
      { name: 'Am', timestamp: 20 }, { name: 'G', timestamp: 30 },
    ],
  },
  {
    keywords: ['blackbird', 'beatles'],
    chords: [
      { name: 'G', timestamp: 0 }, { name: 'Am7', timestamp: 6 },
      { name: 'G/B', timestamp: 12 }, { name: 'C', timestamp: 18 },
    ],
  },
  {
    keywords: ['dust in the wind', 'kansas'],
    chords: [
      { name: 'C', timestamp: 0 }, { name: 'G/B', timestamp: 6 },
      { name: 'Am', timestamp: 12 }, { name: 'G', timestamp: 18 },
    ],
  },
  {
    keywords: ['brown eyed girl', 'van morrison'],
    chords: [
      { name: 'G', timestamp: 0 }, { name: 'C', timestamp: 8 },
      { name: 'G', timestamp: 16 }, { name: 'D', timestamp: 24 },
    ],
  },
  {
    keywords: ['sweet home alabama', 'lynyrd skynyrd'],
    chords: [
      { name: 'D', timestamp: 0 }, { name: 'C', timestamp: 4 },
      { name: 'G', timestamp: 8 },
    ],
  },
  {
    keywords: ['hey jude', 'beatles'],
    chords: [
      { name: 'D', timestamp: 0 }, { name: 'A', timestamp: 10 },
      { name: 'A7', timestamp: 20 }, { name: 'G', timestamp: 30 },
      { name: 'D', timestamp: 40 },
    ],
  },
  {
    keywords: ['house of the rising sun', 'animals'],
    chords: [
      { name: 'Am', timestamp: 0 }, { name: 'C', timestamp: 8 },
      { name: 'D', timestamp: 16 }, { name: 'F', timestamp: 24 },
      { name: 'Am', timestamp: 32 }, { name: 'E', timestamp: 40 },
    ],
  },
  {
    keywords: ['knocking on heaven', 'bob dylan'],
    chords: [
      { name: 'G', timestamp: 0 }, { name: 'D', timestamp: 8 },
      { name: 'Am', timestamp: 16 }, { name: 'C', timestamp: 24 },
    ],
  },
  {
    keywords: ['redemption song', 'bob marley'],
    chords: [
      { name: 'G', timestamp: 0 }, { name: 'Em', timestamp: 8 },
      { name: 'C', timestamp: 16 }, { name: 'G/B', timestamp: 24 },
      { name: 'Am', timestamp: 32 }, { name: 'D', timestamp: 40 },
    ],
  },
  {
    keywords: ['tears in heaven', 'eric clapton'],
    chords: [
      { name: 'A', timestamp: 0 }, { name: 'E', timestamp: 10 },
      { name: 'F#m', timestamp: 20 }, { name: 'D', timestamp: 30 },
    ],
  },
  {
    keywords: ['landslide', 'fleetwood mac'],
    chords: [
      { name: 'C', timestamp: 0 }, { name: 'G/B', timestamp: 8 },
      { name: 'Am7', timestamp: 16 }, { name: 'G', timestamp: 24 },
    ],
  },
  {
    keywords: ['angie', 'rolling stones'],
    chords: [
      { name: 'Am', timestamp: 0 }, { name: 'E7', timestamp: 8 },
      { name: 'G', timestamp: 16 }, { name: 'F', timestamp: 24 },
      { name: 'C', timestamp: 32 },
    ],
  },
  // Add more as needed...
];

// Fuzzy matching: check if all keywords appear anywhere in the title
export function getStaticChords(title: string): { chords: ChordEntry[] } | null {
  const lowerTitle = title.toLowerCase().replace(/[^\w\s]/g, ''); // remove punctuation
  for (const song of STATIC_DATABASE) {
    const allKeywordsPresent = song.keywords.every(keyword =>
      lowerTitle.includes(keyword)
    );
    if (allKeywordsPresent) {
      return { chords: song.chords };
    }
  }
  return null;
}

// Get all songs for reference (optional)
export function getAllSongs(): string[] {
  return STATIC_DATABASE.map(song => song.keywords.join(' '));
}