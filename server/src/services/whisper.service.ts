import fs from "fs";
import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not set");
    client = new OpenAI({ apiKey: key });
  }
  return client;
}

export async function transcribeAudioFile(
  filePath: string
): Promise<string> {
  const openai = getClient();
  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
  });
  const text = response.text?.trim();
  if (!text) throw new Error("Whisper returned empty transcript");
  return text;
}
