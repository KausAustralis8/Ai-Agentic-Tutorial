# Product Spec — Creator Manager

> This is a briefing document for Claude. It describes **what** we're building in plain language. Keep every feature grounded in this spec. When the build plan asks for something, build it the way it's described here.

## One-sentence pitch

Creator Manager is the command center for a creator's **AI talent-management team**: the creator spins up autonomous AI **agents** that discover brands, research and vet them, draft personalized pitches, write priced proposals, follow up, and book the brand call — working solo, in **pods** that hand work to each other, or by **chatting** with the creator in plain English.

## Who it's for

Content creators (KOLs — "key opinion leaders") who want brand deals but don't have time (or a human manager) to chase them. The app is the manager.

## The core idea: grounding in the Media Kit

Everything an agent does is grounded in the creator's **Media Kit** — their niche, bio, platforms + follower/engagement stats, audience demographics, tone, past deals, and rate floor. The Media Kit is threaded into every AI engine as a piece of context called `creatorContext`, so discovery targets the right brands and pitches sound like the actual creator. Filling in the Media Kit is the **first-run onboarding gate** — a new user must complete it before using the app.

## The vocabulary (use these exact terms)

- **Media Kit** — the creator's profile (one per user). The grounding input for all AI.
- **Agent** — an AI worker with a **role** and one or more **capabilities**. Each agent does a focused job.
- **Capability** — a specific skill an agent can perform, backed by an "engine." The capabilities are: `scrape` (shown to users as **Research** / brand discovery), `outreach` (draft a first pitch), `proposal` (draft a scoped, priced deal), `follow-up` (re-engage quiet brands), `book-meeting` (schedule calls), and `research` (write a per-brand vetting brief).
- **Deal Team** — the premade team of five single-task agents every creator gets: Research, Initial Outreach, Proposal, Follow-up, Scheduler.
- **Pod / Team** — a group of agents with a **shared deal book**. A pod can autonomously run **discovery** to build the book, then hands work back to the creator for the on-command stages (pitching, proposals, follow-up, booking).
- **Deal / Lead** — a brand the creator is working. (The database table is named `leads` for historical reasons; to the creator these are "brands" or "deals.") A deal moves through pipeline **stages**: `new → pitched → negotiating → replied → booked`.
- **Review gate** — brands discovered from the web don't go straight into the pipeline. They land in a **Pending** queue and must be **accepted** by the creator before agents work them. A lead has a `review` value of `pending` or `accepted`.
- **Engine** — the AI logic behind a capability (e.g. the "outreach engine" drafts a pitch). Engines are pure functions: input in, structured result out, no database access of their own.
- **Job** — a unit of queued work. Running a capability creates a job; a background runner picks it up and executes the engine.
- **Pitch draft** — an agent-written outbound message (a formal email if the brand has an email address, or a short DM if it only has a social profile).

## The main features (build in the order set by the build-plan document)

1. **Accounts** — sign up and log in with email or **Google**, handled by a hosted sign-in service (**Clerk**); no passwords are stored in the app. Each user's data is fully separate from every other user's.
2. **Media Kit + onboarding** — the profile wizard that gates first use. Every field feeds the AI. A creator can **connect their TikTok** to auto-fill their stats/photo (built last, since it needs the live site).
3. **Agents & pods** — create agents from presets; group them into teams with a shared deal book.
4. **Deals with a review gate** — add a brand by hand, import a CSV, or discover brands from the web. Discovered brands wait in Pending until accepted.
5. **The engines** — `scrape` (discovery), `research`, `outreach` (pitch), `proposal`, `follow-up`, `book-meeting`. Each is one structured AI call grounded in the Media Kit.
6. **Pods (work-the-book)** — a pod autonomously runs discovery to build the book, then hands back to the creator for the on-command stages, narrating each hand-off.
7. **Team group chat** — the creator `@mentions` an agent in plain language; the app detects intent, routes to a capable teammate if needed, runs the real job, and the agent reports back in the thread.
8. **Brand calls & calendar** — book a call from a deal or via chat (natural-language time parsing). The calendar shows only real booked calls.
9. **The signature "agents at work" dashboard, analytics & notifications** — the orbit dashboard (your team circling you, glowing and floating) is the app's **first screen**: it's the landing hero from day one (rendered from the preset team as a showcase) and becomes the personalized logged-in home. It's later wired to real data — real KPIs, a per-day chart, an output ranking, and live "which brand is being worked right now" indicators.

(Pitches are **drafts the creator opens in their own mail app** to send — there is no built-in email-sending integration.)

## The golden behavior: graceful degradation

The app must **always boot and be usable**, even with no database, no Gemini key, no Firecrawl key, and no TikTok keys. Missing a service degrades that one feature (e.g. engines return sensible canned output without a Gemini key; discovery hides without Firecrawl; the TikTok connect card hides without its keys); it never crashes the app. This is a hard requirement — see `conventions.md`.

## The tone of the product

Warm, professional, creator-friendly. The pitches agents write are in the **creator's own first-person voice** and must never reveal they were written by an AI or "on behalf of" anyone. The agent (e.g. "Jade") is an internal drafter whose identity never appears in the outbound message.

The **visual style is the creator's choice** — a warm, dark, polished look by default, but the creator can ask for another aesthetic (light and minimal, glassy and modern, bold and colorful) and it's applied consistently across the whole app and the signature dashboard. Keep it cohesive and professional whatever the choice, and achieve it within the fixed stack (no new UI/component libraries).

## What's explicitly out of scope (for this build)

- Two-way email (capturing brand *replies*) — send-only for now.
- Real browser-automation scraping — discovery uses a web-search API (Firecrawl), not a robot browsing.
- Payments/billing.
- (Note: TikTok auto-fill **is** built — it's the final milestone — but it only works on the live site, since TikTok's login requires an `https://` address.)
