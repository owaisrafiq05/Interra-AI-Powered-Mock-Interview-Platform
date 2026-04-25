"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function DashboardStatCard({
  icon: Icon,
  label,
  value,
  hint,
  variant = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  variant?: "default" | "accent" | "muted";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-shadow duration-300",
        "border-neutral-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-neutral-800/80 dark:bg-neutral-950/60",
        "hover:shadow-md hover:border-primaryCol/25 dark:hover:border-primaryCol/30",
        variant === "accent" &&
          "border-primaryCol/20 bg-gradient-to-br from-primaryCol/[0.08] to-transparent dark:from-primaryCol/[0.12]",
        variant === "muted" && "opacity-95"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 size-28 rounded-full blur-2xl",
          variant === "accent" ? "bg-primaryCol/20" : "bg-primaryCol/10"
        )}
      />
      <div className="relative flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primaryCol/10 text-primaryCol dark:bg-primaryCol/15">
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {label}
          </p>
          <p className="mt-1 font-poppins text-2xl font-semibold tracking-tight text-text dark:text-darkText">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
