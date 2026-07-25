export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { listAgents, listTeams } from "@/lib/agents/store";
import { computeWorkspaceStats } from "@/lib/workspace/stats";
import { listRecentActivity } from "@/lib/activity/store";

export async function GET() {
  const ownerId = process.env.OWNER_USER_ID;
  if (!ownerId) return NextResponse.json({ available: false });

  try {
    const [agents, teams, stats, recent] = await Promise.all([
      listAgents(ownerId),
      listTeams(ownerId),
      computeWorkspaceStats(ownerId),
      listRecentActivity(ownerId, 5),
    ]);

    if (agents.length === 0) return NextResponse.json({ available: false });

    return NextResponse.json({
      available: true,
      agents,
      teams,
      stats,
      activity: recent.map((r) => ({ agentId: r.agentId ?? "", text: r.text })),
    });
  } catch {
    return NextResponse.json({ available: false });
  }
}
