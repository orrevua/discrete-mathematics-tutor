# ITS · Fundamentos Matemáticos da Computação (FMC2)

An adaptive **Intelligent Tutoring System** for the course *Fundamentos Matemáticos
da Computação*. It runs an initial knowledge diagnostic, shows a **knowledge graph**
of 17 concepts colored by mastery (Iniciante / Em progresso / Dominado), delivers
deep pt-BR content per block, and adapts to your answers — recommending the next
block once prerequisites are met.

> Learner-facing content is in **pt-BR** (the student's language); all code,
> structure, and identifiers are in English.

## Architecture

**Backend — FastAPI, hexagonal (ports & adapters):**

```
backend/app/
  domain/        # pure, framework-free: entities, mastery engine, recommendation
  ports/         # repository interfaces (Protocols) — Dependency Inversion
  application/   # TutoringService use cases + DTOs + errors
  adapters/
    inbound/http/   # FastAPI routes, Pydantic schemas, presenters (driving)
    outbound/       # SQLite progress repo + in-memory content repo (driven)
  seed/          # course content (17 blocks) + diagnostic + load-time validation
  main.py        # composition root (wiring)
```

The domain depends on nothing; the application depends only on port abstractions;
adapters are swapped at the composition root. Content is static seed data; only the
single student's mastery/answer log is persisted (SQLite, stdlib `sqlite3`, no ORM).

**Frontend — Next.js (App Router) + TypeScript, feature-sliced:**

```
frontend/src/
  app/           # thin route files → delegate to features
  features/      # dashboard / diagnostic / graph / block (page logic)
  components/    # ui/ (QuestionCard, LevelBadge, ProgressBar) + layout/
  lib/           # api/client.ts, types.ts, constants.ts (routes, topics)
```

## How the adaptivity works

Per-concept mastery `m ∈ [0,1]`, updated by an explainable EWMA on each answer:
`m' = 0.7·m + 0.3·reward`, where `reward = 0.5 ± 0.5·difficulty` by correctness.
Levels: `<0.4` Iniciante, `0.4–0.75` Em progresso, `≥0.75` Dominado. A concept
unlocks when all its prerequisites reach `≥0.6`; the next recommended block is the
unlocked, non-mastered concept with the lowest mastery.

## Running locally

**Prerequisites:** Python 3.12+ and Node.js 20+.

### 1. Backend (port 8000)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows  (source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
uvicorn app.main:app --reload     # serves http://localhost:8000/api
```

Run the tests:

```bash
pytest
```

### 2. Frontend (port 3000)

```bash
cd frontend
copy .env.local.example .env.local   # cp on macOS/Linux
npm install
npm run dev                          # serves http://localhost:3000
```

Open <http://localhost:3000> → take the diagnostic → explore the map → study blocks.

## AI Tutor (optional)

Each concept page has **"Estudar este tópico com o tutor"** — a chat tutor strictly
locked to that topic (it refuses and redirects anything off-topic). It's optional;
without a key the chat shows a "não configurado" message.

1. Get a **free** Gemini API key at <https://aistudio.google.com> ("Get API key").
   This free API tier is separate from any consumer "Google AI" subscription.
2. `cd backend && copy .env.example .env` (cp on macOS/Linux), then set `TUTOR_API_KEY`.
3. Restart the backend.

Defaults to `gemini-2.5-flash-lite` (cheapest). To use another OpenAI-compatible
provider, set `TUTOR_BASE_URL` and `TUTOR_MODEL` (e.g. OpenAI: `https://api.openai.com/v1`
+ `gpt-4o-mini`). The system prompt is built from the concept content and never
sent by the client, so the topic-lock can't be overridden from the browser.

## Resetting progress

Delete the SQLite file and restart the backend:

```bash
del backend\its.db    # rm backend/its.db
```

## API summary

| Method | Path | Purpose |
|--------|------|---------|
| GET  | `/api/state` | diagnostic done? concept count |
| GET  | `/api/graph` | nodes + prerequisite edges |
| GET  | `/api/mastery` | per-concept mastery + global % |
| GET  | `/api/recommendation` | next block to study |
| GET  | `/api/blocks/{id}` | content + 3 questions (no answers) |
| POST | `/api/blocks/{id}/answers` | grade answers, update mastery |
| GET  | `/api/diagnostic` | 10 diagnostic questions |
| POST | `/api/diagnostic/submit` | seed initial mastery |

See `docs/specs/its-fmc2-spec.md` for the full design.
