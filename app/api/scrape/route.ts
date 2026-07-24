export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/currentUser";
import { getDb, isDbConfigured } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { getProfile } from "@/lib/profile/store";
import { discoverBrands } from "@/lib/scrape/discover";
import { recordActivity } from "@/lib/activity/store";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return NextResponse.json({ ok: false, added: 0 });

  const body = await req.json().catch(() => ({ agentId: null }));
  const agentId: string | null = body?.agentId ?? null;

  const profile = await getProfile(user.id);
  const niche = profile.niche || "content creation";

  const candidates = await discoverBrands(niche);
  const db = getDb();
  let added = 0;

  for (const c of candidates) {
    await db.insert(leads).values({
      id: crypto.randomUUID(),
      userId: user.id,
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
      userId: user.id,
      agentId,
      type: "lead_added",
      text: `found ${added} new brand match${added === 1 ? "" : "es"} in your niche`,
    });
  }

  return NextResponse.json({ ok: true, added });
}
