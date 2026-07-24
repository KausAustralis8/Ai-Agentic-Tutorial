import { currentUser } from "@/lib/auth/currentUser";
import { computeWorkspaceStats, activityPerDay } from "@/lib/workspace/stats";
import { listAgents } from "@/lib/agents/store";
import { getDb, isDbConfigured } from "@/lib/db";
import { outreachDrafts, proposals, meetings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import AnalyticsView from "@/components/analytics/AnalyticsView";

export default async function AnalyticsPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <AnalyticsView
        stats={{ activeAgents: 0, tasksRunning: 0, leadsWorked: 0, perAgent: [] }}
        perDay={[]}
        agents={[]}
        pitchesDrafted={0}
        proposalsDrafted={0}
        callsBooked={0}
      />
    );
  }

  const [stats, perDay, agents] = await Promise.all([
    computeWorkspaceStats(user.id),
    activityPerDay(user.id, 14),
    listAgents(user.id),
  ]);

  let pitchesDrafted = 0;
  let proposalsDrafted = 0;
  let callsBooked = 0;

  if (isDbConfigured()) {
    const db = getDb();
    const [drafts, props, calls] = await Promise.all([
      db.select().from(outreachDrafts).where(eq(outreachDrafts.userId, user.id)),
      db.select().from(proposals).where(eq(proposals.userId, user.id)),
      db.select().from(meetings).where(eq(meetings.userId, user.id)),
    ]);
    pitchesDrafted = drafts.length;
    proposalsDrafted = props.length;
    callsBooked = calls.length;
  }

  return (
    <AnalyticsView
      stats={stats}
      perDay={perDay}
      agents={agents}
      pitchesDrafted={pitchesDrafted}
      proposalsDrafted={proposalsDrafted}
      callsBooked={callsBooked}
    />
  );
}
