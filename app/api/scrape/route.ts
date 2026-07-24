export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/currentUser";
import { isDbConfigured } from "@/lib/db";
import { getProfile } from "@/lib/profile/store";
import { runDiscovery } from "@/lib/scrape/run";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return NextResponse.json({ ok: false, added: 0 });

  const body = await req.json().catch(() => ({ agentId: null }));
  const agentId: string | null = body?.agentId ?? null;

  const profile = await getProfile(user.id);
  const niche = profile.niche || "content creation";

  const added = await runDiscovery(user.id, agentId, niche, profile.pastDeals || undefined);

  return NextResponse.json({ ok: true, added });
}
