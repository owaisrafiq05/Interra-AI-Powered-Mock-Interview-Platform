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
import {
  Loader2,
  Volume2,
  Square,
  Video,
  Sparkles,
  Shield,
  Mic,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import {
  speakText,
  stopSpeaking,
  buildAnswerFeedbackSpeech,
} from "@/lib/speech";
import type { AnswerEvaluation } from "@/types/types";
import { cn } from "@/lib/utils";

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
        const attach = async (id: string) => {
          const el = document.getElementById(id) as HTMLVideoElement | null;
          if (el) {
            el.srcObject = s;
            await el.play().catch(() => {});
          }
        };
        await attach("interview-preview-video");
        await attach("interview-pip-video");
        await attach("interview-stage-video");
      } catch {
        setSetupError("Allow camera and microphone to continue.");
      }
    })();
    return () => {
      s?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!ready || !mediaStream) return;
    const ids = ["interview-pip-video", "interview-stage-video"];
    void (async () => {
      for (const id of ids) {
        const el = document.getElementById(id) as HTMLVideoElement | null;
        if (el) {
          el.srcObject = mediaStream;
          await el.play().catch(() => {});
        }
      }
    })();
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
  const currentQ = questions[mainIndex];

  const progressPercent = useMemo(() => {
    if (!questions.length) return 0;
    const base = ((mainIndex + 1) / questions.length) * 100;
    const bump = answeringFollowUp ? 100 / questions.length / 3 : 0;
    return Math.min(100, base + bump);
  }, [mainIndex, questions.length, answeringFollowUp]);

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
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 py-24">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primaryCol/20" />
          <div className="relative flex size-20 items-center justify-center rounded-2xl border border-primaryCol/30 bg-primaryCol/10">
            <Loader2 className="size-10 animate-spin text-primaryCol" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-poppins text-lg font-semibold text-text dark:text-darkText">
            Preparing your session
          </p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Loading interview and questions…
          </p>
        </div>
      </div>
    );
  }

  if (error || !session || !interview) {
    return (
      <div className="mx-auto max-w-lg py-16">
        <div className="rounded-3xl border border-red-200/90 bg-red-50/90 p-8 text-center dark:border-red-900/50 dark:bg-red-950/40">
          <p className="font-medium text-red-800 dark:text-red-200">
            Could not load this session
          </p>
          <p className="mt-2 text-sm text-red-700/90 dark:text-red-300/90">
            It may not exist or you may not have access. Return to your dashboard
            and try again.
          </p>
        </div>
      </div>
    );
  }

  const badges = answeringFollowUp
    ? [{ label: "Follow-up question", tone: "followup" as const }]
    : undefined;

  const questionMeta =
    currentQ && !answeringFollowUp
      ? `${currentQ.type} · difficulty ${currentQ.difficulty}/5`
      : answeringFollowUp
        ? "Short follow-up on your last answer"
        : undefined;

  return (
    <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      {ready && mediaStream && (
        <video
          id="interview-pip-video"
          muted
          playsInline
          className="fixed bottom-5 right-4 z-40 w-36 overflow-hidden rounded-2xl border-2 border-primaryCol/50 shadow-2xl shadow-primaryCol/20 ring-2 ring-black/5 dark:ring-white/10 sm:w-40 lg:hidden"
        />
      )}

      {!ready && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md sm:p-6">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primaryCol/25 via-transparent to-sky-500/10" />
            <div className="relative p-6 sm:p-8">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primaryCol">
                <Video className="size-3.5" />
                Device check
              </div>
              <h2 className="mt-4 font-poppins text-2xl font-bold text-white sm:text-3xl">
                Camera & microphone
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Preview stays on this device. When you record an answer, only the
                audio clip is sent for transcription—aligned with the Interra
                technical flow.
              </p>
              {setupError && (
                <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {setupError}
                </p>
              )}
              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black ring-1 ring-white/5">
                <video
                  id="interview-preview-video"
                  muted
                  playsInline
                  className="aspect-video w-full object-cover"
                />
              </div>
              <ul className="mt-6 space-y-3 text-sm text-white/75">
                <li className="flex gap-3">
                  <Shield className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                  Grant permissions when the browser prompts you.
                </li>
                <li className="flex gap-3">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primaryCol" />
                  Find a quiet spot—we transcribe what you say.
                </li>
              </ul>
              <Button
                type="button"
                size="lg"
                className="mt-8 h-12 w-full rounded-2xl bg-gradient-to-r from-primaryCol to-primaryCol/85 text-base font-semibold text-white shadow-lg shadow-primaryCol/30 hover:from-primaryCol hover:to-primaryCol/80 disabled:opacity-50"
                disabled={!mediaStream || !!setupError}
                onClick={() => setReady(true)}
              >
                I&apos;m ready — enter interview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Session strip */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primaryCol">
            Live session
          </p>
          <h1 className="mt-1 font-poppins text-xl font-bold tracking-tight text-text dark:text-darkText sm:text-2xl">
            {interview.title}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Answer each prompt by voice. AI scores every response.
          </p>
        </div>
        {questions.length > 0 && (
          <div className="w-full max-w-md sm:w-72">
            <div className="mb-2 flex justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
              <span>Progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primaryCol to-sky-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-3 flex gap-1.5">
              {questions.map((_, i) => (
                <span
                  key={i}
                  title={`Question ${i + 1}`}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i < mainIndex
                      ? "bg-primaryCol"
                      : i === mainIndex
                        ? answeringFollowUp
                          ? "bg-amber-400"
                          : "bg-primaryCol/50 ring-2 ring-primaryCol/30"
                        : "bg-neutral-200 dark:bg-neutral-700"
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-10">
        <div className="min-w-0 space-y-8">
          {currentQuestionText && (
            <QuestionCard
              title={currentQuestionText}
              progress={progressLabel}
              meta={questionMeta}
              badges={badges}
              onReadAloud={readAloud}
            >
              <AudioRecorder
                stream={mediaStream}
                disabled={uploading}
                onRecorded={onRecorded}
              />
              {uploading && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-primaryCol/20 bg-primaryCol/5 px-4 py-4 dark:bg-primaryCol/10">
                  <Loader2 className="size-6 shrink-0 animate-spin text-primaryCol" />
                  <div>
                    <p className="text-sm font-semibold text-text dark:text-darkText">
                      Processing your answer…
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Uploading audio, transcribing, and generating feedback.
                    </p>
                  </div>
                </div>
              )}
              {latestFeedback && !uploading && (
                <div
                  className="mt-8 overflow-hidden rounded-2xl border border-primaryCol/25 bg-gradient-to-br from-primaryCol/[0.07] to-transparent dark:from-primaryCol/15"
                  role="region"
                  aria-label="AI feedback audio"
                >
                  <div className="flex flex-col gap-4 border-b border-primaryCol/15 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primaryCol/15 text-primaryCol">
                        <Mic className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primaryCol">
                          {feedbackSpeaking
                            ? "Playing AI feedback…"
                            : "AI feedback"}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Spoken summary + scores below
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 rounded-full border-primaryCol/35"
                        onClick={replayFeedback}
                      >
                        <Volume2 className="size-4" />
                        Replay
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 rounded-full"
                        onClick={stopFeedbackSpeech}
                        disabled={!feedbackSpeaking}
                      >
                        <Square className="size-3.5" />
                        Stop
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3 p-5 sm:grid-cols-4">
                    {(
                      [
                        ["Score", latestFeedback.evaluation.score],
                        ["Technical", latestFeedback.evaluation.technicalAccuracy],
                        ["Communication", latestFeedback.evaluation.communication],
                        ["Confidence", latestFeedback.evaluation.confidence],
                      ] as const
                    ).map(([label, val]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-neutral-200/80 bg-white/80 px-3 py-3 text-center dark:border-neutral-800 dark:bg-neutral-900/60"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                          {label}
                        </p>
                        <p className="mt-1 font-poppins text-xl font-bold text-text dark:text-darkText">
                          {val}
                          <span className="text-xs font-normal text-neutral-400">
                            /10
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                  <details className="group border-t border-neutral-200/80 dark:border-neutral-800/80">
                    <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900/50">
                      Written feedback & detail
                    </summary>
                    <div className="space-y-3 px-5 pb-5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                      <p>{latestFeedback.evaluation.feedback}</p>
                    </div>
                  </details>
                </div>
              )}
            </QuestionCard>
          )}

          {!currentQuestionText && questions.length > 0 && (
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-8 text-center dark:from-emerald-500/15">
              <CheckCircle2 className="mx-auto size-12 text-emerald-600 dark:text-emerald-400" />
              <p className="mt-4 font-poppins text-lg font-semibold text-text dark:text-darkText">
                All questions complete
              </p>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Generate your hiring-style report with one tap.
              </p>
            </div>
          )}

          {canComplete && (
            <Button
              type="button"
              size="lg"
              className="h-14 w-full max-w-md gap-2 rounded-2xl bg-gradient-to-r from-primaryCol to-primaryCol/90 text-base font-semibold text-white shadow-xl shadow-primaryCol/25 hover:from-primaryCol hover:to-primaryCol/85 sm:w-auto"
              disabled={completeMut.isPending}
              onClick={() => completeMut.mutate()}
            >
              {completeMut.isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <BarChart3 className="size-5" />
                  Finish & generate report
                </>
              )}
            </Button>
          )}
        </div>

        {/* Stage video — desktop */}
        {ready && mediaStream && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-3">
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Your camera
              </p>
              <div className="overflow-hidden rounded-3xl border border-neutral-200/90 bg-black shadow-2xl ring-1 ring-neutral-900/10 dark:border-neutral-800 dark:ring-white/10">
                <video
                  id="interview-stage-video"
                  muted
                  playsInline
                  className="aspect-video w-full object-cover"
                />
              </div>
              <p className="text-center text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                Preview is local only. Recording uses your microphone when you tap
                start.
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
