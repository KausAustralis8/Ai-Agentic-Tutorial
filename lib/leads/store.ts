import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { LeadView } from "./types";
import type { ResearchResult } from "@/lib/ai/research";

function toView(row: typeof leads.$inferSelect): LeadView {
  return {
    id: row.id,
    agentId: row.agentId,
    name: row.name,
    title: row.title,
    company: row.company,
    email: row.email,
    status: row.status as LeadView["status"],
    source: row.source as LeadView["source"],
    review: row.review as LeadView["review"],
    platform: row.platform,
    research: (row.research as ResearchResult | null) ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listLeads(userId: string): Promise<LeadView[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const rows = await db.select().from(leads).where(eq(leads.userId, userId)).orderBy(desc(leads.createdAt));
  return rows.map(toView);
}
