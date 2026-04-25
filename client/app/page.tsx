import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ToggleTheme } from "@/components/helpers";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Headphones,
  Layers,
  Mic,
  Rocket,
  Shield,
  Sparkles,
  Users,
  Video,
  Zap,
} from "lucide-react";

const featureCards = [
  {
    icon: Sparkles,
    title: "JD → questions in one click",
    body: "Paste a job description and let Gemini draft eight structured questions—technical, behavioral, and situational—with difficulty levels.",
  },
  {
    icon: Mic,
    title: "Speak naturally",
    body: "Record answers in the browser; audio is transcribed (Whisper locally or via API) so scoring runs on what you actually said.",
  },
  {
    icon: Brain,
    title: "Structured AI scoring",
    body: "Each answer gets numeric dimensions plus concise feedback—consistent rubrics employers can trust for first-pass screening.",
  },
  {
    icon: Video,
    title: "Live interview room",
    body: "Camera preview stays on-device; you control when each answer uploads. Built for demos and async hiring workflows.",
  },
  {
    icon: BarChart3,
    title: "Closing report",
    body: "Wrap with a hiring-style summary: strengths, improvements, recommendation, and an overall score out of 100.",
  },
  {
    icon: Shield,
    title: "Roles & access",
    body: "Employers manage interviews and invite codes; candidates join with a code or run a private mock on any JD.",
  },
];

