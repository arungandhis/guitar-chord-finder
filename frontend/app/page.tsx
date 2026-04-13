'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import YouTube from 'react-youtube';
import {
  Search, Loader2, Music, ChevronLeft, Settings as SettingsIcon,
  AlertCircle, Plus, Save, X, List, Guitar, Star, Edit3, FileText,
  Sparkles, ExternalLink,
} from 'lucide-react';
import Settings from './components/Settings';
import {
  findSongByTitle, getAllSongs, SongData, ChordEntry, MelodyNote,
  toggleFavorite, isFavorite, getFavoriteSongs, getSongWithCustom,
  saveCustomSong,
} from './staticChords';

// ... (interfaces same as before)

export default function Home() {
  // ... all state variables (same as before, except remove fetchingLyrics)

  const handleFetchLyrics = () => {
    if (!selectedVideo) return;
    const query = encodeURIComponent(`${selectedVideo.snippet.title} lyrics`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  // ... keep all other functions (search, select video, edit, etc.)

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-3 md:p-8">
      {/* ... header and search form ... */}

      {selectedVideo && (
        <div className="space-y-4">
          {/* ... back button and player ... */}

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2 border-b border-gray-700">
                {/* tabs: chords, melody, lyrics */}
              </div>
              <div className="flex gap-2">
                {/* Lyrics: always show search link */}
                {activeTab === 'lyrics' && (
                  <button
                    onClick={handleFetchLyrics}
                    className="text-sm bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Search Lyrics
                  </button>
                )}
                {/* Melody: always show generate button when a video is selected */}
                {activeTab === 'melody' && (
                  <button
                    onClick={handleGenerateMelody}
                    disabled={generatingMelody}
                    className="text-sm bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded flex items-center gap-1"
                  >
                    {generatingMelody ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    Generate Melody
                  </button>
                )}
                {/* Edit buttons (same) */}
              </div>
            </div>

            {/* Tab content rendering */}
          </div>
        </div>
      )}
    </main>
  );
}