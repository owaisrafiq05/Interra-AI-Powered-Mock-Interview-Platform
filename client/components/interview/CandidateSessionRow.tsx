"use client";
import type { ISession } from "@/types/types";
import { Badge } from "@/components/ui/badge";

function nameFromPopulated(
  candidate: ISession["candidateId"]
): string {
  if (candidate && typeof candidate === "object" && "name" in candidate) {
    return String((candidate as { name?: string }).name || "Candidate");
  }
  return "Candidate";
}

export function CandidateSessionRow({ session }: { session: ISession }) {
  const name = nameFromPopulated(session.candidateId);
  const rec = session.overallReport?.hiringRecommendation;

  return (
    <li className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-neutral-500">
            Session {session._id.slice(-6)} · {session.mode}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{session.status}</Badge>
          {rec && <Badge>{rec}</Badge>}
          {session.overallReport && (
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Score: {session.overallReport.totalScore}
            </span>
          )}
        </div>
      </div>
      {session.overallReport?.summary && (
        <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
          {session.overallReport.summary}
        </p>
      )}
    </li>
  );
}
