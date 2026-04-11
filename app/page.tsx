'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import YouTube from 'react-youtube';
import {
  Search,
  Loader2,
  Music,
  ChevronLeft,
  Settings as SettingsIcon,
  AlertCircle,
  Plus,
  Save,
  X,
  List,
  Guitar,
} from 'lucide-react';
import Settings from './components/Settings';
import { getStaticChords, getAllStaticSongs, ChordEntry, MelodyNote } from './staticChords';

interface VideoItem {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { medium: { url: string } };
    channelTitle: string;
  };
}

interface SongData {
  chords: ChordEntry[];
  melody?: MelodyNote[];
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
  const [manualChords, setManualChords] = useState<ChordEntry[]>([{ name: '', timestamp: 0 }]);
  const [manualMelody, setManualMelody] = useState<MelodyNote[]>([{ string: 1, fret: 0, timestamp: 0 }]);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [availableSongs] = useState(() => getAllStaticSongs());
  const [activeTab, setActiveTab] = useState<'chords' | 'melody'>('chords');

  useEffect(() => {
    const yt = localStorage.getItem('youtube_api_key');
    setHasKeys(!!yt);
  }, []);

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
      const errorMessage =
        err.response?.data?.error?.message ||
        'Search failed. Check your API key or try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVideo = async (video: VideoItem) => {
    setSelectedVideo(video);
    setSongData(null);
    setError('');
    setChordLoading(true);
    setManualMode(false);

    const staticResult = getStaticChords(video.snippet.title);
    if (staticResult) {
      setSongData(staticResult);
      setChordLoading(false);
      return;
    }

