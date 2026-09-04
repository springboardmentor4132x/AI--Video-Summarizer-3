"""
AI Summarization using Hugging Face Transformers (DistilBART).
Handles chunking for long transcripts.
Loads the model directly to avoid pipeline task-registry issues.
"""

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

MODEL_NAME = "sshleifer/distilbart-cnn-12-6"

_tokenizer = None
_model = None


def get_model():
    """Load the model and tokenizer only once (cached for reuse)."""
    global _tokenizer, _model
    if _model is None:
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        _model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
    return _tokenizer, _model


def chunk_text(text, max_words=500):
    """Split long transcript into chunks the model can handle at once."""
    words = text.split()
    chunks = [" ".join(words[i:i + max_words]) for i in range(0, len(words), max_words)]
    return chunks


def summarize_text(text, max_length=130, min_length=30):
    """Run one piece of text through the model and return the summary string."""
    tokenizer, model = get_model()
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=1024)
    summary_ids = model.generate(
        inputs["input_ids"],
        max_length=max_length,
        min_length=min_length,
        num_beams=4,
        early_stopping=True,
    )
    return tokenizer.decode(summary_ids[0], skip_special_tokens=True)


def generate_summary(transcript: str):
    """
    Returns {"short_summary": ..., "detailed_summary": ...}
    """
    chunks = chunk_text(transcript)

    chunk_summaries = []
    for chunk in chunks:
        if len(chunk.split()) < 20:
            continue
        chunk_summaries.append(summarize_text(chunk, max_length=130, min_length=30))

    detailed_summary = " ".join(chunk_summaries)

    if len(chunk_summaries) > 1:
        short_summary = summarize_text(detailed_summary, max_length=60, min_length=15)
    else:
        short_summary = chunk_summaries[0] if chunk_summaries else ""

    return {"short_summary": short_summary, "detailed_summary": detailed_summary}