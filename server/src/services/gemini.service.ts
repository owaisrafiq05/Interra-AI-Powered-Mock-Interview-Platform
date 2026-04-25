import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AnswerEvaluation,
  GeneratedQuestion,
  OverallReport,
} from "../types/type";

/** Default for Google AI Studio; override with GEMINI_MODEL if needed. */
const MODEL =
  process.env.GEMINI_MODEL ||
  process.env.GEMINI_MODEL_NAME ||
  "gemini-2.5-flash";

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: MODEL });
}

function stripCodeFences(raw: string): string {
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return t.trim();
}

async function generateText(prompt: string): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

function parseJson<T>(raw: string, label: string): T {
  const cleaned = stripCodeFences(raw);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Invalid JSON from Gemini (${label})`);
  }
}

async function generateJsonWithRetry<T>(
  prompt: string,
  label: string,
  validate: (v: T) => boolean
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < 2; i++) {
    try {
      const strict =
        i === 0
          ? prompt
          : `${prompt}\n\nIMPORTANT: Reply with ONLY valid JSON. No markdown fences, no commentary.`;
      const text = await generateText(strict);
      const parsed = parseJson<T>(text, label);
      if (validate(parsed)) return parsed;
      throw new Error("Validation failed for parsed JSON");
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

export async function generateQuestionsFromJD(
  jobDescription: string
): Promise<GeneratedQuestion[]> {
  const prompt = `
You are an expert technical interviewer.
Given this job description:
---
${jobDescription}
---
Generate exactly 8 interview questions as JSON array:
[{ "text": string, "type": "technical"|"behavioral"|"situational", "difficulty": number }]
difficulty must be an integer 1-5.
Return ONLY the JSON array. No markdown, no explanation.
`.trim();

  const data = await generateJsonWithRetry<GeneratedQuestion[]>(
    prompt,
    "questions",
    (v) => Array.isArray(v) && v.length >= 8
  );

  if (!Array.isArray(data) || data.length < 8) {
    throw new Error("Gemini returned fewer than 8 questions");
  }

  return data.slice(0, 8).map((q) => ({
    text: String(q.text || "").trim(),
    type: (["technical", "behavioral", "situational"].includes(q.type)
      ? q.type
      : "technical") as GeneratedQuestion["type"],
    difficulty: Math.min(5, Math.max(1, Number(q.difficulty) || 3)),
  }));
}

export async function evaluateAnswer(params: {
  jobTitle: string;
  jobDescription: string;
  question: string;
  transcript: string;
}): Promise<AnswerEvaluation> {
  const { jobTitle, jobDescription, question, transcript } = params;
  const prompt = `
Job Role: ${jobTitle}
Job context (short): ${jobDescription.slice(0, 2000)}
Question: ${question}
Candidate Answer: ${transcript}
Evaluate and return JSON:
{
  "score": number,
  "technicalAccuracy": number,
  "communication": number,
  "confidence": number,
  "feedback": string
}
Rules: All numeric scores are 0-10 integers. technicalAccuracy can be 0 if the question is purely behavioral.
feedback must be one sentence of constructive feedback.
Return ONLY JSON.
`.trim();

  return generateJsonWithRetry<AnswerEvaluation>(
    prompt,
    "evaluation",
    (v) =>
      typeof v?.score === "number" &&
      typeof v?.technicalAccuracy === "number" &&
      typeof v?.communication === "number" &&
      typeof v?.confidence === "number" &&
      typeof v?.feedback === "string"
  );
}

export async function decideFollowUp(params: {
  question: string;
  transcript: string;
}): Promise<string | null> {
  const prompt = `
Question asked: ${params.question}
Candidate answered: ${params.transcript}
Should you ask a follow-up? If yes, provide one short follow-up question.
If no, respond with null.
Return JSON: { "followUp": string | null }
Return ONLY JSON.
`.trim();

  const data = await generateJsonWithRetry<{ followUp: string | null }>(
    prompt,
    "followUp",
    (v) => v && Object.prototype.hasOwnProperty.call(v, "followUp")
  );

  if (data.followUp == null) return null;
  const s = String(data.followUp).trim();
  return s.length ? s : null;
}

export async function generateFinalReport(params: {
  jobTitle: string;
  evaluations: AnswerEvaluation[];
}): Promise<OverallReport> {
  const prompt = `
You evaluated a candidate for: ${params.jobTitle}
Here are all their Q&A evaluations: ${JSON.stringify(params.evaluations)}
Generate a final hiring report as JSON:
{
  "totalScore": number,
  "summary": string,
  "strengths": string[],
  "improvements": string[],
  "hiringRecommendation": "Strong Yes" | "Yes" | "Maybe" | "No"
}
totalScore is 0-100.
summary is 2-3 sentences.
Return ONLY JSON.
`.trim();

  return generateJsonWithRetry<OverallReport>(
    prompt,
    "report",
    (v) =>
      typeof v?.totalScore === "number" &&
      typeof v?.summary === "string" &&
      Array.isArray(v?.strengths) &&
      Array.isArray(v?.improvements) &&
      typeof v?.hiringRecommendation === "string"
  );
}
