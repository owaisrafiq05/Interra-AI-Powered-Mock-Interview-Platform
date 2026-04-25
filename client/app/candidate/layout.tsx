"use client";
import { DashboardShell } from "@/components/shared/DashboardShell";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      title="Candidate workspace"
      nav={[
        { href: "/candidate/dashboard", label: "My sessions" },
        { href: "/candidate/join", label: "Join with code" },
        { href: "/candidate/mock", label: "Mock interview" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
