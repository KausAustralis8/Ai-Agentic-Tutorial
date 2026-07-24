"use server";
import { currentUser } from "@/lib/auth/currentUser";
import { revalidatePath } from "next/cache";
import { listAgents } from "@/lib/agents/store";
import { insertMessage } from "./store";
import { classifyIntent } from "@/lib/ai/chatIntent";
import { getProfile, profileSummary, creatorDisplayName } from "@/lib/profile/store";
import { runDiscovery } from "@/lib/scrape/run";
import { draftResearch, type ResearchResult } from "@/lib/ai/research";
import { draftProposal } from "@/lib/ai/proposal";
import { draftFollowup } from "@/lib/ai/followup";
import { bookMeetingFromText } from "@/lib/meetings/actions";
import { recordActivity } from "@/lib/activity/store";
import { getDb, isDbConfigured } from "@/lib/db";
import { leads, proposals, outreachDrafts } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { AgentView } from "@/lib/agents/types";
import type { CapabilityId } from "@/lib/agentTypes";

function findMentionedAgent(text: string, agents: AgentView[]): AgentView | null {
  const m = text.match(/@(\w+)/);
  if (!m) return null;
  const token = m[1].toLowerCase();
  return (
    agents.find((a) => a.name.toLowerCase().split(/\s+/)[0] === token) ||
    agents.find((a) => a.role.toLowerCase().replace(/\s+/g, "") === token) ||
    agents.find((a) => a.name.toLowerCase().replace(/\s+/g, "").startsWith(token)) ||
    agents.find((a) => a.role.toLowerCase().startsWith(token)) ||
    null
  );
}

function findAgentWithCapability(agents: AgentView[], capability: CapabilityId): AgentView | null {
  return agents.find((a) => a.capabilities.includes(capability) && !a.paused) ?? null;
}

async function findLeadByName(userId: string, name: string) {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(leads).where(eq(leads.userId, userId));
  const needle = name.toLowerCase();
  return rows.find((r) => r.name.toLowerCase().includes(needle) || needle.includes(r.name.toLowerCase())) ?? null;
}

export interface ChatReply {
  agentId: string | null;
  agentName: string | null;
  text: string;
}

