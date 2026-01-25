# Quiz Gen: AI-powered quiz builder.

## Summary

### System architecture and technical decisions

- **Layered design** — API Route Handlers call `QuizService`, which orchestrates `AIService` (LLM) and Drizzle/PostgreSQL. Business logic lives in services; routes handle HTTP and validation.
- **Next.js App Router** — RSC for `/quiz/[id]` and listing so quiz data is loaded on the server with no client fetch for the initial payload. Route Handlers power `/api/quiz/generate`, `/api/quiz/[id]/submit`, and related endpoints.
- **Database** — Drizzle ORM with PostgreSQL. Normalized schema: `quizzes` → `quiz_questions` → `question_options`; `quiz_attempts` → `quiz_attempt_answers`. Cascade deletes and foreign keys keep referential integrity. `QuizService` uses transactions for submitting an attempt and its answers.
- **Structured AI output** — Quiz generation uses **Zod** schemas and **Vercel AI SDK**’s `Output.object` so the model returns a strongly typed structure (5 questions, 4 options each, one correct per question). This avoids malformed JSON and reduces client‑side parsing.
- **Minimal client JS** — Client components only where needed: generate form, take-quiz form, and results. The rest stays in RSC for smaller bundles and better first-load performance.

### AI tools and reasoning

- **Vercel AI SDK (`ai`)** — `generateText` with `Output.object` and a Zod schema (`generatedQuizSchema`) to get a deterministic shape from the model. Retries and a clear system prompt (e.g. “exactly 5 questions, 4 options A–D, one correct, concise explanations”) improve reliability.
- **@ai-sdk/openai** — OpenAI as the LLM provider. The `webSearch` tool is available so the model can ground factual questions in current web data when useful.
- **Zod** — Schemas enforce array lengths and `isCorrect` cardinality (exactly one per question). Invalid output is caught before persistence, so only valid quizzes reach the DB.

## Tech stack

- **Next.js 15** — App Router, RSC, Route Handlers
- **React 19**
- **Drizzle ORM** + **PostgreSQL**
- **Vercel AI SDK** + **@ai-sdk/openai** + **Zod** — structured quiz generation
- **Tailwind CSS** — styling
- **shadcn-style UI** — Radix, Lucide

## RSC and server optimizations

- **Quiz data** is loaded in the **Server Component** for `/quiz/[id]` (no client fetch for initial data)
- **Route Handlers** for `/api/health`, `/api/quiz/generate`, `/api/quiz/[id]/submit`
- **Client components** only where needed: generate form, take-quiz form, and results

## Setup

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Environment**

   Create a `.env` file with:

   - `DATABASE_URL` — Postgres connection string (use host `db` when the app runs in Docker, `localhost` when it runs on your machine)
   - `OPENAI_API_KEY` — OpenAI API key

3. **Database**

   ```bash
   bun run db:push
   ```

4. **Run**

   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Docker

With PostgreSQL via Docker Compose:

```bash
# Start DB only (for local app)
docker compose up -d db

# Or run app + DB
docker compose up
```

Ensure `DATABASE_URL` in `.env` matches the DB service (e.g. `postgresql://postgres:postgres@db:5432/quiz` when running in Docker).

## Scripts

- `bun run dev` — dev server
- `bun run build` — production build
- `bun run start` — production server
- `bun run db:push` — push schema to DB
- `bun run db:studio` — Drizzle Studio

## API

- `GET /api/health` — `{ status: "ok" }`
- `GET /api/quizzes` — `{ quizzes: { id, topic, description?, createdAt }[] }`
- `POST /api/quiz/generate` — `{ topic, description? }` → `{ quiz }`
- `POST /api/quiz/[id]/submit` — `{ answers: Record<questionId, optionId[]> }` → `{ result: { quizId, attemptId, score, totalQuestions, maxScore, questionResults, questions } }`
- `GET /api/quiz/[id]/attempts` — `{ attempts: { id, completedAt, correctCount, totalQuestions }[] }`
- `GET /api/quiz/[id]/attempts/[attemptId]` — `{ result }` (same shape as submit)
