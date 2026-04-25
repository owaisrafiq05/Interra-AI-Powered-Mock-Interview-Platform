"use client";

import type { ISession } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Calendar, ClipboardCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

function nameFromPopulated(
  candidate: ISession["candidateId"]
): string {
  if (candidate && typeof candidate === "object" && "name" in candidate) {
    return String((candidate as { name?: string }).name || "Candidate");
  }
  return "Candidate";
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function statusTone(status: ISession["status"]) {
  switch (status) {
    case "completed":
      return "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
    case "in_progress":
      return "border-primaryCol/35 bg-primaryCol/10 text-primaryCol";
    case "pending":
      return "border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-100";
    default:
      return "border-neutral-300 bg-neutral-100 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200";
  }
}

function recTone(rec: string) {
  const r = rec.toLowerCase();
  if (r.includes("strong yes") || r === "yes")
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
  if (r.includes("maybe"))
    return "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100";
  if (r.includes("no"))
    return "border-red-400/40 bg-red-500/10 text-red-800 dark:text-red-200";
  return "border-primaryCol/30 bg-primaryCol/10 text-primaryCol";
}

export function CandidateSessionRow({ session }: { session: ISession }) {
  const name = nameFromPopulated(session.candidateId);
  const rec = session.overallReport?.hiringRecommendation;
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <li>
      <article
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/90 shadow-sm transition-all duration-300",
          "hover:-translate-y-0.5 hover:border-primaryCol/25 hover:shadow-lg dark:border-neutral-800/90 dark:bg-neutral-950/70",
          "dark:hover:border-primaryCol/30"
        )}
      >
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primaryCol to-primaryCol/40" />
        <div className="flex flex-col gap-4 p-5 pl-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primaryCol/15 to-primaryCol/5 font-poppins text-sm font-bold text-primaryCol ring-1 ring-primaryCol/20">
              {initials}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="flex items-center gap-2 font-poppins text-base font-semibold text-text dark:text-darkText">
                  <User className="size-4 shrink-0 text-primaryCol/80" />
                  {name}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                    statusTone(session.status)
                  )}
                >
                  {session.status.replace(/_/g, " ")}
                </span>
                <Badge variant="outline" className="text-xs capitalize">
                  {session.mode.replace(/_/g, " ")}
                </Badge>
              </div>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5 shrink-0 text-primaryCol/70" />
                  {formatDate(session.createdAt)}
                </span>
                <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
                  …{session._id.slice(-8)}
                </span>
              </p>
              {session.overallReport?.summary && (
                <p className="line-clamp-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {session.overallReport.summary}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            {rec && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
                  recTone(rec)
                )}
              >
                <ClipboardCheck className="size-3.5" />
                {rec}
              </span>
            )}
            {session.overallReport && (
              <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 px-4 py-2 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Total score
                </p>
                <p className="font-poppins text-xl font-bold text-text dark:text-darkText">
                  {session.overallReport.totalScore}
                  <span className="text-xs font-normal text-neutral-400">/100</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}
