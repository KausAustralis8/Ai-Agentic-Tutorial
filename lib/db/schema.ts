import { pgTable, text, jsonb, timestamp, boolean, primaryKey } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  name: text("name"),
  workspaceName: text("workspace_name").notNull().default("My Workspace"),
  notifications: jsonb("notifications").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const creatorProfile = pgTable("creator_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  niche: text("niche"),
  bio: text("bio"),
  platforms: jsonb("platforms").notNull().default([]),
  audience: jsonb("audience").notNull().default({}),
  tone: text("tone"),
  pastDeals: text("past_deals"),
  rateFloor: text("rate_floor"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const agents = pgTable(
  "agents",
  {
    userId: text("user_id").notNull(),
    id: text("id").notNull(),
    name: text("name").notNull(),
    initials: text("initials").notNull(),
    role: text("role").notNull(),
    color: text("color").notNull(),
    status: text("status").notNull().default("waiting"),
    task: text("task"),
    score: text("score"),
    goal: text("goal"),
    char: text("char"),
    type: text("type").notNull().default("custom"),
    capabilities: jsonb("capabilities").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.id] }) })
);

export const agentConfig = pgTable(
  "agent_config",
  {
    userId: text("user_id").notNull(),
    agentId: text("agent_id").notNull(),
    name: text("name"),
    initials: text("initials"),
    role: text("role"),
    goal: text("goal"),
    permissions: jsonb("permissions").notNull().default({}),
    settings: jsonb("settings").notNull().default({}),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.agentId] }) })
);

export const agentStates = pgTable(
  "agent_states",
  {
    userId: text("user_id").notNull(),
    agentId: text("agent_id").notNull(),
    removed: boolean("removed").notNull().default(false),
    paused: boolean("paused").notNull().default(false),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.agentId] }) })
);

export const teams = pgTable(
  "teams",
  {
    userId: text("user_id").notNull(),
    id: text("id").notNull(),
    name: text("name").notNull(),
    icon: text("icon"),
    iconBg: text("icon_bg"),
    description: text("description"),
    goal: text("goal"),
    members: jsonb("members").notNull().default([]),
    activity: jsonb("activity").notNull().default([]),
    meetings: jsonb("meetings").notNull().default([]),
    pipeline: jsonb("pipeline").notNull().default([]),
    leads: jsonb("leads").notNull().default([]),
    template: text("template"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.id] }) })
);

export const teamMembers = pgTable(
  "team_members",
  {
    userId: text("user_id").notNull(),
    teamId: text("team_id").notNull(),
    members: jsonb("members").notNull().default([]),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.teamId] }) })
);

export const leads = pgTable("leads", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  agentId: text("agent_id"),
  name: text("name").notNull(),
  title: text("title"),
  company: text("company"),
  email: text("email"),
  status: text("status").notNull().default("new"),
  score: text("score"),
  source: text("source").notNull().default("manual"),
  review: text("review").notNull().default("accepted"),
  profileUrl: text("profile_url"),
  platform: text("platform"),
  research: jsonb("research"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activity = pgTable("activity", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  agentId: text("agent_id"),
  type: text("type").notNull(),
  leadId: text("lead_id"),
  text: text("text").notNull(),
  dismissed: boolean("dismissed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const outreachDrafts = pgTable("outreach_drafts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  agentId: text("agent_id"),
  leadId: text("lead_id").notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
  rationale: text("rationale"),
  status: text("status").notNull().default("draft"),
  dismissed: boolean("dismissed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

export const proposals = pgTable("proposals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  agentId: text("agent_id"),
  leadId: text("lead_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  products: jsonb("products").notNull().default([]),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  agentId: text("agent_id"),
  kind: text("kind").notNull(),
  status: text("status").notNull().default("queued"),
  params: jsonb("params").notNull().default({}),
  result: jsonb("result"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});
