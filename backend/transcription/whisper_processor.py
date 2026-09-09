import whisper


class WhisperProcessor:
    def __init__(self, model_name="tiny"):
        print(f"Loading Whisper model: {model_name}")
        self.model = whisper.load_model(model_name)
        print("Whisper model loaded successfully")

    def transcribe(self, audio_path: str) -> str:
        result = self.model.transcribe(
            audio_path,
            fp16=False,
            language="en",
            temperature=0
        )

        text = result.get("text", "").strip()

        print("Whisper transcript:", repr(text))

        return text

    def transcribe_with_timestamps(self, audio_path: str):
        result = self.model.transcribe(
            audio_path,
            fp16=False,
            language="en",
            temperature=0
        )

        segments = []

        for segment in result.get("segments", []):
            text = segment.get("text", "").strip()

            if text:
                segments.append({
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": text
                })

        print("Timestamped segments:")
        for segment in segments:
            print(segment)

        return segments