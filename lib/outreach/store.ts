import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { outreachDrafts } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { DraftView } from "./types";

function toView(row: typeof outreachDrafts.$inferSelect): DraftView {
  return {
    id: row.id,
    leadId: row.leadId,
    subject: row.subject,
    body: row.body,
    rationale: row.rationale,
    status: row.status as DraftView["status"],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listDrafts(userId: string): Promise<DraftView[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const rows = await db.select().from(outreachDrafts).where(eq(outreachDrafts.userId, userId)).orderBy(desc(outreachDrafts.createdAt));
  return rows.map(toView);
}

export async function getLatestDraftForLead(userId: string, leadId: string): Promise<DraftView | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(outreachDrafts)
    .where(and(eq(outreachDrafts.userId, userId), eq(outreachDrafts.leadId, leadId)))
    .orderBy(desc(outreachDrafts.createdAt))
    .limit(1);
  return rows[0] ? toView(rows[0]) : null;
}
