import os
import shutil
import stat
import tempfile
from pathlib import Path

from imageio_ffmpeg import get_ffmpeg_exe

def _expose_ffmpeg_command():
    """Expose imageio-ffmpeg's bundled binary as the `ffmpeg` command."""
    bundled_ffmpeg = Path(get_ffmpeg_exe())
    command_dir = Path(tempfile.gettempdir()) / "clipmind-bin"
    command_dir.mkdir(parents=True, exist_ok=True)
    command_name = "ffmpeg.exe" if os.name == "nt" else "ffmpeg"
    command_path = command_dir / command_name

    if not command_path.exists():
        try:
            command_path.symlink_to(bundled_ffmpeg)
        except OSError:
            shutil.copy2(bundled_ffmpeg, command_path)

    if os.name != "nt":
        command_path.chmod(command_path.stat().st_mode | stat.S_IXUSR)

    os.environ["PATH"] = str(command_dir) + os.pathsep + os.environ.get("PATH", "")


_expose_ffmpeg_command()

import whisper


class WhisperProcessor:
    def __init__(self, model_name="tiny"):
        print(f"Loading Whisper model: {model_name}")
        self.model = whisper.load_model(model_name)
        print("Whisper model loaded successfully")

    def transcribe(self, audio_path: str) -> str:
        result = self.model.transcribe(
            audio_path,
            fp16=False,
            language="en",
            temperature=0
        )

        text = result.get("text", "").strip()

        print("Whisper transcript:", repr(text))

        return text

    def transcribe_with_timestamps(self, audio_path: str):
        result = self.model.transcribe(
            audio_path,
            fp16=False,
            language="en",
            temperature=0
        )

        segments = []

        for segment in result.get("segments", []):
            text = segment.get("text", "").strip()

            if text:
                segments.append({
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": text
                })

        print("Timestamped segments:")
        for segment in segments:
            print(segment)

        return segments