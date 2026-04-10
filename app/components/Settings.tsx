'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, X } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const [youtubeKey, setYoutubeKey] = useState('');
  const [lamucalKey, setLamucalKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setYoutubeKey(localStorage.getItem('youtube_api_key') || '');
      setLamucalKey(localStorage.getItem('lamucal_api_key') || '');
    }
  }, [isOpen]);

  const saveSettings = () => {
    localStorage.setItem('youtube_api_key', youtubeKey.trim());
    localStorage.setItem('lamucal_api_key', lamucalKey.trim());
    onClose();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            API Settings
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Enter your own API keys. They are stored only in your browser.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              YouTube Data API v3 Key
            </label>
            <input
              type="password"
              value={youtubeKey}
              onChange={(e) => setYoutubeKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-400 mt-1 inline-block"
            >
              Get a YouTube API key →
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Lamucal API Key
            </label>
            <input
              type="password"
              value={lamucalKey}
              onChange={(e) => setLamucalKey(e.target.value)}
              placeholder="lmc_..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <a
              href="https://lamucal.com/dashboard/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-400 mt-1 inline-block"
            >
              Get a Lamucal API key →
            </a>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}