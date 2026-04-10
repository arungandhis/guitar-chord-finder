// app/chordDatabase.ts

interface ChordEntry {
  name: string;
  timestamp: number;
}

interface ChordDatabaseEntry {
  videoId?: string; // Optional: directly match a video ID
  titleKeywords: string[]; // Match based on words in the video title
  chords: ChordEntry[];
}

// Our simple static database
const CHORD_DATABASE: ChordDatabaseEntry[] = [
  {
    titleKeywords: ['wonderwall', 'oasis'],
    chords: [
      { name: 'Em7', timestamp: 0 },
      { name: 'G', timestamp: 10 },
      { name: 'Dsus4', timestamp: 20 },
      { name: 'A7sus4', timestamp: 30 },
    ],
  },
  {
    titleKeywords: ['perfect', 'ed sheeran'],
    chords: [
      { name: 'G', timestamp: 0 },
      { name: 'Em', timestamp: 10 },
      { name: 'C', timestamp: 20 },
      { name: 'D', timestamp: 30 },
    ],
  },
  {
    titleKeywords: ['let it be', 'beatles'],
    chords: [
      { name: 'C', timestamp: 0 },
      { name: 'G', timestamp: 10 },
      { name: 'Am', timestamp: 20 },
      { name: 'F', timestamp: 30 },
    ],
  },
  // Add more songs here as you find them
];

export function getChordsForVideo(videoId: string, videoTitle: string): { chords: ChordEntry[] } | null {
  // First, try to find an exact match by video ID (if we have it)
  const idMatch = CHORD_DATABASE.find(entry => entry.videoId === videoId);
  if (idMatch) {
    return { chords: idMatch.chords };
  }

  // Otherwise, search by keywords in the title
  const lowerTitle = videoTitle.toLowerCase();
  const keywordMatch = CHORD_DATABASE.find(entry =>
    entry.titleKeywords.every(keyword => lowerTitle.includes(keyword))
  );
  if (keywordMatch) {
    return { chords: keywordMatch.chords };
  }

  return null;
}