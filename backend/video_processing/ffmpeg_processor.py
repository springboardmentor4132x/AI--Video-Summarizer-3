import subprocess


def get_video_info(video_path):
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_format", "-show_streams", video_path],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise RuntimeError(result.stderr)

    return result.stdout


def extract_audio(video_path, audio_path):
    result = subprocess.run(
        [
            "ffmpeg",
            "-i", video_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            "-y",
            audio_path
        ],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise RuntimeError(result.stderr)

    return audio_path