#!/usr/bin/env python3
"""
Transcribe one audio file using OpenAI Whisper (local).
Install: pip install -U openai-whisper  (or: pip install git+https://github.com/openai/whisper.git)
Requires: ffmpeg on PATH (https://github.com/openai/whisper#setup)
"""
from __future__ import annotations

import json
import os
import sys


def main() -> None:
    if len(sys.argv) < 2:
        print(
            json.dumps({"ok": False, "error": "usage: whisper_transcribe.py <audio_file>"}),
            flush=True,
        )
        sys.exit(2)
    audio_path = sys.argv[1]
    if not os.path.isfile(audio_path):
        print(
            json.dumps({"ok": False, "error": f"not a file: {audio_path}"}),
            flush=True,
        )
        sys.exit(1)

    model_name = (os.environ.get("WHISPER_LOCAL_MODEL") or "base").strip() or "base"
    device = (os.environ.get("WHISPER_LOCAL_DEVICE") or "cpu").strip() or "cpu"

    try:
        import whisper  # type: ignore[import-untyped]
    except ImportError:
        print(
            json.dumps(
                {
                    "ok": False,
                    "error": "Python package missing. Run: pip install -U openai-whisper && ensure ffmpeg is installed.",
                }
            ),
            flush=True,
        )
        sys.exit(1)

    try:
        model = whisper.load_model(model_name, device=device)
        result = model.transcribe(audio_path)
        text = (result.get("text") or "").strip()
        print(json.dumps({"ok": True, "text": text}), flush=True)
    except Exception as e:  # noqa: BLE001 — surface any runtime failure as JSON
        print(
            json.dumps({"ok": False, "error": str(e) or "transcribe failed"}),
            flush=True,
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
