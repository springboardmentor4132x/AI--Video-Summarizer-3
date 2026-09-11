import re
from collections import Counter

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "should", "could", "can", "may", "might", "must", "shall",
    "to", "of", "in", "on", "at", "by", "for", "with", "about", "against",
    "between", "into", "through", "during", "before", "after", "above",
    "below", "from", "up", "down", "out", "off", "over", "under", "again",
    "further", "then", "once", "here", "there", "when", "where", "why",
    "how", "all", "any", "both", "each", "few", "more", "most", "other",
    "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "than", "too", "very", "s", "t", "just", "don", "now", "i", "you",
    "your", "it", "its", "this", "that", "these", "those", "as", "if",
    "what", "which", "who", "whom", "me", "my", "we", "our", "us",
    "he", "she", "him", "her", "his", "they", "them", "their",
}


def extract_keywords(text: str, top_n: int = 10):
    """Frequency-based keyword extraction with basic stopword filtering."""
    if not text:
        return []

    words = re.findall(r"[a-zA-Z']+", text.lower())
    filtered = [w for w in words if w not in STOPWORDS and len(w) > 2]

    counts = Counter(filtered)
    return [word for word, _ in counts.most_common(top_n)]