"use client";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
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

    // Mixed video+audio streams often break MediaRecorder when mime is audio-only.
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
      <p className="text-sm text-neutral-500">
        Complete camera and microphone setup first.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {!recording ? (
        <Button
          type="button"
          className="bg-primaryCol text-darkText"
          disabled={disabled}
          onClick={start}
        >
          <Mic className="mr-2 size-4" />
          Start answer
        </Button>
      ) : (
        <Button type="button" variant="destructive" onClick={stop}>
          <Square className="mr-2 size-4" />
          Done answering
        </Button>
      )}
    </div>
  );
}
