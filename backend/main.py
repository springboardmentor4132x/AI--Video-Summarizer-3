"""
ClipMind AI - Backend Entry Point
Module 1: Project Initialization, Design Process & Core Setup

Run locally with:
    uvicorn main:app --reload
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from video_processing.ffmpeg_processor import extract_audio


app = FastAPI(
    title="ClipMind AI API",
    description="AI-powered video summarization & key moments detection platform",
    version="0.1.0",
)


# Allow the frontend to communicate with the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Basic sanity check that the server is alive."""
    return {"message": "ClipMind AI backend is running"}


@app.get("/health")
def health_check():
    """Used by teammates / deployment tools to confirm the API is up."""
    return {"status": "ok"}


# Folder where uploaded videos and extracted audio will be stored.
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.post("/video/process")
async def process_video(file: UploadFile = File(...)):
    """Upload an MP4 video and extract its audio using FFmpeg."""

    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".mp4"):
        raise HTTPException(
            status_code=400,
            detail="Only MP4 files are supported"
        )

    # Create paths for video and extracted audio
    video_path = UPLOAD_DIR / file.filename
    audio_path = UPLOAD_DIR / f"{video_path.stem}.wav"

    # Save uploaded video
    with open(video_path, "wb") as buffer:
        buffer.write(await file.read())

    # Extract audio using FFmpeg
    extract_audio(str(video_path), str(audio_path))

    return {
        "status": "processed",
        "video": str(video_path),
        "audio": str(audio_path)
    }