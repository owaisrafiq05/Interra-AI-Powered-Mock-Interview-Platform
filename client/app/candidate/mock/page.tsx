"use client";
import { joinSession } from "@/API/sessions.api";
import { PageTitle } from "@/components/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CandidateMockPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Mock interview");
  const [jobDescription, setJobDescription] = useState("");

  const mut = useMutation({
    mutationFn: () => joinSession({ title, jobDescription }),
    onSuccess: (data) => {
      toast.success("Session ready");
      router.push(`/interview/${data.session._id}/live`);
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Could not start mock";
      toast.error(msg);
    },
  });

  const start = () => {
    if (!jobDescription.trim()) {
      toast.error("Paste a job description");
      return;
    }
    mut.mutate();
  };

  return (
    <section>
      <PageTitle
        title="Mock interview"
        desc="Paste any job description. We create a private interview and session, then open the live room."
      />
      <div className="mt-8 grid max-w-2xl gap-4">
        <div>
          <label className="text-sm font-medium">Short title</label>
          <Input
            className="mt-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Job description</label>
          <Textarea
            className="mt-2 min-h-[220px]"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste JD text…"
          />
        </div>
        <Button
          type="button"
          className="w-fit bg-primaryCol text-darkText"
          disabled={mut.isPending}
          onClick={start}
        >
          {mut.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Start mock session"
          )}
        </Button>
      </div>
    </section>
  );
}