    setChordLoading(false);
    setError('Song not found in database. You can enter chords and melody manually below.');
  };

  const addManualChordRow = () => {
    setManualChords([...manualChords, { name: '', timestamp: 0 }]);
  };

  const updateManualChord = (index: number, field: 'name' | 'timestamp', value: string | number) => {
    const updated = [...manualChords];
    if (field === 'name') {
      updated[index].name = value as string;
    } else {
      updated[index].timestamp = Number(value);
    }
    setManualChords(updated);
  };

  const removeManualChord = (index: number) => {
    setManualChords(manualChords.filter((_, i) => i !== index));
  };

  const addManualMelodyRow = () => {
    setManualMelody([...manualMelody, { string: 1, fret: 0, timestamp: 0 }]);
  };

  const updateManualMelody = (index: number, field: 'string' | 'fret' | 'timestamp', value: number) => {
    const updated = [...manualMelody];
    updated[index][field] = value;
    setManualMelody(updated);
  };

  const removeManualMelody = (index: number) => {
    setManualMelody(manualMelody.filter((_, i) => i !== index));
  };

  const saveManualData = () => {
    const validChords = manualChords.filter(c => c.name.trim() !== '');
    const validMelody = manualMelody.filter(m => m.timestamp !== undefined);
    if (validChords.length === 0 && validMelody.length === 0) {
      setError('Please enter at least one chord or melody note.');
      return;
    }
    setSongData({ chords: validChords, melody: validMelody });
    setManualMode(false);
    setError('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMelodyNote = (note: MelodyNote) => {
    const strings = ['E', 'B', 'G', 'D', 'A', 'E'];
    return `${strings[note.string - 1]}${note.fret}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-3 md:p-8">
      <div className="max-w-6xl mx-auto relative">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-1 flex items-center justify-center gap-2">
            <Music className="w-7 h-7 text-green-400" />
            Chord & Tab Finder
          </h1>
          <p className="text-gray-400 text-sm">YouTube → Chords + Melody Notes</p>
        </header>

        <div className="absolute top-0 right-0 flex gap-2">
          <button
            onClick={() => setBrowseOpen(true)}
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"
            aria-label="Browse songs"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"
            aria-label="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>

        {!hasKeys && (
          <div className="bg-yellow-600/20 border border-yellow-600 text-yellow-200 p-3 rounded-lg mb-4 text-sm">
            ⚠️ YouTube API key not set. Click the gear icon to add your key.
          </div>
        )}

        <form
          onSubmit={handleSearch}
          className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur p-2 -mx-2 mb-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Song name or artist..."
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center gap-1 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-600/20 border border-red-600 text-red-200 p-3 rounded-lg mb-4 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {videos.length > 0 && !selectedVideo && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {videos.map((video) => (
              <div
                key={video.id.videoId}
                onClick={() => handleSelectVideo(video)}
                className="bg-gray-800 rounded-lg overflow-hidden active:ring-2 active:ring-green-500 transition cursor-pointer"
              >
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-2">
                  <h3 className="font-medium text-sm line-clamp-2">{video.snippet.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 truncate">{video.snippet.channelTitle}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedVideo && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setSelectedVideo(null);
                setSongData(null);
                setError('');
                setManualMode(false);
              }}
              className="text-green-400 hover:underline flex items-center gap-1 text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden">
                <YouTube
                  videoId={selectedVideo.id.videoId}
                  opts={{ width: '100%', height: '100%', playerVars: { autoplay: 0 } }}
                  className="aspect-video"
                />
              </div>
              <h2 className="text-lg font-bold px-1">{selectedVideo.snippet.title}</h2>

              <div className="bg-gray-800 rounded-lg p-4">
                {/* Tab switcher */}
                <div className="flex gap-2 mb-4 border-b border-gray-700">
                  <button
                    onClick={() => setActiveTab('chords')}
                    className={`px-4 py-2 font-medium ${activeTab === 'chords' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}
                  >
                    <Music className="w-4 h-4 inline mr-1" /> Chords
                  </button>
                  <button
                    onClick={() => setActiveTab('melody')}
                    className={`px-4 py-2 font-medium ${activeTab === 'melody' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}
                  >
                    <Guitar className="w-4 h-4 inline mr-1" /> Melody Tab
                  </button>
                </div>

                {chordLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin w-6 h-6 text-green-400" />
                    <span className="ml-2">Looking up...</span>
                  </div>
                )}

                {!chordLoading && !songData && !manualMode && (
                  <div className="space-y-4">
                    <p className="text-gray-400 text-sm">
                      This song isn't in our database yet. Would you like to enter chords and melody manually?
                    </p>
                    <button
                      onClick={() => setManualMode(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Data Manually
                    </button>
                  </div>
                )}

                {manualMode && (
                  <div className="space-y-6">
                    {/* Manual Chords Section */}
                    <div>
                      <h4 className="font-medium mb-2">Chords</h4>
                      {manualChords.map((chord, idx) => (
                        <div key={idx} className="flex gap-2 items-center mb-2">
                          <input
                            type="text"
                            placeholder="Chord"
                            value={chord.name}
                            onChange={(e) => updateManualChord(idx, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                          />
                          <input
                            type="number"
                            placeholder="Time"
                            value={chord.timestamp}
                            onChange={(e) => updateManualChord(idx, 'timestamp', e.target.value)}
                            className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                          />
                          {manualChords.length > 1 && (
                            <button onClick={() => removeManualChord(idx)} className="p-2 bg-red-600 rounded">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button onClick={addManualChordRow} className="text-sm text-green-400 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Chord
                      </button>
                    </div>

                    {/* Manual Melody Section */}
                    <div>
                      <h4 className="font-medium mb-2">Melody Notes (String, Fret, Time)</h4>
                      {manualMelody.map((note, idx) => (
                        <div key={idx} className="flex gap-2 items-center mb-2">
                          <select
                            value={note.string}
                            onChange={(e) => updateManualMelody(idx, 'string', parseInt(e.target.value))}
                            className="w-16 px-2 py-2 bg-gray-700 border border-gray-600 rounded"
                          >
                            {[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s}e</option>)}
                          </select>
                          <input
                            type="number"
                            placeholder="Fret"
                            value={note.fret}
                            onChange={(e) => updateManualMelody(idx, 'fret', parseInt(e.target.value))}
                            className="w-16 px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                          />
                          <input
                            type="number"
                            placeholder="Time"
                            value={note.timestamp}
                            onChange={(e) => updateManualMelody(idx, 'timestamp', parseInt(e.target.value))}
                            className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                          />
                          {manualMelody.length > 1 && (
                            <button onClick={() => removeManualMelody(idx)} className="p-2 bg-red-600 rounded">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button onClick={addManualMelodyRow} className="text-sm text-green-400 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Note
                      </button>
                    </div>

                    <button onClick={saveManualData} className="px-4 py-2 bg-green-600 rounded flex items-center gap-2">
                      <Save className="w-4 h-4" /> Save All
                    </button>
                  </div>
                )}

                {songData && !manualMode && (
                  <>
                    {activeTab === 'chords' && (
                      <div className="space-y-1 max-h-80 overflow-y-auto">
                        {songData.chords.map((chord, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                            <span className="text-xl font-mono font-bold text-green-300">{chord.name}</span>
                            <span className="text-sm text-gray-300">{formatTime(chord.timestamp)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === 'melody' && (
                      <div className="space-y-1 max-h-80 overflow-y-auto">
                        {songData.melody && songData.melody.length > 0 ? (
                          songData.melody.map((note, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                              <span className="text-lg font-mono">
                                String {note.string}, Fret {note.fret}
                              </span>
                              <span className="text-sm text-gray-300">{formatTime(note.timestamp)}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-center py-4">No melody notes available for this song.</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Browse Songs Modal */}
        {browseOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold">Available Songs</h2>
                <button onClick={() => setBrowseOpen(false)} className="p-1 hover:bg-gray-700 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-4 space-y-1">
                {availableSongs.map((song, idx) => (
                  <div key={idx} className="p-2 bg-gray-700 rounded text-sm">
                    {song.displayName}
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-700">
                <button
                  onClick={() => setBrowseOpen(false)}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}