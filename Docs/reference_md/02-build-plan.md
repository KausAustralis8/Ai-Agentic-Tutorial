# The Build Plan — the 17 milestones, in order

> This is your build sequence, Claude. Work through it **top to bottom, one milestone at a time.** Do not skip ahead. Each milestone lists: the **plain outcome** (what the creator can do afterward — say this in your own words), what **you build** (your technical checklist), and **done when** (the real-world check that must pass before moving on).
>
> The creator drives the build by describing what they want next in plain, natural language (see `10-milestone-prompts.md`) — they won't mention milestones, numbers, or these documents, and neither should you. Silently match each request to the right milestone below and build exactly that.
>
> Ground everything in the other documents: what-we-are-building (the product), tech-stack (fixed tools), data-model (the data), conventions (the house rules — especially graceful degradation and hand-written SQL migrations), engines (the AI pattern) and the-deal-team (`07a` — the five agents' roster reference), and **dashboard-design (the exact "agents at work" dashboard to copy — built at Milestone 1, wired to real data at Milestone 15).** **Never make the creator choose any of the technical details below — they're already decided.** Every milestone builds a feature that exists in the real product; there are no optional/extra features.

## Before Milestone 1: setup
Make sure the creator has done the setup in the **setup guide** document (tools installed, you can write files into their project folder, and their secret keys are saved). If you can't write files yet, walk them through turning that on first. **The four service keys — database (Neon), auth (Clerk), AI (Gemini), and brand discovery (Firecrawl) — are gathered together up front** (the build guide's "Step 0", before Getting started), so the app runs on real data, login, and AI from the first build step. It still degrades gracefully if a Gemini/Firecrawl/TikTok key is missing (that feature disables, never the whole app); the Clerk keys are needed for login. Hosting keys come at Milestone 16; TikTok — and `AUTH_SECRET`, the local secret that encrypts the stored TikTok token — at Milestone 17.

Save the creator's progress after each milestone by giving them the two "save" commands (see conventions / setup guide). A milestone ends with: it works → save → next.

---

# Phase A — Foundation (Milestones 1–4)

