"use client";
import { getInterview, updateInterviewStatus } from "@/API/interviews.api";
import { PageTitle } from "@/components/helpers";
import { CandidateSessionRow } from "@/components/interview/CandidateSessionRow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IInterview, ISession } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

  const copyCode = () => {
    if (!interview?.inviteCode) return;
    void navigator.clipboard.writeText(interview.inviteCode);
    toast.success("Invite code copied");
  };

  return (
    <section>
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primaryCol" />
        </div>
      )}
      {error && (
        <p className="text-red-500">
          Failed to load interview. Ensure you own this resource.
        </p>
      )}
      {interview && (
        <>
          <PageTitle title={interview.title} desc={interview.jobDescription} />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge variant="outline">{interview.status}</Badge>
            {interview.inviteCode && (
              <>
                <span className="font-mono text-sm">
                  Invite: {interview.inviteCode}
                </span>
                <Button type="button" size="sm" variant="outline" onClick={copyCode}>
                  <Copy className="mr-1 size-4" />
                  Copy
                </Button>
              </>
            )}
            {interview.status === "active" && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={closeMut.isPending}
                onClick={() => closeMut.mutate()}
              >
                Close interview
              </Button>
            )}
          </div>

          <h3 className="mt-10 text-lg font-semibold">Candidate sessions</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Each row is one candidate run. Reports appear when status is
            completed.
          </p>
          <ul className="mt-6 space-y-4">
            {sessions.length === 0 && (
              <li className="text-neutral-500">No sessions yet.</li>
            )}
            {sessions.map((s) => (
              <CandidateSessionRow key={s._id} session={s} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
