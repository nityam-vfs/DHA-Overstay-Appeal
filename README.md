# DHA Overstay Appeal Management System — Prototype

A high-fidelity, clickable prototype of a South African Department of Home Affairs
Overstay Appeal Management System. Built with Next.js 15 (App Router), TypeScript,
Tailwind CSS, hand-rolled ShadCN-style UI components, Zustand, and optional
Supabase (Postgres + Storage) integration.

This is a **prototype**, not a production system: there is no real authentication —
role switching and applicant login are simulated for demo purposes.

## Getting Started (zero configuration)

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app works fully out of the box using seeded demo
data stored in your browser's localStorage — no Supabase account is required.

- **Landing page** lets you choose the **Online** applicant journey or the
  **Back Office** portal.
- **Online / Applicant**: log in with the demo applicant, or start a new appeal
  via the 6-step wizard (eligibility → appeal details → documents → declaration →
  payment → confirmation).
- **Back Office**: pick any role card (Assigner, Adjudicator, Supervisor, Deputy
  Director, Director, Chief Director, V-List, Admin) — no password needed — to view that
  role's queue, review applications, and progress them through the workflow.

## Optional: connecting real Supabase

By default the app runs entirely on local seeded/mock data. If you want real
persistence (Postgres) and real file storage instead of the local demo store,
you can wire up a Supabase project. The integration is **additive and
graceful**: with no env vars set, nothing changes; once configured, the app
reads/writes through to Supabase automatically.

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then open the SQL
editor and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
This creates all 9 demo tables (applications, documents, comments, status
history, assignments, document requests, notifications, decision letters,
users), enables Row Level Security with permissive prototype policies, and
creates a public `appeal-documents` storage bucket.

> ⚠️ The RLS policies in `schema.sql` are intentionally permissive
> (`USING (true)`) so the prototype works with only the anon key. This is
> **not production-safe** — there is no real Supabase Auth wired up. Replace
> the policies before using this schema for anything beyond a demo.

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your project's values
(found in Supabase → Project Settings → API):

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-only, used by the seed script
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=appeal-documents
```

`SUPABASE_SERVICE_ROLE_KEY` is only used by `scripts/seed-supabase.ts` (a
Node script, never shipped to the browser) — never prefix it with
`NEXT_PUBLIC_`.

### 3. Seed the database (optional but recommended)

```bash
npm run seed:supabase
```

This clears and repopulates all tables with the same deterministic 50-application
demo dataset used for local mode, so the back-office queues and analytics
dashboard have realistic volume from the start.

### 4. Run the app

```bash
npm run dev
```

With env vars present, on load the app fetches applications/notifications/
letters from Supabase instead of generating local seed data. From then on:

- Creating an application, assigning it, commenting, advancing/rejecting,
  requesting documents, fulfilling document requests, and marking
  notifications read are all written through to Supabase in the background.
- Document uploads (in the wizard's Documents step, and the "Re-upload
  Document" flow) upload the real PDF to the `appeal-documents` Storage
  bucket, and reviewers' document downloads open the real Supabase Storage
  URL when available.
- All Supabase calls are **best-effort and non-blocking** — if a request
  fails (e.g. misconfigured credentials, offline), the UI keeps working off
  local state and the error is only logged with `console.warn`, never thrown.

If you don't configure Supabase at all, the app behaves exactly like the
zero-configuration mode described above.

## Project Structure

- `src/app/` — Next.js App Router pages (landing, `online/*` applicant
  journey, `backoffice/*` back-office portal).
- `src/components/` — shared UI building blocks (ShadCN-style primitives in
  `ui/`, plus header, status badge/timeline, wizard stepper, back-office shell).
- `src/lib/store.ts` — Zustand store (persisted to localStorage) holding all
  application/notification/letter state and mutating actions.
- `src/lib/wizard-store.ts` — Zustand store for in-progress applicant wizard
  form state.
- `src/lib/seed.ts` — deterministic mock data generator (50 applications).
- `src/lib/supabase/` — `client.ts` (browser client + config check),
  `repo.ts` (data-access layer: row↔domain mappers, CRUD, storage helpers).
- `supabase/schema.sql` — full Postgres DDL + RLS + storage bucket.
- `scripts/seed-supabase.ts` — seeds a real Supabase project with the same
  demo dataset used locally.

## Scripts

| Command                | Description                                    |
| ----------------------- | ----------------------------------------------- |
| `npm run dev`           | Start the dev server                            |
| `npm run build`         | Production build                                |
| `npm run start`         | Run the production build                        |
| `npm run lint`          | Lint (build itself skips linting)               |
| `npm run seed:supabase` | Seed a configured Supabase project's tables      |
