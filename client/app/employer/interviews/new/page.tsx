"use client";
import { createInterview, updateInterviewStatus } from "@/API/interviews.api";
import { PageTitle } from "@/components/helpers";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { IInterview } from "@/types/types";
import { Loader2 } from "lucide-react";

export default function NewInterviewPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [preview, setPreview] = useState<IInterview | null>(null);

  const createMut = useMutation({
    mutationFn: () => createInterview({ title, jobDescription }),
    onSuccess: (data) => {
      setPreview(data);
      toast.success("Questions generated — review then publish");
      void qc.invalidateQueries({ queryKey: ["interviews"] });
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create interview";
      toast.error(msg);
    },
  });

  const publishMut = useMutation({
    mutationFn: () =>
      updateInterviewStatus(preview!._id, { status: "active" }),
    onSuccess: () => {
      toast.success("Interview is active — invite code ready");
      void qc.invalidateQueries({ queryKey: ["interviews"] });
      router.push(`/employer/interviews/${preview!._id}`);
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Could not activate";
      toast.error(msg);
    },
  });

  const onCreate = () => {
    if (!title.trim() || !jobDescription.trim()) {
      toast.error("Title and job description are required");
      return;
    }
    createMut.mutate();
  };

  return (
    <section>
      <PageTitle
        title="Create interview"
        desc="Paste a job description. The API calls Gemini once to generate eight questions."
      />
      <div className="mt-8 grid max-w-3xl gap-6">
        <div>
          <label className="text-sm font-medium">Role title</label>
          <Input
            className="mt-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Backend Engineer"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Job description</label>
          <Textarea
            className="mt-2 min-h-[200px]"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full JD here…"
          />
        </div>
        <Button
          type="button"
          className="w-fit bg-primaryCol text-darkText"
          disabled={createMut.isPending}
          onClick={onCreate}
        >
          {createMut.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Generating…
            </>
          ) : (
            "Generate questions"
          )}
        </Button>
      </div>

      {preview && (
        <div className="mt-12 max-w-3xl rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
          <h3 className="text-lg font-semibold">Question preview</h3>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm">
            {preview.generatedQuestions?.map((q, i) => (
              <li key={i}>
                <span className="font-medium">{q.type}</span> · difficulty{" "}
                {q.difficulty}
                <p className="mt-1 text-neutral-700 dark:text-neutral-300">
                  {q.text}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              className="bg-primaryCol text-darkText"
              disabled={publishMut.isPending}
              onClick={() => publishMut.mutate()}
            >
              {publishMut.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Publish (active + invite code)"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/employer/dashboard")}
            >
              Back to list
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
