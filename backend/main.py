"""
ClipMind AI - Backend Entry Point

Module 1:
Project Initialization, Design Process & Core Setup

Module 2:
Transcript Generation using FFmpeg + Whisper
"""

from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from video_processing.ffmpeg_processor import extract_audio
from transcription.whisper_processor import WhisperProcessor

from app.database import engine, Base, SessionLocal
from app import models


# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="ClipMind AI API",
    description="AI-powered video summarization & key moments detection platform",
    version="0.2.0",
)


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Basic routes
# ---------------------------------------------------------

@app.get("/")
def read_root():
    """Basic sanity check that the server is alive."""
    return {
        "message": "ClipMind AI backend is running"
    }


@app.get("/health")
def health_check():
    """Used by teammates / deployment tools to confirm the API is up."""
    return {
        "status": "ok"
    }


# ---------------------------------------------------------
# File storage
# ---------------------------------------------------------

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# ---------------------------------------------------------
# Whisper processor
# ---------------------------------------------------------

# Load Whisper once when the application starts.
# Using tiny model because it is suitable for local CPU testing.
whisper_processor = WhisperProcessor("tiny")


# ---------------------------------------------------------
# Video processing + transcript generation
# ---------------------------------------------------------

@app.post("/video/process")
async def process_video(
    file: UploadFile = File(...),
    user_id: int = Form(...)
):
    """
    Module 2 pipeline:

    MP4
      ↓
    Save video
      ↓
    Create Video database record
      ↓
    FFmpeg
      ↓
    WAV audio
      ↓
    Whisper
      ↓
    Transcript
      ↓
    Save Transcript to database
    """

    # -----------------------------------------------------
    # 1. Validate file
    # -----------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was provided"
        )

    if not file.filename.lower().endswith(".mp4"):
        raise HTTPException(
            status_code=400,
            detail="Only MP4 files are supported"
        )


    # -----------------------------------------------------
    # 2. Check user exists
    # -----------------------------------------------------

    db: Session = SessionLocal()

    try:

        user = (
            db.query(models.User)
            .filter(models.User.id == user_id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail=f"User with id {user_id} not found"
            )


        # -------------------------------------------------
        # 3. Create video paths
        # -------------------------------------------------

        video_path = UPLOAD_DIR / file.filename
        audio_path = UPLOAD_DIR / f"{video_path.stem}.wav"


        # -------------------------------------------------
        # 4. Save uploaded video
        # -------------------------------------------------

        with open(video_path, "wb") as buffer:
            buffer.write(await file.read())


        # -------------------------------------------------
        # 5. Create Video record
        # -------------------------------------------------

        video = models.Video(
            user_id=user_id,
            filename=file.filename,
            file_path=str(video_path),
            status="processing"
        )

        db.add(video)
        db.commit()
        db.refresh(video)


        # -------------------------------------------------
        # 6. Create Transcript record
        # -------------------------------------------------

        transcript = models.Transcript(
            video_id=video.id,
            user_id=user_id,
            transcript_text=None,
            status="processing"
        )

        db.add(transcript)
        db.commit()
        db.refresh(transcript)


        # -------------------------------------------------
        # 7. Extract audio using FFmpeg
        # -------------------------------------------------

        try:

            extract_audio(
                str(video_path),
                str(audio_path)
            )

        except Exception as e:

            video.status = "failed"
            transcript.status = "failed"

            db.commit()

            raise HTTPException(
                status_code=500,
                detail=f"Audio extraction failed: {str(e)}"
            )


        # -------------------------------------------------
        # 8. Generate transcript using Whisper
        # -------------------------------------------------

        try:

            transcript_text = whisper_processor.transcribe(
                str(audio_path)
            )

        except Exception as e:

            video.status = "failed"
            transcript.status = "failed"

            db.commit()

            raise HTTPException(
                status_code=500,
                detail=f"Transcription failed: {str(e)}"
            )


        # -------------------------------------------------
        # 9. Check transcript result
        # -------------------------------------------------

        if not transcript_text:

            video.status = "failed"
            transcript.status = "failed"

            db.commit()

            raise HTTPException(
                status_code=500,
                detail="Whisper generated an empty transcript"
            )


        # -------------------------------------------------
        # 10. Save transcript
        # -------------------------------------------------

        transcript.transcript_text = transcript_text
        transcript.status = "completed"

        video.status = "processed"

        db.commit()

        db.refresh(video)
        db.refresh(transcript)


        # -------------------------------------------------
        # 11. Return result
        # -------------------------------------------------

        return {
            "status": "completed",
            "video_id": video.id,
            "transcript_id": transcript.id,
            "video": str(video_path),
            "audio": str(audio_path),
            "transcript": transcript_text
        }


    finally:

        db.close()