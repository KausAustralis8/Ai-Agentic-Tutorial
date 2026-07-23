"use server";
import { currentUser } from "@/lib/auth/currentUser";
import { enqueueJob, getJob } from "./store";
import { revalidatePath } from "next/cache";

export async function enqueueResearch(leadId: string, agentId: string | null) {
  const user = await currentUser();
  if (!user) return null;
  const id = await enqueueJob({ userId: user.id, agentId, kind: "research", params: { leadId } });
  revalidatePath("/deals");
  return id;
}

export async function enqueueProposal(leadId: string, agentId: string | null) {
  const user = await currentUser();
  if (!user) return null;
  const id = await enqueueJob({ userId: user.id, agentId, kind: "proposal", params: { leadId } });
  revalidatePath("/deals");
  return id;
}

export async function enqueueFollowup(leadId: string, agentId: string | null) {
  const user = await currentUser();
  if (!user) return null;
  const id = await enqueueJob({ userId: user.id, agentId, kind: "follow-up", params: { leadId } });
  revalidatePath("/deals");
  return id;
}

export async function getJobStatus(id: string) {
  const user = await currentUser();
  if (!user) return null;
  const job = await getJob(user.id, id);
  return job ? { status: job.status } : null;
}
