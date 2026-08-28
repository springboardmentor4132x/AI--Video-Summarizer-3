"""
ClipMind AI - Backend Entry Point
Module 1: Project Initialization, Design Process & Core Setup

Run locally with:
    uvicorn main:app --reload
"""

import os
from datetime import datetime, timedelta, timezone
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, FastAPI, UploadFile, File, HTTPException
from pathlib import Path
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from jose import jwt
from sqlalchemy.orm import Session

from video_processing.ffmpeg_processor import extract_audio


from app.database import engine, Base, get_db
from app import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ClipMind AI API",
    description="AI-powered video summarization & key moments detection platform",
    version="0.1.0",
)


# Allow the frontend to communicate with the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "clipmind-development-secret")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
        {"sub": str(user_id), "exp": expires_at},
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


def user_response(user: models.User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }


@app.post("/auth/register")
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(
        models.User.email == payload.email
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = models.User(
        name=payload.name,
        email=payload.email,
        password=password_context.hash(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User registered successfully", "user": user_response(user)}


@app.post("/auth/login")
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.email == payload.email
    ).first()
    if not user or not password_context.verify(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
        "user": user_response(user),
    }


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
    try:
        extract_audio(str(video_path), str(audio_path))
    except (OSError, RuntimeError) as error:
        raise HTTPException(
            status_code=500,
            detail=f"Video processing failed: {error}",
        ) from error

    return {
        "status": "processed",
        "video": str(video_path),
        "audio": str(audio_path)
    }