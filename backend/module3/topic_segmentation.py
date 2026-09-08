def detect_topic_boundaries(similarities, threshold=0.30):
    boundaries = []

    for i, similarity in enumerate(similarities):
        if similarity < threshold:
            boundaries.append(i + 1)

    return boundaries


def create_topics(chunks, boundaries):
    topics = []

    start_index = 0

    for topic_id, boundary in enumerate(boundaries, start=1):
        topic_chunks = chunks[start_index:boundary]

        if topic_chunks:
            topics.append({
                "topic_id": topic_id,
                "start_time": topic_chunks[0]["start"],
                "end_time": topic_chunks[-1]["end"],
                "text": " ".join(
                    chunk["text"] for chunk in topic_chunks
                )
            })

        start_index = boundary

    remaining_chunks = chunks[start_index:]

    if remaining_chunks:
        topics.append({
            "topic_id": len(topics) + 1,
            "start_time": remaining_chunks[0]["start"],
            "end_time": remaining_chunks[-1]["end"],
            "text": " ".join(
                chunk["text"] for chunk in remaining_chunks
            )
        })

    return topics