"use client";

import Link from "next/link";
import { ToggleTheme, UserAvatar } from "@/components/helpers";
import { Mic, ChevronLeft } from "lucide-react";

export default function InterviewRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-bg text-text dark:bg-darkBg dark:text-darkText">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-80 dark:opacity-100"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(58, 109, 208, 0.14), transparent 50%),
            radial-gradient(ellipse 50% 40% at 100% 100%, rgba(58, 109, 208, 0.06), transparent 45%)
          `,
        }}
      />
      <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-bg/80 backdrop-blur-xl dark:border-neutral-800/80 dark:bg-darkBg/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/candidate/dashboard"
              className="group flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/80 py-1.5 pl-2 pr-3 text-sm font-medium text-neutral-700 transition hover:border-primaryCol/35 hover:text-primaryCol dark:border-neutral-800 dark:bg-neutral-950/80 dark:text-neutral-200 dark:hover:border-primaryCol/40"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-neutral-100 transition group-hover:bg-primaryCol/10 dark:bg-neutral-900">
                <ChevronLeft className="size-4" />
              </span>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="hidden h-6 w-px bg-neutral-200 dark:bg-neutral-800 sm:block" />
            <div className="hidden items-center gap-2 font-poppins font-semibold text-primaryCol sm:flex">
              <Mic className="size-5" />
              Live interview
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-neutral-200/80 bg-white/80 p-0.5 dark:border-neutral-800 dark:bg-neutral-950/80">
              <ToggleTheme />
            </div>
            <div className="rounded-full border border-neutral-200/80 bg-white/80 px-1 py-0.5 dark:border-neutral-800 dark:bg-neutral-950/80">
              <UserAvatar />
            </div>
          </div>
        </div>
      </header>
      <div className="relative flex-1">{children}</div>
    </div>
  );
}
