import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_client = None


def get_client():
    global _client
    if _client is None:
        _client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _client


def answer_question(question: str, transcript: str, summary: str = ""):
    """Answer a question about the video using its transcript + summary as context."""
    client = get_client()

    context = transcript[:6000]
    system_prompt = (
        "You are a helpful assistant answering questions about a video, "
        "using only the transcript and summary provided. "
        "If the answer isn't in the content, say so honestly. "
        "Keep answers concise and directly relevant."
    )

    user_prompt = f"Video Summary: {summary}\n\nVideo Transcript: {context}\n\nQuestion: {question}"

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=300,
    )

    return {"answer": response.choices[0].message.content.strip()}


def generate_quiz_llm(transcript: str, summary: str = "", num_questions: int = 5):
    """Generate a multiple-choice quiz from the video content using an LLM."""
    client = get_client()

    context = transcript[:6000]
    system_prompt = (
        "You generate multiple-choice quiz questions from video content. "
        "Return ONLY valid JSON, no other text, no markdown fences. "
        'Format: {"questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "A"}]} '
        f"Generate exactly {num_questions} questions based on the content."
    )

    user_prompt = f"Video Summary: {summary}\n\nVideo Transcript: {context}"

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.5,
        max_tokens=1200,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)