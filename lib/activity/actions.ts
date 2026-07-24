"use server";
import { currentUser } from "@/lib/auth/currentUser";
import { getDb, isDbConfigured } from "@/lib/db";
import { activity } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function dismissAllActivity() {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return;
  const db = getDb();
  await db.update(activity).set({ dismissed: true }).where(and(eq(activity.userId, user.id), eq(activity.dismissed, false)));
  revalidatePath("/dashboard");
  revalidatePath("/deals");
}
