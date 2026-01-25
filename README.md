# Quiz Gen 2 — Next.js

AI-powered quiz builder built with **Next.js 15** (App Router, React Server Components), **Drizzle**, **PostgreSQL**, **Vercel AI SDK**, and **shadcn/ui**.

## Tech stack

- **Next.js 15** — App Router, RSC, Route Handlers
- **React 19**
- **Drizzle ORM** + **PostgreSQL**
- **Vercel AI SDK** + **@ai-sdk/openai** + **Zod** — structured quiz generation
- **Tailwind CSS** — styling
- **shadcn-style UI** — Radix, CVA, Lucide

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

   Or generate and run migrations:

   ```bash
   bun run db:generate
   bun run db:migrate
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
- `bun run db:generate` — generate migrations
- `bun run db:migrate` — run migrations
- `bun run db:studio` — Drizzle Studio

## API

- `GET /api/health` — health check
- `POST /api/quiz/generate` — `{ topic, description? }` → `{ quiz }`
- `POST /api/quiz/[id]/submit` — `{ answers: Record<questionId, optionId[]> }` → `{ result }`
