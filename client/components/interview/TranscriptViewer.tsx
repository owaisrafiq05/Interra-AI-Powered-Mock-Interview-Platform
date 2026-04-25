"use client";
import type { SessionAnswer } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { speakText, stopSpeaking, buildEvaluationSpeech } from "@/lib/speech";

export function TranscriptViewer({ answers }: { answers: SessionAnswer[] }) {
  if (!answers.length) {
    return <p className="text-sm text-neutral-500">No transcript yet.</p>;
  }
  return (
    <div className="max-h-[420px] space-y-4 overflow-y-auto rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      {answers.map((a, i) => (
        <div key={i} className="border-b border-neutral-100 pb-4 last:border-0 dark:border-neutral-900">
          <p className="text-xs text-neutral-500">
            Q{a.questionIndex + 1}
            {a.isFollowUp ? " · follow-up" : ""}
          </p>
          <p className="mt-1 text-sm font-medium text-text dark:text-darkText">
            {a.questionText}
          </p>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
            {a.transcript || "—"}
          </p>
          {a.evaluation && (
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  onClick={() => {
                    const ev = a.evaluation;
                    if (!ev) return;
                    stopSpeaking();
                    speakText(buildEvaluationSpeech(ev));
                  }}
                >
                  <Volume2 className="size-3.5" />
                  Listen to feedback
                </Button>
              </div>
              <details className="text-xs text-primaryCol">
                <summary className="cursor-pointer text-neutral-600 dark:text-neutral-400">
                  Show written feedback
                </summary>
                <p className="mt-1 text-neutral-700 dark:text-neutral-300">
                  Score {a.evaluation.score}/10 — {a.evaluation.feedback}
                </p>
              </details>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
