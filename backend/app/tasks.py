import os
import tempfile
import subprocess
import json
import shutil
import yt_dlp
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
from app.fretting import midi_to_guitar_notes

def download_audio(youtube_url: str, output_path: str):
    """
    Download audio using yt-dlp Python module with browser-like headers.
    """
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
            'preferredquality': '192',
        }],
        'outtmpl': output_path.replace('.wav', ''),  # yt-dlp adds extension
        'quiet': True,
        'no_warnings': True,
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'extractor_args': {'youtube': {'skip': ['dash', 'hls']}},
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([youtube_url])
        # The actual output file will have .wav extension; ensure we return the correct path
        # yt-dlp adds .wav after extraction, so adjust path
        return output_path
    except Exception as e:
        raise RuntimeError(f"yt-dlp download failed: {str(e)}")

def separate_guitar(input_path: str, output_dir: str):
    cmd = ["demucs", "--two-stems=vocals", "-o", output_dir, input_path]
    subprocess.run(cmd, check=True, capture_output=True)

def process_transcription(job_id: str, youtube_url: str, jobs: dict):
    temp_dir = tempfile.mkdtemp()
    audio_input = os.path.join(temp_dir, "audio")
    demucs_output = os.path.join(temp_dir, "separated")
    
    try:
        # 1. Download audio (output_path will be audio.wav after post-processing)
        download_audio(youtube_url, audio_input)
        actual_audio = audio_input + '.wav'  # yt-dlp adds extension
        
        # 2. Separate guitar stem
        separate_guitar(actual_audio, demucs_output)
        
        # 3. Locate guitar stem
        guitar_stem = os.path.join(temp_dir, "separated", "htdemucs", "audio", "guitar.wav")
        if not os.path.exists(guitar_stem):
            guitar_stem = actual_audio
        
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
        jobs[job_id] = {"status": "failed", "error": str(e)}
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)