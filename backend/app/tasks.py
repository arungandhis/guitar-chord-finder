import os
import tempfile
import subprocess
import json
import shutil
import yt_dlp
from pytube import YouTube
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
from app.fretting import midi_to_guitar_notes

def download_audio_pytube(youtube_url: str, output_path: str) -> bool:
    """
    Attempt to download audio using pytube.
    Returns True if successful, False otherwise.
    """
    try:
        yt = YouTube(youtube_url)
        audio_stream = yt.streams.filter(only_audio=True).first()
        if not audio_stream:
            return False
        # Download to temp file
        temp_file = audio_stream.download(output_path=os.path.dirname(output_path))
        # Convert to wav using ffmpeg
        wav_path = output_path + '.wav'
        subprocess.run([
            'ffmpeg', '-i', temp_file, '-acodec', 'pcm_s16le', '-ar', '44100', wav_path
        ], check=True, capture_output=True)
        os.remove(temp_file)
        return True
    except Exception as e:
        print(f"pytube failed: {e}")
        return False

def download_audio_ytdlp(youtube_url: str, output_path: str):
    """
    Fallback using yt-dlp with browser-like headers.
    """
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
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])

def download_audio(youtube_url: str, output_base: str):
    """
    Try pytube first; if it fails, fallback to yt-dlp.
    """
    # Try pytube
    if download_audio_pytube(youtube_url, output_base):
        return output_base + '.wav'
    # Fallback to yt-dlp
    download_audio_ytdlp(youtube_url, output_base)
    return output_base + '.wav'

def separate_guitar(input_path: str, output_dir: str):
    cmd = ["demucs", "--two-stems=vocals", "-o", output_dir, input_path]
    subprocess.run(cmd, check=True, capture_output=True)

def process_transcription(job_id: str, youtube_url: str, jobs: dict):
    temp_dir = tempfile.mkdtemp()
    audio_base = os.path.join(temp_dir, "audio")
    demucs_output = os.path.join(temp_dir, "separated")
    
    try:
        # 1. Download audio using best available method
        audio_file = download_audio(youtube_url, audio_base)
        
        # 2. Separate guitar stem
        separate_guitar(audio_file, demucs_output)
        
        # 3. Locate guitar stem
        guitar_stem = os.path.join(temp_dir, "separated", "htdemucs", "audio", "guitar.wav")
        if not os.path.exists(guitar_stem):
            guitar_stem = audio_file
        
        # 4. Transcribe
        model_output, midi_data, note_events = predict(
            guitar_stem,
            ICASSP_2022_MODEL_PATH,
            onset_threshold=0.5,
            frame_threshold=0.3,
            minimum_note_length=58,
            minimum_frequency=80,
            maximum_frequency=1000,
        )
        
        melody = midi_to_guitar_notes(note_events)
        jobs[job_id] = {"status": "completed", "result": {"melody": melody}}
    except Exception as e:
        error_msg = str(e)
        if "Sign in to confirm" in error_msg:
            error_msg = "YouTube blocked the request. Try a different video or retry later."
        jobs[job_id] = {"status": "failed", "error": error_msg}
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)