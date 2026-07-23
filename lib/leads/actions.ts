"use server";
import { currentUser } from "@/lib/auth/currentUser";
import { getDb, isDbConfigured } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { recordActivity } from "@/lib/activity/store";
import type { AddLeadInput, LeadStatus } from "./types";

export async function addLead(data: AddLeadInput) {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return;
  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(leads).values({
    id,
    userId: user.id,
    agentId: data.agentId,
    name: data.name,
    company: data.company || null,
    email: data.email || null,
    platform: data.platform || null,
    status: "new",
    source: "manual",
    review: "accepted",
  });
  await recordActivity({
    userId: user.id,
    agentId: data.agentId,
    type: "lead_added",
    leadId: id,
    text: `added ${data.name}${data.company ? " (" + data.company + ")" : ""}`,
  });
  revalidatePath("/deals");
  revalidatePath("/dashboard");
}

export async function setLeadStage(id: string, status: LeadStatus) {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return;
  const db = getDb();
  await db
    .update(leads)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(leads.userId, user.id), eq(leads.id, id)));
  revalidatePath("/deals");
  revalidatePath("/dashboard");
}

export async function acceptLead(id: string) {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return;
  const db = getDb();
  await db
    .update(leads)
    .set({ review: "accepted", updatedAt: new Date() })
    .where(and(eq(leads.userId, user.id), eq(leads.id, id)));
  revalidatePath("/deals");
  revalidatePath("/dashboard");
}

export async function rejectLead(id: string) {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return;
  const db = getDb();
  await db.delete(leads).where(and(eq(leads.userId, user.id), eq(leads.id, id), eq(leads.review, "pending")));
  revalidatePath("/deals");
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      cells.push(cur);
      cur = "";
    } else cur += ch;
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

const HEADER_ALIASES: Record<string, string[]> = {
  name: ["name", "brand", "brand name", "contact", "contact name"],
  company: ["company", "company name", "organization"],
  email: ["email", "email address", "contact email"],
  platform: ["platform", "channel", "social"],
};

function matchHeader(header: string): string | null {
  const h = header.trim().toLowerCase();
  for (const [key, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.includes(h)) return key;
  }
  return null;
}

export async function importLeadsCsv(csvText: string, agentId: string | null): Promise<{ imported: number; skipped: number }> {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return { imported: 0, skipped: 0 };

  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { imported: 0, skipped: 0 };

  const headers = parseCsvLine(lines[0]).map(matchHeader);
  const db = getDb();
  let imported = 0;
  let skipped = 0;

  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((key, i) => {
      if (key) row[key] = cells[i] ?? "";
    });
    const name = row.name || row.company;
    if (!name) {
      skipped++;
      continue;
    }

    const id = crypto.randomUUID();
    await db.insert(leads).values({
      id,
      userId: user.id,
      agentId,
      name,
      company: row.company || null,
      email: row.email || null,
      platform: row.platform || null,
      status: "new",
      source: "manual",
      review: "accepted",
    });
    imported++;
  }

  if (imported > 0) {
    await recordActivity({
      userId: user.id,
      agentId,
      type: "lead_added",
      text: `imported ${imported} brand${imported === 1 ? "" : "s"} from a CSV`,
    });
  }
  revalidatePath("/deals");
  revalidatePath("/dashboard");
  return { imported, skipped };
}
