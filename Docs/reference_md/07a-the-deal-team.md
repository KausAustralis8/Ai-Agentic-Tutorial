# The Deal Team — the five agents, in detail

> Briefing document for Claude. This is the companion to `07-engines.md`: engines explains *how* an agent thinks (the shared AI recipe); this document is the **reference for the five agents themselves** — who they are, what each one does, the engine behind it, and exactly what it returns. Build the roster to match this. The catalog lives in code at `lib/agentTypes.ts` (capabilities + agent types + team template) and the seeded starter identities at `lib/workspace/seed.ts`.

## The roster at a glance

Every new creator is seeded a premade **Deal Team** of five single-task agents — each does exactly **one** job (one capability). They cover a brand deal end to end: find → pitch → propose → follow up → book.

| # | Agent (user label) | Type id | Capability | jobKind | Default identity (seeded) | Accent |
|---|---|---|---|---|---|---|
| 1 | **Research** | `discovery` | `scrape` | `scrape` | Remy Rivera (RR) | `#0EA5E9` |
| 2 | **Initial Outreach** | `outreach` | `outreach` | `outreach` | Otis Vance (OV) | `#5122C1` |
| 3 | **Proposal** | `proposal` | `proposal` | `proposal` | Priya Shah (PS) | `#7C3AED` |
| 4 | **Follow-up** | `followup` | `follow-up` | `follow-up` | Faye Cole (FC) | `#8B5CF6` |
| 5 | **Scheduler** | `scheduler` | `book-meeting` | `book-meeting` | Sam Okafor (SO) | `#F43F7E` |

The five default names/initials/colors are **friendly placeholders** — the creator renames and re-styles each one during onboarding (`updateAgentIdentity`). The presets themselves are static developer-curated data in code; only the creator's own *additions* and *overrides* (renamed, paused, removed, re-goaled) live in the database (`agents`, `agentConfig`, `agentStates`). When you list agents, merge presets + saved rows + overrides.

Each seeded agent carries the fields the dashboard needs later: `name`, `initials`, `role` (the type label), `color`, `status` (starts `"working"`), `task` (a human "doing…" line), `goal`, `capabilities`, and `char` (an illustrated-avatar sprite index — unused by the default initials avatar; keep it for parity).

---

## 1. Research — `discovery` / `scrape`

- **What it does:** discovers real brands that sponsor creators in the creator's niche, and drops them into the **Pending** review queue for the creator to accept.
- **Where it runs:** the discovery route `app/api/scrape/route.ts` (Node runtime, 60-second cap) — a **Firecrawl** web search + a Gemini extraction step that turns results into brand candidates. It is **not** part of the `jobs/run` batch runner.
- **Output:** new `leads` rows with `source: "scrape"` and `review: "pending"`, plus an activity event. Nothing enters the working pipeline until the creator accepts it (the review gate).
- **Real vs fallback:** with a Firecrawl key it finds live brands; **without** the key it returns a small canned set of example brands so the flow still completes (graceful degradation — a real fallback, not a separate feature).
- **Also its on-demand sidekick:** the Research agent is the natural home for the **Brand brief** capability (`research`) — see below.

## 2. Initial Outreach — `outreach` / `outreach`

- **What it does:** the flagship. Scores a brand's fit (0–100), picks a pipeline stage, and drafts a **personalized first-touch pitch in the creator's own first-person voice** — a polished 90–140-word partnership **email** if the brand has an email, or a short 2–4-sentence **DM** if it only has a social profile.
- **Where it runs:** the jobs runner (`app/api/jobs/run/route.ts`, kind `outreach`), engine `lib/ai/outreach.ts` → `draftOutreach(agent, lead, creatorContext, creatorName)`. Saves to `outreachDrafts`; advances the lead to `pitched`; logs activity. Each pitch is a **draft the creator opens in their own mail app** (a `mailto:` link) or copies — there is no email-sending integration.
- **Returns (JSON schema):** `{ score: integer, stage: "new"|"pitched"|"negotiating"|"replied"|"booked", subject: string, body: string, rationale: string }`.
- **Real vs fallback:** with the Gemini key it writes a genuine, brand-specific pitch; **without** it returns a clean templated email/DM (score ~55–60, `stage: "pitched"`, `rationale: "Fallback pitch (Gemini not configured)."`).
- **Voice rule:** the agent (e.g. "Otis") is an internal drafter — its identity **never** appears in the message, and the message never reveals it was written by an AI or "on behalf of" anyone. See `PITCH_GUARDRAILS` in `lib/ai/guardrails.ts`.

## 3. Proposal — `proposal` / `proposal`

