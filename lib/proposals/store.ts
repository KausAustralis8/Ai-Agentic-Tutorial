import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { proposals } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { ProposalView } from "./types";

function toView(row: typeof proposals.$inferSelect): ProposalView {
  return {
    id: row.id,
    leadId: row.leadId,
    title: row.title,
    body: row.body,
    packages: (row.products as string[]) ?? [],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listProposals(userId: string): Promise<ProposalView[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const rows = await db.select().from(proposals).where(eq(proposals.userId, userId)).orderBy(desc(proposals.createdAt));
  return rows.map(toView);
}
