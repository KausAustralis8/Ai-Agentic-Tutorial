import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function ensureUserRow(id: string, email: string | null, name: string | null) {
  if (!isDbConfigured()) return;
  const db = getDb();
  await db
    .insert(users)
    .values({ id, email: email ?? undefined, name: name ?? undefined })
    .onConflictDoNothing({ target: users.id });
}

export async function getUserRow(id: string) {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}
