import subprocess


def extract_audio(video_path: str, audio_path: str):
    command = [
        "ffmpeg",
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

    subprocess.run(
        command,
        check=True
    )