## Milestone 1 — Landing page + the signature dashboard
- **Plain outcome:** "Your app opens in your web browser for the first time — a proper, finished-looking landing page for Creator Manager, led by the signature 'AI team at work' dashboard (your agents orbiting the center, glowing and floating) and followed by sections that explain what the app does, with Log in and Sign up buttons."
- **You build:** the base project per tech-stack (correct framework/versions, TypeScript, the `@/` path alias, package scripts including `db:migrate`), a root layout, a global stylesheet, and a `.gitignore` excluding dependencies, build output, and `.env*.local`. Then a **rich, full marketing landing page** for Creator Manager — not just a hero + buttons — with a top nav (logo + Log in / Sign up), a **hero led by the orbit dashboard**, a headline value proposition + subhead, a **features/benefits** section (find brands, pitch in the creator's voice, proposals, follow-ups, booking, the live dashboard), a **how-it-works** section (a few simple steps), a **"who it's for"** section, a closing **CTA**, and a footer. Ground all copy in `01-what-we-are-building.md` — real features only, no invented testimonials/logos (use clearly-generic placeholders if a slot calls for a face or quote).
- **The orbit dashboard (the hero):** reproduce it faithfully from `09-dashboard-design.md` (keyframes, fonts, primitives, component). **It is the app's first UI and is built now, not last.** With no database/auth/AI yet, render it from the **static preset "Deal Team"** (`lib/agentTypes.ts` — see `07a-the-deal-team.md`) with representative demo stats/activity, so it looks alive on first open (a self-contained showcase — graceful degradation). The same dashboard becomes the personalized logged-in home and is wired to real data at Milestone 15.
- **The look is the creator's choice (design system):** ask them — in plain language, offering the warm-dark default — what visual style they want (e.g. warm/dark, light/minimal, glassy/modern, bold/colorful). Apply that chosen look across the **whole app and the dashboard** — palette, typography, surfaces, motion — re-skinning the orbit to match while **keeping its layout and behavior** (see the design-systems note in `09-dashboard-design.md`). **Achieve the aesthetic within the fixed stack — do NOT add UI/component libraries** (hand-rolled styles as everywhere else). Default if they don't say: warm dark.
- **Done when:** they run the install + start commands you give them, open the local address, and see a **finished-looking landing page** — the orbit hero (team floating/glowing) followed by real sections explaining the app, in the chosen style — with Log in / Sign up, and no error.

## Milestone 2 — Database
- **Plain outcome:** "Your app can now remember things — accounts, brands, everything. Nothing new to see yet; this is the storage behind the scenes."
- **You build:** the database connection + toolkit per tech-stack, with `getDb()` and `isDbConfigured()` so the app runs fine with no database yet. The hand-authored SQL migration system (`scripts/migrate.mjs` + `lib/db/migrations/*.sql`, run by `pnpm db:migrate`) — **never** use auto-generation. The first migration creates the `users` table — **`id` is a text primary key holding the Clerk user id (not a UUID), and there is no `passwordHash`** (Clerk owns auth); mirror it in the schema file.
- **Done when:** the migrate command runs cleanly and the app still loads.

## Milestone 3 — Accounts & login (Clerk + Google)
- **Plain outcome:** "You can sign up and log in — with email or a 'Continue with Google' button — and log out. Your app is now private to signed-in users, and forgotten-password/reset is handled for you."
- **You build:** auth via **Clerk** per conventions/tech-stack (no in-app passwords, bcrypt, or JWT). Install `@clerk/nextjs`; wrap the root layout in `<ClerkProvider>`; add `clerkMiddleware()` in `middleware.ts` protecting every route **except** the public landing page and Clerk's sign-in/sign-up routes; add **sign-in and sign-up pages** using Clerk's components (catch-all routes) with **email and Google** enabled; put a `<UserButton>` (avatar + sign-out) in the app frame. Read the signed-in user server-side via `auth()` / `currentUser()` (`userId` = Clerk id) behind a thin `currentUser()` helper. On the first authenticated request, **upsert the local `users` row** keyed by the Clerk `userId` (workspaceName default, notifications). **Google** is switched on in the Clerk dashboard's Social Connections (in development Clerk supplies shared Google credentials so it works immediately; production uses the creator's own — Clerk guides this at go-live). Password reset and email verification are Clerk's — build **no** reset table or flow.
- **Done when:** they sign up (email or Google), land logged in, log out, and log back in; a protected page bounces them to Clerk's sign-in when logged out, while the public landing page stays reachable.

## Milestone 4 — Navigation & settings
- **Plain outcome:** "Your app now has a proper menu, a search box, and a settings page — it finally feels like a real app."
- **You build:** a shared app frame with navigation to Dashboard, Deals, Agents, Chat, Calendar, Analytics, Profile, Settings; the user's name + a logout button; logged-in pages wrapped in the frame while the welcome page stays frame-free. A **global search** control in the frame. A **Settings page** with notification preferences (the on/off flags stored on the user). Placeholder pages ("coming soon") for the feature sections, all login-protected. Clean, responsive, mobile-friendly. (The Dashboard already exists — its "agents at work" orbit was built at Milestone 1 from `09-dashboard-design.md`. Here you just link the menu to it and make it the personalized logged-in home; it gets wired to real data at Milestone 15. The *other* feature sections are simple "coming soon" placeholders for now.)
- **Done when:** logged in, they can click to every section, open search, and toggle notification settings; logout works; logged out redirects to login.

---

# Phase B — Identity & Team (Milestones 5–6)

## Milestone 5 — Media Kit
- **Plain outcome:** "You fill in who you are — niche, audience, platforms, rates, and voice. This is what makes every pitch sound like *you*, and it's what every AI helper grounds its work on." New users are guided through a friendly setup before using the rest of the app.
- **You build:** the `creatorProfile` table (new migration + schema update), a store with a save action and two helpers used later by the AI (`profileSummary` → the "creatorContext" text block, and `creatorDisplayName`). A Profile page to view/edit every field (add/remove platform rows, simple audience fields, and the rate floor). An onboarding wizard that gates the app until the essentials are filled (niche + one platform + rate floor). Graceful with no database.
- **Ask the creator (plain):** their niche and platform stats — or let them type it into the wizard. (Connecting TikTok to auto-fill these stats is added last, at Milestone 17; for now the Media Kit is filled in manually.)
- **Done when:** a new user is guided through onboarding, finishes, lands in the app, and can later edit their Media Kit and see it persist.

