import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { ChatMessageView } from "./types";

export async function listMessages(userId: string): Promise<ChatMessageView[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const rows = await db.select().from(messages).where(eq(messages.userId, userId)).orderBy(asc(messages.id));
  return rows.map((r) => ({
    id: r.id,
    agentId: r.agentId,
    who: r.who as ChatMessageView["who"],
    text: r.text,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function insertMessage(userId: string, agentId: string | null, who: "ai" | "me", text: string) {
  if (!isDbConfigured()) return;
  const db = getDb();
  await db.insert(messages).values({ userId, agentId, who, text });
}
