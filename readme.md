# Interra

**Interra** is an **AI-powered mock interview platform** for **employers** and **candidates**. Employers create interviews from a job description, get **Gemini**-generated questions, and share an **invite code**. Candidates join (or run a **solo mock**), answer **by voice** in a live room, and receive **structured scores**, **spoken feedback** (browser text-to-speech), and a **final hiring-style report**.

Built for the **DHA Suffa University hackathon** (and similar demos): end-to-end flows, modern UI (light/dark), and optional **Kubernetes** manifests.

---

## Core features

| Area | What you get |
|------|----------------|
| **Employers** | Dashboard, create interview from JD, **AI-generated question set** (8 questions with type + difficulty), **invite code** when published, interview detail with **JD**, **questions**, and **candidate session** list with scores/recommendations. |
| **Candidates** | Dashboard, **join with code**, **mock interview** (private JD), **live interview** room (camera preview + **audio recording** per answer). |
| **Live interview** | Progress UI, per-answer **upload → transcribe → Gemini evaluation** (and optional follow-up), **TTS** for AI feedback, **finish → overall report** (scores, strengths, improvements, hiring recommendation). |
| **Reports** | Per-session report page with radar-style dimensions, transcript, **listen to report** (TTS). |
| **Auth** | Register/login with **role** (`employer` \| `candidate`), JWT (Bearer + compatible cookie flow via API client). |
| **Transcription** | **Local Whisper** ([openai/whisper](https://github.com/openai/whisper) in Python) or **OpenAI Whisper API** — configurable (see [Environment](#environment)). |

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), React 18, TypeScript, [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)-style components, [TanStack Query](https://tanstack.com/query), [next-themes](https://github.com/pacocoursey/next-themes), [Axios](https://axios-http.com/), [Sonner](https://sonner.emilkowal.ski/) |
| **Backend** | [Express](https://expressjs.com/), TypeScript, [Mongoose](https://mongoosejs.com/) (MongoDB), [JWT](https://github.com/auth0/node-jsonwebtoken) + bcrypt, [Multer](https://github.com/expressjs/multer) (audio uploads) |
| **AI** | [Google Generative AI](https://ai.google.dev/) (Gemini) for questions, evaluations, follow-ups, final report; **Whisper** (local Python or OpenAI API) for speech-to-text |
| **Ops** | Example **Dockerfiles** (`server/`, `client/`), **`k8s/`** manifests for API + web + secrets |

---

## Prerequisites

- **Node.js** 18+ (Node 20+ / 22 LTS recommended; on **Node 25+** the server uses a small **SlowBuffer polyfill** for legacy JWT deps — already wired in `npm` scripts).
- **MongoDB** — [Atlas](https://www.mongodb.com/atlas) URI or local `mongodb://…`
- **API keys** — `GEMINI_API_KEY`; for cloud transcription, `OPENAI_API_KEY` (optional if using **local** Whisper).
- **Local Whisper (optional)** — **Python 3**, **`ffmpeg`**, and a venv with `openai-whisper` (see below).

---

## Project structure

```
Interra-AI-Powered-Mock-Interview-Platform/
├── client/                 # Next.js app (port 3001 in dev)
├── server/                 # Express API (default port 5000)
├── k8s/                    # Kubernetes examples (secrets, deployments)
├── Interra_Technical_Plan.docx
└── README.md
```

---

## Environment

### Server (`server/.env`)

Copy from the example and fill in values:

```bash
cp server/.env.example server/.env
```

Important variables:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string (or legacy `MONGO_URI`) |
| `PORT` | API port (default **5000**) |
| `ACCESS_TOKEN_SECRET` / `JWT_SECRET` | Auth signing (set a long random string) |
| `GEMINI_API_KEY` | Google AI Studio / Gemini API |
| `GEMINI_MODEL` | e.g. `gemini-2.5-flash` |
| `TRANSCRIPTION_PROVIDER` | `local` (default in **development**) or `openai` |
| `OPENAI_API_KEY` | Required if `TRANSCRIPTION_PROVIDER=openai` |
| `WHISPER_PYTHON` | Optional path to venv Python (else `server/.venv-whisper/bin/python` if present) |
| `UPLOAD_DIR` | Optional; defaults under `server/uploads` |

See comments in **`server/.env.example`** for Whisper venv and **ffmpeg**.

### Client (`client/.env`)

```bash
cp client/.env.example client/.env
```

Set **`NEXT_PUBLIC_API_URL`** to your API **including** the `/api/v1` prefix, e.g.:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Local install & run

### 1. Clone and install dependencies

```bash
cd Interra-AI-Powered-Mock-Interview-Platform

cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Configure environment

- Edit **`server/.env`** (MongoDB, Gemini, auth secrets, transcription mode).
- Edit **`client/.env`** (`NEXT_PUBLIC_API_URL`).

### 3. (Optional) Local Whisper for transcription

On Debian/Ubuntu-style systems:

```bash
sudo apt update && sudo apt install -y ffmpeg

cd server
python3 -m venv .venv-whisper
source .venv-whisper/bin/activate   # Windows: .venv-whisper\Scripts\activate
pip install -U pip
pip install -r requirements-whisper.txt
deactivate
```

Use **`TRANSCRIPTION_PROVIDER=local`** in `server/.env` (default in dev). For **OpenAI** transcription only, set **`TRANSCRIPTION_PROVIDER=openai`** and **`OPENAI_API_KEY`**.

### 4. Start the API

```bash
cd server
npm run dev
```

Wait for the API to listen (default **http://localhost:5000**). The dev script runs TypeScript in watch mode and **nodemon** for the API.

### 5. Start the web app

In a **second** terminal:

```bash
cd client
npm run dev
```

Open **http://localhost:3001** — marketing site, register as **employer** or **candidate**, then use the dashboards and flows.

### Production-style run

```bash
cd server && npm run start    # builds TS then runs node on dist/
cd client && npm run build && npm run start
```

---

## API surface (high level)

REST routes are mounted under **`/api/v1`** (e.g. auth, interviews, sessions). The client’s `NEXT_PUBLIC_API_URL` must end with **`/api/v1`** so paths like `/sessions/...` resolve correctly.

---

## Docker / Kubernetes

- **`server/Dockerfile`** and **`client/Dockerfile`** — example images (API uses Node; **local Whisper** needs a richer image with Python + ffmpeg if you transcribe in-container).
- **`k8s/`** — example **Deployments**, **Services**, and **Secret** templates (`server-secret.example.yaml`). Set secrets for MongoDB, JWT, Gemini, and optional OpenAI.

---

## Troubleshooting

| Issue | Hint |
|-------|------|
| Client can’t reach API | Check **`NEXT_PUBLIC_API_URL`**, CORS, and that the server is listening on the expected **port**. |
| Gemini 404 / quota | Use a supported **`GEMINI_MODEL`** (see [Google AI models](https://ai.google.dev/gemini-api/docs/models)). |
| `SlowBuffer` / JWT on Node 25+ | Server dev/start already preload **`server/scripts/slowbuffer-polyfill.cjs`**. |
| `externally-managed-environment` (pip) | Use a **venv** under `server/.venv-whisper` (see above). |
| MediaRecorder errors | Use an **audio-only** stream for recording (handled in client); ensure **HTTPS** or **localhost** for `getUserMedia` where required. |

---

## License

Server `package.json` declares **ISC**; treat the repo as appropriate for your hackathon / course submission unless you add a root `LICENSE` file.

---

**Interra** — practice and screen with AI-driven interviews from a single job description.
