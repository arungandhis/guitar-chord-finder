// app/staticChords.ts

interface ChordEntry {
  name: string;
  timestamp: number;
}

interface StaticSong {
  keywords: string[]; // lowercase words that must appear in title
  chords: ChordEntry[];
}

const STATIC_DATABASE: StaticSong[] = [
  {
    keywords: ['wonderwall', 'oasis'],
    chords: [
      { name: 'Em7', timestamp: 0 },
      { name: 'G', timestamp: 10 },
      { name: 'Dsus4', timestamp: 20 },
      { name: 'A7sus4', timestamp: 30 },
    ],
  },
  {
    keywords: ['perfect', 'ed sheeran'],
    chords: [
      { name: 'G', timestamp: 0 },
      { name: 'Em', timestamp: 10 },
      { name: 'C', timestamp: 20 },
      { name: 'D', timestamp: 30 },
    ],
  },
  {
    keywords: ['let it be', 'beatles'],
    chords: [
      { name: 'C', timestamp: 0 },
      { name: 'G', timestamp: 10 },
      { name: 'Am', timestamp: 20 },
      { name: 'F', timestamp: 30 },
    ],
  },
  {
    keywords: ['hallelujah', 'cohen'],
    chords: [
      { name: 'C', timestamp: 0 },
      { name: 'Am', timestamp: 10 },
      { name: 'C', timestamp: 20 },
      { name: 'Am', timestamp: 30 },
      { name: 'F', timestamp: 40 },
      { name: 'G', timestamp: 50 },
      { name: 'C', timestamp: 60 },
    ],
  },
];

export function getStaticChords(title: string): { chords: ChordEntry[] } | null {
  const lowerTitle = title.toLowerCase();
  const match = STATIC_DATABASE.find(song =>
    song.keywords.every(keyword => lowerTitle.includes(keyword))
  );
  return match ? { chords: match.chords } : null;
}