const steps = [
  { n: "01", t: "Sign up", d: "Choose employer or candidate and land in a focused workspace." },
  { n: "02", t: "Create or join", d: "Employers publish from a JD; candidates enter a code or start a mock." },
  { n: "03", t: "Interview & review", d: "Answer by voice, get AI feedback, then generate the final report." },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-bg text-text dark:bg-darkBg dark:text-darkText">
      {/* ambient */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-90 dark:opacity-100"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 55% at 50% -15%, rgba(58, 109, 208, 0.22), transparent 52%),
            radial-gradient(ellipse 60% 45% at 100% 0%, rgba(58, 109, 208, 0.08), transparent 45%),
            radial-gradient(ellipse 50% 35% at 0% 100%, rgba(58, 109, 208, 0.1), transparent 40%)
          `,
        }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-bg/75 dark:bg-darkBg/80" aria-hidden />

      <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-bg/75 backdrop-blur-xl dark:border-neutral-800/80 dark:bg-darkBg/75">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-poppins text-lg font-bold tracking-tight text-primaryCol"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primaryCol to-primaryCol/80 text-white shadow-lg shadow-primaryCol/25">
              <Mic className="size-5" strokeWidth={2.2} />
            </span>
            Interra
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-300 md:flex">
            <a href="#features" className="transition hover:text-primaryCol">
              Product
            </a>
            <a href="#audiences" className="transition hover:text-primaryCol">
              Who it&apos;s for
            </a>
            <a href="#flow" className="transition hover:text-primaryCol">
              How it works
            </a>
            <a href="#stack" className="transition hover:text-primaryCol">
              Stack
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-full border border-neutral-200/80 bg-white/70 p-0.5 dark:border-neutral-800 dark:bg-neutral-950/60">
              <ToggleTheme />
            </div>
            <Link
              href="/login"
              className="hidden text-sm font-medium text-neutral-600 transition hover:text-primaryCol sm:inline dark:text-neutral-300"
            >
              Log in
            </Link>
            <Button
              asChild
              size="sm"
              className="rounded-full bg-primaryCol px-4 font-semibold text-white shadow-md shadow-primaryCol/20 hover:bg-primaryCol/90"
            >
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-primaryCol/25 bg-primaryCol/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primaryCol">
                <Zap className="size-3.5" />
                AI interviews · voice-first
              </p>
              <h1 className="mt-6 font-poppins text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                Screen and practice with{" "}
                <span className="bg-gradient-to-r from-primaryCol to-sky-500 bg-clip-text text-transparent dark:to-sky-400">
                  interviews that feel real
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg">
                Interra turns any job description into a full mock loop—Gemini
                questions, spoken answers, Whisper transcription, structured scores,
                and a hiring-style report. Built for hackathon-grade demos and
                serious async workflows.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-12 gap-2 rounded-full bg-primaryCol px-8 text-base font-semibold text-white shadow-xl shadow-primaryCol/25 hover:bg-primaryCol/90"
                >
                  <Link href="/register">
                    Start free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-neutral-300 px-7 dark:border-neutral-600">
                  <Link href="/login">Log in</Link>
                </Button>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-neutral-500 dark:text-neutral-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  Gemini question generation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  Whisper-ready audio pipeline
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  Employer + candidate flows
                </li>
              </ul>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primaryCol/20 via-transparent to-sky-500/10 blur-2xl dark:from-primaryCol/25" />
              <div className="relative overflow-hidden rounded-3xl border border-neutral-200/90 bg-white/90 shadow-2xl shadow-neutral-900/10 ring-1 ring-neutral-900/5 dark:border-neutral-800/90 dark:bg-neutral-950/90 dark:shadow-black/40 dark:ring-white/10">
                <div className="flex items-center gap-2 border-b border-neutral-200/80 bg-neutral-50/90 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/80">
                  <span className="size-3 rounded-full bg-red-400/90" />
                  <span className="size-3 rounded-full bg-amber-400/90" />
                  <span className="size-3 rounded-full bg-emerald-400/90" />
                  <span className="ml-2 flex-1 truncate text-center text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    app.interra.dev / live session
                  </span>
                </div>
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="rounded-2xl border border-primaryCol/20 bg-gradient-to-br from-primaryCol/[0.07] to-transparent p-4 dark:from-primaryCol/15">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primaryCol">
                      Current question
                    </p>
                    <p className="mt-2 text-sm font-medium leading-snug text-text dark:text-darkText">
                      Describe how you would design rate limiting for a public API
                      with unpredictable traffic spikes.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="aspect-video flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
                      <div className="flex h-full items-center justify-center text-neutral-400 dark:text-neutral-500">
                        <Video className="size-10 opacity-60" />
                      </div>
                    </div>
                    <div className="flex w-28 flex-col justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
                      <div className="h-2 w-full rounded-full bg-primaryCol/30" />
                      <div className="h-2 w-[85%] rounded-full bg-neutral-200 dark:bg-neutral-700" />
                      <div className="h-2 w-[60%] rounded-full bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/80">
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      <Headphones className="size-4 text-primaryCol" />
                      AI feedback queued…
                    </div>
                    <span className="rounded-full bg-primaryCol/15 px-2.5 py-0.5 text-xs font-semibold text-primaryCol">
                      Live
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-y border-neutral-200/80 bg-white/60 py-20 dark:border-neutral-800/80 dark:bg-neutral-950/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primaryCol">
                Product
              </p>
              <h2 className="mt-3 font-poppins text-3xl font-bold tracking-tight sm:text-4xl">
                Everything for a credible mock loop
              </h2>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                From first paste to final PDF-style narrative—opinionated defaults
                so you can demo end-to-end without glue code.
              </p>
            </div>
            <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featureCards.map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className={cn(
                    "group rounded-2xl border border-neutral-200/90 bg-bg/80 p-6 shadow-sm transition duration-300",
                    "hover:-translate-y-1 hover:border-primaryCol/30 hover:shadow-lg hover:shadow-primaryCol/5",
                    "dark:border-neutral-800/90 dark:bg-darkBg/50 dark:hover:border-primaryCol/35"
                  )}
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primaryCol/10 text-primaryCol transition group-hover:bg-primaryCol/15">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-4 font-poppins text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Audiences */}
        <section id="audiences" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primaryCol">
              Who it&apos;s for
            </p>
            <h2 className="mt-3 font-poppins text-3xl font-bold tracking-tight sm:text-4xl">
              Two workspaces, one platform
            </h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              Tailored dashboards keep employers shipping interviews and candidates
              practicing without friction.
            </p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-3xl border border-neutral-200/90 bg-gradient-to-br from-white to-primaryCol/[0.06] p-8 shadow-lg dark:border-neutral-800/90 dark:from-neutral-950 dark:to-primaryCol/[0.08] sm:p-10">
              <div className="absolute -right-8 -top-8 size-40 rounded-full bg-primaryCol/10 blur-3xl" />
              <Users className="relative size-10 text-primaryCol" strokeWidth={1.5} />
              <h3 className="relative mt-6 font-poppins text-2xl font-bold">Employers</h3>
              <p className="relative mt-3 text-neutral-600 dark:text-neutral-400">
                Create interviews from a job description, review AI-generated
                questions, publish to activate an invite code, and track sessions as
                candidates complete the room.
              </p>
              <Button
                asChild
                variant="outline"
                className="relative mt-8 gap-2 rounded-full border-primaryCol/35"
              >
                <Link href="/register">
                  I hire talent
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </article>
            <article className="relative overflow-hidden rounded-3xl border border-neutral-200/90 bg-gradient-to-br from-white to-sky-500/[0.05] p-8 shadow-lg dark:border-neutral-800/90 dark:from-neutral-950 dark:to-sky-500/10 sm:p-10">
              <div className="absolute -right-8 -top-8 size-40 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-400/15" />
              <Rocket className="relative size-10 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />
              <h3 className="relative mt-6 font-poppins text-2xl font-bold">Candidates</h3>
              <p className="relative mt-3 text-neutral-600 dark:text-neutral-400">
                Join with an employer code for a structured loop, or spin up a mock
                on any pasted JD to rehearse before the real interview—same scoring
                and report experience.
              </p>
              <Button
                asChild
                variant="outline"
                className="relative mt-8 gap-2 rounded-full border-sky-500/40 text-sky-700 dark:border-sky-500/30 dark:text-sky-300"
              >
                <Link href="/register">
                  I practice interviews
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </article>
          </div>
        </section>

        {/* Flow */}
        <section id="flow" className="border-t border-neutral-200/80 bg-neutral-50/80 py-20 dark:border-neutral-800/80 dark:bg-neutral-950/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primaryCol">
                How it works
              </p>
              <h2 className="mt-3 font-poppins text-3xl font-bold tracking-tight sm:text-4xl">
                Three beats from zero to report
              </h2>
            </div>
            <ol className="mt-14 grid gap-8 md:grid-cols-3">
              {steps.map((s) => (
                <li
                  key={s.n}
                  className="relative rounded-2xl border border-neutral-200/90 bg-bg p-8 dark:border-neutral-800 dark:bg-darkBg"
                >
                  <span className="font-poppins text-4xl font-bold tabular-nums text-primaryCol/25 dark:text-primaryCol/30">
                    {s.n}
                  </span>
                  <h3 className="mt-2 font-poppins text-xl font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {s.d}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Stack */}
        <section id="stack" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <Layers className="size-10 text-primaryCol" strokeWidth={1.25} />
            <h2 className="font-poppins text-2xl font-bold sm:text-3xl">
              Built with a modern, deployable stack
            </h2>
            <p className="max-w-2xl text-neutral-600 dark:text-neutral-400">
              Next.js App Router · Express REST · MongoDB Atlas · JWT auth · Gemini
              · OpenAI Whisper (or local Whisper) · optional Kubernetes manifests.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Next.js 14",
                "TypeScript",
                "Tailwind",
                "Express",
                "MongoDB",
                "Gemini",
                "Whisper",
                "Docker / K8s",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-neutral-200/90 bg-white/80 px-4 py-1.5 text-xs font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-neutral-200/80 bg-gradient-to-r from-primaryCol/[0.12] via-primaryCol/[0.08] to-sky-500/[0.1] px-4 py-16 dark:border-neutral-800/80 dark:from-primaryCol/20 dark:via-primaryCol/10 dark:to-sky-500/15 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <h2 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to run your next mock?
            </h2>
            <p className="max-w-xl text-neutral-700 dark:text-neutral-300">
              Create an account in seconds—no credit card required for this
              prototype. Tune keys in <code className="rounded bg-white/60 px-1.5 py-0.5 text-sm dark:bg-black/30">.env</code>{" "}
              and you&apos;re live.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-primaryCol px-8 text-base font-semibold text-white shadow-lg shadow-primaryCol/30 hover:bg-primaryCol/90"
              >
                <Link href="/register">Create account</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="h-12 rounded-full px-8">
                <Link href="/login">I have an account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200/80 bg-neutral-50/90 dark:border-neutral-800/80 dark:bg-neutral-950/80">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <div className="flex items-center gap-2 font-poppins font-bold text-primaryCol">
              <Mic className="size-6" />
              Interra
            </div>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              AI-powered mock interviews for teams and candidates. Built for clarity,
              speed, and demo-day polish.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Product
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="#features" className="text-neutral-600 hover:text-primaryCol dark:text-neutral-400">
                  Features
                </a>
              </li>
              <li>
                <a href="#flow" className="text-neutral-600 hover:text-primaryCol dark:text-neutral-400">
                  Flow
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Account
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-neutral-600 hover:text-primaryCol dark:text-neutral-400">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-neutral-600 hover:text-primaryCol dark:text-neutral-400">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Prototype
            </p>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              DHA Suffa Hackathon · Express + MongoDB + Gemini + Whisper
            </p>
          </div>
        </div>
        <div className="border-t border-neutral-200/80 py-4 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-500">
          © {new Date().getFullYear()} Interra. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
