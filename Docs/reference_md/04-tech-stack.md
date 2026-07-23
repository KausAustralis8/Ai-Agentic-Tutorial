# Tech Stack — the fixed ingredients

> Briefing document for Claude. This stack is **fixed**. Do not substitute libraries, frameworks, or versions. Building the exact same stack means the learner can compare against the reference product and get reliable help. Pin these versions.
>
> **The *visual look* is the creator's choice** (warm-dark by default, or another aesthetic they name — light/minimal, glassy, bold, etc.), applied across the whole app and the dashboard. But achieve any look **within this stack**, using the same hand-rolled/inline-style approach the app already uses — **do not add UI or component libraries** (shadcn/ui, Tailwind, Material, Chakra, Bootstrap, …) to get a style. Design freedom is about aesthetics, not new dependencies.

## The stack

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Framework | **Next.js** (App Router) | `14.2.15` | One app = web UI + server logic + API routes, all together. |
| UI library | **React** | `18.3.1` | |
| Language | **TypeScript** | `5.5.3` | |
| Database | **Neon Postgres** (`@neondatabase/serverless`) | `^1.1.0` | Serverless Postgres. Use the **pooled** connection string. |
| DB toolkit | **Drizzle ORM** | `^0.45.2` | Schema in `lib/db/schema.ts`. |
| DB migrations | **Drizzle Kit** | `^0.31.10` | ⚠️ Migrations are **hand-authored SQL** — see conventions. |
| Auth | **Clerk** (`@clerk/nextjs`) | `^6` | Hosted auth — email + **Google** sign-in/sign-up. `<ClerkProvider>` + `clerkMiddleware`; server-side user via `auth()`. No in-app passwords, JWT, or bcrypt. |
| AI | **Google Gemini** via raw `fetch` | — | `gemini-2.5-flash` for text/JSON. **No SDK.** (No embeddings/vectors — that feature was removed.) |
| Brand discovery | **Firecrawl** (`/v2/search`) + Gemini extraction | — | Runs inside a Node API route. |
| Social | **TikTok Login Kit** via OAuth 2.0 | — | Auto-fills the Media Kit; refresh token **encrypted at rest**. |
| Landing animation | **GSAP** + **anime.js** | `^3.15.0` / `^4.5.0` | Only for the marketing/landing hero. |
| Package manager | **pnpm** | `11.3.0` | |
| Hosting | **Vercel** | — | Deploy the single Next.js app. |

## Key architectural facts (respect these)

1. **One app, one deploy.** The web UI, the server-side actions, and the job/scrape runners are all part of the same Next.js project. There is no separate backend.

2. **Server Actions + a jobs queue.** Most writes happen through Next.js **Server Actions** (functions marked `"use server"`). Long AI work is **queued as a job** and run by an API route (`app/api/jobs/run/route.ts`), which the client re-invokes as it polls. This keeps any single request short (Vercel's Hobby plan caps a serverless function at **60 seconds** — set `export const maxDuration = 60` on AI routes and process work in small batches).

3. **AI engines are pure.** Each engine (e.g. `lib/ai/outreach.ts`) is a plain function: it takes the agent, the lead/brand, and the `creatorContext`, makes one structured Gemini call, and returns a typed result. It never touches the database. Separate "store" files apply the result to the DB.

4. **Gemini via one `fetch`, no SDK.** All AI calls go through helpers in `lib/ai/gemini.ts`:
   - `geminiGenerate(system, turns, opts)` → free text.
   - `geminiJSON(system, turns, schema, opts)` → parsed JSON matching a response schema (this is how engines get reliable structured output).
   Each call has a timeout and `thinkingConfig: { thinkingBudget: 0 }` so replies come back fast and complete.

5. **Everything is per-user.** Almost every table has a `userId` column — the **Clerk user id** (a string like `user_...`) — and every query filters by the signed-in user (from Clerk's `auth()`). Users never see each other's data.

6. **Graceful degradation is built into these helpers.** `isGeminiConfigured()` / `isDbConfigured()` gate the real path; when a service is missing, the code returns a sensible fallback instead of throwing.

## Folder layout (target shape)

```
app/                         Next.js pages & API routes (the App Router)
  page.tsx, layout.tsx       home + root layout
  api/jobs/run/route.ts      the background job runner
  api/scrape/route.ts        brand discovery (Firecrawl + Gemini)
  api/auth/tiktok/...        TikTok OAuth start + callback
  sign-in/, sign-up/         Clerk sign-in & sign-up pages (catch-all routes)
  (feature pages)            calendar, analytics, leads, profile, settings, ...
components/                  React UI pieces (AppFrame, Onboarding, MediaKit, ...)
lib/
  db/                        schema.ts, index.ts, migrations/*.sql
  ai/                        gemini.ts + one file per engine (outreach, research, proposal, ...)
  auth/                      currentUser.ts — thin wrapper over Clerk's auth()/currentUser (no JWT/bcrypt; Clerk owns login)
  profile/  leads/  proposals/  meetings/  pod/  chat/  teams/  email/  social/  scrape/
  agentTypes.ts              the capability + agent-type + team catalog
middleware.ts                clerkMiddleware() — route protection (public landing + Clerk routes open; the rest require sign-in)
scripts/                     migrate.mjs (applies SQL migrations), seed-demo.mjs
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon **pooled** connection string. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key (starts `pk_`). |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key (starts `sk_`). Server-only. |
| `GEMINI_API_KEY` | for AI | Enables all AI. Without it, engines return canned output. |
| `GEMINI_MODEL` | optional | Override default `gemini-2.5-flash`. |
| `GEMINI_FAST_MODEL` | optional | Lighter tier for routing/extraction only. |
| `FIRECRAWL_API_KEY` | optional | Enables web brand discovery. |
| `AUTH_SECRET` | for TikTok | Long random string that **encrypts stored TikTok tokens** at rest (not for login — Clerk owns login). Only needed once TikTok is connected. |
| `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` / `TIKTOK_REDIRECT_URI` | optional | TikTok Media Kit auto-fill (connected on the live site — needs https). |

## Commands

| Command | What it does |
|---|---|
| `pnpm install` | Install all building blocks (run after package.json changes). |
| `pnpm dev` | Start the app locally at `http://localhost:3000`. |
| `pnpm db:migrate` | Apply the hand-written SQL migrations to Neon. |
| `pnpm build` / `pnpm start` | Production build / serve. |
| `pnpm lint` | Check the code for problems. |
