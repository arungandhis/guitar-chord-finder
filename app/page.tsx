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
} from 'lucide-react';
import Settings from './components/Settings';

interface VideoItem {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { medium: { url: string } };
    channelTitle: string;
  };
}

interface ChordData {
  chords: { name: string; timestamp: number }[];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [chords, setChords] = useState<ChordData | null>(null);
  const [loading, setLoading] = useState(false);
  const [chordLoading, setChordLoading] = useState(false);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasKeys, setHasKeys] = useState(false);

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
    setChords(null);
    setError('');
    setChordLoading(true);

    try {
      // Step 1: Search Songsterr for the song using video title
      const searchUrl = `https://www.songsterr.com/a/wa/bestMatchForQueryStringPart?s=${encodeURIComponent(
        video.snippet.title
      )}`;
      const searchRes = await axios.get(searchUrl);
      const songData = searchRes.data;

      if (!songData || !songData.id) {
        setError('Song not found on Songsterr.');
        setChordLoading(false);
        return;
      }

      // Step 2: Fetch tab data in JSON format
      const tabUrl = `https://www.songsterr.com/a/wa/tab?id=${songData.id}`;
      const tabRes = await axios.get(tabUrl, {
        headers: { Accept: 'application/json' },
      });
      const tabData = tabRes.data;

      // Step 3: Extract chord progression from tab JSON
      // Songsterr's tab JSON contains a "chords" array with timing info
      if (tabData && tabData.chords && tabData.chords.length > 0) {
        const formattedChords = {
          chords: tabData.chords.map((chord: any) => ({
            name: chord.chordName,
            timestamp: chord.time, // time in seconds
          })),
        };
        setChords(formattedChords);
      } else {
        setError('No chord data available for this song on Songsterr.');
      }
    } catch (err: any) {
      console.error('Songsterr API error:', err);
      setError('Failed to load chords from Songsterr. Please try again later.');
    } finally {
      setChordLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-3 md:p-8">
      <div className="max-w-6xl mx-auto relative">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-1 flex items-center justify-center gap-2">
            <Music className="w-7 h-7 text-green-400" />
            Chord Finder
          </h1>
          <p className="text-gray-400 text-sm">YouTube → Chords (via Songsterr)</p>
        </header>

        {/* Settings Button */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="absolute top-0 right-0 p-2 bg-gray-800 rounded-full hover:bg-gray-700"
          aria-label="Settings"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>

        {/* No Keys Warning */}
        {!hasKeys && (
          <div className="bg-yellow-600/20 border border-yellow-600 text-yellow-200 p-3 rounded-lg mb-4 text-sm">
            ⚠️ YouTube API key not set. Click the gear icon to add your key.
          </div>
        )}

        {/* Search Form */}
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
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="bg-red-600/20 border border-red-600 text-red-200 p-3 rounded-lg mb-4 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Video Results Grid */}
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
                  <h3 className="font-medium text-sm line-clamp-2">
                    {video.snippet.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {video.snippet.channelTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Video View */}
        {selectedVideo && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setSelectedVideo(null);
                setChords(null);
                setError('');
              }}
              className="text-green-400 hover:underline flex items-center gap-1 text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="space-y-4">
              {/* YouTube Player */}
              <div className="rounded-lg overflow-hidden">
                <YouTube
                  videoId={selectedVideo.id.videoId}
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: { autoplay: 0 },
                  }}
                  className="aspect-video"
                />
              </div>
              <h2 className="text-lg font-bold px-1">
                {selectedVideo.snippet.title}
              </h2>

              {/* Chords Panel */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Music className="w-5 h-5 text-green-400" />
                  Chords
                </h3>

                {chordLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin w-6 h-6 text-green-400" />
                    <span className="ml-2">Fetching from Songsterr...</span>
                  </div>
                )}

                {error && !chordLoading && (
                  <div className="bg-red-600/20 border border-red-600 text-red-200 p-3 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {chords?.chords && !error && (
                  <div className="space-y-1 max-h-80 overflow-y-auto">
                    {chords.chords.map((chord, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-gray-700 rounded active:bg-gray-600"
                      >
                        <span className="text-xl font-mono font-bold text-green-300">
                          {chord.name}
                        </span>
                        <span className="text-sm text-gray-300">
                          {formatTime(chord.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}