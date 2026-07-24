import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { activity } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function recordActivity(params: {
  userId: string;
  agentId?: string | null;
  type: string;
  leadId?: string | null;
  text: string;
}) {
  if (!isDbConfigured()) return;
  const db = getDb();
  await db.insert(activity).values({
    id: crypto.randomUUID(),
    userId: params.userId,
    agentId: params.agentId ?? null,
    type: params.type,
    leadId: params.leadId ?? null,
    text: params.text,
  });
}

export interface ActivityItem {
  id: string;
  agentId: string | null;
  type: string;
  text: string;
  createdAt: string;
}

function toItem(row: typeof activity.$inferSelect): ActivityItem {
  return { id: row.id, agentId: row.agentId, type: row.type, text: row.text, createdAt: row.createdAt.toISOString() };
}

export async function listRecentActivity(userId: string, limit = 10): Promise<ActivityItem[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const rows = await db
    .select()
    .from(activity)
    .where(and(eq(activity.userId, userId), eq(activity.dismissed, false)))
    .orderBy(desc(activity.createdAt))
    .limit(limit);
  return rows.map(toItem);
}
