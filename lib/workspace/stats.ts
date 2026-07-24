import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { activity, jobs } from "@/lib/db/schema";
import { eq, and, gte, inArray } from "drizzle-orm";

export interface WorkspaceStats {
  activeAgents: number;
  tasksRunning: number;
  leadsWorked: number;
  perAgent: { agentId: string; leadsWorked: number }[];
}

const EMPTY_STATS: WorkspaceStats = { activeAgents: 0, tasksRunning: 0, leadsWorked: 0, perAgent: [] };

export async function computeWorkspaceStats(userId: string): Promise<WorkspaceStats> {
  if (!isDbConfigured()) return EMPTY_STATS;
  const db = getDb();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [activeJobs, monthActivity] = await Promise.all([
    db.select().from(jobs).where(and(eq(jobs.userId, userId), inArray(jobs.status, ["queued", "running"]))),
    db.select().from(activity).where(and(eq(activity.userId, userId), gte(activity.createdAt, monthStart))),
  ]);

  const activeAgentIds = new Set(activeJobs.map((j) => j.agentId).filter((id): id is string => !!id));

  const workedLeadIds = new Set(
    monthActivity.filter((a) => a.type !== "lead_added" && a.leadId).map((a) => a.leadId as string)
  );

  const perAgentMap = new Map<string, number>();
  for (const a of monthActivity) {
    if (!a.agentId) continue;
    perAgentMap.set(a.agentId, (perAgentMap.get(a.agentId) ?? 0) + 1);
  }

  return {
    activeAgents: activeAgentIds.size,
    tasksRunning: activeJobs.length,
    leadsWorked: workedLeadIds.size,
    perAgent: [...perAgentMap.entries()].map(([agentId, leadsWorked]) => ({ agentId, leadsWorked })),
  };
}

export async function getActiveAgentIds(userId: string): Promise<string[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const activeJobs = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.userId, userId), inArray(jobs.status, ["queued", "running"])));
  return [...new Set(activeJobs.map((j) => j.agentId).filter((id): id is string => !!id))];
}

export interface DayCount {
  date: string;
  count: number;
}

export async function activityPerDay(userId: string, days = 14): Promise<DayCount[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const rows = await db.select().from(activity).where(and(eq(activity.userId, userId), gte(activity.createdAt, since)));

  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    counts.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of rows) {
    const key = r.createdAt.toISOString().slice(0, 10);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()].map(([date, count]) => ({ date, count }));
}
