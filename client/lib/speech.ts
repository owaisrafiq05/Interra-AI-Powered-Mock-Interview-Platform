"use client";

import type { AnswerEvaluation, OverallReport } from "@/types/types";

export function stopSpeaking(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
}

export function speakText(
  text: string,
  opts?: {
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
  }
): void {
  if (typeof window === "undefined") return;
  const trimmed = text.trim();
  if (!trimmed) {
    opts?.onEnd?.();
    return;
  }
  stopSpeaking();
  const u = new SpeechSynthesisUtterance(trimmed);
  u.rate = opts?.rate ?? 0.95;
  u.pitch = 1;
  u.onstart = () => opts?.onStart?.();
  const done = () => opts?.onEnd?.();
  u.onend = done;
  u.onerror = done;
  window.speechSynthesis.speak(u);
}

/** Spoken script after each scored answer (browser Speech Synthesis). */
export function buildAnswerFeedbackSpeech(input: {
  evaluation: AnswerEvaluation;
  followUp: string | null;
}): string {
  const e = input.evaluation;
  const parts = [
    "Here is your feedback.",
    e.feedback,
    `Your overall score for this answer is ${e.score} out of 10.`,
    `Technical accuracy ${e.technicalAccuracy}, communication ${e.communication}, confidence ${e.confidence}, each out of 10.`,
  ];
  if (input.followUp) {
    parts.push("Next, please answer the follow-up question.");
  }
  return parts.join(" ");
}

export function buildEvaluationSpeech(e: AnswerEvaluation): string {
  return [
    "Feedback.",
    e.feedback,
    `Score ${e.score} out of 10.`,
    `Technical ${e.technicalAccuracy}, communication ${e.communication}, confidence ${e.confidence}.`,
  ].join(" ");
}

export function buildOverallReportSpeech(r: OverallReport): string {
  const strengths = r.strengths.length ? r.strengths.join(". ") : "None listed.";
  const improvements = r.improvements.length
    ? r.improvements.join(". ")
    : "None listed.";
  return [
    "Your interview report.",
    r.summary,
    `Total score ${r.totalScore} out of 100.`,
    `Hiring recommendation: ${r.hiringRecommendation}.`,
    `Strengths: ${strengths}`,
    `Areas to improve: ${improvements}`,
  ].join(" ");
}
