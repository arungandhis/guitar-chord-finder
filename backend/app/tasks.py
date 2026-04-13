import os
import tempfile
import subprocess
import json
import shutil
import random
import yt_dlp
from pytube import YouTube
from youtube_dl_exec import youtube_dl_exec
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
from app.fretting import midi_to_guitar_notes

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
]

def download_audio_pytube(youtube_url: str, output_path: str) -> bool:
    """Attempt pytube with a random user agent."""
    try:
        yt = YouTube(youtube_url)
        audio_stream = yt.streams.filter(only_audio=True).first()
        if not audio_stream:
            return False
        temp_file = audio_stream.download(output_path=os.path.dirname(output_path))
        wav_path = output_path + '.wav'
        subprocess.run([
            'ffmpeg', '-i', temp_file, '-acodec', 'pcm_s16le', '-ar', '44100', wav_path
        ], check=True, capture_output=True)
        os.remove(temp_file)
        return True
    except:
        return False

def download_audio_ytdlp(youtube_url: str, output_path: str) -> bool:
    """yt-dlp with mobile client emulation."""
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
            'preferredquality': '192',
        }],
        'outtmpl': output_path,
        'quiet': True,
        'no_warnings': True,
        'user_agent': random.choice(USER_AGENTS),
        'extractor_args': {'youtube': {'player_client': ['android']}},
        'socket_timeout': 30,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([youtube_url])
        return True
    except:
        return False

def download_audio_youtubedl(youtube_url: str, output_path: str) -> bool:
    """Fallback to youtube-dl-exec."""
    try:
        youtube_dl_exec(youtube_url, {
            'extract-audio': True,
            'audio-format': 'wav',
            'output': output_path + '.%(ext)s',
            'user-agent': random.choice(USER_AGENTS),
        })
        return True
    except:
        return False

def download_audio(youtube_url: str, output_base: str) -> str:
    """Try multiple downloaders in sequence."""
    if download_audio_pytube(youtube_url, output_base):
        return output_base + '.wav'
    if download_audio_ytdlp(youtube_url, output_base):
        return output_base + '.wav'
    if download_audio_youtubedl(youtube_url, output_base):
        return output_base + '.wav'
    raise RuntimeError("All download methods failed. YouTube may be blocking this request.")

# ... rest of the file (separate_guitar, process_transcription) unchanged ...