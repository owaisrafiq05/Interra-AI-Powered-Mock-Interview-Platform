"use client";
import { Button } from "@/components/ui/button";

export function QuestionCard({
  title,
  progress,
  children,
  onReadAloud,
}: {
  title: string;
  progress: string;
  children: React.ReactNode;
  onReadAloud?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primaryCol">
            {progress}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-snug">{title}</h2>
        </div>
        {onReadAloud && (
          <Button type="button" variant="outline" size="sm" onClick={onReadAloud}>
            Listen to question
          </Button>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
