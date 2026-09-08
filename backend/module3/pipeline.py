from transcription.whisper_processor import WhisperProcessor

from .segmentation import segment_transcript
from .embeddings import EmbeddingGenerator
from .similarity import calculate_similarity
from .topic_segmentation import (
    detect_topic_boundaries,
    create_topics
)


class TopicPipeline:
    def __init__(self, whisper_processor):
        self.whisper = whisper_processor
        self.embedding_generator = EmbeddingGenerator()

    def analyze_segments(self, segments):
        if not segments:
            return {
                "chunks": [],
                "similarities": [],
                "topics": []
            }

        chunks = segment_transcript(segments)

        if not chunks:
            return {
                "chunks": [],
                "similarities": [],
                "topics": []
            }

        embeddings = self.embedding_generator.generate_embeddings(chunks)

        similarities = calculate_similarity(embeddings)

        boundaries = detect_topic_boundaries(
            similarities,
            threshold=0.30
        )

        topics = create_topics(
            chunks,
            boundaries
        )

        return {
            "chunks": chunks,
            "similarities": similarities,
            "topics": topics
        }

    def process(self, audio_path: str):
        segments = self.whisper.transcribe_with_timestamps(audio_path)

        analysis = self.analyze_segments(segments)

        return {
            "segments": segments,
            **analysis
        }