export async function sendChatMessage(text: string): Promise<ChatReply[]> {
  const user = await currentUser();
  const trimmed = text.trim();
  if (!user || !trimmed) return [];

  await insertMessage(user.id, null, "me", trimmed);

  const agents = await listAgents(user.id);

  if (/@everyone\b/i.test(trimmed)) {
    const replies: ChatReply[] = [];
    for (const a of agents.filter((a) => !a.paused)) {
      const status = a.task?.trim() || a.goal?.trim() || "Ready to help.";
      await insertMessage(user.id, a.id, "ai", status);
      replies.push({ agentId: a.id, agentName: a.name, text: status });
    }
    revalidatePath("/chat");
    return replies;
  }

  const mentioned = findMentionedAgent(trimmed, agents);
  const intent = await classifyIntent(trimmed);

  let actingAgent: AgentView | null = mentioned;
  if (intent.capability !== "none" && (!actingAgent || !actingAgent.capabilities.includes(intent.capability))) {
    actingAgent = findAgentWithCapability(agents, intent.capability) ?? actingAgent;
  }

  const profile = await getProfile(user.id);
  const creatorContext = profileSummary(profile, creatorDisplayName(user.name, user.email));
  const creatorName = creatorDisplayName(user.name, user.email);

  let reply: string;

  if (intent.capability === "none") {
    reply = mentioned
      ? `Not sure what you'd like me to do — try something like "find me some brands," "write a brief on X," "draft a proposal for X," "follow up with X," or "book a call with X."`
      : `Mention a teammate with @ and tell them what you need — like "@Research find me some fitness brands."`;
  } else if (!actingAgent) {
    reply = `No one on your team can do that yet — you could add an agent with that skill from the Agents page.`;
  } else if (intent.capability === "scrape") {
    const niche = intent.detail || profile.niche || "content creation";
    const added = await runDiscovery(user.id, actingAgent.id, niche, profile.pastDeals || undefined);
    reply =
      added > 0
        ? `Found ${added} new brand${added === 1 ? "" : "s"} matching "${niche}" — check Pending review in Deals.`
        : `Didn't find anything new for "${niche}" this time — try again in a bit or tweak your niche.`;
  } else if (intent.capability === "outreach") {
    reply = `Pitch-writing isn't set up yet — I can still write a brand brief, a proposal, or a follow-up if that helps.`;
  } else if (intent.capability === "research") {
    const lead = intent.brandName ? await findLeadByName(user.id, intent.brandName) : null;
    if (!lead) {
      reply = intent.brandName ? `I couldn't find "${intent.brandName}" in your Deals yet.` : `Which brand should I research?`;
    } else {
      const brief = await draftResearch({ name: lead.name, company: lead.company, platform: lead.platform }, creatorContext);
      const db = getDb();
      await db.update(leads).set({ research: brief, updatedAt: new Date() }).where(eq(leads.id, lead.id));
      await recordActivity({ userId: user.id, agentId: actingAgent.id, type: "lead_qualified", leadId: lead.id, text: `wrote a research brief for ${lead.name}` });
      reply = `Here's the brief on ${lead.name}: ${brief.summary} Best angle: ${brief.angle}`;
    }
  } else if (intent.capability === "proposal") {
    const lead = intent.brandName ? await findLeadByName(user.id, intent.brandName) : null;
    if (!lead) {
      reply = intent.brandName ? `I couldn't find "${intent.brandName}" in your Deals yet.` : `Which brand should I draft a proposal for?`;
    } else {
      const proposal = await draftProposal(
        { name: lead.name, company: lead.company, research: lead.research as ResearchResult | null },
        creatorContext,
        creatorName
      );
      const db = getDb();
      await db.insert(proposals).values({
        id: crypto.randomUUID(),
        userId: user.id,
        agentId: actingAgent.id,
        leadId: lead.id,
        title: proposal.title,
        body: proposal.body,
        products: proposal.packages,
      });
      await recordActivity({ userId: user.id, agentId: actingAgent.id, type: "proposal_drafted", leadId: lead.id, text: `drafted a proposal for ${lead.name}` });
      reply = `Drafted a proposal for ${lead.name}: "${proposal.title}" — open the Deals page to read the full thing.`;
    }
  } else if (intent.capability === "follow-up") {
    const lead = intent.brandName ? await findLeadByName(user.id, intent.brandName) : null;
    if (!lead) {
      reply = intent.brandName ? `I couldn't find "${intent.brandName}" in your Deals yet.` : `Which brand should I follow up with?`;
    } else {
      const db = getDb();
      const [priorDraft] = await db
        .select()
        .from(outreachDrafts)
        .where(and(eq(outreachDrafts.userId, user.id), eq(outreachDrafts.leadId, lead.id)))
        .orderBy(desc(outreachDrafts.createdAt))
        .limit(1);
      const followup = await draftFollowup(
        { name: lead.name, company: lead.company },
        creatorContext,
        creatorName,
        priorDraft ? { subject: priorDraft.subject, body: priorDraft.body } : null
      );
      await db.insert(outreachDrafts).values({
        id: crypto.randomUUID(),
        userId: user.id,
        agentId: actingAgent.id,
        leadId: lead.id,
        subject: followup.subject,
        body: followup.body,
        rationale: followup.rationale,
        status: "draft",
      });
      await recordActivity({ userId: user.id, agentId: actingAgent.id, type: "email_drafted", leadId: lead.id, text: `wrote a follow-up for ${lead.name}` });
      reply = `Wrote a follow-up for ${lead.name}: "${followup.subject}" — ${followup.body}`;
    }
  } else {
    const lead = intent.brandName ? await findLeadByName(user.id, intent.brandName) : null;
    const res = await bookMeetingFromText({ text: intent.detail || trimmed, leadId: lead?.id ?? null, agentId: actingAgent.id });
    reply = res.ok ? `Booked it — ${res.whenLabel}. Check your Calendar.` : `I couldn't work out the time from that — try something like "next Tuesday at 2pm."`;
  }

  const speakerId = actingAgent?.id ?? mentioned?.id ?? null;
  const speakerName = actingAgent?.name ?? mentioned?.name ?? null;
  await insertMessage(user.id, speakerId, "ai", reply);

  revalidatePath("/chat");
  return [{ agentId: speakerId, agentName: speakerName, text: reply }];
}