## Milestone 6 — AI agents & teams
- **Plain outcome:** "You get a ready-made team of five AI helpers — one finds brands, one writes first pitches, one builds proposals, one follows up, one books calls — with their AI brain switched on so their work is the real thing, and you can create your own and group them into teams."
- **You build:** the static catalog (six capabilities with user-facing labels — scrape/"Research", outreach, proposal, follow-up, book-meeting, and research/"Brand brief"; the five preset "Deal Team" agents with one capability each; one team template) per the product + engines docs and **`07a-the-deal-team.md`** (the roster reference — names, identities, capabilities, engines). The `agents` and `teams` tables + per-user override tables (config, states, members) — migration + schema. Actions to create/edit/pause/remove agents and create/edit teams, merging presets + saved rows + overrides when listing. An Agents page (presets + custom, with "new agent" and "new team" flows) and an agent detail page. Ensure each agent carries `initials`, `color`, `status`, `capabilities`. Now that real agents exist, **wire the Milestone 1 orbit dashboard to the creator's real agents/teams** (it keeps demo stats/activity until Milestone 15).
- **The AI is already on (from Step 0):** the **Gemini key** was set up front (build guide Step 0), so from the moment the team exists its output is real and on-voice, not the placeholder fallback — just confirm `GEMINI_API_KEY` is in place. **Keep the deterministic fallback** as the offline safety net (graceful degradation is still mandatory) — but the creator's real experience is genuine AI, not a dummy. (The AI *engine code* is first built at Milestone 8; because the key's already set, it works for real on the first run.)
- **Done when:** the five preset agents show, the AI is switched on, and they can create a custom agent and a team that both persist.

---

# Phase C — Deals & the Engines (Milestones 7–12)

## Milestone 7 — Deals pipeline
- **Plain outcome:** "A pipeline that tracks brands from 'new' to 'booked call.' Add brands by hand or import a CSV; brands your AI discovers wait in a 'Pending' area for your approval."
- **You build:** the `leads` table (brands/deals) per data-model, with pipeline stages and the `review` (pending/accepted) gate — migration + schema. A store + actions: add manually, import CSV (`importLeadsCsv` — parse name/company/email/platform with header aliases), list (per user and per agent), change stage, accept/reject pending. Manual adds are accepted. Create the `activity` event-log table + store now too, and record a "brand added" event. A Deals page: pipeline grouped by stage, an add form, CSV import, and a "Pending review" section with Accept/Reject.
- **Done when:** they add a brand, assign it to an agent, move it between stages (persists), import a CSV, and the Pending section exists (empty until discovery fills it).

## Milestone 8 — Pitch writing (the AI engine goes in) ⭐
- **Plain outcome:** "The big moment — click a button on a brand and an agent writes a personalized pitch in *your* voice (an email if the brand has one, a DM if not). Each pitch is a draft you can open in your own mail app to send."
- **You build:** the shared AI helpers per tech-stack (free-text; structured-JSON with a response schema; configured-check; timeout; no SDK). The shared guardrails string per conventions. The pure pitch engine (`draftOutreach`) per the engines document's worked example, with a clean templated fallback for the offline safety net. The work-queue: a `jobs` table, an enqueue action, and the runner route (Node runtime, 60-second cap, **atomic claim on kind in {`outreach`, `research`, `proposal`, `follow-up`}**, reads the Media Kit once, drafts leads with bounded concurrency, saves to a new `outreachDrafts` table, advances the lead, logs activity) + a client poller that re-invokes the runner until the queue drains. A "Draft pitch" button on a brand/agent and a **pitch inbox** where each draft can be **opened in the creator's own mail app** (a `mailto:` link) or copied. **There is no email-sending integration** — pitches stay as drafts the creator opens in their own mail app. The Gemini key was switched on at Milestone 6, so the pitch is real from the first run. **This queue + runner is reused by every later engine.**
- **Done when:** they click Draft pitch on a brand and read a real, **brand-specific**, first-person pitch (not the templated fallback), then open it in their mail app; the brand's stage advances. (If the AI key is ever removed, a clean fallback pitch still appears — the flow never breaks.)

