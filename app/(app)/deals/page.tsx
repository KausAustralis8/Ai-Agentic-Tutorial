import { currentUser } from "@/lib/auth/currentUser";
import { listLeads } from "@/lib/leads/store";
import { listAgents } from "@/lib/agents/store";
import { listProposals } from "@/lib/proposals/store";
import { listDrafts } from "@/lib/outreach/store";
import DealsView from "@/components/deals/DealsView";
import type { ProposalView } from "@/lib/proposals/types";
import type { DraftView } from "@/lib/outreach/types";

function latestByLead<T extends { leadId: string; createdAt: string }>(rows: T[]): Record<string, T> {
  const map: Record<string, T> = {};
  for (const row of rows) {
    const existing = map[row.leadId];
    if (!existing || row.createdAt > existing.createdAt) map[row.leadId] = row;
  }
  return map;
}

export default async function DealsPage() {
  const user = await currentUser();
  const leads = user ? await listLeads(user.id) : [];
  const agents = user ? await listAgents(user.id) : [];
  const proposals: ProposalView[] = user ? await listProposals(user.id) : [];
  const drafts: DraftView[] = user ? await listDrafts(user.id) : [];

  return (
    <DealsView
      leads={leads}
      agents={agents}
      proposalsByLead={latestByLead(proposals)}
      followupsByLead={latestByLead(drafts)}
    />
  );
}
