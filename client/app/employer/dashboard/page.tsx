"use client";

import { listInterviews } from "@/API/interviews.api";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  ClipboardList,
  Copy,
  Hash,
  KeyRound,
  Loader2,
  Plus,
  Radio,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { IInterview } from "@/types/types";

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

function statusStyles(status: IInterview["status"]) {
  switch (status) {
    case "active":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "draft":
      return "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200";
    default:
      return "border-neutral-300 bg-neutral-100 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200";
  }
}

export default function EmployerDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["interviews"],
    queryFn: () => listInterviews(),
  });

  const copyCode = (code?: string) => {
    if (!code) return;
    void navigator.clipboard.writeText(code);
    toast.success("Invite code copied");
  };

  const list = data ?? [];
  const activeCount = list.filter((i) => i.status === "active").length;
  const draftCount = list.filter((i) => i.status === "draft").length;

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/90 bg-gradient-to-br from-white via-white to-primaryCol/[0.06] p-8 shadow-sm dark:border-neutral-800/90 dark:from-neutral-950 dark:via-neutral-950 dark:to-primaryCol/[0.08] sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primaryCol/10 blur-3xl dark:bg-primaryCol/15" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primaryCol">
              Employer dashboard
            </p>
            <h1 className="mt-2 font-poppins text-3xl font-bold tracking-tight text-text dark:text-darkText sm:text-4xl">
              Your interview pipeline
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base">
              Spin up role-specific AI questions from a job description, publish
              when ready, and share invite codes with candidates — all in one
              workspace.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-12 shrink-0 gap-2 rounded-xl bg-primaryCol px-6 text-base font-semibold text-white shadow-lg shadow-primaryCol/25 transition hover:bg-primaryCol/90 hover:shadow-primaryCol/35"
          >
            <Link href="/employer/interviews/new">
              <Plus className="size-5" />
              New interview
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard
          icon={ClipboardList}
          label="Total interviews"
          value={isLoading ? "…" : list.length}
          hint="All drafts and published roles"
        />
        <DashboardStatCard
          icon={Radio}
          label="Live & hiring"
          value={isLoading ? "…" : activeCount}
          hint="Active roles with invite codes"
          variant="accent"
        />
        <DashboardStatCard
          icon={Briefcase}
          label="Drafts"
          value={isLoading ? "…" : draftCount}
          hint="Finish setup to generate codes"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-poppins text-xl font-semibold text-text dark:text-darkText">
            All interviews
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage JDs, questions, and candidate access
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit gap-2 rounded-xl border-primaryCol/30">
          <Link href="/employer/interviews/new">
            <Sparkles className="size-4 text-primaryCol" />
            Create from job description
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-neutral-200 bg-white/50 dark:border-neutral-800 dark:bg-neutral-950/40">
          <Loader2 className="size-10 animate-spin text-primaryCol" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Loading your interviews…
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          Could not load interviews. Confirm{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs dark:bg-red-900/60">
            NEXT_PUBLIC_API_URL
          </code>{" "}
          and that you are logged in as an employer.
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-neutral-200/90 bg-white/70 px-8 py-16 text-center dark:border-neutral-800/90 dark:bg-neutral-950/50">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primaryCol/10 text-primaryCol">
            <ClipboardList className="size-8" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-poppins text-lg font-semibold text-text dark:text-darkText">
              No interviews yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
              Create your first interview to let Gemini draft tailored questions
              from your job description.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="gap-2 rounded-xl bg-primaryCol px-8 text-white shadow-md shadow-primaryCol/20"
          >
            <Link href="/employer/interviews/new">
              Create interview
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}

      {list.length > 0 && (
      <ul className="grid gap-4 lg:grid-cols-1">
        {list.map((inv) => {
          const qCount = inv.generatedQuestions?.length ?? 0;
          return (
            <li key={inv._id}>
              <article className="group relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primaryCol/25 hover:shadow-lg hover:shadow-primaryCol/5 dark:border-neutral-800/90 dark:bg-neutral-950/70 dark:hover:border-primaryCol/30 dark:hover:shadow-primaryCol/10">
                <div
                  className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primaryCol to-primaryCol/50 opacity-90`}
                  aria-hidden
                />
                <div className="flex flex-col gap-6 p-6 pl-7 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles(inv.status)}`}
                      >
                        {inv.status}
                      </span>
                      {inv.isMockInterview && (
                        <Badge variant="outline" className="text-xs">
                          Mock-capable
                        </Badge>
                      )}
                    </div>
                    <Link
                      href={`/employer/interviews/${inv._id}`}
                      className="block font-poppins text-xl font-semibold tracking-tight text-text transition group-hover:text-primaryCol dark:text-darkText dark:group-hover:text-primaryCol"
                    >
                      {inv.title}
                    </Link>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-3.5 shrink-0 text-primaryCol/80" />
                        Updated {formatDate(inv.updatedAt || inv.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Hash className="size-3.5 shrink-0 text-primaryCol/80" />
                        {qCount} AI question{qCount === 1 ? "" : "s"}
                      </span>
                      {inv.status === "active" && inv.inviteCode && (
                        <span className="inline-flex items-center gap-1.5 font-mono text-neutral-700 dark:text-neutral-300">
                          <KeyRound className="size-3.5 shrink-0 text-primaryCol" />
                          {inv.inviteCode}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch lg:flex-row">
                    {inv.inviteCode && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 rounded-xl"
                        onClick={() => copyCode(inv.inviteCode)}
                      >
                        <Copy className="size-4" />
                        Copy code
                      </Button>
                    )}
                    <Button
                      asChild
                      size="sm"
                      className="gap-1.5 rounded-xl bg-primaryCol text-white hover:bg-primaryCol/90"
                    >
                      <Link href={`/employer/interviews/${inv._id}`}>
                        Open
                        <ArrowRight className="size-4 opacity-80" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
      )}
    </div>
  );
}
