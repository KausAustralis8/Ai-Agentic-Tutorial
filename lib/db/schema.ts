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
