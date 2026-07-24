import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { discoverBrands } from "./discover";
import { recordActivity } from "@/lib/activity/store";

export async function runDiscovery(userId: string, agentId: string | null, niche: string, pastDeals?: string): Promise<number> {
  if (!isDbConfigured()) return 0;
  const db = getDb();

  const existing = await db.select({ name: leads.name }).from(leads).where(eq(leads.userId, userId));
  const seen = new Set(existing.map((r) => r.name.trim().toLowerCase()));

  const candidates = await discoverBrands(niche, { pastDeals, excludeNames: [...seen] });

  let added = 0;
  for (const c of candidates) {
    const key = c.name.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);

    await db.insert(leads).values({
      id: crypto.randomUUID(),
      userId,
      agentId,
      name: c.name,
      company: c.company,
      status: "new",
      source: "scrape",
      review: "pending",
    });
    added++;
  }

  if (added > 0) {
    await recordActivity({
      userId,
      agentId,
      type: "lead_added",
      text: `found ${added} new brand match${added === 1 ? "" : "es"} in your niche`,
    });
  }

  return added;
}
