"""
ClipMind AI - Backend Entry Point
Module 1: Project Initialization, Design Process & Core Setup

Run locally with:
    uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ClipMind AI API",
    description="AI-powered video summarization & key moments detection platform",
    version="0.1.0",
)

# Allow the frontend (running on a different port) to call this API during development.
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