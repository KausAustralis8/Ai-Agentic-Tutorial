"use server";
import { currentUser } from "@/lib/auth/currentUser";
import { getDb, isDbConfigured } from "@/lib/db";
import { meetings, leads } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { parseMeetingTime } from "@/lib/ai/meetingTime";
import { recordActivity } from "@/lib/activity/store";

function describeNow(): string {
  return new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function bookMeetingFromText(input: { text: string; leadId: string | null; agentId: string | null }) {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return { ok: false as const };

  const parsed = await parseMeetingTime(input.text, describeNow());
  if (!parsed) return { ok: false as const, needsManual: true as const };

  const db = getDb();
  let leadId = input.leadId;
  let title = `Brand call — ${input.text}`;

  if (leadId) {
    const [lead] = await db
      .select()
      .from(leads)
      .where(and(eq(leads.userId, user.id), eq(leads.id, leadId)))
      .limit(1);
    if (lead) title = `Call with ${lead.name}`;
  } else if (parsed.brandName) {
    const rows = await db.select().from(leads).where(eq(leads.userId, user.id));
    const needle = parsed.brandName.toLowerCase();
    const match = rows.find((r) => r.name.toLowerCase().includes(needle) || needle.includes(r.name.toLowerCase()));
    if (match) {
      leadId = match.id;
      title = `Call with ${match.name}`;
    } else {
      title = `Call with ${parsed.brandName}`;
    }
  }

  let rescheduled = false;
  if (leadId) {
    const removed = await db
      .delete(meetings)
      .where(and(eq(meetings.userId, user.id), eq(meetings.leadId, leadId)))
      .returning({ id: meetings.id });
    rescheduled = removed.length > 0;
  }

  const id = crypto.randomUUID();
  await db.insert(meetings).values({
    id,
    userId: user.id,
    agentId: input.agentId,
    leadId,
    title,
    kind: "call",
    whenAt: new Date(parsed.whenAt),
    whenLabel: parsed.whenLabel,
  });
  await recordActivity({
    userId: user.id,
    agentId: input.agentId,
    type: "meeting_booked",
    leadId,
    text: `${rescheduled ? "rescheduled" : "booked"} ${title} — ${parsed.whenLabel}`,
  });

  revalidatePath("/calendar");
  revalidatePath("/deals");
  revalidatePath("/dashboard");
  return { ok: true as const, whenLabel: parsed.whenLabel };
}

export async function bookMeetingManual(input: { title: string; leadId: string | null; agentId: string | null; whenAt: string }) {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return { ok: false as const };

  const date = new Date(input.whenAt);
  if (Number.isNaN(date.getTime())) return { ok: false as const };

  const whenLabel = date.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const db = getDb();

  let rescheduled = false;
  if (input.leadId) {
    const removed = await db
      .delete(meetings)
      .where(and(eq(meetings.userId, user.id), eq(meetings.leadId, input.leadId)))
      .returning({ id: meetings.id });
    rescheduled = removed.length > 0;
  }

  const id = crypto.randomUUID();
  await db.insert(meetings).values({
    id,
    userId: user.id,
    agentId: input.agentId,
    leadId: input.leadId,
    title: input.title,
    kind: "call",
    whenAt: date,
    whenLabel,
  });
  await recordActivity({
    userId: user.id,
    agentId: input.agentId,
    type: "meeting_booked",
    leadId: input.leadId,
    text: `${rescheduled ? "rescheduled" : "booked"} ${input.title} — ${whenLabel}`,
  });

  revalidatePath("/calendar");
  revalidatePath("/deals");
  revalidatePath("/dashboard");
  return { ok: true as const, whenLabel };
}
