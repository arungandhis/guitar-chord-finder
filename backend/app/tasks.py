import os
import tempfile
import subprocess
import json
import shutil
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
from app.fretting import midi_to_guitar_notes

def download_audio(youtube_url: str, output_path: str):
    cmd = [
        "yt-dlp",
        "-f", "bestaudio",
        "--extract-audio",
        "--audio-format", "wav",
        "--output", output_path,
        youtube_url
    ]
    subprocess.run(cmd, check=True, capture_output=True)

def separate_guitar(input_path: str, output_dir: str):
    cmd = ["demucs", "--two-stems=vocals", "-o", output_dir, input_path]
    subprocess.run(cmd, check=True, capture_output=True)

def process_transcription(job_id: str, youtube_url: str, jobs: dict):
    temp_dir = tempfile.mkdtemp()
    audio_input = os.path.join(temp_dir, "audio.wav")
    demucs_output = os.path.join(temp_dir, "separated")
    
    try:
        # 1. Download audio
        download_audio(youtube_url, audio_input)
        
        # 2. Separate guitar stem (optional but improves accuracy)
        separate_guitar(audio_input, demucs_output)
        
        # 3. Locate the guitar stem (Demucs output path)
        guitar_stem = os.path.join(temp_dir, "separated", "htdemucs", "audio", "guitar.wav")
        if not os.path.exists(guitar_stem):
            # Fallback to original if separation fails
            guitar_stem = audio_input
        
        # 4. Transcribe with Basic Pitch
        model_output, midi_data, note_events = predict(
            guitar_stem,
            ICASSP_2022_MODEL_PATH,
            onset_threshold=0.5,
            frame_threshold=0.3,
            minimum_note_length=58,
            minimum_frequency=80,
            maximum_frequency=1000,
        )
        
        # 5. Convert MIDI pitches to guitar string/fret positions
        melody = midi_to_guitar_notes(note_events)
        
        # 6. Store completed result in the shared jobs dictionary
        jobs[job_id] = {
            "status": "completed",
            "result": {"melody": melody}
        }
    except Exception as e:
        # Store failure status with error message
        jobs[job_id] = {
            "status": "failed",
            "error": str(e)
        }
    finally:
        # Cleanup temporary files
        shutil.rmtree(temp_dir, ignore_errors=True)