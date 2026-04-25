"use client";

import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuestionCard({
  title,
  progress,
  meta,
  badges,
  children,
  onReadAloud,
}: {
  title: string;
  progress: string;
  /** e.g. "Technical · Difficulty 3/5" */
  meta?: string;
  badges?: { label: string; tone?: "followup" | "default" }[];
  children: React.ReactNode;
  onReadAloud?: () => void;
}) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-3xl border border-neutral-200/90 bg-white/95 shadow-xl shadow-neutral-900/[0.06] ring-1 ring-neutral-900/[0.03] dark:border-neutral-800/90 dark:bg-neutral-950/90 dark:shadow-black/30 dark:ring-white/[0.04]"
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primaryCol via-sky-500 to-primaryCol opacity-90 dark:opacity-100" />
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            {badges && badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => (
                  <span
                    key={b.label}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider",
                      b.tone === "followup"
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                        : "border-primaryCol/30 bg-primaryCol/10 text-primaryCol"
                    )}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primaryCol">
              {progress}
            </p>
            <h2 className="font-poppins text-xl font-bold leading-snug tracking-tight text-text dark:text-darkText sm:text-2xl">
              {title}
            </h2>
            {meta && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{meta}</p>
            )}
          </div>
          {onReadAloud && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReadAloud}
              className="shrink-0 gap-2 rounded-full border-primaryCol/30 hover:bg-primaryCol/5 hover:text-primaryCol dark:border-primaryCol/40"
            >
              <Volume2 className="size-4" />
              Listen
            </Button>
          )}
        </div>
        <div className="mt-8 border-t border-neutral-100 pt-8 dark:border-neutral-800/80">
          {children}
        </div>
      </div>
    </article>
  );
}
