import os
from imageio_ffmpeg import get_ffmpeg_exe

# openai-whisper internally shells out to a plain "ffmpeg" command on PATH
# when loading audio, which is separate from the imageio_ffmpeg binary this
# project already uses for extraction. On machines without ffmpeg installed
# system-wide (common on Windows), that internal call fails and transcription
# breaks even though our own extract_audio() step succeeded.
# Fix: put the bundled ffmpeg binary's folder on PATH so Whisper finds it too.
_ffmpeg_dir = os.path.dirname(get_ffmpeg_exe())
if _ffmpeg_dir not in os.environ.get("PATH", ""):
    os.environ["PATH"] = _ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")

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