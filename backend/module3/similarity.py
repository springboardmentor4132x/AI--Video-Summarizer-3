from sklearn.metrics.pairwise import cosine_similarity


def calculate_similarity(embeddings):
    similarities = []

    for i in range(len(embeddings) - 1):
        score = cosine_similarity(
            [embeddings[i]],
            [embeddings[i + 1]]
        )[0][0]

        similarities.append(float(score))

    return similarities