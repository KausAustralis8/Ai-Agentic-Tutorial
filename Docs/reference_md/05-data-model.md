# Data Model — what gets stored

> Briefing document for Claude. This is the shape of the database (Postgres via Drizzle, schema in `lib/db/schema.ts`). Build tables to match this. Almost every table is **scoped to a user** via a `userId` column — the **Clerk user id** (a text string like `user_...`, **not** a UUID) — and every query filters by the signed-in user. Other IDs are UUIDs unless noted. Timestamps are `timestamptz`.

## The tables

### `users`
The account. `id` (the **Clerk user id** — a text primary key, not a UUID), `email`, `name`, `workspaceName` (default "My Workspace"), `notifications` (JSON on/off flags), `createdAt`. **Auth (passwords, Google sign-in, reset) lives in Clerk — there is no `passwordHash`.** `email`/`name` mirror Clerk for display/queries; the row is **upserted on the user's first authenticated request** (or via a Clerk webhook).

### `creatorProfile` — the Media Kit (one row per user)
The single most important table. `userId` (primary key), `niche`, `bio`, `platforms` (JSON list of `{ platform, handle, followers, engagementRate }`), `audience` (JSON, free-form demographics like `{ age, geo, gender }`), `tone`, `pastDeals`, `rateFloor`, `updatedAt`. Read by every AI engine as `creatorContext`.

### `agents` — agents the user created
Composite key `(userId, id)` where `id` is a per-user code. Fields: `name`, `initials`, `role`, `color`, `status`, `task`, `score`, `goal`, `char`, `type` (default "custom"), `capabilities` (JSON list of capability ids), `createdAt`. The five preset "Deal Team" agents are static template data in code (see `agentTypes.ts`); only the user's own additions live here.

### `agentConfig`, `agentStates`, `teamMembers`
Per-user overrides layered on top of preset agents/teams so users can tweak them without duplicating them:
- `agentConfig` — edited `role`/`goal`/`permissions`/`settings` for any agent.
- `agentStates` — `removed` (soft delete) and `paused` flags per agent.
- `teamMembers` — a replacement member list for a team.

### `teams` — pods the user created
Composite key `(userId, id)`. Fields: `name`, `icon`, `iconBg`, `description`, `goal`, `members` (JSON list of agent ids), `activity` (JSON), `meetings`, `pipeline`, `leads`, `template`, `createdAt`.

### `messages` — 1:1 chat with an agent
`id` (auto-increment, preserves order), `userId`, `agentId`, `who` (`'ai'` or `'me'`), `text`, `createdAt`. Indexed by `(userId, agentId, id)` for fast per-thread loads.

### `leads` — brands / deals (the pipeline)
The brands an agent works. Fields: `id`, `userId`, `agentId`, `name`, `title`, `company`, `email`, `status` (`new | pitched | negotiating | replied | booked`), `score`, `source` (`manual | scrape`), `review` (`accepted | pending` — the **review gate**), `profileUrl`, `platform`, `research` (JSON brief: `{ summary, priorities[], hooks[], angle }`), `createdAt`, `updatedAt`. Indexed by `(userId, agentId)` and `(userId, review)`.

### `outreachDrafts` — pitch drafts
Agent-written outbound pitches. Fields: `id`, `userId`, `agentId`, `leadId` (→ leads, cascade delete), `subject`, `body`, `rationale`, `status` (`draft | sent`), `dismissed` (soft-hide from the pitch inbox — never affects analytics counts), `createdAt`, `sentAt`. Each pitch is a draft the creator opens in their own mail app (there is no email-sending integration).

### `proposals` — rate proposals
Agent-written priced proposals for a lead. Fields: `id`, `userId`, `agentId`, `leadId`, `title`, `body`, `products` (JSON list of deliverable package names, surfaced as `packages`), `status` (`draft | sent`), `createdAt`, `sentAt`.

### `meetings` — booked calls (the calendar's only source)
Fields: `id`, `userId`, `agentId`, `leadId`, `title`, `kind` (`call | shoot | deliverable`), `whenAt`, `whenLabel`, `createdAt`. Indexed by `(userId, whenAt)` for calendar ranges.

### `activity` — the event log
Feeds notifications, the dashboard, and analytics. Fields: `id`, `userId`, `agentId`, `type` (e.g. `lead_added | lead_qualified | email_drafted | email_sent`), `leadId` (nullable), `text`, `dismissed` (clears from the Notifications bell only — dashboard/analytics read the raw unfiltered log so clearing never drops a metric), `createdAt`.

### `jobs` — the work queue
Fields: `id`, `userId`, `agentId`, `kind` (e.g. `outreach | research | proposal | scrape`), `status` (`queued | running | done | failed`), `params` (JSON), `result` (JSON), `error`, `createdAt`, `startedAt`, `finishedAt`. A runner claims a `queued` job atomically (guards on `status='queued'` so two runners can't grab the same one), runs the engine, and marks it `done`/`failed`.

### `socialAccounts` — connected socials (TikTok)
Composite key `(userId, provider)`. Holds TikTok/Instagram stats to auto-fill the Media Kit. `openId`, `username`, `displayName`, `avatarUrl`, `refreshToken` (encrypted), token expiry fields, `scope`, `snapshot` (JSON of last-fetched stats), `needsReconnect`, `connectedAt`.

> **Removed with Clerk:** the old `passwordResetTokens` table is gone — password reset and email verification are handled entirely by Clerk. There is no in-app reset flow and no `passwordHash`.

> Note: there is **no** offerings / rate-card / products table and **no** embeddings — that feature was removed. Proposals are grounded on the Media Kit (rate floor + audience), not a catalog. Don't build one.

## Relationships in one picture

```
users ─┬─ creatorProfile (1:1, the Media Kit)
       ├─ agents / teams (the AI workforce)
       ├─ leads (brands) ─┬─ outreachDrafts (pitches)
       │                  ├─ proposals
       │                  └─ meetings (calendar)
       ├─ jobs (work queue) → engines run here
       ├─ activity (event log → notifications/analytics)
       ├─ messages (1:1 agent chat)
       └─ socialAccounts (TikTok integration)
```

## Rules of thumb for Claude

- **Every feature table has `userId`** and every read/write filters by the current user.
- **Cascade deletes** flow from `users` down, and from `leads` to its drafts/proposals/meetings.
- **Soft-hide flags** (`dismissed`, `removed`, `paused`) hide things from a view but **never** rewrite historical totals — analytics always read the raw log.
- **Add columns via hand-written SQL migrations** (see `conventions.md`), never destructive resets.
