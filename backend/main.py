"""
ClipMind AI - Backend Entry Point

Module 1:
Project Initialization, Design Process & Core Setup

Module 2:
Transcript Generation using FFmpeg + Whisper
"""

import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import (
    Depends,
    FastAPI,
    UploadFile,
    File,
    HTTPException,
    Header,
)
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from jose import jwt
from sqlalchemy.orm import Session

from video_processing.ffmpeg_processor import extract_audio
from transcription.whisper_processor import WhisperProcessor

from app.database import engine, Base, get_db
from app import models


# ---------------------------------------------------------
# Create database tables if they do not exist
# ---------------------------------------------------------

Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------

app = FastAPI(
    title="ClipMind AI API",
    description="AI-powered video summarization & key moments detection platform",
    version="0.2.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

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
# JWT Authentication
# ---------------------------------------------------------

JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "clipmind-development-secret"
)

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def create_access_token(user_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    return jwt.encode(
        {
            "sub": str(user_id),
            "exp": expires_at
        },
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )


def user_response(user: models.User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }


def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Extract and validate JWT token, return current user."""

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing authorization header"
        )

    try:
        # Extract token from "Bearer <token>"
        parts = authorization.split(" ")

        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization header format"
            )

        token = parts[1]

        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = int(payload.get("sub"))

        user = (
            db.query(models.User)
            .filter(models.User.id == user_id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token expired"
        )

    except jwt.JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or malformed token"
        )


# ---------------------------------------------------------
# Authentication Routes
# ---------------------------------------------------------

@app.post("/auth/register")
def register_user(
    payload: RegisterRequest,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == payload.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered"
        )

    user = models.User(
        name=payload.name,
        email=payload.email,
        password=password_context.hash(payload.password),
        role=payload.role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user": user_response(user)
    }


@app.post("/auth/login")
def login_user(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(models.User)
        .filter(models.User.email == payload.email)
        .first()
    )

    if not user or not password_context.verify(
        payload.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
        "user": user_response(user),
    }


# ---------------------------------------------------------
# Basic Routes
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
# Get Current User Videos
# ---------------------------------------------------------

@app.get("/videos/me")
def get_user_videos(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all videos uploaded by the current user."""

    videos = (
        db.query(models.Video)
        .filter(models.Video.user_id == current_user.id)
        .order_by(models.Video.uploaded_at.desc())
        .all()
    )

    return {
        "user_id": current_user.id,
        "videos": [
            {
                "id": video.id,
                "filename": video.filename,
                "file_path": video.file_path,
                "status": video.status,
                "uploaded_at": (
                    video.uploaded_at.isoformat()
                    if video.uploaded_at
                    else None
                ),
            }
            for video in videos
        ],
    }


# ---------------------------------------------------------
# File Storage
# ---------------------------------------------------------

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB


# ---------------------------------------------------------
# Whisper Processor
# ---------------------------------------------------------

# Load Whisper once when the application starts.
# Using tiny model because it is suitable for local CPU testing.

whisper_processor = WhisperProcessor("tiny")


# ---------------------------------------------------------
# Video Processing + Transcript Generation
# ---------------------------------------------------------

@app.post("/video/process")
async def process_video(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Module 2 pipeline:

    MP4
      ↓
    Validate and save video
      ↓
    Create Video database record
      ↓
    Create Transcript database record
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

    # Read file content once
    file_content = await file.read()

    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size exceeds maximum limit of 100MB"
        )

    if len(file_content) == 0:
        raise HTTPException(
            status_code=400,
            detail="File is empty"
        )

    # -----------------------------------------------------
    # 2. Create video paths
    # -----------------------------------------------------

    video_path = UPLOAD_DIR / file.filename
    audio_path = UPLOAD_DIR / f"{video_path.stem}.wav"

    # -----------------------------------------------------
    # 3. Save uploaded video
    # -----------------------------------------------------

    with open(video_path, "wb") as buffer:
        buffer.write(file_content)

    # -----------------------------------------------------
    # 4. Create Video database record
    # -----------------------------------------------------

    video = models.Video(
        user_id=current_user.id,
        filename=file.filename,
        file_path=str(video_path),
        status="processing"
    )

    db.add(video)
    db.commit()
    db.refresh(video)

    # -----------------------------------------------------
    # 5. Create Transcript database record
    # -----------------------------------------------------

    transcript = models.Transcript(
        video_id=video.id,
        user_id=current_user.id,
        transcript_text=None,
        status="processing"
    )

    db.add(transcript)
    db.commit()
    db.refresh(transcript)

    # -----------------------------------------------------
    # 6. Extract audio using FFmpeg
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # 7. Generate transcript using Whisper
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # 8. Check transcript result
    # -----------------------------------------------------

    if not transcript_text:
        video.status = "failed"
        transcript.status = "failed"

        db.commit()

        raise HTTPException(
            status_code=500,
            detail="Whisper generated an empty transcript"
        )

    # -----------------------------------------------------
    # 9. Save transcript
    # -----------------------------------------------------

    transcript.transcript_text = transcript_text
    transcript.status = "completed"

    video.status = "processed"

    db.commit()

    db.refresh(video)
    db.refresh(transcript)

    # -----------------------------------------------------
    # 10. Return result
    # -----------------------------------------------------

    return {
        "status": "completed",
        "video_id": video.id,
        "transcript_id": transcript.id,
        "video": str(video_path),
        "audio": str(audio_path),
        "transcript": transcript_text,
    }
