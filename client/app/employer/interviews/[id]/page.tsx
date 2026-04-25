"use client";

import { getInterview, updateInterviewStatus } from "@/API/interviews.api";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { CandidateSessionRow } from "@/components/interview/CandidateSessionRow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IInterview, ISession } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  Copy,
  Hash,
  Loader2,
  Sparkles,
  Users,
  XCircle,
  FileText,
  ListOrdered,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function statusStyles(status: IInterview["status"]) {
  switch (status) {
    case "active":
      return "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
    case "draft":
      return "border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-100";
    default:
      return "border-neutral-300 bg-neutral-100 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200";
  }
}

export default function EmployerInterviewDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["interview", id],
    queryFn: () => getInterview(id),
  });

  const closeMut = useMutation({
    mutationFn: () => updateInterviewStatus(id, { status: "closed" }),
    onSuccess: () => {
      toast.success("Interview closed");
      void qc.invalidateQueries({ queryKey: ["interview", id] });
      void qc.invalidateQueries({ queryKey: ["interviews"] });
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Update failed";
      toast.error(msg);
    },
  });

  const interview = data?.interview as IInterview | undefined;
  const sessions = (data?.sessions || []) as ISession[];
  const qCount = interview?.generatedQuestions?.length ?? 0;
  const completedSessions = sessions.filter((s) => s.status === "completed").length;

  const copyCode = () => {
    if (!interview?.inviteCode) return;
    void navigator.clipboard.writeText(interview.inviteCode);
    toast.success("Invite code copied");
  };

  return (
    <div className="space-y-10 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          asChild
          variant="ghost"
          className="group -ml-2 gap-2 rounded-full px-3 text-neutral-600 hover:bg-neutral-100 hover:text-primaryCol dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-primaryCol"
        >
          <Link href="/employer/dashboard">
            <ArrowLeft className="size-4 transition group-hover:-translate-x-0.5" />
            All interviews
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-full border-primaryCol/30">
          <Link href="/employer/interviews/new">New interview</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-neutral-200 bg-white/50 dark:border-neutral-800 dark:bg-neutral-950/40">
          <Loader2 className="size-10 animate-spin text-primaryCol" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Loading interview…
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200/90 bg-red-50/90 p-8 dark:border-red-900/50 dark:bg-red-950/40">
          <p className="font-medium text-red-800 dark:text-red-200">
            Failed to load interview
          </p>
          <p className="mt-2 text-sm text-red-700/90 dark:text-red-300/90">
            Ensure you own this resource and your API is reachable.
          </p>
          <Button asChild className="mt-6 rounded-full" variant="outline">
            <Link href="/employer/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      )}

      {interview && (
        <>
          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl border border-neutral-200/90 bg-gradient-to-br from-white via-white to-primaryCol/[0.06] shadow-xl shadow-neutral-900/[0.06] dark:border-neutral-800/90 dark:from-neutral-950 dark:via-neutral-950 dark:to-primaryCol/[0.1] dark:shadow-black/30">
            <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primaryCol/15 blur-3xl dark:bg-primaryCol/20" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primaryCol/50 to-transparent" />
            <div className="relative p-6 sm:p-10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primaryCol">
                    Interview detail
                  </p>
                  <h1 className="font-poppins text-3xl font-bold tracking-tight text-text dark:text-darkText sm:text-4xl">
                    {interview.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold capitalize",
                        statusStyles(interview.status)
                      )}
                    >
                      {interview.status}
                    </span>
                    {interview.isMockInterview && (
                      <Badge variant="outline" className="text-xs">
                        Mock-friendly
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <DashboardStatCard
                  icon={ListOrdered}
                  label="AI questions"
                  value={qCount}
                  hint="Generated from your JD"
                  variant="accent"
                />
                <DashboardStatCard
                  icon={Users}
                  label="Candidate sessions"
                  value={sessions.length}
                  hint="All runs for this role"
                />
                <DashboardStatCard
                  icon={Sparkles}
                  label="Reports ready"
                  value={completedSessions}
                  hint="Completed with overall score"
                />
              </div>

              {interview.status === "active" && interview.inviteCode && (
                <div className="mt-8 rounded-2xl border border-primaryCol/25 bg-primaryCol/[0.06] p-5 dark:bg-primaryCol/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-primaryCol">
                    Share with candidates
                  </p>
                  <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <code className="break-all rounded-xl border border-neutral-200/80 bg-white/90 px-4 py-3 font-mono text-lg font-semibold tracking-wide text-text dark:border-neutral-800 dark:bg-neutral-950/80 dark:text-darkText">
                      {interview.inviteCode}
                    </code>
                    <Button
                      type="button"
                      size="lg"
                      className="shrink-0 gap-2 rounded-xl bg-primaryCol text-white shadow-lg shadow-primaryCol/25 hover:bg-primaryCol/90"
                      onClick={copyCode}
                    >
                      <Copy className="size-5" />
                      Copy invite code
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {interview.status === "active" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 rounded-xl border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
                    disabled={closeMut.isPending}
                    onClick={() => closeMut.mutate()}
                  >
                    {closeMut.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <XCircle className="size-4" />
                    )}
                    Close interview
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Job description */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <FileText className="size-5 text-primaryCol" />
              <h2 className="font-poppins text-xl font-bold text-text dark:text-darkText">
                Job description
              </h2>
            </div>
            <div className="rounded-2xl border border-neutral-200/90 bg-white/80 shadow-sm dark:border-neutral-800/90 dark:bg-neutral-950/60">
              <div className="max-h-[280px] overflow-y-auto p-6 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {interview.jobDescription}
              </div>
            </div>
          </section>

          {/* Questions */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Hash className="size-5 text-primaryCol" />
                <h2 className="font-poppins text-xl font-bold text-text dark:text-darkText">
                  Generated questions
                </h2>
              </div>
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {qCount} total
              </span>
            </div>
            {qCount === 0 ? (
              <p className="rounded-2xl border border-dashed border-neutral-200 px-6 py-10 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                No questions on file. Regenerate from the interview workflow if
                needed.
              </p>
            ) : (
              <ol className="grid gap-3 sm:grid-cols-2">
                {(interview.generatedQuestions ?? []).map((q, i) => (
                  <li
                    key={i}
                    className="flex gap-4 rounded-2xl border border-neutral-200/90 bg-white/90 p-4 shadow-sm transition hover:border-primaryCol/25 dark:border-neutral-800/90 dark:bg-neutral-950/70 dark:hover:border-primaryCol/30"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primaryCol/10 font-poppins text-sm font-bold text-primaryCol">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug text-text dark:text-darkText">
                        {q.text}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {q.type}
                        </Badge>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          Difficulty {q.difficulty}/5
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Sessions */}
          <section>
            <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ClipboardList className="size-5 text-primaryCol" />
                  <h2 className="font-poppins text-xl font-bold text-text dark:text-darkText">
                    Candidate sessions
                  </h2>
                </div>
                <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
                  Each row is one candidate run on this interview. When a session
                  completes, you&apos;ll see the hiring recommendation and total
                  score here.
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-4">
              {sessions.length === 0 && (
                <li className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/80 px-8 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900/40">
                  <Users className="mx-auto size-12 text-primaryCol/50" />
                  <p className="mt-4 font-medium text-text dark:text-darkText">
                    No sessions yet
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
                    Share the invite code with candidates. Their attempts will show
                    up here with status and report summaries.
                  </p>
                </li>
              )}
              {sessions.map((s) => (
                <CandidateSessionRow key={s._id} session={s} />
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
