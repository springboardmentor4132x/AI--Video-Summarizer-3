def segment_transcript(segments, max_words=80):
    chunks = []
    current_segments = []
    current_words = 0

    for segment in segments:
        text = segment["text"].strip()
        word_count = len(text.split())

        if not text:
            continue

        if current_segments and current_words + word_count > max_words:
            chunks.append({
                "start": current_segments[0]["start"],
                "end": current_segments[-1]["end"],
                "text": " ".join(
                    item["text"] for item in current_segments
                )
            })

            current_segments = []
            current_words = 0

        current_segments.append(segment)
        current_words += word_count

    if current_segments:
        chunks.append({
            "start": current_segments[0]["start"],
            "end": current_segments[-1]["end"],
            "text": " ".join(
                item["text"] for item in current_segments
            )
        })

    return chunks