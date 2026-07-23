export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { getDb, isDbConfigured } from "@/lib/db";
import { jobs, leads, proposals, outreachDrafts } from "@/lib/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import { currentUser } from "@/lib/auth/currentUser";
import { getProfile, profileSummary, creatorDisplayName } from "@/lib/profile/store";
import { draftResearch, type ResearchResult } from "@/lib/ai/research";
import { draftProposal } from "@/lib/ai/proposal";
import { draftFollowup } from "@/lib/ai/followup";
import { recordActivity } from "@/lib/activity/store";

const HANDLED_KINDS = ["research", "proposal", "follow-up"];

export async function POST() {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return NextResponse.json({ ok: true, processed: 0 });

  const db = getDb();

  const queued = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.userId, user.id), eq(jobs.status, "queued"), inArray(jobs.kind, HANDLED_KINDS)))
    .limit(5);

  if (queued.length === 0) return NextResponse.json({ ok: true, processed: 0 });

  const profile = await getProfile(user.id);
  const creatorContext = profileSummary(profile, creatorDisplayName(user.name, user.email));

  let processed = 0;

  for (const job of queued) {
    const claimed = await db
      .update(jobs)
      .set({ status: "running", startedAt: new Date() })
      .where(and(eq(jobs.id, job.id), eq(jobs.status, "queued")))
      .returning({ id: jobs.id });
    if (claimed.length === 0) continue;

    try {
      if (job.kind === "research") {
        const { leadId } = job.params as { leadId: string };
        const [lead] = await db
          .select()
          .from(leads)
          .where(and(eq(leads.userId, user.id), eq(leads.id, leadId)))
          .limit(1);
        if (!lead) throw new Error("Lead not found");

        const brief = await draftResearch({ name: lead.name, company: lead.company, platform: lead.platform }, creatorContext);
        await db.update(leads).set({ research: brief, updatedAt: new Date() }).where(eq(leads.id, leadId));
        await recordActivity({
          userId: user.id,
          agentId: job.agentId,
          type: "lead_qualified",
          leadId,
          text: `wrote a research brief for ${lead.name}`,
        });
      }

      if (job.kind === "proposal") {
        const { leadId } = job.params as { leadId: string };
        const [lead] = await db
          .select()
          .from(leads)
          .where(and(eq(leads.userId, user.id), eq(leads.id, leadId)))
          .limit(1);
        if (!lead) throw new Error("Lead not found");

        const proposal = await draftProposal(
          { name: lead.name, company: lead.company, research: lead.research as ResearchResult | null },
          creatorContext,
          creatorDisplayName(user.name, user.email)
        );
        await db.insert(proposals).values({
          id: crypto.randomUUID(),
          userId: user.id,
          agentId: job.agentId,
          leadId,
          title: proposal.title,
          body: proposal.body,
          products: proposal.packages,
        });
        await recordActivity({
          userId: user.id,
          agentId: job.agentId,
          type: "proposal_drafted",
          leadId,
          text: `drafted a proposal for ${lead.name}`,
        });
      }

      if (job.kind === "follow-up") {
        const { leadId } = job.params as { leadId: string };
        const [lead] = await db
          .select()
          .from(leads)
          .where(and(eq(leads.userId, user.id), eq(leads.id, leadId)))
          .limit(1);
        if (!lead) throw new Error("Lead not found");

        const [priorDraft] = await db
          .select()
          .from(outreachDrafts)
          .where(and(eq(outreachDrafts.userId, user.id), eq(outreachDrafts.leadId, leadId)))
          .orderBy(desc(outreachDrafts.createdAt))
          .limit(1);

        const followup = await draftFollowup(
          { name: lead.name, company: lead.company },
          creatorContext,
          creatorDisplayName(user.name, user.email),
          priorDraft ? { subject: priorDraft.subject, body: priorDraft.body } : null
        );
        await db.insert(outreachDrafts).values({
          id: crypto.randomUUID(),
          userId: user.id,
          agentId: job.agentId,
          leadId,
          subject: followup.subject,
          body: followup.body,
          rationale: followup.rationale,
          status: "draft",
        });
        await recordActivity({
          userId: user.id,
          agentId: job.agentId,
          type: "email_drafted",
          leadId,
          text: `wrote a follow-up for ${lead.name}`,
        });
      }
      await db.update(jobs).set({ status: "done", finishedAt: new Date(), result: { ok: true } }).where(eq(jobs.id, job.id));
      processed++;
    } catch (err) {
      await db
        .update(jobs)
        .set({ status: "failed", finishedAt: new Date(), error: String(err) })
        .where(eq(jobs.id, job.id));
    }
  }

  return NextResponse.json({ ok: true, processed });
}
