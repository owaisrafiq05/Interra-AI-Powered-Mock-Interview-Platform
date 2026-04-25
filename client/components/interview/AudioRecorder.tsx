"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Radio } from "lucide-react";
import { toast } from "sonner";
const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
  "audio/mp4;codecs=mp4a.40.2",
] as const;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  for (const m of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return undefined;
}

function createRecorder(stream: MediaStream): MediaRecorder {
  const mime = pickMimeType();
  if (mime) {
    try {
      return new MediaRecorder(stream, { mimeType: mime });
    } catch {
      /* fall through */
    }
  }
  return new MediaRecorder(stream);
}

export function AudioRecorder({
  stream,
  disabled,
  onRecorded,
}: {
  stream: MediaStream | null;
  disabled?: boolean;
  onRecorded: (blob: Blob) => void;
}) {
  const [recording, setRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const stop = useCallback(() => {
    const mr = mediaRecorder.current;
    if (!mr || mr.state === "inactive") return;
    mr.stop();
    setRecording(false);
  }, []);

  const start = useCallback(() => {
    if (!stream) return;
    if (typeof MediaRecorder === "undefined") {
      toast.error("Recording is not supported in this browser.");
      return;
    }

    const audioTracks = stream
      .getAudioTracks()
      .filter((t) => t.readyState === "live" && t.enabled);
    if (audioTracks.length === 0) {
      toast.error("No live microphone track — check permissions and try again.");
      return;
    }

    const audioOnly = new MediaStream(audioTracks);

    chunks.current = [];
    let mr: MediaRecorder;
    try {
      mr = createRecorder(audioOnly);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not create recorder";
      toast.error(msg);
      return;
    }

    mediaRecorder.current = mr;
    mr.ondataavailable = (e) => {
      if (e.data.size) chunks.current.push(e.data);
    };
    mr.onstop = () => {
      const type = mr.mimeType || pickMimeType() || "audio/webm";
      const blob = new Blob(chunks.current, { type });
      onRecorded(blob);
    };

    try {
      mr.start(250);
      setRecording(true);
    } catch (e) {
      const msg =
        e instanceof DOMException
          ? e.message
          : e instanceof Error
            ? e.message
            : "Could not start recording";
      toast.error(msg);
      mediaRecorder.current = null;
    }
  }, [stream, onRecorded]);

  if (!stream) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 px-4 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-400">
        Complete camera and microphone setup to enable your answer recording.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {!recording ? (
          <Button
            type="button"
            disabled={disabled}
            onClick={start}
            size="lg"
            className="h-14 gap-3 rounded-2xl bg-gradient-to-r from-primaryCol to-primaryCol/90 px-8 text-base font-semibold text-white shadow-lg shadow-primaryCol/30 transition hover:from-primaryCol hover:to-primaryCol/85 hover:shadow-primaryCol/40 disabled:opacity-60"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/20">
              <Mic className="size-5" />
            </span>
            Start recording answer
          </Button>
        ) : (
          <Button
            type="button"
            onClick={stop}
            size="lg"
            className="h-14 gap-3 rounded-2xl border-2 border-red-500/40 bg-red-500/10 px-8 text-base font-semibold text-red-700 shadow-md transition hover:bg-red-500/15 dark:border-red-500/50 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950/70"
          >
            <span className="relative flex size-10 items-center justify-center rounded-xl bg-red-500/20">
              <Square className="size-4 fill-current" />
              <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
              </span>
            </span>
            Finish & upload answer
          </Button>
        )}
        {recording && (
          <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/5 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300">
            <Radio className="size-4 shrink-0 animate-pulse" />
            Recording… speak clearly, then tap finish.
          </div>
        )}
      </div>
      <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        Audio is captured from your microphone only (not the preview video track).
        After you stop, we upload and transcribe your answer.
      </p>
    </div>
  );
}
