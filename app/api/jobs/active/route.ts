export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/currentUser";
import { getActiveAgentIds } from "@/lib/workspace/stats";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ agentIds: [] });
  const agentIds = await getActiveAgentIds(user.id);
  return NextResponse.json({ agentIds });
}
