"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, submitAnswer, completeSession } from "@/API/sessions.api";
import type { IInterview, ISession } from "@/types/types";
import { QuestionCard } from "./QuestionCard";
import { AudioRecorder } from "./AudioRecorder";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Volume2, Square } from "lucide-react";
import {
  speakText,
  stopSpeaking,
  buildAnswerFeedbackSpeech,
} from "@/lib/speech";
import type { AnswerEvaluation } from "@/types/types";

function interviewFromSession(session: ISession): IInterview | null {
  const inv = session.interviewId;
  if (inv && typeof inv === "object" && "generatedQuestions" in inv) {
    return inv as IInterview;
  }
  return null;
}

export function InterviewLiveExperience({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const lastSyncedSession = useRef<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [mainIndex, setMainIndex] = useState(0);
  const [pendingFollowUp, setPendingFollowUp] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState<{
    evaluation: AnswerEvaluation;
    followUp: string | null;
  } | null>(null);
  const [feedbackSpeaking, setFeedbackSpeaking] = useState(false);

  const { data: session, isLoading, error, refetch } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => getSession(sessionId),
  });

  const interview = useMemo(
    () => (session ? interviewFromSession(session) : null),
    [session]
  );
  const questions = interview?.generatedQuestions || [];

  useEffect(() => {
    if (!session?._id || lastSyncedSession.current === session._id) return;
    lastSyncedSession.current = session._id;
    const mains = session.answers?.filter((a) => !a.isFollowUp) || [];
    if (mains.length === 0) return;
    const maxIx = Math.max(...mains.map((a) => a.questionIndex));
    setMainIndex(maxIx + 1);
  }, [session]);

  useEffect(() => {
    if (session?.status === "completed") {
      router.replace(`/interview/${sessionId}/report`);
    }
  }, [session?.status, router, sessionId]);

  useEffect(() => {
    let s: MediaStream | null = null;
    (async () => {
      try {
        s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMediaStream(s);
        const el = document.getElementById(
          "interview-preview-video"
        ) as HTMLVideoElement | null;
        if (el) {
          el.srcObject = s;
          await el.play().catch(() => {});
        }
        const pip = document.getElementById(
          "interview-pip-video"
        ) as HTMLVideoElement | null;
        if (pip) {
          pip.srcObject = s;
          await pip.play().catch(() => {});
        }
      } catch {
        setSetupError("Allow camera and microphone to continue.");
      }
    })();
    return () => {
      s?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    const pip = document.getElementById(
      "interview-pip-video"
    ) as HTMLVideoElement | null;
    if (pip && mediaStream) {
      pip.srcObject = mediaStream;
      void pip.play().catch(() => {});
    }
  }, [ready, mediaStream]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const currentQuestionText =
    pendingFollowUp ||
    (questions[mainIndex] ? questions[mainIndex].text : null);

  const progressLabel =
    questions.length > 0
      ? `Question ${mainIndex + 1} of ${questions.length}`
      : "Interview";

  const answeringFollowUp = !!pendingFollowUp;

  const onRecorded = useCallback(
    async (blob: Blob) => {
      if (!session || !currentQuestionText || questions.length === 0) return;
      if (!blob.size) {
        toast.error("Empty recording — try again");
        return;
      }
      setUploading(true);
      try {
        const fd = new FormData();
        const ext = blob.type.includes("webm")
          ? "webm"
          : blob.type.includes("mp4") || blob.type.includes("m4a")
            ? "m4a"
            : blob.type.includes("ogg")
              ? "ogg"
              : "bin";
        fd.append("audio", blob, `answer.${ext}`);
        fd.append("questionIndex", String(mainIndex));
        fd.append("questionText", currentQuestionText);
        fd.append("isFollowUp", answeringFollowUp ? "true" : "false");
        const res = await submitAnswer(sessionId, fd);

        setLatestFeedback({
          evaluation: res.evaluation,
          followUp: res.followUp,
        });
        speakText(buildAnswerFeedbackSpeech(res), {
          onStart: () => setFeedbackSpeaking(true),
          onEnd: () => setFeedbackSpeaking(false),
        });

        if (answeringFollowUp) {
          setPendingFollowUp(null);
          setMainIndex((i) => i + 1);
        } else if (res.followUp) {
          setPendingFollowUp(res.followUp);
        } else {
          setMainIndex((i) => i + 1);
        }
        toast.success("Answer saved — listen to AI feedback");
        await refetch();
        void qc.invalidateQueries({ queryKey: ["my-sessions"] });
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Upload failed";
        toast.error(msg);
      } finally {
        setUploading(false);
      }
    },
    [
      answeringFollowUp,
      currentQuestionText,
      mainIndex,
      questions.length,
      qc,
      refetch,
      session,
      sessionId,
    ]
  );

  const completeMut = useMutation({
    mutationFn: () => completeSession(sessionId),
    onSuccess: () => {
      toast.success("Report ready");
      void qc.invalidateQueries({ queryKey: ["my-sessions"] });
      router.push(`/interview/${sessionId}/report`);
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Could not complete";
      toast.error(msg);
    },
  });

  const canComplete =
    session?.status !== "completed" &&
    questions.length > 0 &&
    mainIndex >= questions.length &&
    !pendingFollowUp;

  const readAloud = () => {
    if (!currentQuestionText) return;
    stopSpeaking();
    setFeedbackSpeaking(false);
    speakText(currentQuestionText);
  };

  const replayFeedback = () => {
    if (!latestFeedback) return;
    speakText(buildAnswerFeedbackSpeech(latestFeedback), {
      onStart: () => setFeedbackSpeaking(true),
      onEnd: () => setFeedbackSpeaking(false),
    });
  };

  const stopFeedbackSpeech = () => {
    stopSpeaking();
    setFeedbackSpeaking(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-10 animate-spin text-primaryCol" />
      </div>
    );
  }

  if (error || !session || !interview) {
    return (
      <p className="p-6 text-red-500">
        Could not load this session. It may not exist or you may not have access.
      </p>
    );
  }

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-8">
      {ready && mediaStream && (
        <video
          id="interview-pip-video"
          muted
          playsInline
          className="fixed bottom-4 right-4 z-40 w-40 overflow-hidden rounded-lg border-2 border-primaryCol shadow-lg"
        />
      )}

      {!ready && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-6 text-white">
          <h2 className="text-xl font-semibold">Set up camera & microphone</h2>
          <p className="mt-2 max-w-md text-center text-sm text-white/80">
            Video stays on this device; audio is sent to the server when you finish
            each answer.
          </p>
          {setupError && <p className="mt-4 text-sm text-red-300">{setupError}</p>}
          <div className="mt-6 w-full max-w-md overflow-hidden rounded-xl bg-black">
            <video
              id="interview-preview-video"
              muted
              playsInline
              className="aspect-video w-full object-cover"
            />
          </div>
          <Button
            type="button"
            className="mt-8 bg-primaryCol text-darkText"
            disabled={!mediaStream || !!setupError}
            onClick={() => setReady(true)}
          >
            I am ready — start interview
          </Button>
        </div>
      )}

      {currentQuestionText && (
        <QuestionCard
          title={currentQuestionText}
          progress={progressLabel}
          onReadAloud={readAloud}
        >
          <AudioRecorder
            stream={mediaStream}
            disabled={uploading}
            onRecorded={onRecorded}
          />
          {uploading && (
            <p className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="size-4 animate-spin" />
              Uploading and transcribing…
            </p>
          )}
          {latestFeedback && !uploading && (
            <div
              className="mt-6 rounded-xl border border-primaryCol/30 bg-primaryCol/5 p-4 dark:border-primaryCol/40 dark:bg-primaryCol/10"
              role="region"
              aria-label="AI feedback audio"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-primaryCol">
                  {feedbackSpeaking
                    ? "Playing AI feedback…"
                    : "AI feedback (spoken aloud)"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={replayFeedback}
                  >
                    <Volume2 className="size-4" />
                    Replay
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="gap-1.5"
                    onClick={stopFeedbackSpeech}
                    disabled={!feedbackSpeaking}
                  >
                    <Square className="size-3.5" />
                    Stop
                  </Button>
                </div>
              </div>
              <details className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                <summary className="cursor-pointer font-medium text-neutral-800 dark:text-neutral-200">
                  Show written feedback
                </summary>
                <p className="mt-2 leading-relaxed">
                  {latestFeedback.evaluation.feedback}
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  Score {latestFeedback.evaluation.score}/10 · technical{" "}
                  {latestFeedback.evaluation.technicalAccuracy}/10 ·
                  communication {latestFeedback.evaluation.communication}/10 ·
                  confidence {latestFeedback.evaluation.confidence}/10
                </p>
              </details>
            </div>
          )}
        </QuestionCard>
      )}

      {!currentQuestionText && questions.length > 0 && (
        <p className="text-neutral-600 dark:text-neutral-400">
          All questions answered. Generate your report.
        </p>
      )}

      {canComplete && (
        <Button
          type="button"
          className="mt-8 bg-primaryCol text-darkText"
          disabled={completeMut.isPending}
          onClick={() => completeMut.mutate()}
        >
          {completeMut.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Finish & generate report"
          )}
        </Button>
      )}
    </div>
  );
}
