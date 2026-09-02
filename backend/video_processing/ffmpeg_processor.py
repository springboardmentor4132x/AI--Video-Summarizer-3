import subprocess
from imageio_ffmpeg import get_ffmpeg_exe


def extract_audio(video_path: str, audio_path: str):
    command = [
        get_ffmpeg_exe(),
        "-y",
        "-i",
        video_path,
        "-vn",
        "-af",
        "loudnorm",
        "-ar",
        "16000",
        "-ac",
        "1",
        "-c:a",
        "pcm_s16le",
        audio_path,
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise RuntimeError(result.stderr)

    return audio_path
