"use client";
import { DashboardShell } from "@/components/shared/DashboardShell";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      title="Employer workspace"
      nav={[
        { href: "/employer/dashboard", label: "My interviews" },
        { href: "/employer/interviews/new", label: "Create interview" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
