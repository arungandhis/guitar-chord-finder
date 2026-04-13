import os
import tempfile
import subprocess
import shutil
import random
import yt_dlp
from pytube import YouTube
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
from app.fretting import midi_to_guitar_notes

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
]


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
        temp_file = audio_stream.download(output_path=os.path.dirname(output_path))
        wav_path = output_path + '.wav'
        subprocess.run(
            ['ffmpeg', '-i', temp_file, '-acodec', 'pcm_s16le', '-ar', '44100', wav_path],
            check=True,
            capture_output=True
        )
        os.remove(temp_file)
        return True
    except Exception:
        return False


def download_audio_ytdlp(youtube_url: str, output_path: str) -> bool:
    """
    Attempt to download using yt-dlp with mobile client emulation and rotating user agents.
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
        'user_agent': random.choice(USER_AGENTS),
        'extractor_args': {'youtube': {'player_client': ['android', 'web']}},
        'socket_timeout': 30,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([youtube_url])
        return True
    except Exception:
        return False


def download_audio(youtube_url: str, output_base: str) -> str:
    """
    Try pytube first, then yt-dlp.
    Returns the path to the downloaded WAV file.
    Raises RuntimeError if all methods fail.
    """
    if download_audio_pytube(youtube_url, output_base):
        return output_base + '.wav'
    if download_audio_ytdlp(youtube_url, output_base):
        return output_base + '.wav'
    raise RuntimeError("All download methods failed. YouTube may be blocking this request.")


def separate_guitar(input_path: str, output_dir: str):
    """
    Use Demucs to isolate the guitar stem.
    """
    cmd = ["demucs", "--two-stems=vocals", "-o", output_dir, input_path]
    subprocess.run(cmd, check=True, capture_output=True)


def process_transcription(job_id: str, youtube_url: str, jobs: dict):
    """
    Main transcription pipeline.
    """
    temp_dir = tempfile.mkdtemp()
    audio_base = os.path.join(temp_dir, "audio")
    demucs_output = os.path.join(temp_dir, "separated")

    try:
        # 1. Download audio
        audio_file = download_audio(youtube_url, audio_base)

        # 2. Separate guitar stem
        separate_guitar(audio_file, demucs_output)

        # 3. Locate guitar stem
        guitar_stem = os.path.join(
            temp_dir, "separated", "htdemucs",
            os.path.basename(audio_file).rsplit('.', 1)[0],
            "guitar.wav"
        )
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

        # 5. Convert to guitar fretting
        melody = midi_to_guitar_notes(note_events)
        jobs[job_id] = {"status": "completed", "result": {"melody": melody}}

    except Exception as e:
        jobs[job_id] = {"status": "failed", "error": str(e)}

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def process_uploaded_file(job_id: str, file_path: str, jobs: dict):
    """
    Process an uploaded audio file.
    """
    temp_dir = os.path.dirname(file_path)
    demucs_output = os.path.join(temp_dir, "separated")

    try:
        separate_guitar(file_path, demucs_output)
        guitar_stem = os.path.join(
            temp_dir, "separated", "htdemucs",
            os.path.basename(file_path).rsplit('.', 1)[0],
            "guitar.wav"
        )
        if not os.path.exists(guitar_stem):
            guitar_stem = file_path

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