"use client";

import { listMySessions } from "@/API/sessions.api";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ISession, IInterview } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Mic,
  PlayCircle,
  Sparkles,
} from "lucide-react";

function interviewTitle(s: ISession) {
  const inv = s.interviewId;
  if (inv && typeof inv === "object" && "title" in inv) {
    return (inv as IInterview).title;
  }
  return "Interview";
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function sessionStatusClass(status: ISession["status"]) {
  switch (status) {
    case "completed":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
    case "in_progress":
      return "border-primaryCol/35 bg-primaryCol/10 text-primaryCol";
    case "pending":
      return "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100";
    default:
      return "border-neutral-300 bg-neutral-100 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200";
  }
}

function modeLabel(mode: ISession["mode"]) {
  return mode === "mock" ? "Mock practice" : "Invite session";
}

export default function CandidateDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-sessions"],
    queryFn: () => listMySessions(),
  });

  const list = data ?? [];
  const activeSessions = list.filter(
    (s) => s.status === "pending" || s.status === "in_progress"
  ).length;
  const completed = list.filter((s) => s.status === "completed").length;
  const mockCount = list.filter((s) => s.mode === "mock").length;

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/90 bg-gradient-to-br from-white via-white to-primaryCol/[0.06] p-8 shadow-sm dark:border-neutral-800/90 dark:from-neutral-950 dark:via-neutral-950 dark:to-primaryCol/[0.08] sm:p-10">
        <div className="pointer-events-none absolute -left-16 bottom-0 size-64 rounded-full bg-primaryCol/10 blur-3xl dark:bg-primaryCol/15" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primaryCol">
              Candidate dashboard
            </p>
            <h1 className="mt-2 font-poppins text-3xl font-bold tracking-tight text-text dark:text-darkText sm:text-4xl">
              Your interview sessions
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base">
              Join with an employer code, run a solo mock, and review AI-scored
              feedback when you finish — all from one place.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button
              asChild
              variant="outline"
              className="h-12 gap-2 rounded-xl border-primaryCol/35 bg-white/80 dark:bg-neutral-950/60"
            >
              <Link href="/candidate/join">
                <KeyRound className="size-4 text-primaryCol" />
                Join with code
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-12 gap-2 rounded-xl bg-primaryCol px-6 text-base font-semibold text-white shadow-lg shadow-primaryCol/25 hover:bg-primaryCol/90"
            >
              <Link href="/candidate/mock">
                <Mic className="size-5" />
                Mock interview
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard
          icon={PlayCircle}
          label="In progress"
          value={isLoading ? "…" : activeSessions}
          hint="Pending or live rooms"
          variant="accent"
        />
        <DashboardStatCard
          icon={BarChart3}
          label="Reports ready"
          value={isLoading ? "…" : completed}
          hint="Completed sessions"
        />
        <DashboardStatCard
          icon={Sparkles}
          label="Mock sessions"
          value={isLoading ? "…" : mockCount}
          hint="Practice without an employer"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-poppins text-xl font-semibold text-text dark:text-darkText">
            Session history
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Continue where you left off or open your latest report
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit gap-2 rounded-xl">
          <Link href="/candidate/join">
            <LayoutDashboard className="size-4" />
            Join new interview
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-neutral-200 bg-white/50 dark:border-neutral-800 dark:bg-neutral-950/40">
          <Loader2 className="size-10 animate-spin text-primaryCol" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Loading your sessions…
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          Could not load sessions. Check your API URL and that you are logged in
          as a candidate.
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-neutral-200/90 bg-white/70 px-8 py-16 text-center dark:border-neutral-800/90 dark:bg-neutral-950/50">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primaryCol/10 text-primaryCol">
            <Mic className="size-8" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-poppins text-lg font-semibold text-text dark:text-darkText">
              No sessions yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
              Enter an invite code from an employer or start a private mock to
              get AI-generated questions and feedback.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-xl bg-primaryCol text-white">
              <Link href="/candidate/mock">Start mock</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/candidate/join">I have a code</Link>
            </Button>
          </div>
        </div>
      )}

      {list.length > 0 && (
      <ul className="grid gap-4">
        {list.map((s) => (
          <li key={s._id}>
            <article className="group relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primaryCol/25 hover:shadow-lg dark:border-neutral-800/90 dark:bg-neutral-950/70 dark:hover:border-primaryCol/30">
              <div
                className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primaryCol to-primaryCol/40"
                aria-hidden
              />
              <div className="flex flex-col gap-6 p-6 pl-7 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${sessionStatusClass(s.status)}`}
                    >
                      {s.status.replace(/_/g, " ")}
                    </span>
                    <Badge variant="outline" className="text-xs font-medium">
                      {modeLabel(s.mode)}
                    </Badge>
                  </div>
                  <p className="font-poppins text-xl font-semibold tracking-tight text-text dark:text-darkText">
                    {interviewTitle(s)}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5 shrink-0 text-primaryCol/80" />
                      Started {formatDate(s.startedAt || s.createdAt)}
                    </span>
                    {s.status === "completed" && s.completedAt && (
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        Done {formatDate(s.completedAt)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {s.status !== "completed" && (
                    <Button
                      asChild
                      size="sm"
                      className="gap-1.5 rounded-xl bg-primaryCol text-white hover:bg-primaryCol/90"
                    >
                      <Link href={`/interview/${s._id}/live`}>
                        <PlayCircle className="size-4" />
                        Continue
                      </Link>
                    </Button>
                  )}
                  {s.status === "completed" && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="gap-1.5 rounded-xl border-primaryCol/30"
                    >
                      <Link href={`/interview/${s._id}/report`}>
                        <BarChart3 className="size-4 text-primaryCol" />
                        View report
                        <ArrowRight className="size-4 opacity-70" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
