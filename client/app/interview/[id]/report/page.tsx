"use client";
import { getSession } from "@/API/sessions.api";
import { PageTitle } from "@/components/helpers";
import { TranscriptViewer } from "@/components/interview/TranscriptViewer";
import { ScoreRadar } from "@/components/interview/ScoreRadar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AnswerEvaluation } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Loader2, Volume2, Square } from "lucide-react";
import {
  speakText,
  stopSpeaking,
  buildOverallReportSpeech,
} from "@/lib/speech";

export default function InterviewReportPage() {
  const params = useParams();
  const id = String(params.id);

  const { data: session, isLoading } = useQuery({
    queryKey: ["session", id],
    queryFn: () => getSession(id),
  });

  const lastEval = session?.answers
    ?.filter((a) => a.evaluation)
    .map((a) => a.evaluation as AnswerEvaluation)
    .at(-1);

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primaryCol" />
        </div>
      )}
      {session && (
        <>
          <PageTitle
            title="Interview report"
            desc="Use Listen for spoken AI summary; scores and transcript below."
          />
          {session.overallReport && (
            <div className="mt-8 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge>
                    {session.overallReport.hiringRecommendation}
                  </Badge>
                  <span className="text-lg font-semibold">
                    Total {session.overallReport.totalScore}/100
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => {
                      const r = session.overallReport;
                      if (!r) return;
                      stopSpeaking();
                      speakText(buildOverallReportSpeech(r));
                    }}
                  >
                    <Volume2 className="size-4" />
                    Listen to report
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="gap-1.5"
                    onClick={() => stopSpeaking()}
                  >
                    <Square className="size-3.5" />
                    Stop
                  </Button>
                </div>
              </div>
              <details className="mt-4 text-neutral-700 dark:text-neutral-300">
                <summary className="cursor-pointer font-medium text-neutral-900 dark:text-neutral-100">
                  Show written summary
                </summary>
                <p className="mt-2 leading-relaxed">
                  {session.overallReport.summary}
                </p>
              </details>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-medium text-primaryCol">Strengths</h3>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {session.overallReport.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-primaryCol">Improvements</h3>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {session.overallReport.improvements.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {lastEval && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold">Latest answer dimensions</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Radar uses the most recent scored answer (prototype view).
              </p>
              <div className="mt-4">
                <ScoreRadar evaluation={lastEval} />
              </div>
            </div>
          )}

          <div className="mt-10">
            <h3 className="text-lg font-semibold">Transcript</h3>
            <div className="mt-3">
              <TranscriptViewer answers={session.answers || []} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
