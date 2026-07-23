import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { activity } from "@/lib/db/schema";

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
