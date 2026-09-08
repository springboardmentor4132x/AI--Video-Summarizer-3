from sentence_transformers import SentenceTransformer


class EmbeddingGenerator:
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        print(f"Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        print("Embedding model loaded successfully")

    def generate_embeddings(self, chunks):
        texts = [chunk["text"] for chunk in chunks]

        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True
        )

        return embeddings