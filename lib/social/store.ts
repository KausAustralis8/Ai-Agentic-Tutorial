import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { socialAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export interface SocialAccountView {
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  connectedAt: string;
  needsReconnect: boolean;
}

export async function getSocialAccount(userId: string, provider = "tiktok"): Promise<SocialAccountView | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(socialAccounts)
    .where(and(eq(socialAccounts.userId, userId), eq(socialAccounts.provider, provider)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return {
    username: row.username,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    connectedAt: row.connectedAt.toISOString(),
    needsReconnect: row.needsReconnect,
  };
}
