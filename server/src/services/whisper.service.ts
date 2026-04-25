import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "fs/promises";
import path from "path";
import OpenAI, { APIConnectionError } from "openai";
import { throwError } from "../utils/helpers";

const execFileAsync = promisify(execFile);

let client: OpenAI | null = null;

/**
 * `TRANSCRIPTION_PROVIDER` explicit: openai | local.
 * If unset: local in development, openai in production (containers usually have no Python whisper).
 */
function transcriptionProvider(): "openai" | "local" {
  const raw = process.env.TRANSCRIPTION_PROVIDER?.toLowerCase().trim();
  if (raw === "openai") return "openai";
  if (raw === "local") return "local";
  return process.env.NODE_ENV === "production" ? "openai" : "local";
}

async function resolveWhisperPython(): Promise<string> {
  const fromEnv = process.env.WHISPER_PYTHON?.trim();
  if (fromEnv) return fromEnv;

  const venvPy = path.join(
    process.cwd(),
    ".venv-whisper",
    "bin",
    process.platform === "win32" ? "python.exe" : "python"
  );
  try {
    await fs.access(venvPy);
    return venvPy;
  } catch {
    return process.platform === "win32" ? "python" : "python3";
  }
}

function getClient(): OpenAI {
  if (!client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not set");
    client = new OpenAI({
      apiKey: key,
      maxRetries: 2,
      timeout: 120_000,
    });
  }
  return client;
}

/** Whisper uses the filename hint to detect container/codec. */
function uploadFilenameForPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".webm") return "recording.webm";
  if (ext === ".m4a") return "recording.m4a";
  if (ext === ".mp4") return "recording.m4a";
  if (ext === ".ogg") return "recording.ogg";
  if (ext === ".mp3") return "recording.mp3";
  if (ext === ".wav") return "recording.wav";
  return `recording${ext || ".webm"}`;
}

function parseWhisperScriptStdout(stdout: string): {
  ok?: boolean;
  text?: string;
  error?: string;
} {
  const lines = stdout.trim().split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line.startsWith("{")) continue;
    try {
      return JSON.parse(line) as { ok?: boolean; text?: string; error?: string };
    } catch {
      /* continue */
    }
  }
  throw new Error("No JSON line in whisper script output");
}

async function transcribeOpenAI(filePath: string): Promise<string> {
  const openai = getClient();
  const buf = await fs.readFile(filePath);
  const file = await OpenAI.toFile(buf, uploadFilenameForPath(filePath));

  try {
    const response = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });
    const text = response.text?.trim();
    if (!text) throw new Error("Whisper returned empty transcript");
    return text;
  } catch (e) {
    if (e instanceof APIConnectionError) {
      const cause = (e as Error & { cause?: Error }).cause;
      const detail =
        cause && typeof cause === "object" && "message" in cause
          ? String((cause as Error).message)
          : "";
      throw throwError(
        `Whisper (OpenAI) could not be reached${detail ? `: ${detail}` : ""}. Check OPENAI_API_KEY, outbound access to api.openai.com, and your network/DNS.`,
        502
      );
    }
    throw e;
  }
}

/** Local inference via https://github.com/openai/whisper (Python + ffmpeg). */
async function transcribeLocal(filePath: string): Promise<string> {
  const scriptPath = path.join(process.cwd(), "scripts", "whisper_transcribe.py");
  try {
    await fs.access(scriptPath);
  } catch {
    throw throwError(
      `Local Whisper script not found at ${scriptPath}. Set TRANSCRIPTION_PROVIDER=openai or add scripts/whisper_transcribe.py.`,
      500
    );
  }

  const pythonBin = await resolveWhisperPython();
  const timeoutMs = Number(process.env.WHISPER_LOCAL_TIMEOUT_MS) || 600_000;
  const env = {
    ...process.env,
    WHISPER_LOCAL_MODEL: process.env.WHISPER_LOCAL_MODEL || "base",
    WHISPER_LOCAL_DEVICE: process.env.WHISPER_LOCAL_DEVICE || "cpu",
  };

  let stdout = "";
  let stderr = "";
  try {
    const r = await execFileAsync(pythonBin, [scriptPath, filePath], {
      env,
      maxBuffer: 50 * 1024 * 1024,
      timeout: timeoutMs,
    });
    stdout = r.stdout;
    stderr = r.stderr;
  } catch (e: unknown) {
    const err = e as {
      stderr?: string;
      stdout?: string;
      message?: string;
    };
    const tail = [err.stderr, err.stdout, err.message]
      .filter(Boolean)
      .join("\n")
      .trim();
    throw throwError(
      tail
        ? `Local Whisper process failed:\n${tail.slice(-4000)}`
        : "Local Whisper process failed",
      502
    );
  }

  let parsed: { ok?: boolean; text?: string; error?: string };
  try {
    parsed = parseWhisperScriptStdout(stdout);
  } catch {
    throw throwError(
      `Local Whisper produced invalid output. stderr:\n${stderr.slice(-2000)}`,
      502
    );
  }

  if (!parsed.ok) {
    throw throwError(parsed.error || "Local Whisper error", 502);
  }
  const text = (parsed.text || "").trim();
  if (!text) {
    throw throwError("Local Whisper returned empty transcript", 502);
  }
  return text;
}

export async function transcribeAudioFile(
  filePath: string
): Promise<string> {
  let stat: { size: number };
  try {
    stat = await fs.stat(filePath);
  } catch {
    throw throwError(`Audio file not found: ${filePath}`, 400);
  }
  if (stat.size < 1) {
    throw throwError("Audio file is empty", 400);
  }

  if (transcriptionProvider() === "local") {
    return transcribeLocal(filePath);
  }

  return transcribeOpenAI(filePath);
}
