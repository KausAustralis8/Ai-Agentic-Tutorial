import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { agents, agentConfig, agentStates, teams, teamMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AGENT_TYPES, TEAM_TEMPLATES, type CapabilityId } from "@/lib/agentTypes";
import type { AgentView, TeamView } from "./types";

export async function listAgents(userId: string): Promise<AgentView[]> {
  const presets: AgentView[] = AGENT_TYPES.map((t) => ({
    id: t.id,
    name: t.name,
    initials: t.initials,
    role: t.role,
    color: t.color,
    status: "working",
    task: t.task,
    goal: t.goal,
    capabilities: t.capabilities,
    type: t.id,
    isPreset: true,
    paused: false,
  }));

  let customRows: (typeof agents.$inferSelect)[] = [];
  let configRows: (typeof agentConfig.$inferSelect)[] = [];
  let stateRows: (typeof agentStates.$inferSelect)[] = [];

  if (isDbConfigured()) {
    const db = getDb();
    [customRows, configRows, stateRows] = await Promise.all([
      db.select().from(agents).where(eq(agents.userId, userId)),
      db.select().from(agentConfig).where(eq(agentConfig.userId, userId)),
      db.select().from(agentStates).where(eq(agentStates.userId, userId)),
    ]);
  }

  const configById = new Map(configRows.map((c) => [c.agentId, c]));
  const stateById = new Map(stateRows.map((s) => [s.agentId, s]));

  const customAgents: AgentView[] = customRows.map((r) => ({
    id: r.id,
    name: r.name,
    initials: r.initials,
    role: r.role,
    color: r.color,
    status: (r.status as AgentView["status"]) ?? "waiting",
    task: r.task ?? "Ready to get to work",
    goal: r.goal ?? "",
    capabilities: (r.capabilities as CapabilityId[]) ?? [],
    type: r.type,
    isPreset: false,
    paused: false,
  }));

  return [...presets, ...customAgents]
    .map((a) => {
      const cfg = configById.get(a.id);
      const st = stateById.get(a.id);
      const paused = st?.paused ?? false;
      return {
        ...a,
        name: cfg?.name || a.name,
        initials: cfg?.initials || a.initials,
        role: cfg?.role || a.role,
        goal: cfg?.goal || a.goal,
        paused,
        status: paused ? ("waiting" as const) : a.status,
      };
    })
    .filter((a) => !stateById.get(a.id)?.removed);
}

export async function getAgent(userId: string, id: string): Promise<AgentView | null> {
  const list = await listAgents(userId);
  return list.find((a) => a.id === id) ?? null;
}

export async function listTeams(userId: string): Promise<TeamView[]> {
  const presets: TeamView[] = TEAM_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    description: "Your ready-made brand-deal team.",
    goal: "Cover a brand deal end to end — find, pitch, propose, follow up, and book.",
    members: t.members,
    isPreset: true,
  }));

  let customRows: (typeof teams.$inferSelect)[] = [];
  let memberOverrides: (typeof teamMembers.$inferSelect)[] = [];

  if (isDbConfigured()) {
    const db = getDb();
    [customRows, memberOverrides] = await Promise.all([
      db.select().from(teams).where(eq(teams.userId, userId)),
      db.select().from(teamMembers).where(eq(teamMembers.userId, userId)),
    ]);
  }

  const overrideById = new Map(memberOverrides.map((m) => [m.teamId, m.members as string[]]));

  const customTeams: TeamView[] = customRows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    goal: r.goal ?? "",
    members: (r.members as string[]) ?? [],
    isPreset: false,
  }));

  return [...presets, ...customTeams].map((t) => ({
    ...t,
    members: overrideById.get(t.id) ?? t.members,
  }));
}
