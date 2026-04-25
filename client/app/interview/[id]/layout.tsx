"use client";
import Link from "next/link";
import { ToggleTheme, UserAvatar } from "@/components/helpers";

export default function InterviewRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg dark:bg-darkBg">
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <Link
          href="/candidate/dashboard"
          className="text-sm font-medium text-primaryCol hover:underline"
        >
          ← Candidate home
        </Link>
        <div className="flex items-center gap-2">
          <ToggleTheme />
          <UserAvatar />
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
