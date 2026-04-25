"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToggleTheme, UserAvatar } from "@/components/helpers";
import {
  Mic,
  Home,
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

function NavGlyph({ href }: { href: string }) {
  const h = href.toLowerCase();
  const cls = "size-[18px] shrink-0";
  if (h.endsWith("/employer/dashboard") || h === "/employer/dashboard")
    return <ClipboardList className={cls} strokeWidth={1.75} />;
  if (h.includes("/employer/interviews/new"))
    return <PlusCircle className={cls} strokeWidth={1.75} />;
  if (h.endsWith("/candidate/dashboard") || h === "/candidate/dashboard")
    return <LayoutDashboard className={cls} strokeWidth={1.75} />;
  if (h.includes("/candidate/join"))
    return <KeyRound className={cls} strokeWidth={1.75} />;
  if (h.includes("/candidate/mock"))
    return <Sparkles className={cls} strokeWidth={1.75} />;
  return <LayoutDashboard className={cls} strokeWidth={1.75} />;
}

export function DashboardShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-bg dark:bg-darkBg">
      <aside className="sticky top-0 z-20 flex h-screen w-[280px] shrink-0 flex-col border-r border-neutral-200/90 bg-white/90 backdrop-blur-xl dark:border-neutral-800/90 dark:bg-neutral-950/90">
        <div className="relative border-b border-neutral-200/80 p-6 dark:border-neutral-800/80">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primaryCol/40 to-transparent" />
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primaryCol"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primaryCol to-primaryCol/80 text-white shadow-lg shadow-primaryCol/25">
              <Mic className="size-6" strokeWidth={2} />
            </span>
            <div>
              <span className="font-poppins text-lg font-semibold tracking-tight text-text dark:text-darkText">
                Interra
              </span>
              <p className="text-xs font-medium text-primaryCol">{title}</p>
            </div>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-3">
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Menu
          </p>
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-primaryCol/15 to-primaryCol/5 text-primaryCol shadow-sm ring-1 ring-primaryCol/20 dark:from-primaryCol/20 dark:to-primaryCol/5 dark:ring-primaryCol/25"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-text dark:text-neutral-300 dark:hover:bg-neutral-900/80 dark:hover:text-darkText"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                    active
                      ? "border-primaryCol/30 bg-primaryCol/10 text-primaryCol"
                      : "border-neutral-200/80 bg-neutral-50 text-neutral-500 group-hover:border-primaryCol/20 group-hover:bg-primaryCol/5 group-hover:text-primaryCol dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400"
                  )}
                >
                  <NavGlyph href={item.href} />
                </span>
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="ml-auto hidden h-1.5 w-1.5 shrink-0 rounded-full bg-primaryCol sm:block" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-neutral-200/80 p-4 dark:border-neutral-800/80">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-primaryCol dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-primaryCol"
          >
            <Home className="size-4 shrink-0" />
            Back to marketing site
          </Link>
        </div>
      </aside>

      <div className="dashboard-main-bg flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-neutral-200/80 bg-bg/80 px-5 py-4 backdrop-blur-md dark:border-neutral-800/80 dark:bg-darkBg/80 sm:px-8">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Workspace
            </p>
            <p className="truncate font-poppins text-sm font-semibold text-text dark:text-darkText sm:text-base">
              {title}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="rounded-full border border-neutral-200/80 bg-white/80 p-0.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/80">
              <ToggleTheme />
            </div>
            <div className="rounded-full border border-neutral-200/80 bg-white/80 px-1 py-0.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/80">
              <UserAvatar />
            </div>
          </div>
        </header>

        <main className="section flex-1 pb-16 pt-8 sm:pt-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
