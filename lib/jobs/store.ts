import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function enqueueJob(input: { userId: string; agentId: string | null; kind: string; params: Record<string, unknown> }) {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(jobs).values({
    id,
    userId: input.userId,
    agentId: input.agentId,
    kind: input.kind,
    status: "queued",
    params: input.params,
  });
  return id;
}

export async function getJob(userId: string, id: string) {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.userId, userId), eq(jobs.id, id)))
    .limit(1);
  return rows[0] ?? null;
}