## Milestone 9 — Brand research
- **Plain outcome:** "A helper that writes a short 'brief' on a brand — what they care about and how to hook them — so pitches get sharper."
- **You build:** a pure `draftResearch` engine on the same pattern, returning a brief (summary, priorities, hooks, angle) saved on the brand; add it as a job kind in the runner; a fallback brief; keep guardrails. A "Write brief" action on a brand/agent reusing the enqueue-and-poll flow; show the brief on the brand detail.
- **Done when:** they run a brief on a brand and see the summary/hooks/angle appear; still completes with the AI key removed.

## Milestone 10 — Proposals & follow-ups
- **Plain outcome:** "A helper that drafts a scoped, priced proposal for a brand — and your Follow-up helper re-engaging brands that went quiet."
- **You build:** a pure `draftProposal` engine on the same pattern. **Ground it in the Media Kit (niche, audience, rate floor) and the brand's research brief** — the app has no separate rate-card catalog, so the proposal's scope and pricing come from the creator's profile/rates and the brand context. Returns a titled, priced proposal with a short list of deliverable packages (stored as the `products` array on the `proposals` table — data-model); add it as a job kind; fallback proposal; keep guardrails (first person, no AI mention). A "Draft proposal" action reusing the enqueue-and-poll flow; show proposals in a list / on the brand.
- **Also build the Follow-up engine (so that agent isn't a dummy):** a pure `draftFollowup` on the same pattern that re-engages a brand that went quiet — a short, polite nudge in the creator's first-person voice, grounded in the **prior pitch** (the last `outreachDrafts` row for that lead). Returns `{ subject, body, rationale }`; add `follow-up` as a runner job kind (and to the claim filter — see Milestone 8); a warm "circling back" fallback; keep the pitch guardrails. A "Follow up" action on a brand reusing the enqueue-and-poll flow. See `07a-the-deal-team.md` (agent #4) for the exact shape. *(In the reference repo this engine + runner kind are the one piece not yet wired — build them here.)*
- **Done when:** they run a proposal on a brand and get a scoped, priced proposal in their voice; and running a follow-up on a quiet brand produces a real nudge that builds on the earlier pitch. Both still complete with the AI key removed.

## Milestone 11 — Brand discovery
- **Plain outcome:** "Your Research agent goes and finds real brands from the web and drops them into your Pending area to approve."
- **You build:** a web-search call (per tech-stack's discovery tool, Firecrawl) with an AI extraction step that turns results into brand candidates, run from a Node route capped at 60 seconds, inserting them as pending, source-discovered leads; log activity. Graceful: if the discovery key isn't set yet, return a small canned set so the flow still completes (real degradation, not a separate feature). A "Discover brands" button that surfaces results in Pending for Accept/Reject; accepting sets them accepted so agents can work them.
- **Done when:** Discover brings brands into Pending; accepting one moves it into the working pipeline.

## Milestone 12 — Self-running teams (pods)
- **Plain outcome:** "Kick off a team on your brands and watch it get to work — running stages and handing brands along, then checking back with you for the steps that need your say-so."
- **You build:** an orchestrator (`chainNext`) that, after a team stage completes, narrates the hand-off in the team's activity and either enqueues the next stage it covers or hands back to the creator (with an @mention) for the on-command steps. Discovery is the autonomous "build the book" stage; pitching/proposals/follow-up/booking hand back for the creator's go-ahead. Wire the runner to call `chainNext` for team jobs; a "Work the book" action on the team page and a live view of what's running. Keep batches small; rely on the poller re-invocation so nothing exceeds the time cap.
- **Done when:** a team run visibly starts, produces work (e.g. discovers/briefs brands), narrates progress, and hands back to the creator for the steps that need approval.

---

# Phase D — Team & Launch (Milestones 13–17)

## Milestone 13 — Team chat
- **Plain outcome:** "You talk to your whole AI team in a group chat. Mention an agent in plain English ('@Research find me fitness brands') and it actually does the job and reports back in the thread."
- **You build:** a team group-chat view; when the creator @mentions an agent in plain language, detect the intent, route to a capable teammate if the mentioned one can't do it, run the real job (reusing the engines/queue), and post the acting agent's result back into the thread. Persist chat messages. Keep guardrails on any brand-facing text produced.
- **Done when:** they @mention an agent with a request, watch it run the real task, and see it reply in-thread with the result.

## Milestone 14 — Calendar
- **Plain outcome:** "Booked brand calls show up on a real calendar, and you can book one from a brand or just by asking in plain English ('book a call with Acme next Tuesday at 2pm')."
- **You build:** the `meetings` table + a book-meeting engine/action that parses a natural-language time (per the meeting-time parser) and books a call/shoot; a Calendar page showing only real booked calls. Graceful with no AI key (accept a simple typed date/time).
- **Done when:** they book a call from a brand (or via chat) and see it on the calendar.

## Milestone 15 — Make the dashboard live (real data & analytics) ⭐
- **Plain outcome:** "The signature dashboard you've had since day one now runs on your real work — real numbers (pitches drafted, brands worked, calls booked), helpers lighting up as they actually work, and a notifications bell."
- **You build:** the orbit dashboard **visual already exists from Milestone 1** (built verbatim from `09-dashboard-design.md`) — do **not** rebuild or redesign it. Here you **wire it to real data**: replace the demo stats/activity with genuine numbers read from the real activity log + pipeline (KPIs, a per-day chart, an output ranking per agent) — no fake data. Add a live "which brand is being worked right now" indicator (drives the "Working now" pill + pulsing agent dots) from currently-running jobs. A notifications bell reading recent activity, clear-that-only-hides (analytics still read the raw log). Fill in the Analytics page.
- **Done when:** the dashboard (unchanged visually from day one) now shows real numbers; running a pitch/pod makes agents visibly "work" (green pulse); analytics reflect real actions (draft a pitch → the count goes up); clearing the bell doesn't change the totals.

## Milestone 16 — Go live
- **Plain outcome:** "Your app gets a real web link you can send to anyone. It's live."
- **You build:** guide the creator (plain, step-by-step, per the setup guide) to put their saved code on GitHub and deploy with the hosting service in tech-stack: create the accounts, connect the project, enter the same secret keys (as the live app's settings, not a file), and update any web addresses that must change from the local one to the live one. Handle the settings/config yourself; only have them click and copy where required.
- **Done when:** the live link opens the working app, they can sign up on it, and the AI features work there too.

## Milestone 17 — Connect TikTok
- **Plain outcome:** "Connect your TikTok so your follower stats auto-fill your Media Kit and your profile photo sits at the center of your dashboard."
- **Why it's last:** TikTok's web login only works over a secure `https://` address — it **rejects localhost**. So it's connected on the **live site** (Milestone 16), not during local building. (The code can be built earlier, but connecting/testing needs the live URL.)
- **You build:** TikTok Login Kit via OAuth per tech-stack — the `socialAccounts` table (composite key `user + provider`, refresh token **encrypted at rest** — AES-256-GCM, key derived from `AUTH_SECRET`, which you generate now as a local secret (`openssl rand -hex 32` → save to `.env.local`)), the connect start + callback routes, and a **Connect TikTok** card (on Profile/Settings). On connect, read the account's stats/bio into the `snapshot` and **merge them into `creatorProfile`** (auto-fill the Media Kit); the dashboard center already uses the TikTok avatar when present. **Graceful:** without the TikTok keys, the connect card hides and the Media Kit stays manual — nothing breaks. Then guide the creator step-by-step (per the setup guide) to: register a TikTok developer app (add the **Login Kit** product; scopes `user.info.basic` / `user.info.profile` / `user.info.stats`; build in **Sandbox** with themselves added as a test user), set the **exact live `https://…/api/auth/tiktok/callback` URL** identically in the TikTok portal and in the app's settings (it must match byte-for-byte), add the client key/secret to the live app's settings, redeploy, and connect.
- **Done when:** on the live site they click Connect TikTok, authorize, and their stats + profile photo auto-fill the Media Kit and appear at the center of the dashboard. (Locally, before keys are set, the connect card is simply hidden.)