- **What it does:** turns brand interest into a **scoped, priced proposal**, grounded in the creator's Media Kit (niche, audience, and especially the **rate floor**) plus the brand's research brief. There is **no separate rate-card catalog** — the scope and pricing come from who the creator is.
- **Where it runs:** the jobs runner (kind `proposal`), engine `lib/ai/proposal.ts` → `draftProposal(agent, lead, creatorContext)`. Saves to `proposals` (the deliverable package names go in the `products` array, surfaced as `packages`).
- **Returns (JSON schema):** `{ title: string, body: string, packages: string[] }` — 2–4 deliverable packages that fit the creator's *own* platforms, priced against the rate floor; a 150–250-word body; a soft next step.
- **Real vs fallback:** with the Gemini key it writes a tailored proposal; without it returns a short templated proposal (no hard numbers, `packages: []`).

## 4. Follow-up — `followup` / `follow-up`

- **What it does:** re-engages a brand that went quiet — a short, polite nudge written in the creator's voice, grounded in the **prior pitch** and the brand's brief.
- **Build note (make it real, not a dummy):** the capability is declared but there is currently **no follow-up engine and the jobs runner does not handle a `follow-up` kind**, so left as-is this agent only ever produces placeholder text. To make it actually work, build it on the same pattern as the others:
  1. Add `lib/ai/followup.ts` → `draftFollowup(agent, lead, creatorContext, creatorName)` returning `{ subject: string, body: string, rationale: string }`, referencing the last `outreachDrafts` row for that lead so the nudge builds on what was already said. Include `PITCH_GUARDRAILS` and the first-person creator voice.
  2. Add a fallback (a brief, warm "circling back" note) for when the Gemini key is absent.
  3. Add `follow-up` to the runner's handled kinds (alongside `outreach`/`research`/`proposal`) and to the `inArray(jobs.kind, […])` claim filter, saving the result as a new draft and logging activity.
- **Funnel position:** on-command (the creator triggers it), after a pitch has gone out and gone cold.

## 5. Scheduler — `scheduler` / `book-meeting`

- **What it does:** books a brand **call/shoot** onto the calendar from a natural-language time ("next Tuesday at 2pm"), or from a brand directly.
- **Where it runs:** the meetings flow (`lib/meetings/*`, surfaced on the Calendar at Milestone 14), using the natural-language time parser `lib/ai/meetingTime.ts`. It writes to `meetings` (the calendar's only source). It is **not** part of the `jobs/run` batch runner.
- **Real vs fallback:** with the Gemini key it parses free-form phrasing; without it, accept a simple typed date/time so booking still works.

---

## The sixth capability — Brand brief (`research`), on-demand

`research` (user label **"Brand brief"**, jobKind `research`) is **not** one of the five agents — it's a kept on-demand capability, usually run by the Research agent. It vets one brand and writes a short brief the pitch engine then uses to personalize.

- **Where it runs:** the jobs runner (kind `research`), engine `lib/ai/research.ts` → `draftResearch(agent, lead, creatorContext)`. Saves the brief onto the `leads.research` JSON.
- **Returns (JSON schema):** `{ summary: string, priorities: string[], hooks: string[], angle: string }`.
- **Real vs fallback:** without the Gemini key it returns a labeled placeholder brief ("Research brief unavailable (Gemini not configured).").

---

## The funnel (the order the team works a brand)

```
scrape → research → outreach → proposal → follow-up → book-meeting
(discover) (vet)    (pitch)    (price)    (nudge)     (schedule)
Research   Research  Outreach   Proposal   Follow-up   Scheduler
```

- **Discovery (`scrape`)** is the one stage a **pod** runs autonomously to build the book; everything downstream (pitch, proposal, follow-up, booking) is **on-command**, so a pod discovers brands and then hands back to the creator for the go-ahead (with an `@mention` in the team activity).
- A **solo agent** runs just its one capability.
- In **team chat**, the creator `@mentions` an agent in plain English; the app detects intent, routes to a capable teammate if the mentioned one can't do it, runs the **real** job (reusing these engines and the queue), and the acting agent reports back in the thread.

## Real output vs dummy — the one thing that makes the team "work"

Every agent above has a **deterministic fallback** so the app is fully demoable with no keys — but the fallback is a *safety net*, not the experience. The team produces real, on-voice work only when the **Google Gemini key (`GEMINI_API_KEY`)** is set. In this course that key is switched on at the **agent-building step** (Milestone 6), so from the moment the team exists it does real work; the fallback quietly covers the app if the key is ever missing. (Discovery additionally needs the Firecrawl key, added at the discovery step; scheduling free-form times needs Gemini too.)

## Where this lives in code

- `lib/agentTypes.ts` — `CAPABILITIES`, `AGENT_TYPES` (the five), `TEAM_TEMPLATES` (the one "Deal Team").
- `lib/workspace/seed.ts` — `DEFAULT_AGENTS` (seeded identities) + `seedDefaultWorkspace` (idempotent, seeded once at signup, never throws).
- `lib/ai/outreach.ts`, `research.ts`, `proposal.ts`, `meetingTime.ts` — the engines; `lib/ai/gemini.ts` — the shared call helpers; `lib/ai/guardrails.ts` — the shared guardrail strings.
- `app/api/jobs/run/route.ts` — the batch runner (`outreach`/`research`/`proposal`, plus `follow-up` once you build it); `app/api/scrape/route.ts` — discovery.
