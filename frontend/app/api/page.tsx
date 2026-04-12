'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import YouTube from 'react-youtube';
import {
  Search, Loader2, Music, ChevronLeft, Settings as SettingsIcon,
  AlertCircle, Plus, Save, X, List, Guitar, Star, Edit3, FileText,
  Sparkles, Download,
} from 'lucide-react';
import Settings from './components/Settings';
import {
  findSongByTitle, getAllSongs, SongData, ChordEntry, MelodyNote,
  toggleFavorite, isFavorite, getFavoriteSongs, getSongWithCustom,
  saveCustomSong, exportDatabase,
} from './staticChords';

interface VideoItem {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { medium: { url: string } };
    channelTitle: string;
  };
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [songData, setSongData] = useState<SongData | null>(null);
  const [loading, setLoading] = useState(false);
  const [chordLoading, setChordLoading] = useState(false);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasKeys, setHasKeys] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editChords, setEditChords] = useState<ChordEntry[]>([]);
  const [editMelody, setEditMelody] = useState<MelodyNote[]>([]);
  const [editLyrics, setEditLyrics] = useState('');
  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseTab, setBrowseTab] = useState<'all' | 'favorites'>('all');
  const [allSongs] = useState(() => getAllSongs());
  const [favorites, setFavorites] = useState<SongData[]>([]);
  const [activeTab, setActiveTab] = useState<'chords' | 'melody' | 'lyrics'>('chords');
  const [generatingMelody, setGeneratingMelody] = useState(false);
  const [fetchingLyrics, setFetchingLyrics] = useState(false);

  useEffect(() => {
    const yt = localStorage.getItem('youtube_api_key');
    setHasKeys(!!yt);
    setFavorites(getFavoriteSongs());
  }, []);

  const refreshFavorites = () => setFavorites(getFavoriteSongs());

  const handleToggleFavorite = (songId: string) => {
    toggleFavorite(songId);
    refreshFavorites();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const youtubeKey = localStorage.getItem('youtube_api_key');
    if (!youtubeKey) {
      setSettingsOpen(true);
      return;
    }
    setLoading(true);
    setError('');
    setVideos([]);
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
        searchQuery
      )}&type=video&key=${youtubeKey}`;
      const res = await axios.get(url);
      setVideos(res.data.items || []);
      if (!res.data.items || res.data.items.length === 0) {
        setError('No videos found. Try a different search.');
      }
    } catch (err: any) {
      console.error('YouTube API error:', err);
      const errorMessage = err.response?.data?.error?.message || 'Search failed. Check your API key or try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadSongData = (song: SongData) => {
    setSongData(song);
    setEditChords(song.chords);
    setEditMelody(song.melody || []);
    setEditLyrics(song.lyrics || '');
  };

  const handleSelectSong = (song: SongData) => {
    setBrowseOpen(false);
    const customSong = getSongWithCustom(song.id) || song;
    setSelectedVideo({
      id: { videoId: customSong.videoId },
      snippet: {
        title: `${customSong.title} - ${customSong.artist}`,
        thumbnails: { medium: { url: `https://img.youtube.com/vi/${customSong.videoId}/mqdefault.jpg` } },
        channelTitle: customSong.artist,
      },
    });
    loadSongData(customSong);
    setError('');
    setManualMode(false);
    setEditMode(false);
    setActiveTab('chords');
  };

  const handleSelectVideo = async (video: VideoItem) => {
    setSelectedVideo(video);
    setChordLoading(true);
    setManualMode(false);
    const found = findSongByTitle(video.snippet.title);
    if (found) {
      const customSong = getSongWithCustom(found.id) || found;
      loadSongData(customSong);
      setError('');
    } else {
      setSongData(null);
      setError('Song not in Bollywood database. You can add chords manually below.');
    }
    setChordLoading(false);
  };

  const enterEditMode = () => {
    if (!songData) return;
    setEditChords([...songData.chords]);
    setEditMelody([...songData.melody || []]);
    setEditLyrics(songData.lyrics || '');
    setEditMode(true);
  };

  const saveEdits = () => {
    if (!songData) return;
    const updatedSong: SongData = {
      ...songData,
      chords: editChords.filter(c => c.name.trim() !== ''),
      melody: editMelody,
      lyrics: editLyrics,
    };
    saveCustomSong(updatedSong);
    loadSongData(updatedSong);
    setEditMode(false);
  };

  const cancelEdits = () => {
    setEditMode(false);
    if (songData) {
      setEditChords(songData.chords);
      setEditMelody(songData.melody || []);
      setEditLyrics(songData.lyrics || '');
    }
  };

  const addEditChord = () => setEditChords([...editChords, { name: '', timestamp: 0 }]);
  const updateEditChord = (idx: number, field: 'name' | 'timestamp', value: string | number) => {
    const updated = [...editChords];
    if (field === 'name') updated[idx].name = value as string;
    else updated[idx].timestamp = Number(value);
    setEditChords(updated);
  };
  const removeEditChord = (idx: number) => setEditChords(editChords.filter((_, i) => i !== idx));

  const addEditMelody = () => setEditMelody([...editMelody, { string: 1, fret: 0, timestamp: 0 }]);
  const updateEditMelody = (idx: number, field: 'string' | 'fret' | 'timestamp', value: number) => {
    const updated = [...editMelody];
    updated[idx][field] = value;
    setEditMelody(updated);
  };
  const removeEditMelody = (idx: number) => setEditMelody(editMelody.filter((_, i) => i !== idx));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFetchLyrics = async () => {
    if (!songData) return;
    setFetchingLyrics(true);
    try {
      const res = await fetch(`/api/lyrics?artist=${encodeURIComponent(songData.artist)}&title=${encodeURIComponent(songData.title)}`);
      const data = await res.json();
      if (data.lyrics) {
        const updatedSong: SongData = { ...songData, lyrics: data.lyrics };
        saveCustomSong(updatedSong);
        loadSongData(updatedSong);
      } else {
        alert('Lyrics not found for this song.');
      }
    } catch (error) {
      alert('Failed to fetch lyrics.');
    } finally {
      setFetchingLyrics(false);
    }
  };

  const pollJobStatus = async (jobId: string): Promise<any> => {
    const maxAttempts = 60;
    let attempts = 0;
    while (attempts < maxAttempts) {
      const res = await fetch(`/api/transcribe/status?jobId=${jobId}`);
      const data = await res.json();
      if (data.status === 'completed') return data.result;
      if (data.status === 'failed') throw new Error(data.error || 'Transcription failed');
      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;
    }
    throw new Error('Transcription timed out');
  };

  const handleGenerateMelody = async () => {
    if (!selectedVideo) return;
    setGeneratingMelody(true);
    try {
      const startRes = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: `https://www.youtube.com/watch?v=${selectedVideo.id.videoId}` }),
      });
      const { jobId, error: startError } = await startRes.json();
      if (startError) throw new Error(startError);

      const result = await pollJobStatus(jobId);
      if (result.melody) {
        const updatedSong: SongData = songData
          ? { ...songData, melody: result.melody }
          : {
              id: selectedVideo.id.videoId,
              title: selectedVideo.snippet.title,
              artist: selectedVideo.snippet.channelTitle,
              year: new Date().getFullYear(),
              videoId: selectedVideo.id.videoId,
              keywords: [],
              displayName: selectedVideo.snippet.title,
              chords: [],
              melody: result.melody,
            };
        saveCustomSong(updatedSong);
        loadSongData(updatedSong);
      } else {
        alert('No melody generated.');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setGeneratingMelody(false);
    }
  };

  const renderChords = (chords: ChordEntry[], editable: boolean) => (
    <div className="space-y-1 max-h-80 overflow-y-auto">
      {chords.map((chord, idx) => (
        <div key={idx} className="flex justify-between items-center p-3 bg-gray-700 rounded">
          {editable ? (
            <>
              <input type="text" value={chord.name} onChange={(e) => updateEditChord(idx, 'name', e.target.value)} className="w-20 px-2 py-1 bg-gray-600 rounded" />
              <input type="number" value={chord.timestamp} onChange={(e) => updateEditChord(idx, 'timestamp', e.target.value)} className="w-16 px-2 py-1 bg-gray-600 rounded" />
              <button onClick={() => removeEditChord(idx)} className="text-red-400">✕</button>
            </>
          ) : (
            <>
              <span className="text-xl font-mono font-bold text-green-300">{chord.name}</span>
              <span className="text-sm text-gray-300">{formatTime(chord.timestamp)}</span>
            </>
          )}
        </div>
      ))}
      {editable && <button onClick={addEditChord} className="mt-2 text-sm text-green-400 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Chord</button>}
    </div>
  );

  const renderMelody = (melody: MelodyNote[], editable: boolean) => (
    <div className="space-y-1 max-h-80 overflow-y-auto">
      {melody.length > 0 ? (
        melody.map((note, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-gray-700 rounded">
            {editable ? (
              <>
                <select value={note.string} onChange={(e) => updateEditMelody(idx, 'string', parseInt(e.target.value))} className="w-16 px-2 py-1 bg-gray-600 rounded">
                  {[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s}e</option>)}
                </select>
                <input type="number" value={note.fret} onChange={(e) => updateEditMelody(idx, 'fret', parseInt(e.target.value))} className="w-16 px-2 py-1 bg-gray-600 rounded" />
                <input type="number" value={note.timestamp} onChange={(e) => updateEditMelody(idx, 'timestamp', parseFloat(e.target.value))} className="w-16 px-2 py-1 bg-gray-600 rounded" />
                <button onClick={() => removeEditMelody(idx)} className="text-red-400">✕</button>
              </>
            ) : (
              <>
                <span className="text-lg font-mono">String {note.string}, Fret {note.fret}</span>
                <span className="text-sm text-gray-300">{formatTime(note.timestamp)}</span>
              </>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center py-4">No melody notes yet. Edit to add or use "Generate Melody".</p>
      )}
      {editable && <button onClick={addEditMelody} className="mt-2 text-sm text-green-400 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Note</button>}
    </div>
  );

  const renderLyrics = (lyrics: string, editable: boolean) => (
    <div className="max-h-80 overflow-y-auto">
      {editable ? (
        <textarea value={editLyrics} onChange={(e) => setEditLyrics(e.target.value)} className="w-full h-64 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white" placeholder="Paste lyrics here..." />
      ) : (
        <pre className="whitespace-pre-wrap font-sans text-gray-300">{lyrics || 'No lyrics available. Edit to add or use "Fetch Lyrics".'}</pre>
      )}
    </div>
  );

  const songsToShow = browseTab === 'all' ? allSongs : favorites;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-3 md:p-8">
      <div className="max-w-6xl mx-auto relative">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-1 flex items-center justify-center gap-2">
            <Music className="w-7 h-7 text-green-400" />
            Bollywood Tab Generator
          </h1>
          <p className="text-gray-400 text-sm">100+ Songs • AI Melody • Lyrics • Edit & Save</p>
        </header>

        <div className="absolute top-0 right-0 flex gap-2">
          <button onClick={() => { setBrowseOpen(true); refreshFavorites(); }} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"><List className="w-5 h-5" /></button>
          <button onClick={() => setSettingsOpen(true)} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"><SettingsIcon className="w-5 h-5" /></button>
        </div>

        {!hasKeys && (
          <div className="bg-yellow-600/20 border border-yellow-600 text-yellow-200 p-3 rounded-lg mb-4 text-sm">
            ⚠️ YouTube API key not set. Click the gear icon.
          </div>
        )}

        <form onSubmit={handleSearch} className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur p-2 -mx-2 mb-4">
          <div className="flex gap-2">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search any YouTube video..." className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-base" />
            <button type="submit" disabled={loading} className="px-5 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
          </div>
        </form>

        {error && <div className="bg-red-600/20 border border-red-600 text-red-200 p-3 rounded-lg mb-4 text-sm"><AlertCircle className="w-4 h-4 inline mr-1" /> {error}</div>}

        {videos.length > 0 && !selectedVideo && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {videos.map((video) => (
              <div key={video.id.videoId} onClick={() => handleSelectVideo(video)} className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer">
                <img src={video.snippet.thumbnails.medium.url} className="w-full aspect-video object-cover" />
                <div className="p-2">
                  <h3 className="font-medium text-sm line-clamp-2">{video.snippet.title}</h3>
                  <p className="text-xs text-gray-400">{video.snippet.channelTitle}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedVideo && (
          <div className="space-y-4">
            <button onClick={() => { setSelectedVideo(null); setSongData(null); setEditMode(false); }} className="text-green-400 hover:underline flex items-center gap-1 text-sm">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="rounded-lg overflow-hidden">
              <YouTube videoId={selectedVideo.id.videoId} opts={{ width: '100%', height: '100%' }} className="aspect-video" />
            </div>
            <h2 className="text-lg font-bold">{selectedVideo.snippet.title}</h2>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 border-b border-gray-700">
                  <button onClick={() => setActiveTab('chords')} className={`px-4 py-2 font-medium ${activeTab === 'chords' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}><Music className="w-4 h-4 inline mr-1" /> Chords</button>
                  <button onClick={() => setActiveTab('melody')} className={`px-4 py-2 font-medium ${activeTab === 'melody' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}><Guitar className="w-4 h-4 inline mr-1" /> Melody</button>
                  <button onClick={() => setActiveTab('lyrics')} className={`px-4 py-2 font-medium ${activeTab === 'lyrics' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}><FileText className="w-4 h-4 inline mr-1" /> Lyrics</button>
                </div>
                {songData && !manualMode && (
                  <div className="flex gap-2">
                    {activeTab === 'lyrics' && (
                      <button onClick={handleFetchLyrics} disabled={fetchingLyrics} className="text-sm bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded flex items-center gap-1">
                        {fetchingLyrics ? <Loader2 className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4" />}
                        Fetch Lyrics
                      </button>
                    )}
                    {activeTab === 'melody' && (
                      <button onClick={handleGenerateMelody} disabled={generatingMelody} className="text-sm bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded flex items-center gap-1">
                        {generatingMelody ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        Generate Melody
                      </button>
                    )}
                    {!editMode ? (
                      <button onClick={enterEditMode} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded flex items-center gap-1"><Edit3 className="w-4 h-4" /> Edit</button>
                    ) : (
                      <>
                        <button onClick={saveEdits} className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded flex items-center gap-1"><Save className="w-4 h-4" /> Save</button>
                        <button onClick={cancelEdits} className="text-sm bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded flex items-center gap-1"><X className="w-4 h-4" /> Cancel</button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {chordLoading && <div className="text-center py-8"><Loader2 className="animate-spin inline" /> Loading...</div>}

              {!chordLoading && songData && (
                <>
                  {activeTab === 'chords' && renderChords(editMode ? editChords : songData.chords, editMode)}
                  {activeTab === 'melody' && renderMelody(editMode ? editMelody : (songData.melody || []), editMode)}
                  {activeTab === 'lyrics' && renderLyrics(editMode ? editLyrics : (songData.lyrics || ''), editMode)}
                </>
              )}

              {!chordLoading && !songData && !manualMode && (
                <div className="space-y-4">
                  <p className="text-gray-400">Song not in database.</p>
                  <button onClick={() => setManualMode(true)} className="px-4 py-2 bg-blue-600 rounded"><Plus className="inline w-4 h-4" /> Add Manually</button>
                </div>
              )}
            </div>
          </div>
        )}

        {browseOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-700 flex justify-between">
                <h2 className="text-xl font-bold">🎸 Bollywood Songs</h2>
                <button onClick={() => setBrowseOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="flex border-b border-gray-700">
                <button onClick={() => setBrowseTab('all')} className={`flex-1 py-2 ${browseTab === 'all' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}>All ({allSongs.length})</button>
                <button onClick={() => setBrowseTab('favorites')} className={`flex-1 py-2 ${browseTab === 'favorites' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}>Favorites ({favorites.length})</button>
              </div>
              <div className="overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {songsToShow.map((song) => (
                  <div key={song.id} className="bg-gray-700 hover:bg-gray-600 rounded-lg">
                    <button onClick={() => handleSelectSong(song)} className="text-left p-3 w-full">
                      <div className="font-medium">{song.title}</div>
                      <div className="text-xs text-gray-400">{song.artist} • {song.year}</div>
                    </button>
                    <div className="px-3 pb-2 flex justify-end">
                      <button onClick={() => handleToggleFavorite(song.id)} className="text-yellow-400">
                        <Star className={`w-4 h-4 ${isFavorite(song.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-700">
                <button onClick={() => setBrowseOpen(false)} className="w-full py-2 bg-green-600 rounded">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}