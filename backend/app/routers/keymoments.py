from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models.models import Video, Transcript, KeyMoment, ProcessingStatus
from routers.auth import get_current_user

router = APIRouter()

def get_user_from_header(authorization: str, db: Session):
    token = authorization.replace("Bearer ", "")
    return get_current_user(token, db)

def chunk_transcript(text: str, chunk_size: int = 3):
    sentences = [s.strip() for s in text.split(".") if s.strip()]
    chunks = []
    for i in range(0, len(sentences), chunk_size):
        chunk_text = ". ".join(sentences[i:i+chunk_size]) + "."
        start_time = (i / max(len(sentences), 1)) * 3600
        end_time = ((i + chunk_size) / max(len(sentences), 1)) * 3600
        chunks.append({"text": chunk_text, "start": round(start_time, 1), "end": round(end_time, 1)})
    return chunks

def detect_key_moments(video_id: int, transcript_text: str, db: Session):
    db.query(KeyMoment).filter(KeyMoment.video_id == video_id).delete()
    db.commit()

    try:
        from sentence_transformers import SentenceTransformer
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np

        model = SentenceTransformer("all-MiniLM-L6-v2")
        chunks = chunk_transcript(transcript_text)
        if not chunks:
            return

        texts = [c["text"] for c in chunks]
        embeddings = model.encode(texts)

        scores = []
        for i, emb in enumerate(embeddings):
            sim = cosine_similarity([emb], embeddings)[0]
            avg_sim = float(np.mean(sim))
            position_score = 1.0 - abs(i / len(embeddings) - 0.5)
            importance = (avg_sim * 0.6) + (position_score * 0.4)
            scores.append(importance)

        threshold = sum(scores) / len(scores) if scores else 0.5
        topics = ["Introduction", "Main Concept", "Key Discussion", "Deep Dive",
                  "Examples", "Applications", "Summary", "Conclusion"]

        for i, (chunk, score) in enumerate(zip(chunks, scores)):
            if score >= threshold:
                topic = topics[i % len(topics)]
                km = KeyMoment(video_id=video_id, topic=topic, start_time=chunk["start"],
                               end_time=chunk["end"], transcript_text=chunk["text"],
                               importance_score=round(score, 4))
                db.add(km)
        db.commit()

    except ImportError:
        # Fallback without ML
        chunks = chunk_transcript(transcript_text)
        for i, chunk in enumerate(chunks[:5]):
            score = round(0.5 + (i % 3) * 0.15, 2)
            km = KeyMoment(video_id=video_id, topic=f"Segment {i+1}", start_time=chunk["start"],
                           end_time=chunk["end"], transcript_text=chunk["text"],
                           importance_score=score)
            db.add(km)
        db.commit()

@router.post("/{video_id}/detect")
def detect_moments(video_id: int, background_tasks: BackgroundTasks,
                   authorization: str = Header(...), db: Session = Depends(get_db)):
    user = get_user_from_header(authorization, db)
    video = db.query(Video).filter(Video.id == video_id, Video.user_id == user.id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    transcript = db.query(Transcript).filter(Transcript.video_id == video_id).first()
    if not transcript or transcript.status != ProcessingStatus.completed:
        raise HTTPException(status_code=400, detail="Transcript not ready")
    background_tasks.add_task(detect_key_moments, video_id, transcript.text, db)
    return {"message": "Key moment detection started"}

@router.get("/{video_id}")
def get_key_moments(video_id: int, authorization: str = Header(...), db: Session = Depends(get_db)):
    user = get_user_from_header(authorization, db)
    video = db.query(Video).filter(Video.id == video_id, Video.user_id == user.id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    moments = db.query(KeyMoment).filter(KeyMoment.video_id == video_id).order_by(KeyMoment.start_time).all()
    return [{"id": m.id, "topic": m.topic, "start_time": m.start_time, "end_time": m.end_time,
             "transcript_text": m.transcript_text, "importance_score": m.importance_score} for m in moments]
