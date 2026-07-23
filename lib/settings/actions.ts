"use server";
import { currentUser } from "@/lib/auth/currentUser";
import { getDb, isDbConfigured } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateNotificationSettings(next: Record<string, boolean>) {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return;
  const db = getDb();
  await db.update(users).set({ notifications: next }).where(eq(users.id, user.id));
  revalidatePath("/settings");
}
